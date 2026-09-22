-- Feature 010, stage 3: the Gap list becomes Knowledge.
--
-- Plain English (approved with the 010 plan on 2026-09-21): an unanswered
-- question gets an "answered on" date. When staff write its answer on the
-- question's own page, the answer goes into the draft FAQs and this date is
-- set, so the question moves out of "needs an answer". Nothing is deleted.

alter table unanswered_questions
  add column answered_at timestamptz;

-- Until now only the service role wrote this table. Signed-in staff may now
-- update rows, so the dashboard can set answered_at through the staff session;
-- the voice agent still writes through the service role.
create policy unanswered_questions_update_authenticated on unanswered_questions
  for update to authenticated using (true) with check (true);
