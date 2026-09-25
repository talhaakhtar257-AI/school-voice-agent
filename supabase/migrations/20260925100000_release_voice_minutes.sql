-- Feature 011, stage A: count the minutes a call actually used.
--
-- Plain English (approved with the 011 plan on 2026-09-25): when a call
-- starts, the gate reserves the full maximum length against the monthly
-- budget. With 10-minute calls that would let only 50 calls through a
-- 500-minute month, even if most calls last three minutes. When Retell reports
-- the call ended, this gives the unused minutes back.
--
--   * calls.usage_released_at — set once per call, so a repeated "call ended"
--     event can never give the same minutes back twice.
--   * release_voice_minutes() — does the give-back atomically.
--
-- No existing data changes.

alter table calls add column usage_released_at timestamptz;

create or replace function release_voice_minutes(
  p_call_id uuid,
  p_reserved_minutes numeric,
  p_used_minutes numeric
)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_started timestamptz;
  v_release numeric := greatest(0, p_reserved_minutes - greatest(0, p_used_minutes));
begin
  -- Claim the release for this call; a second event finds it already done.
  update calls
    set usage_released_at = now()
    where id = p_call_id and usage_released_at is null
    returning started_at into v_started;

  if v_started is null or v_release = 0 then
    return 0;
  end if;

  update voice_usage_monthly
    set reserved_minutes = greatest(0, reserved_minutes - v_release)
    where usage_month = to_char(v_started at time zone 'UTC', 'YYYY-MM');

  return v_release;
end;
$$;

-- Service role only, same as reserve_voice_call.
revoke execute on function release_voice_minutes(uuid, numeric, numeric) from public;
revoke execute on function release_voice_minutes(uuid, numeric, numeric) from anon;
revoke execute on function release_voice_minutes(uuid, numeric, numeric) from authenticated;
