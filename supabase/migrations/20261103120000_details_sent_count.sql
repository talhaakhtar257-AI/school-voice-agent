-- Feature 013, slice B: cap the written-detail emails at three per call.
--
-- specs/011-tester-feedback/plan.md specified "at most 3 sends per call" and it
-- was never built, so a parent who keeps asking keeps triggering emails. The
-- free Brevo tier allows 300 a day, and every send also burns call seconds.
--
-- The count has to survive the request: a counter held in memory resets on the
-- next serverless instance, which is no cap at all.
--
-- Additive and defaulted, so existing rows need no backfill and the currently
-- deployed code is unaffected by the column's presence.

alter table public.calls
  add column details_sent_count integer not null default 0
    check (details_sent_count >= 0);

comment on column public.calls.details_sent_count is
  'How many sets of written details were emailed during this call. Capped at 3 (feature 013, FR-007).';

-- Raise the counter in one statement, so two sends that overlap cannot both
-- read the same value and write the same result back. The read that decides
-- whether to send is still a separate statement, so a genuine simultaneous
-- double-ask could allow one extra email; the counter itself can never be lost.
create or replace function public.increment_details_sent(call_row_id uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  update public.calls
     set details_sent_count = details_sent_count + 1,
         updated_at = now()
   where id = call_row_id
  returning details_sent_count;
$$;

revoke all on function public.increment_details_sent(uuid) from public, anon, authenticated;
grant execute on function public.increment_details_sent(uuid) to service_role;
