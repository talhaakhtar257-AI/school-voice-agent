import { createAdminClient } from "@/lib/supabase/admin";
import { emailConfigured, sendEmail } from "./send";
import { INFO_TOPICS, type InfoTopic } from "./info-pack";
import { parentMail, readLead, recordFailure } from "./send-summaries";

/**
 * The send_details tool (feature 011), in two halves (feature 013, slice B).
 *
 * It used to be one function the route awaited: three database reads, a full
 * content read and Zod parse, an HTML render, then an email send with an 8
 * second timeout — all while the parent sat listening to "one moment, I'm
 * sending that to your email". That is the longest silence in a call.
 *
 * Now the route plans the send cheaply, answers the agent, and delivers in
 * after(). Everything expensive happens once the parent is already being
 * spoken to again.
 */

/** FR-007, carried over from specs/011-tester-feedback/plan.md. */
export const MAX_DETAILS_PER_CALL = 3;

export type DetailsPlan =
  | { state: "no-email" }
  | { state: "limit" }
  | { state: "error" }
  | { state: "ready"; callId: string; leadId: string | null; to: string };

/**
 * Decide, with indexed reads only, whether this send can go ahead. No content
 * is read and no email is rendered here — that is the point.
 *
 * A read failure returns "error", never "no-email". The difference matters: the
 * agent tells the parent there is no address on record when it hears
 * "no-email", and saying that because a column or a database was missing would
 * be a false statement to a parent (Constitution I). `details_sent_count`
 * arrives with the feature 013 migration, so this is also what happens if the
 * code is deployed before the migration is applied — the agent falls back to
 * the office number and the cause is logged.
 */
export async function planDetailsSend(retellCallId: string): Promise<DetailsPlan> {
  // Checked before anything else, and deliberately returning "error" rather
  // than "no-email": with no provider key the delivery in after() cannot
  // possibly succeed, but the route has already answered the agent by then and
  // the agent has already told the parent the email is on its way. Without
  // this, a deployment missing BREVO_API_KEY or RESEND_API_KEY makes the
  // assistant promise an email that never leaves — a false statement to a
  // parent, which Constitution I forbids. "error" is the branch whose wording
  // apologises and offers the office number instead.
  if (!emailConfigured()) {
    console.error(
      `[email] send_details asked for, but no email provider is configured @ ${new Date().toISOString()}`,
    );
    return { state: "error" };
  }

  const { data: call, error } = await createAdminClient()
    .from("calls")
    .select("id, lead_id, parent_email, details_sent_count")
    .eq("retell_call_id", retellCallId)
    .maybeSingle<{
      id: string;
      lead_id: string | null;
      parent_email: string | null;
      details_sent_count: number | null;
    }>();
  if (error) {
    console.error(`[email] cannot plan details for a call: ${error.message} @ ${new Date().toISOString()}`);
    return { state: "error" };
  }
  if (!call) return { state: "no-email" };
  if ((call.details_sent_count ?? 0) >= MAX_DETAILS_PER_CALL) return { state: "limit" };

  // The lead's address is the fallback, and costs a second read only when the
  // call row has none of its own.
  const to = call.parent_email ?? (call.lead_id ? (await readLead(call.lead_id))?.email ?? null : null);
  if (!to) return { state: "no-email" };
  return { state: "ready", callId: call.id, leadId: call.lead_id, to };
}

/**
 * Do the slow half, after the response has gone. Nothing is waiting to observe
 * this, so a failure has to be recorded rather than returned (FR-006).
 *
 * The counter is raised before the send and in SQL, so a provider failure still
 * consumes one of the three — the cap exists to protect the email quota, and a
 * failing provider is exactly when a parent asks again. The parent is not left
 * stuck: the agent offers the office number on the attempt that fails.
 */
export async function deliverDetails(
  plan: Extract<DetailsPlan, { state: "ready" }>,
  topics: readonly InfoTopic[],
  answers = "",
  classWanted: string | null = null,
): Promise<void> {
  const supabase = createAdminClient();
  try {
    await supabase.rpc("increment_details_sent", { call_row_id: plan.callId });
    const lead = plan.leadId ? await readLead(plan.leadId) : null;
    const mail = await parentMail(lead, topics.length > 0 ? topics : INFO_TOPICS, [], answers, classWanted);
    const sent = mail ? await sendEmail({ to: plan.to, ...mail }) : { ok: false as const, error: "no published content" };
    if (!sent.ok) await recordFailure(plan.callId, "parent", sent.error);
    // The address itself is never logged.
    console.info(`[email] details ${sent.ok ? "sent" : "failed"} for call ${plan.callId}`);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[email] details failed for call ${plan.callId}: ${message} @ ${new Date().toISOString()}`);
    await recordFailure(plan.callId, "parent", message).catch(() => {});
  }
}
