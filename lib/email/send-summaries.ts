import { createAdminClient } from "@/lib/supabase/admin";
import { readLiveForApi } from "@/lib/content/queries";
import { emailConfigured, sendEmail } from "./send";
import { parentDetailsEmail, schoolEnquiryEmail } from "./templates";
import { INFO_TOPICS, renderInfoPack, type InfoTopic } from "./info-pack";

type Which = "school" | "parent";
const COLUMN: Record<Which, string> = { school: "school_email_sent_at", parent: "parent_email_sent_at" };

/**
 * Claim the right to send one email for one call. Only the request that flips
 * the column from empty to a time gets `true`, so Retell sending the same
 * event twice can never send two emails (FR-022, FR-023).
 */
async function claim(callId: string, which: Which): Promise<boolean> {
  const { data, error } = await createAdminClient()
    .from("calls")
    .update({ [COLUMN[which]]: new Date().toISOString() })
    .eq("id", callId)
    .is(COLUMN[which], null)
    .select("id");
  if (error) throw error;
  return (data ?? []).length > 0;
}

/** Undo a claim after a failed send and keep the reason for staff (FR-024). */
async function recordFailure(callId: string, which: Which, reason: string): Promise<void> {
  await createAdminClient()
    .from("calls")
    .update({ [COLUMN[which]]: null, email_error: `${which}: ${reason}`.slice(0, 400) })
    .eq("id", callId);
}


/**
 * After Retell's summary arrives: email the school about the enquiry, and the
 * parent if they typed an email. Never throws — email trouble is recorded on
 * the call and the webhook still answers 200.
 */
type CallForEmail = { id: string; lead_id: string | null; summary: string | null; parent_email: string | null; transcript: unknown };
type LeadForEmail = { parent_name: string | null; phone: string | null; student_name: string | null; class_wanted: string | null; student_age: number | null; email: string | null };

async function readLead(leadId: string): Promise<LeadForEmail | null> {
  const { data } = await createAdminClient()
    .from("leads")
    .select("parent_name, phone, student_name, class_wanted, student_age, email")
    .eq("id", leadId)
    .maybeSingle<LeadForEmail>();
  return data ?? null;
}

type Turn = { role: "agent" | "user"; content: string };
const asTurns = (value: unknown): Turn[] => (Array.isArray(value) ? (value as Turn[]) : []);

/**
 * The parent's email: the conversation (after the call) plus the info pack
 * for these topics, from the published content.
 */
async function parentMail(lead: LeadForEmail | null, topics: readonly InfoTopic[], transcript: Turn[] = [], answers = "") {
  const live = await readLiveForApi();
  if (!live) return null;
  const pack = renderInfoPack({ doc: live.doc, classWanted: lead?.class_wanted ?? null, studentAge: lead?.student_age ?? null, topics });
  return parentDetailsEmail(lead?.parent_name ?? null, pack, transcript, answers);
}

export async function sendCallSummaries(call: CallForEmail, siteOrigin: string): Promise<void> {
  if (!call.summary || !call.lead_id) return;
  const schoolTo = process.env.SCHOOL_NOTIFY_EMAIL;
  if (!emailConfigured() || !schoolTo) {
    await createAdminClient().from("calls").update({ email_error: "email not configured" }).eq("id", call.id).is("school_email_sent_at", null);
    return;
  }

  try {
    const lead = await readLead(call.lead_id);

    if (await claim(call.id, "school")) {
      const mail = schoolEnquiryEmail({
        parentName: lead?.parent_name ?? null,
        phone: lead?.phone ?? null,
        studentName: lead?.student_name ?? null,
        classWanted: lead?.class_wanted ?? null,
        studentAge: lead?.student_age ?? null,
        email: lead?.email ?? call.parent_email,
        summary: call.summary,
        transcript: asTurns(call.transcript),
        leadUrl: `${siteOrigin}/dashboard/leads/${call.lead_id}`,
      });
      const sent = await sendEmail({ to: schoolTo, ...mail });
      if (!sent.ok) await recordFailure(call.id, "school", sent.error);
      console.info(`[email] school ${sent.ok ? "sent" : "failed"} for call ${call.id}`);
    }

    const parentTo = call.parent_email ?? lead?.email ?? null;
    if (parentTo && (await claim(call.id, "parent"))) {
      const mail = await parentMail(lead, INFO_TOPICS, asTurns(call.transcript));
      const sent = mail ? await sendEmail({ to: parentTo, ...mail }) : { ok: false as const, error: "no published content" };
      if (!sent.ok) await recordFailure(call.id, "parent", sent.error);
      // The address itself is never logged.
      console.info(`[email] parent ${sent.ok ? "sent" : "failed"} for call ${call.id}`);
    }
  } catch (error) {
    console.error(`[email] ${error instanceof Error ? error.message : "unknown"} for call ${call.id}`);
  }
}

/**
 * The send_details tool (feature 011): while the call is still going, email
 * the parent the details they just asked for. Returns whether it went out.
 */
export async function sendDetailsDuringCall(
  retellCallId: string,
  topics: readonly InfoTopic[],
  answers = "",
): Promise<"sent" | "no-email" | "failed"> {
  const { data: call } = await createAdminClient()
    .from("calls")
    .select("id, lead_id, parent_email")
    .eq("retell_call_id", retellCallId)
    .maybeSingle<{ id: string; lead_id: string | null; parent_email: string | null }>();
  const lead = call?.lead_id ? await readLead(call.lead_id) : null;
  const to = call?.parent_email ?? lead?.email ?? null;
  if (!to) return "no-email";
  const mail = await parentMail(lead, topics.length > 0 ? topics : INFO_TOPICS, [], answers);
  if (!mail) return "failed";
  const sent = await sendEmail({ to, ...mail });
  console.info(`[email] details ${sent.ok ? "sent" : "failed"} for call ${call?.id ?? retellCallId}`);
  return sent.ok ? "sent" : "failed";
}
