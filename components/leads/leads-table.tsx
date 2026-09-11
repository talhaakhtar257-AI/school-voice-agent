"use client";

import { useEffect, useState, useTransition } from "react";
import { leadsAdminStrings as s } from "@/lib/strings/leads-admin";
import { LEAD_STATUSES, type LeadRow, type LeadStatus } from "@/lib/leads/rows";
import { refreshLeadsAction, updateLeadStatusAction } from "@/app/dashboard/leads/actions";

const STATUS_LABEL: Record<LeadStatus, { en: string; ur: string }> = {
  new: s.statusNew,
  contacted: s.statusContacted,
  applied: s.statusApplied,
  closed: s.statusClosed,
};

function cell(value: string | number | null): string {
  return value === null || value === "" ? s.notGiven.en : String(value);
}

/**
 * The Leads screen's table. Starts from the rows the server already fetched
 * (no loading flash on open), then polls every 10 seconds so a lead captured
 * by the voice agent appears without a manual reload (FR-006, SC-002) —
 * chosen over Supabase Realtime to avoid a database change for this screen.
 * Renders its own empty state so it stays correct even if polling takes the
 * list from populated back to empty.
 */
export function LeadsTable({ initialLeads }: { initialLeads: LeadRow[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [rowError, setRowError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(() => {
      void refreshLeadsAction()
        .then(setLeads)
        .catch(() => {
          // A single missed poll is not worth alarming staff over — the next
          // 10-second tick tries again.
        });
    }, 10_000);
    return () => clearInterval(interval);
  }, []);

  function handleStatusChange(id: string, next: LeadStatus) {
    const previous = leads.find((l) => l.id === id)?.status;
    setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, status: next } : r)));
    setRowError(null);
    startTransition(() => {
      void updateLeadStatusAction(id, next).then((result) => {
        if (!result.ok && previous) {
          setLeads((rows) =>
            rows.map((r) => (r.id === id ? { ...r, status: previous } : r)),
          );
          setRowError(id);
        }
      });
    });
  }

  if (leads.length === 0) {
    return (
      <div
        dir="auto"
        style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}
      >
        <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>
          {s.emptyTitle.en} · {s.emptyTitle.ur}
        </p>
        <p style={{ margin: "0.5rem 0 0" }}>{s.emptyBody.en}</p>
        <p style={{ margin: 0 }}>{s.emptyBody.ur}</p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
        <thead>
          <tr style={{ textAlign: "start", borderBottom: "2px solid rgba(128,128,128,0.3)" }}>
            {[
              s.date,
              s.parentName,
              s.studentName,
              s.classWanted,
              s.currentClass,
              s.age,
              s.phone,
              s.previousSchool,
              s.admissionType,
              s.language,
              s.status,
            ].map((h) => (
              <th key={h.en} style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                {h.en} · {h.ur}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} style={{ borderBottom: "1px solid rgba(128,128,128,0.2)" }}>
              <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                {new Date(lead.created_at).toLocaleDateString()}
              </td>
              <td dir="auto" style={{ padding: "0.5rem 0.75rem" }}>
                {cell(lead.parent_name)}
              </td>
              <td dir="auto" style={{ padding: "0.5rem 0.75rem" }}>
                {cell(lead.student_name)}
              </td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{cell(lead.class_wanted)}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{cell(lead.current_class)}</td>
              <td style={{ padding: "0.5rem 0.75rem" }}>{cell(lead.student_age)}</td>
              <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                {cell(lead.phone)}
              </td>
              <td dir="auto" style={{ padding: "0.5rem 0.75rem" }}>
                {cell(lead.previous_school)}
              </td>
              <td style={{ padding: "0.5rem 0.75rem" }}>
                {lead.admission_type === "fresh"
                  ? `${s.fresh.en} · ${s.fresh.ur}`
                  : lead.admission_type === "transfer"
                    ? `${s.transfer.en} · ${s.transfer.ur}`
                    : s.notGiven.en}
              </td>
              <td style={{ padding: "0.5rem 0.75rem" }}>
                {lead.language === "ur"
                  ? s.urdu.en
                  : lead.language === "en"
                    ? s.english.en
                    : s.notGiven.en}
              </td>
              <td style={{ padding: "0.5rem 0.75rem" }}>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                  style={{ minHeight: "44px", padding: "0.25rem 0.5rem" }}
                >
                  {LEAD_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_LABEL[st].en}
                    </option>
                  ))}
                </select>
                {rowError === lead.id && (
                  <p
                    role="alert"
                    style={{ color: "var(--failure-border)", fontSize: "0.75rem", margin: "0.25rem 0 0" }}
                  >
                    {s.saveFailed.en}
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
