-- Feature 010: Client feedback round, stage 2
--
-- Plain English (approved by the maintainer on 2026-09-21):
--   * New table `calls`: one row per voice conversation, filled from Retell's
--     call events. Holds start/end, live or ended, language, the full
--     conversation and Retell's summary, an email the parent typed, and the
--     lead it produced. `calls` is on the documented table list in
--     .claude/rules/database.md.
--   * `leads` gains email, summary and call length. All optional.
--   * One lead per Retell call id, so a second save in the same call updates
--     that lead instead of creating a duplicate.
--
-- No data is lost. Every existing lead keeps its values; none has a call id
-- today, and NULLs never clash under the unique index.
--
-- Reuses set_updated_at(), created by the 003 content-system migration.

-- calls -----------------------------------------------------------------------

create table calls (
  id                    uuid primary key default gen_random_uuid(),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  retell_call_id        text not null unique,
  status                text not null default 'ongoing'
                          check (status in ('ongoing', 'ended')),
  outcome               text
                          check (outcome in ('answered', 'transferred', 'lead_captured', 'dropped')),
  started_at            timestamptz not null default now(),
  ended_at              timestamptz,
  duration_seconds      integer check (duration_seconds >= 0),
  language              text check (language in ('ur', 'en')),
  -- [{ "role": "agent" | "user", "content": "..." }], 13-digit ID numbers
  -- masked before insert (constitution VI).
  transcript            jsonb,
  summary               text,
  -- Random cookie value, used only so the browser that made the call is the
  -- only one that can attach an email to it. Not linked to a person.
  visitor_id            text,
  parent_email          text check (parent_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  lead_id               uuid references leads (id) on delete set null,
  school_email_sent_at  timestamptz,
  parent_email_sent_at  timestamptz,
  email_error           text
);

create index calls_status_started_idx on calls (status, started_at desc);
create index calls_started_idx on calls (started_at desc);

create trigger calls_set_updated_at
  before update on calls
  for each row execute function set_updated_at();

alter table calls enable row level security;

-- Staff read only. No insert/update/delete policy: rows are written only by
-- the service-role client, from the Retell webhook and the email box route.
create policy calls_select_authenticated on calls
  for select to authenticated using (true);

-- leads -----------------------------------------------------------------------

alter table leads
  add column email text check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  add column summary text,
  add column call_duration_seconds integer check (call_duration_seconds >= 0);

-- If any call id was ever saved twice, keep it on the newest lead only, so the
-- unique index below can be created. Rows are kept; only the duplicate id is
-- cleared.
update leads l
set retell_call_id = null
where retell_call_id is not null
  and exists (
    select 1 from leads newer
    where newer.retell_call_id = l.retell_call_id
      and newer.created_at > l.created_at
  );

create unique index leads_retell_call_id_key
  on leads (retell_call_id)
  where retell_call_id is not null;
