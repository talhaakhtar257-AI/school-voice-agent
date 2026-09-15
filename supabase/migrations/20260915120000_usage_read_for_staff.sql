-- Feature 008: staff dashboard redesign
--
-- Lets signed-in staff READ the two voice usage tables, so the dashboard's
-- Overview and Health screens can show "calls started today" and "minutes
-- reserved this month" through the staff session (database rules: the
-- dashboard reads through an authenticated session, never a service key).
--
-- No table, column or row is changed or removed. Both tables hold no personal
-- data: random visitor ids and running totals.
--
-- Still no insert, update or delete policy: only the service-role client, from
-- POST /api/retell/web-call via reserve_voice_call(), writes these tables.
-- Anonymous visitors still have no access at all.

create policy voice_usage_daily_select_authenticated on voice_usage_daily
  for select to authenticated using (true);

create policy voice_usage_monthly_select_authenticated on voice_usage_monthly
  for select to authenticated using (true);
