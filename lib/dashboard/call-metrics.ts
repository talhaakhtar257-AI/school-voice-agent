import { createClient } from "@/lib/supabase/server";
import { startOfTodayPk, startOfWeekPk } from "./pk-time";

/**
 * How fast and how costly the calls were, for the Health screen.
 *
 * `specs/004-admin-dashboard/spec.md:111` has required an "average response
 * delay" since feature 004, and `app/dashboard/health/page.tsx` carried a
 * comment refusing to invent one for want of call records. These are not
 * invented: they are Retell's own per-call figures, stored by the webhook from
 * the response it already fetches (feature 013, D-005), so what staff read here
 * matches what Retell reports and bills.
 *
 * Every figure is nullable. A call Retell did not measure is excluded, never
 * counted as zero — a zero would drag the average down and claim the calls were
 * faster and cheaper than they were. `measuredCalls` travels with the figures so
 * the screen can say what they rest on, and one call is never shown as a trend
 * (FR-013).
 */

/** The reply-delay target recorded in specs/011-tester-feedback/plan.md:28. */
export const REPLY_DELAY_TARGET_MS = 1500;

export type CallMetrics = {
  /** Calls in the period, measured or not. */
  totalCalls: number;
  /** Calls Retell reported a reply delay for. The averages rest on these. */
  measuredCalls: number;
  /** Calls Retell reported a cost for. */
  costedCalls: number;
  averageReplyDelayMs: number | null;
  /** The worst typical wait seen in the period: the highest p90 of any call. */
  worstReplyDelayMs: number | null;
  totalCostCents: number | null;
  averageCostCents: number | null;
  /** True only when there is an average to compare. */
  overTarget: boolean;
};

type MetricRow = {
  started_at: string;
  reply_delay_ms: number | null;
  reply_delay_p90_ms: number | null;
  cost_cents: number | null;
};

const mean = (values: number[]): number | null =>
  values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

function summarise(rows: MetricRow[]): CallMetrics {
  const delays = rows.map((r) => r.reply_delay_ms).filter((v): v is number => v !== null);
  const p90s = rows.map((r) => r.reply_delay_p90_ms).filter((v): v is number => v !== null);
  const costs = rows.map((r) => r.cost_cents).filter((v): v is number => v !== null);
  const averageReplyDelayMs = mean(delays);

  return {
    totalCalls: rows.length,
    measuredCalls: delays.length,
    costedCalls: costs.length,
    averageReplyDelayMs,
    worstReplyDelayMs: p90s.length > 0 ? Math.max(...p90s) : null,
    totalCostCents: costs.length > 0 ? costs.reduce((a, b) => a + b, 0) : null,
    averageCostCents: mean(costs),
    overTarget: averageReplyDelayMs !== null && averageReplyDelayMs > REPLY_DELAY_TARGET_MS,
  };
}

export type CallMetricsPeriods = { today: CallMetrics; week: CallMetrics };

/**
 * One read for the whole week, split in code — the same shape as
 * `getPeriodStats`, and a school has tens of calls a day. Reads through the
 * signed-in staff session, never the service key (database rules).
 */
export async function getCallMetrics(now = new Date()): Promise<CallMetricsPeriods> {
  const todayStart = startOfTodayPk(now);
  const weekStart = startOfWeekPk(now).toISOString();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("calls")
    .select("started_at, reply_delay_ms, reply_delay_p90_ms, cost_cents")
    .gte("started_at", weekStart);
  if (error) throw error;

  const rows = (data ?? []) as MetricRow[];
  return {
    today: summarise(rows.filter((r) => new Date(r.started_at) >= todayStart)),
    week: summarise(rows),
  };
}

/** Milliseconds as a short readable figure: "2.3s", or "1,240ms" under a second. */
export function formatDelay(ms: number | null): string | null {
  if (ms === null) return null;
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${Math.round(ms)}ms`;
}

/** Cents as dollars, the currency Retell bills in. Stored once, formatted here. */
export function formatCost(cents: number | null): string | null {
  if (cents === null) return null;
  return `$${(cents / 100).toFixed(2)}`;
}
