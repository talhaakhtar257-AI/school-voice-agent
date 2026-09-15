import { createClient } from "@/lib/supabase/server";
import { LEAD_COLUMNS, type LeadRow } from "@/lib/leads/rows";
import { schoolDateKey } from "./format";

const DAY_MS = 86_400_000;

export type DayLeads = { date: string; en: number; ur: number; none: number };

/**
 * Runs one dashboard query. On failure it logs the reason and returns null, so
 * one broken card shows its own error state instead of blanking the screen.
 * The log carries only the error message — never row data or a phone number.
 */
export async function orNull<T>(label: string, query: Promise<T>): Promise<T | null> {
  try {
    return await query;
  } catch (error) {
    const message =
      error && typeof error === "object" && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
    console.error(`[dashboard/${label}] ${message} @ ${new Date().toISOString()}`);
    return null;
  }
}

/** Leads per school-local day for the last 7 days, oldest first, split by language. */
export async function leadsLast7Days(now = new Date()): Promise<DayLeads[]> {
  const days: DayLeads[] = [];
  for (let i = 6; i >= 0; i--) {
    days.push({ date: schoolDateKey(new Date(now.getTime() - i * DAY_MS)), en: 0, ur: 0, none: 0 });
  }

  // Eight UTC days back safely covers seven Karachi calendar days; anything
  // outside the buckets is ignored below.
  const since = new Date(now.getTime() - 8 * DAY_MS).toISOString();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select("created_at, language")
    .gte("created_at", since);
  if (error) throw error;

  const byDate = new Map(days.map((day) => [day.date, day]));
  for (const row of (data ?? []) as { created_at: string; language: "en" | "ur" | null }[]) {
    const bucket = byDate.get(schoolDateKey(new Date(row.created_at)));
    if (!bucket) continue;
    if (row.language === "en") bucket.en += 1;
    else if (row.language === "ur") bucket.ur += 1;
    else bucket.none += 1;
  }
  return days;
}

export async function recentLeads(limit = 5): Promise<LeadRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as unknown as LeadRow[];
}

export async function countNewLeads(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");
  if (error) throw error;
  return count ?? 0;
}
