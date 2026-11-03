-- Feature 013, slice D: record how long the parent waited and what the call cost.
--
-- Both figures already arrive in the get-call response the webhook fetches on
-- every event, and both were thrown away. specs/004-admin-dashboard/spec.md:111
-- has required the Health screen to show "average response delay" since feature
-- 004, and app/dashboard/health/page.tsx carries a comment deferring it for want
-- of exactly this data.
--
-- All three are nullable because Retell reports no latency for a call with no
-- measured turns, and no cost for some calls. NULL means "not measured" and is
-- excluded from averages (FR-013) — never counted as zero, which would drag an
-- average down and claim calls were faster and cheaper than they were.
--
-- Additive, so no backfill and no effect on the currently deployed code. Calls
-- from before this ships stay NULL on purpose: the old Retell account is
-- unreachable from the current key and Retell expires call data anyway.

alter table public.calls
  add column reply_delay_ms integer check (reply_delay_ms >= 0),
  add column reply_delay_p90_ms integer check (reply_delay_p90_ms >= 0),
  add column cost_cents integer check (cost_cents >= 0);

comment on column public.calls.reply_delay_ms is
  'Retell''s end-to-end p50 in ms: how long the parent typically waited after they stopped speaking. NULL = not measured.';
comment on column public.calls.reply_delay_p90_ms is
  'Retell''s end-to-end p90 in ms. The owner''s 3 Nov complaint was about the spikes, so the worst case is reported too, not only the median.';
comment on column public.calls.cost_cents is
  'call_cost.combined_cost from Retell, in US cents, stored once and formatted for display. NULL = not reported.';

-- The Health screen averages these over a date range, and every existing index
-- on this table is already on started_at (calls_started_idx), which is the
-- column that range filters on. No new index is needed.
