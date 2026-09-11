/**
 * The shape of one leads row, as the dashboard reads it. Kept separate from
 * lib/leads/queries.ts (which reads through the service-role client, for
 * POST /api/leads) because this type is also imported by browser code — the
 * live-updating table — and queries.ts pulls in server-only Supabase code
 * that cannot go into a client bundle.
 */
export const LEAD_STATUSES = ["new", "contacted", "applied", "closed"] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export type LeadRow = {
  id: string;
  created_at: string;
  status: LeadStatus;
  parent_name: string | null;
  student_name: string | null;
  class_wanted: string | null;
  student_age: number | null;
  phone: string | null;
  current_class: string | null;
  previous_school: string | null;
  admission_type: "fresh" | "transfer" | null;
  language: "ur" | "en" | null;
};

/**
 * The columns the Leads screen reads. Shared so the first page load (a Server
 * Component) and the browser's 10-second refresh always ask for exactly the
 * same shape.
 */
export const LEAD_COLUMNS =
  "id, created_at, status, parent_name, student_name, class_wanted, " +
  "student_age, phone, current_class, previous_school, admission_type, language";
