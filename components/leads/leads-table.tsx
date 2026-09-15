"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { Lang } from "@/lib/language";
import { leadsAdminStrings as s } from "@/lib/strings/leads-admin";
import { screenStrings as d } from "@/lib/strings/dashboard-screens";
import { LEAD_STATUSES, type LeadRow, type LeadStatus } from "@/lib/leads/rows";
import { formatDate } from "@/lib/dashboard/format";
import { refreshLeadsAction, updateLeadStatusAction } from "@/app/dashboard/leads/actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LanguageTag, STATUS_LABEL } from "@/components/dashboard/status-tag";
import { LeadDrawer } from "@/components/dashboard/lead-drawer";
import ui from "@/components/dashboard/ui.module.css";

/**
 * The Leads screen's table. Starts from the rows the server already fetched
 * (no loading flash on open), then polls every 10 seconds so a lead captured
 * by the voice agent appears without a manual reload (FR-006, SC-002) —
 * chosen over Supabase Realtime to avoid a database change for this screen.
 * Renders its own empty state so it stays correct even if polling takes the
 * list from populated back to empty. Tapping a row opens the lead drawer.
 */
export function LeadsTable({ initialLeads, lang }: { initialLeads: LeadRow[]; lang: Lang }) {
  const [leads, setLeads] = useState(initialLeads);
  const [rowError, setRowError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
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

  const closeDrawer = useCallback(() => setOpenId(null), []);

  function handleStatusChange(id: string, next: LeadStatus) {
    const previous = leads.find((lead) => lead.id === id)?.status;
    setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, status: next } : r)));
    setRowError(null);
    startTransition(() => {
      void updateLeadStatusAction(id, next).then((result) => {
        if (!result.ok && previous) {
          setLeads((rows) => rows.map((r) => (r.id === id ? { ...r, status: previous } : r)));
          setRowError(id);
        }
      });
    });
  }

  if (leads.length === 0) {
    return <EmptyState title={s.emptyTitle[lang]} body={s.emptyBody[lang]} />;
  }

  const dash = s.notGiven[lang];
  const openLead = leads.find((lead) => lead.id === openId) ?? null;
  const headings = [
    s.date, s.parentName, s.studentName, s.classWanted, s.currentClass, s.age,
    s.phone, s.previousSchool, s.admissionType, s.language, s.status,
  ];

  return (
    <>
      <div className={ui.tscroll}>
        <table className={ui.table}>
          <thead>
            <tr>
              {headings.map((heading) => (
                <th key={heading.en} scope="col">
                  {heading[lang]}
                </th>
              ))}
              <th scope="col">
                <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                  {d.details[lang]}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className={ui.clickableRow} onClick={() => setOpenId(lead.id)}>
                <td className={ui.num} style={{ whiteSpace: "nowrap" }}>
                  {formatDate(lead.created_at, lang)}
                </td>
                <td dir="auto"><b>{lead.parent_name ?? dash}</b></td>
                <td dir="auto">{lead.student_name ?? dash}</td>
                <td dir="auto">{lead.class_wanted ?? dash}</td>
                <td dir="auto">{lead.current_class ?? dash}</td>
                <td className={ui.num}>{lead.student_age ?? dash}</td>
                <td className={ui.num} dir="ltr" style={{ whiteSpace: "nowrap", textAlign: "start" }}>
                  {lead.phone ?? dash}
                </td>
                <td dir="auto">{lead.previous_school ?? dash}</td>
                <td>
                  {lead.admission_type === "fresh"
                    ? s.fresh[lang]
                    : lead.admission_type === "transfer"
                      ? s.transfer[lang]
                      : dash}
                </td>
                <td>
                  <LanguageTag language={lead.language} lang={lang} />
                </td>
                {/* The menu must not also open the drawer. */}
                <td onClick={(event) => event.stopPropagation()}>
                  <select
                    className={ui.select}
                    aria-label={s.status[lang]}
                    value={lead.status}
                    onChange={(event) => handleStatusChange(lead.id, event.target.value as LeadStatus)}
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status][lang]}
                      </option>
                    ))}
                  </select>
                  {rowError === lead.id && (
                    <p role="alert" style={{ color: "var(--crit)", fontSize: "0.75rem", margin: "0.25rem 0 0" }}>
                      {s.saveFailed[lang]}
                    </p>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      setOpenId(lead.id);
                    }}
                  >
                    {d.details[lang]}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openLead && (
        <LeadDrawer
          lead={openLead}
          lang={lang}
          saveFailed={rowError === openLead.id}
          onClose={closeDrawer}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}
