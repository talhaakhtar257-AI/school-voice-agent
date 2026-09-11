import { createAdminClient } from "@/lib/supabase/admin";
import type { IncomingEnquiry } from "./schema";

/**
 * Store a validated enquiry as a lead. Status is always "new" here, never taken
 * from the request (FR-025). A phone number or name is stored only when its
 * paired `*Confirmed` flag is true; otherwise the column is left NULL and the
 * lead is still saved (FR-024). Uses the service-role client — RLS gives
 * `authenticated` no INSERT policy on `leads`, by design.
 */
export async function insertLead(enquiry: IncomingEnquiry): Promise<string> {
  const supabase = createAdminClient();

  const row = {
    status: "new" as const,
    parent_name: enquiry.parentNameConfirmed ? (enquiry.parentName ?? null) : null,
    student_name: enquiry.studentNameConfirmed
      ? (enquiry.studentName ?? null)
      : null,
    class_wanted: enquiry.classWanted ?? null,
    student_age: enquiry.studentAge ?? null,
    phone: enquiry.phoneConfirmed ? (enquiry.phone ?? null) : null,
    current_class: enquiry.currentClass ?? null,
    previous_school: enquiry.previousSchool ?? null,
    admission_type: enquiry.admissionType ?? null,
    language: enquiry.language ?? null,
    consent: enquiry.consent ?? null,
    retell_call_id: enquiry.retellCallId ?? null,
  };

  const { data, error } = await supabase
    .from("leads")
    .insert(row)
    .select("id")
    .single<{ id: string }>();

  if (error) throw error;
  return data.id;
}
