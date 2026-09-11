-- Feature 005: Parent-facing voice landing page
--
-- Creates three tables. No existing data is touched.
--
--   leads               - one row per parent enquiry captured by the voice
--                          agent. On the documented table list.
--   voice_usage_daily   - counts voice calls per visitor per day, for the
--                          per-visitor daily limit. No personal data.
--   voice_usage_monthly - one running total of reserved minutes for the whole
--                          school, for the monthly cost cap. No personal data.
--
-- Both usage tables are NOT on .claude/rules/database.md's documented table
-- list; the maintainer approved adding them (see specs/005-voice-landing-page/
-- plan.md) because Vercel's serverless functions share no memory between
-- requests, so the limits need somewhere durable to live.
--
-- Reuses set_updated_at(), created by the 003 content-system migration.

-- leads -----------------------------------------------------------------------

create table leads (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  status           text not null default 'new'
                     check (status in ('new', 'contacted', 'applied', 'closed')),
  parent_name      text,
  student_name     text,
  class_wanted     text,
  student_age      integer,
  phone            text,
  current_class    text,
  previous_school  text,
  admission_type   text check (admission_type in ('fresh', 'transfer')),
  language         text check (language in ('ur', 'en')),
  consent          boolean,
  retell_call_id   text
);

create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();

alter table leads enable row level security;

-- Staff can read and update (for status changes, in the future dashboard).
-- No insert or delete policy: only the service-role client (POST /api/leads,
-- after the shared-secret check) may create a row; nothing deletes one.
create policy leads_select_authenticated on leads
  for select to authenticated using (true);
create policy leads_update_authenticated on leads
  for update to authenticated using (true) with check (true);

-- voice_usage_daily -----------------------------------------------------------
-- No personal data: visitor_id is a random value from a cookie, not linked to
-- a name, a lead, or anything identifying.

create table voice_usage_daily (
  visitor_id  uuid not null,
  usage_date  date not null,
  call_count  integer not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (visitor_id, usage_date)
);

create trigger voice_usage_daily_set_updated_at
  before update on voice_usage_daily
  for each row execute function set_updated_at();

alter table voice_usage_daily enable row level security;
-- No policies at all: no anon or authenticated access, by design. Only the
-- service-role client (which bypasses RLS) reads or writes this table, from
-- POST /api/retell/web-call.

-- voice_usage_monthly ---------------------------------------------------------
-- Also no personal data: one total per calendar month for the whole school.

create table voice_usage_monthly (
  usage_month       text primary key,
  reserved_minutes  numeric not null default 0,
  updated_at        timestamptz not null default now()
);

create trigger voice_usage_monthly_set_updated_at
  before update on voice_usage_monthly
  for each row execute function set_updated_at();

alter table voice_usage_monthly enable row level security;
-- No policies: service-role only, same reasoning as voice_usage_daily.
