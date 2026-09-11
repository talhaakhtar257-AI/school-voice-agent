import { listLeads } from "@/lib/leads/queries";
import { LeadsTable } from "@/components/leads/leads-table";
import { leadsAdminStrings as s } from "@/lib/strings/leads-admin";

export const dynamic = "force-dynamic";

/** Staff see every parent enquiry, newest first (User Story 1, FR-003/FR-004). */
export default async function LeadsPage() {
  let leads;
  try {
    leads = await listLeads();
  } catch {
    return (
      <div dir="auto" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <p role="alert" style={{ color: "var(--failure-border)", fontWeight: 600 }}>
          {s.errorTitle.en} · {s.errorTitle.ur}
        </p>
        <p style={{ color: "var(--text-secondary)" }}>{s.errorBody.en}</p>
        <p style={{ color: "var(--text-secondary)" }}>{s.errorBody.ur}</p>
      </div>
    );
  }

  return (
    <div dir="auto">
      <h2 style={{ margin: "0 0 1rem" }}>
        {s.title.en} · {s.title.ur}
      </h2>
      <LeadsTable initialLeads={leads} />
    </div>
  );
}
