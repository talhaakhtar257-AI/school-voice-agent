"use server";

import { createClient } from "@/lib/supabase/server";
import { LEAD_COLUMNS, LEAD_STATUSES, type LeadRow, type LeadStatus } from "@/lib/leads/rows";

/** Re-reads every lead. Called on first load and by the 10-second poll (FR-006). */
export async function refreshLeadsAction(): Promise<LeadRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as LeadRow[];
}

export type UpdateStatusResult = { ok: true } | { ok: false };

/**
 * Changes one lead's status (FR-005). The check() constraint in the
 * leads_and_voice_usage migration is the real guard; LEAD_STATUSES here just
 * stops a bad value being sent to the database at all.
 */
export async function updateLeadStatusAction(
  id: string,
  status: LeadStatus,
): Promise<UpdateStatusResult> {
  if (!LEAD_STATUSES.includes(status)) return { ok: false };
  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);
  if (error) {
    console.error(`[leads/update-status] ${error.message} @ ${new Date().toISOString()}`);
    return { ok: false };
  }
  return { ok: true };
}
