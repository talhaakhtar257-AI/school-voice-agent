import { createClient } from "@/lib/supabase/server";

/**
 * A call with no reported end stops counting as live after this long (FR-020),
 * so a lost "call ended" event never leaves the badge stuck. It is longer than
 * the longest allowed call.
 */
export const LIVE_CUTOFF_MS = 15 * 60 * 1000;

export type LiveCall = {
  id: string;
  retellCallId: string;
  startedAt: string;
  language: "ur" | "en" | null;
  lead: { id: string; parentName: string | null; phone: string | null; status: string } | null;
};

type Row = {
  id: string;
  retell_call_id: string;
  started_at: string;
  language: "ur" | "en" | null;
  lead: { id: string; parent_name: string | null; phone: string | null; status: string } | null;
};

function since(): string {
  return new Date(Date.now() - LIVE_CUTOFF_MS).toISOString();
}

/** Calls happening now, newest first, with the confirmed name and phone when saved. Staff session. */
export async function listLiveCalls(): Promise<LiveCall[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .select("id, retell_call_id, started_at, language, lead:leads(id, parent_name, phone, status)")
    .eq("status", "ongoing")
    .gte("started_at", since())
    .order("started_at", { ascending: false });
  if (error) throw error;
  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    retellCallId: row.retell_call_id,
    startedAt: row.started_at,
    language: row.language,
    lead: row.lead
      ? { id: row.lead.id, parentName: row.lead.parent_name, phone: row.lead.phone, status: row.lead.status }
      : null,
  }));
}

export async function countLiveCalls(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("calls")
    .select("id", { count: "exact", head: true })
    .eq("status", "ongoing")
    .gte("started_at", since());
  if (error) throw error;
  return count ?? 0;
}
