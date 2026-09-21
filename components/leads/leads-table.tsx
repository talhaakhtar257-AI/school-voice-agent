"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/language";
import { leadsAdminStrings as s } from "@/lib/strings/leads-admin";
import { leadDetailStrings as t } from "@/lib/strings/lead-details";
import { LEAD_STATUSES, type LeadRow, type LeadStatus } from "@/lib/leads/rows";
import { formatDate } from "@/lib/dashboard/format";
import { refreshLeadsAction, updateLeadStatusAction } from "@/app/dashboard/leads/actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import { STATUS_LABEL } from "@/components/dashboard/status-tag";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./lead-details.module.css";

/**
 * The Leads screen's table: Name, Contact, Email, Summary, Status, Date
 * (FR-008). Starts from the rows the server already fetched, then polls every
 * 10 seconds so a lead saved during a call appears without a reload. A row
 * opens the lead's own details page. Renders its own empty state, so it stays
 * correct if polling takes the list from populated back to empty.
 */
export function LeadsTable({ initialLeads, lang }: { initialLeads: LeadRow[]; lang: Lang }) {
  const router = useRouter();
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
  const headings = [t.name, t.contact, t.email, t.summary, s.status, s.date];

  return (
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
                {t.open[lang]}
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const href = `/dashboard/leads/${lead.id}`;
            return (
              <tr key={lead.id} className={ui.clickableRow} onClick={() => router.push(href)}>
                <td dir="auto">
                  <b>{lead.parent_name ?? dash}</b>
                  {(lead.student_name || lead.class_wanted) && (
                    <div className={ui.muted} style={{ fontSize: "0.8rem" }}>
                      {[lead.student_name, lead.class_wanted].filter(Boolean).join(" · ")}
                    </div>
                  )}
                </td>
                <td className={ui.num} dir="ltr" style={{ whiteSpace: "nowrap", textAlign: "start" }}>
                  {lead.phone ?? dash}
                </td>
                <td dir="ltr" style={{ textAlign: "start" }}>
                  {lead.email ?? dash}
                </td>
                <td dir="auto">
                  <span className={styles.clamp}>{lead.summary ?? dash}</span>
                </td>
                {/* The menu must not also open the details page. */}
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
                <td className={ui.num} style={{ whiteSpace: "nowrap" }}>
                  {formatDate(lead.created_at, lang)}
                </td>
                <td onClick={(event) => event.stopPropagation()}>
                  <Link href={href} className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                    {t.open[lang]}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
