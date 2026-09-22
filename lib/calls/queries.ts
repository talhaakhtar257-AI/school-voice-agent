import { createAdminClient } from "@/lib/supabase/admin";
import { maskIdNumbers, maskTranscript } from "./mask";
import type { RetellCall } from "./retell-api";

type CallRow = {
  id: string;
  status: "ongoing" | "ended";
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  transcript: unknown;
  summary: string | null;
  visitor_id: string | null;
  parent_email: string | null;
  lead_id: string | null;
};

const CALL_COLUMNS =
  "id, status, started_at, ended_at, duration_seconds, transcript, summary, visitor_id, parent_email, lead_id";

async function findCall(retellCallId: string): Promise<CallRow | null> {
  const { data, error } = await createAdminClient()
    .from("calls")
    .select(CALL_COLUMNS)
    .eq("retell_call_id", retellCallId)
    .maybeSingle<CallRow>();
  if (error) throw error;
  return data;
}

async function findLeadIdForCall(retellCallId: string): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from("leads")
    .select("id")
    .eq("retell_call_id", retellCallId)
    .maybeSingle<{ id: string }>();
  if (error) throw error;
  return data?.id ?? null;
}

/**
 * Write what Retell says about a call. Events can arrive twice or out of order
 * (research R-002), so this merges instead of overwriting: "ended" never goes
 * back to "ongoing", and a value already stored is never replaced by nothing.
 * The transcript and summary are masked before they reach the database.
 */
export async function upsertCallFromRetell(call: RetellCall): Promise<CallRow> {
  const existing = await findCall(call.callId);
  const ended = call.ended || existing?.status === "ended";
  const leadId = existing?.lead_id ?? (await findLeadIdForCall(call.callId));

  const row = {
    retell_call_id: call.callId,
    status: ended ? "ended" : "ongoing",
    started_at: (call.startedAt?.toISOString() ?? existing?.started_at) || new Date().toISOString(),
    ended_at: call.endedAt?.toISOString() ?? existing?.ended_at ?? null,
    duration_seconds: call.durationSeconds ?? existing?.duration_seconds ?? null,
    transcript: call.transcript ? maskTranscript(call.transcript) : (existing?.transcript ?? null),
    summary: call.summary ? maskIdNumbers(call.summary) : (existing?.summary ?? null),
    lead_id: leadId,
    outcome: ended ? (leadId ? "lead_captured" : "answered") : null,
  };

  const { data, error } = await createAdminClient()
    .from("calls")
    .upsert(row, { onConflict: "retell_call_id" })
    .select(CALL_COLUMNS)
    .single<CallRow>();
  if (error) throw error;

  if (data.lead_id) await copyCallToLead(data);
  return data;
}

/**
 * Copy what only the call knows (summary, length, the email the parent typed)
 * onto its lead. Never overwrites an email the lead already has.
 */
async function copyCallToLead(call: CallRow): Promise<void> {
  if (!call.lead_id) return;
  const supabase = createAdminClient();
  const update: Record<string, string | number> = {};
  if (call.summary) update.summary = call.summary;
  if (call.duration_seconds !== null) update.call_duration_seconds = call.duration_seconds;
  if (Object.keys(update).length > 0) {
    const { error } = await supabase.from("leads").update(update).eq("id", call.lead_id);
    if (error) throw error;
  }
  if (call.parent_email) {
    const { error } = await supabase
      .from("leads")
      .update({ email: call.parent_email })
      .eq("id", call.lead_id)
      .is("email", null);
    if (error) throw error;
  }
}

/** Called after save_lead: tie the lead to its call row, if Retell has reported it yet. */
export async function linkLeadToCall(
  retellCallId: string,
  leadId: string,
  language?: "ur" | "en",
): Promise<void> {
  const { data, error } = await createAdminClient()
    .from("calls")
    .update(language ? { lead_id: leadId, language } : { lead_id: leadId })
    .eq("retell_call_id", retellCallId)
    .select(CALL_COLUMNS)
    .maybeSingle<CallRow>();
  if (error) throw error;
  if (data) await copyCallToLead(data);
}

/**
 * The email box. The first browser to send an email for a call becomes that
 * call's owner; any other browser is refused (research R-003). The call row is
 * created here if Retell's "started" event has not arrived yet.
 */
export async function saveParentEmail(
  retellCallId: string,
  visitorId: string,
  email: string,
): Promise<"ok" | "forbidden"> {
  const supabase = createAdminClient();
  const existing = await findCall(retellCallId);

  if (existing && existing.visitor_id && existing.visitor_id !== visitorId) return "forbidden";

  const { data, error } = existing
    ? await supabase
        .from("calls")
        .update({ visitor_id: visitorId, parent_email: email })
        .eq("id", existing.id)
        .select(CALL_COLUMNS)
        .single<CallRow>()
    : await supabase
        .from("calls")
        .insert({
          retell_call_id: retellCallId,
          visitor_id: visitorId,
          parent_email: email,
          lead_id: await findLeadIdForCall(retellCallId),
        })
        .select(CALL_COLUMNS)
        .single<CallRow>();
  // 23505: Retell's "started" event created the row a moment ago. Go again,
  // this time as an update.
  if (error?.code === "23505" && !existing) return saveParentEmail(retellCallId, visitorId, email);
  if (error) throw error;

  if (data.lead_id) {
    // The parent just typed it, so it replaces an older one on the lead.
    const { error: leadError } = await supabase.from("leads").update({ email }).eq("id", data.lead_id);
    if (leadError) throw leadError;
  }
  return "ok";
}
