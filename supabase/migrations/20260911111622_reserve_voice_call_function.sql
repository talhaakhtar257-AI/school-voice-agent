-- Atomic reservation for the two hard voice-usage limits (FR-031, FR-032).
--
-- Locks the visitor's daily row and the month's row (via SELECT ... FOR UPDATE)
-- so concurrent requests from the same visitor, or concurrent requests from
-- anyone during the same month, serialize on exactly the rows that matter --
-- making the monthly cap an actual hard ceiling, not just "usually" true.
--
-- Only the service-role client may call this (EXECUTE revoked below, same
-- pattern as publish_content in the 003 migration) -- it is invoked only from
-- app/api/retell/web-call/route.ts, after the content and config checks.
--
-- Verified interactively before this file was written: a 2-calls/day,
-- 1-minute-per-call, 3-minute-monthly-cap scenario correctly allowed calls 1-2
-- for one visitor, refused a 3rd for that visitor (daily cap), allowed a 4th
-- from a different visitor (reserved_minutes now 3), and refused a 5th from a
-- third visitor (monthly cap) without incrementing anything. Test rows deleted
-- afterward.

create or replace function reserve_voice_call(
  p_visitor_id uuid,
  p_max_calls_per_day integer,
  p_call_minutes numeric,
  p_monthly_cap_minutes numeric
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_month text := to_char(current_date, 'YYYY-MM');
  v_daily_count integer;
  v_reserved numeric;
begin
  insert into voice_usage_daily (visitor_id, usage_date, call_count)
  values (p_visitor_id, v_today, 0)
  on conflict (visitor_id, usage_date) do nothing;

  select call_count into v_daily_count
  from voice_usage_daily
  where visitor_id = p_visitor_id and usage_date = v_today
  for update;

  if v_daily_count >= p_max_calls_per_day then
    return false;
  end if;

  insert into voice_usage_monthly (usage_month, reserved_minutes)
  values (v_month, 0)
  on conflict (usage_month) do nothing;

  select reserved_minutes into v_reserved
  from voice_usage_monthly
  where usage_month = v_month
  for update;

  if v_reserved + p_call_minutes > p_monthly_cap_minutes then
    return false;
  end if;

  update voice_usage_daily
    set call_count = call_count + 1
    where visitor_id = p_visitor_id and usage_date = v_today;

  update voice_usage_monthly
    set reserved_minutes = reserved_minutes + p_call_minutes
    where usage_month = v_month;

  return true;
end;
$$;

revoke execute on function reserve_voice_call(uuid, integer, numeric, numeric) from public;
revoke execute on function reserve_voice_call(uuid, integer, numeric, numeric) from anon;
revoke execute on function reserve_voice_call(uuid, integer, numeric, numeric) from authenticated;
