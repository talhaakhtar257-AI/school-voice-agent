import { createAdminClient } from "@/lib/supabase/admin";
import { readLiveForApi } from "@/lib/content/queries";
import { emailConfigured, sendEmail } from "./send";
import { parentSummaryEmail, schoolEnquiryEmail } from "./templates";

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

function officeHoursLine(hours: { days: string; opens: string; closes: string }[]): string | null {
  return hours.length > 0 ? hours.map((h) => `${h.days} ${h.opens}–${h.closes}`).join(", ") : null;
}

/**
 * After Retell's summary arrives: email the school about the enquiry, and the
 * parent if they typed an email. Never throws — email trouble is recorded on
 * the call and the webhook still answers 200.
 */
export async function sendCallSummaries(call: { id: string; lead_id: string | null; summary: string | null; parent_email: string | null }, siteOrigin: string): Promise<void> {
  if (!call.summary || !call.lead_id) return;
  const schoolTo = process.env.SCHOOL_NOTIFY_EMAIL;
  if (!emailConfigured() || !schoolTo) {
    await createAdminClient().from("calls").update({ email_error: "email not configured" }).eq("id", call.id).is("school_email_sent_at", null);
    return;
  }

  try {
    const { data: lead } = await createAdminClient()
      .from("leads")
      .select("parent_name, phone, student_name, class_wanted, email")
      .eq("id", call.lead_id)
      .maybeSingle<{ parent_name: string | null; phone: string | null; student_name: string | null; class_wanted: string | null; email: string | null }>();

    if (await claim(call.id, "school")) {
      const mail = schoolEnquiryEmail({
        parentName: lead?.parent_name ?? null,
        phone: lead?.phone ?? null,
        studentName: lead?.student_name ?? null,
        classWanted: lead?.class_wanted ?? null,
        email: lead?.email ?? call.parent_email,
        summary: call.summary,
        leadUrl: `${siteOrigin}/dashboard/leads/${call.lead_id}`,
      });
      const sent = await sendEmail({ to: schoolTo, ...mail });
      if (!sent.ok) await recordFailure(call.id, "school", sent.error);
      console.info(`[email] school ${sent.ok ? "sent" : "failed"} for call ${call.id}`);
    }

    const parentTo = call.parent_email ?? lead?.email ?? null;
    if (parentTo && (await claim(call.id, "parent"))) {
      const live = await readLiveForApi();
      const mail = parentSummaryEmail(call.summary, officeHoursLine(live?.doc.facts.officeHours ?? []));
      const sent = await sendEmail({ to: parentTo, ...mail });
      if (!sent.ok) await recordFailure(call.id, "parent", sent.error);
      // The address itself is never logged.
      console.info(`[email] parent ${sent.ok ? "sent" : "failed"} for call ${call.id}`);
    }
  } catch (error) {
    console.error(`[email] ${error instanceof Error ? error.message : "unknown"} for call ${call.id}`);
  }
}
