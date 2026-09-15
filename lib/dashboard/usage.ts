import { createClient } from "@/lib/supabase/server";
import { utcDateKey } from "./format";

/**
 * Voice usage counts for the dashboard, read through the signed-in staff
 * session (the usage_read_for_staff migration grants SELECT to authenticated).
 * These count calls that passed the limits check in POST /api/retell/web-call —
 * not completed calls; there is no calls table yet.
 */

export async function callsStartedOn(dateKey: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voice_usage_daily")
    .select("call_count")
    .eq("usage_date", dateKey);
  if (error) throw error;
  return ((data ?? []) as { call_count: number }[]).reduce(
    (sum, row) => sum + row.call_count,
    0,
  );
}

/** Minutes reserved against the monthly cap. Each call reserves its full maximum length. */
export async function minutesReservedThisMonth(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("voice_usage_monthly")
    .select("reserved_minutes")
    .eq("usage_month", utcDateKey().slice(0, 7))
    .maybeSingle<{ reserved_minutes: number | string }>();
  if (error) throw error;
  // numeric columns can arrive as strings from PostgREST.
  return Number(data?.reserved_minutes ?? 0);
}
