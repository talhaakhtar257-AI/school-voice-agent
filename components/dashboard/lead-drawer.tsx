"use client";

import { useEffect } from "react";
import type { Lang } from "@/lib/language";
import { LEAD_STATUSES, type LeadRow, type LeadStatus } from "@/lib/leads/rows";
import { formatDateTime } from "@/lib/dashboard/format";
import { leadsAdminStrings as l } from "@/lib/strings/leads-admin";
import { screenStrings as d } from "@/lib/strings/dashboard-screens";
import { STATUS_LABEL } from "./status-tag";
import ui from "./ui.module.css";
import panels from "./panels.module.css";

/**
 * Side panel with every field of one lead, a tap-to-call link and the status
 * menu. Closes on Esc, on the close button, or on a tap outside. Slides in
 * from the inline end, so it opens from the left in Urdu.
 */
export function LeadDrawer({
  lead,
  lang,
  saveFailed,
  onClose,
  onStatusChange,
}: {
  lead: LeadRow;
  lang: Lang;
  saveFailed: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}) {
  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  const dash = l.notGiven[lang];
  const admissionType =
    lead.admission_type === "fresh" ? l.fresh[lang] : lead.admission_type === "transfer" ? l.transfer[lang] : dash;
  const language = lead.language === "ur" ? l.urdu[lang] : lead.language === "en" ? l.english[lang] : dash;

  const fields: [{ en: string; ur: string }, string][] = [
    [l.date, formatDateTime(lead.created_at, lang)],
    [l.parentName, lead.parent_name ?? dash],
    [l.studentName, lead.student_name ?? dash],
    [l.classWanted, lead.class_wanted ?? dash],
    [l.currentClass, lead.current_class ?? dash],
    [l.age, lead.student_age?.toString() ?? dash],
    [l.phone, lead.phone ?? dash],
    [l.previousSchool, lead.previous_school ?? dash],
    [l.admissionType, admissionType],
    [l.language, language],
  ];

  return (
    <>
      <div className={panels.scrim} onClick={onClose} aria-hidden="true" />
      <div className={panels.drawer} role="dialog" aria-modal="true" aria-labelledby="lead-drawer-title">
        <div className={panels.drHead}>
          <div>
            <h2 id="lead-drawer-title" className={panels.drTitle}>
              {d.leadDetails[lang]}
            </h2>
            <div className={ui.sub} dir="auto">
              {lead.parent_name ?? dash}
            </div>
          </div>
          <button type="button" className={panels.drClose} onClick={onClose} aria-label={d.close[lang]}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <dl className={panels.drMeta}>
          {fields.map(([label, value]) => (
            <div key={label.en}>
              <dt>{label[lang]}</dt>
              <dd dir="auto">{value}</dd>
            </div>
          ))}
        </dl>

        <div className={panels.drFoot}>
          {lead.phone ? (
            <a className={`${ui.btn} ${ui.btnPrimary}`} href={`tel:${lead.phone.replace(/\s/g, "")}`}>
              {d.callBack[lang]}
            </a>
          ) : (
            <span className={ui.muted}>{d.noPhone[lang]}</span>
          )}
          <label className={panels.drStatus}>
            {l.status[lang]}
            <select
              className={ui.select}
              value={lead.status}
              onChange={(event) => onStatusChange(lead.id, event.target.value as LeadStatus)}
            >
              {LEAD_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABEL[status][lang]}
                </option>
              ))}
            </select>
          </label>
          {saveFailed && (
            <p role="alert" className={panels.error}>
              {l.saveFailed[lang]}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
