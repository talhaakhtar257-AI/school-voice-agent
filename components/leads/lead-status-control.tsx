"use client";

import { useState, useTransition } from "react";
import type { Lang } from "@/lib/language";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads/rows";
import { leadsAdminStrings as l } from "@/lib/strings/leads-admin";
import { updateLeadStatusAction } from "@/app/dashboard/leads/actions";
import { STATUS_LABEL } from "@/components/dashboard/status-tag";
import ui from "@/components/dashboard/ui.module.css";

/** The status menu on the lead details page. Goes back to the old value if saving fails. */
export function LeadStatusControl({ id, initial, lang }: { id: string; initial: LeadStatus; lang: Lang }) {
  const [status, setStatus] = useState(initial);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function change(next: LeadStatus) {
    const previous = status;
    setStatus(next);
    setFailed(false);
    startTransition(() => {
      void updateLeadStatusAction(id, next).then((result) => {
        if (!result.ok) {
          setStatus(previous);
          setFailed(true);
        }
      });
    });
  }

  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
      {l.status[lang]}
      <select
        className={ui.select}
        value={status}
        disabled={pending}
        onChange={(event) => change(event.target.value as LeadStatus)}
      >
        {LEAD_STATUSES.map((option) => (
          <option key={option} value={option}>
            {STATUS_LABEL[option][lang]}
          </option>
        ))}
      </select>
      {failed && (
        <span role="alert" style={{ color: "var(--crit)", fontSize: "0.8rem" }}>
          {l.saveFailed[lang]}
        </span>
      )}
    </label>
  );
}
