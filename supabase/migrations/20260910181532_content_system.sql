-- Feature 003: School Content System
--
-- Creates two tables and one function. No existing application data is touched:
-- this project has no application tables before this migration. The two `content`
-- rows are seeded empty.
--
--   content          - exactly two rows, channel 'draft' and channel 'live',
--                      each holding the whole content document as jsonb
--   content_history  - one row per publish; never updated, never deleted
--   publish_content  - copies draft -> live and writes a history row, atomically

-- Shared updated_at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- content ---------------------------------------------------------------------

create table content (
  id         uuid primary key default gen_random_uuid(),
  channel    text not null unique check (channel in ('draft', 'live')),
  doc        jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger content_set_updated_at
  before update on content
  for each row execute function set_updated_at();

insert into content (channel, doc)
values ('draft', '{}'::jsonb), ('live', '{}'::jsonb);

-- content_history -----------------------------------------------------------

create table content_history (
  id                 uuid primary key default gen_random_uuid(),
  published_at       timestamptz not null default now(),
  published_by       uuid references auth.users (id) on delete set null,
  published_by_email text,
  doc_before         jsonb not null,
  doc_after          jsonb not null,
  change_summary     jsonb not null default '[]'::jsonb,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger content_history_set_updated_at
  before update on content_history
  for each row execute function set_updated_at();

create index content_history_published_at_idx
  on content_history (published_at desc);

-- publish_content ----------------------------------------------------------
-- Atomic: if the draft differs from live, record history then copy draft to live.
-- If they are identical, do nothing and report 'noop' (pressing Publish twice).

create or replace function publish_content(
  actor_id    uuid,
  actor_email text,
  summary     jsonb
)
returns table (result text, history_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  d jsonb;
  l jsonb;
  new_id uuid;
begin
  select doc into d from content where channel = 'draft';
  select doc into l from content where channel = 'live';

  if d = l then
    return query select 'noop'::text, null::uuid;
    return;
  end if;

  insert into content_history (published_by, published_by_email, doc_before, doc_after, change_summary)
  values (actor_id, actor_email, l, d, coalesce(summary, '[]'::jsonb))
  returning id into new_id;

  update content set doc = d where channel = 'live';

  return query select 'published'::text, new_id;
end;
$$;

-- Row level security -------------------------------------------------------

alter table content enable row level security;
alter table content_history enable row level security;

-- Authenticated staff read both content rows.
create policy content_select_authenticated on content
  for select to authenticated using (true);

-- Authenticated staff update only the draft row directly. The live row is
-- written solely by publish_content (which runs security definer, bypassing RLS).
create policy content_update_draft_only on content
  for update to authenticated
  using (channel = 'draft')
  with check (channel = 'draft');

-- Authenticated staff read history. There is no update or delete policy and no
-- direct insert policy: history rows are written only by publish_content.
create policy content_history_select_authenticated on content_history
  for select to authenticated using (true);
