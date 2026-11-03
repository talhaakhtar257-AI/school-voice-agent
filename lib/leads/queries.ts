import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { IncomingEnquiry } from "./schema";
import { LEAD_COLUMNS, type LeadRow, type LeadWithCall, type TranscriptTurn } from "./rows";

/**
 * Store a validated enquiry as a lead. Status is always "new" here, never taken
 * from the request (FR-025). A phone number or name is stored only when its
 * paired `*Confirmed` flag is true; otherwise the column is left NULL and the
 * lead is still saved (FR-024). Uses the service-role client — RLS gives
 * `authenticated` no INSERT policy on `leads`, by design.
 */
export async function insertLead(enquiry: IncomingEnquiry, callId: string | null = null): Promise<string> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("leads")
    .insert({ status: "new" as const, ...leadValues(enquiry), retell_call_id: callId })
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return data.id;
}

/**
 * The values an enquiry may store. Only what the parent confirmed, only what
 * is actually present — so the same object works for a first insert and for a
 * later update that must never blank out an earlier answer. A parent who says
 * the office may NOT call them keeps their lead, without the phone number
 * (`.claude/rules/api.md`).
 */
function leadValues(enquiry: IncomingEnquiry): Record<string, string | number | boolean | null> {
  const text = (value: string | undefined) => (value && value.trim() !== "" ? value.trim() : undefined);
  const values: Record<string, string | number | boolean | null | undefined> = {
    parent_name: enquiry.parentNameConfirmed ? text(enquiry.parentName) : undefined,
    student_name: enquiry.studentNameConfirmed ? text(enquiry.studentName) : undefined,
    class_wanted: text(enquiry.classWanted),
    student_age: enquiry.studentAge,
    phone: enquiry.phoneConfirmed ? text(enquiry.phone) : undefined,
    current_class: text(enquiry.currentClass),
    previous_school: text(enquiry.previousSchool),
    admission_type: enquiry.admissionType,
    language: enquiry.language,
    consent: enquiry.consent,
  };
  if (enquiry.consent === false) values.phone = null;
  return Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined)) as Record<
    string,
    string | number | boolean | null
  >;
}

/** Every column `leadValues` can write, so a repeat save can be compared. */
const WRITABLE = [
  "parent_name",
  "student_name",
  "class_wanted",
  "student_age",
  "phone",
  "current_class",
  "previous_school",
  "admission_type",
  "language",
  "consent",
] as const;

type StoredLead = { id: string } & Record<string, string | number | boolean | null>;

/**
 * One lead per call (FR-003). The agent saves once the phone is confirmed and
 * again at the end; the second save fills in the same row. Another call's lead
 * is never touched, and status is never set here.
 *
 * Repeat-safe since feature 013 (slice C). The 3 November test call shows the
 * model firing save_lead four times in two identical pairs on the same row,
 * each returning the same id — so the prompt cannot be relied on to stop it and
 * the endpoint has to make it harmless. Fields are now compared against what is
 * stored and only the differences are written; an identical repeat does no
 * write at all and reports `outcome: "unchanged"`.
 *
 * This also settles the race where the parent's typed form and the agent's
 * first save reach the same row at once: whichever arrives second writes only
 * what the first did not already store.
 *
 * Merge, never replace. `leadValues` omits anything absent, so a later save
 * carrying only the child's age cannot blank a class recorded earlier
 * (`.claude/rules/api.md`). The one deliberate blanking — consent withdrawn
 * clearing the phone — stays, because the rules require it.
 */
export async function upsertLeadForCall(
  enquiry: IncomingEnquiry,
  callId: string,
): Promise<{ id: string; outcome: "inserted" | "updated" | "unchanged" }> {
  const supabase = createAdminClient();
  const { data: existing, error: findError } = await supabase
    .from("leads")
    .select(["id", ...WRITABLE].join(", "))
    .eq("retell_call_id", callId)
    .maybeSingle<StoredLead>();
  if (findError) throw findError;

  if (!existing) {
    try {
      return { id: await insertLead(enquiry, callId), outcome: "inserted" };
    } catch (error) {
      // 23505: two saves in the same call raced; the other one inserted first.
      // Still the backstop — comparing above cannot prevent a true collision.
      if ((error as { code?: string }).code !== "23505") throw error;
      return upsertLeadForCall(enquiry, callId);
    }
  }

  // Only what actually differs. An empty object means the agent told us
  // nothing new, so the row is left alone.
  const values = leadValues(enquiry);
  const changed = Object.fromEntries(
    Object.entries(values).filter(([column, value]) => existing[column] !== value),
  );
  if (Object.keys(changed).length === 0) {
    return { id: existing.id, outcome: "unchanged" };
  }

  const { error } = await supabase.from("leads").update(changed).eq("id", existing.id);
  if (error) throw error;
  return { id: existing.id, outcome: "updated" };
}

/**
 * Read every lead for the dashboard's Leads screen, newest first (FR-004).
 * Goes through the signed-in staff member's own session, never the service
 * key — the database rules require the dashboard to read via an
 * authenticated session, and the leads_select_authenticated RLS policy
 * (feature 005 migration) already allows it.
 */
export async function listLeads(): Promise<LeadRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as LeadRow[];
}

/**
 * One lead and its call, for the lead details page. Read through the staff
 * session (RLS allows authenticated reads of both tables). Returns null when
 * no such lead exists.
 */
export async function getLeadWithCall(id: string): Promise<LeadWithCall | null> {
  const supabase = await createClient();
  const { data: lead, error } = await supabase
    .from("leads")
    .select(LEAD_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!lead) return null;

  const { data: call, error: callError } = await supabase
    .from("calls")
    .select("status, transcript, summary, email_error, school_email_sent_at, parent_email_sent_at")
    .eq("lead_id", id)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (callError) throw callError;

  return {
    ...(lead as unknown as LeadRow),
    call: call
      ? {
          status: call.status as "ongoing" | "ended",
          transcript: Array.isArray(call.transcript) ? (call.transcript as TranscriptTurn[]) : null,
          summary: call.summary as string | null,
          email_error: call.email_error as string | null,
          school_email_sent_at: call.school_email_sent_at as string | null,
          parent_email_sent_at: call.parent_email_sent_at as string | null,
        }
      : null,
  };
}
