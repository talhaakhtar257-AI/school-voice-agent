-- Feature 006: Unanswered questions capture
--
-- One table. A question the voice agent could not answer is logged once;
-- the same question asked again increments times_asked on the existing row
-- instead of creating a duplicate (spec Assumptions: matching is on
-- normalised text -- trimmed, whitespace collapsed, lowercased -- not an
-- exact match, since the agent's phrasing will vary slightly each time).
--
-- normalized_text is a generated column, not computed in application code,
-- so the match-or-insert can be one atomic database statement (an upsert)
-- rather than a read-then-write -- otherwise two identical questions
-- arriving within milliseconds of each other could both read "no existing
-- row" and both insert, defeating the whole point of times_asked.
--
-- Reuses set_updated_at(), created by the 003 content-system migration.

create table unanswered_questions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  question_text    text not null,
  normalized_text  text generated always as (
                     lower(regexp_replace(trim(question_text), '\s+', ' ', 'g'))
                   ) stored,
  language         text check (language in ('ur', 'en')),
  times_asked      integer not null default 1
);

-- The upsert's ON CONFLICT target.
create unique index unanswered_questions_normalized_text_key
  on unanswered_questions (normalized_text);

create trigger unanswered_questions_set_updated_at
  before update on unanswered_questions
  for each row execute function set_updated_at();

alter table unanswered_questions enable row level security;

-- Staff can read, for the dashboard screen. No insert/update/delete policy:
-- only the service-role client (POST /api/unanswered, after the shared-secret
-- check) may write -- same pattern as `leads`.
create policy unanswered_questions_select_authenticated on unanswered_questions
  for select to authenticated using (true);
