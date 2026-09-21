"use client";

import type { Lang } from "@/lib/language";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/leads/rows";
import { leadDetailStrings as t } from "@/lib/strings/lead-details";
import { STATUS_LABEL } from "@/components/dashboard/status-tag";
import styles from "./lead-details.module.css";

export type LeadFilter = LeadStatus | "all";

/** Status tabs with counts, and a search box, above the Leads table. */
export function LeadsToolbar({
  lang,
  filter,
  onFilter,
  counts,
  query,
  onQuery,
}: {
  lang: Lang;
  filter: LeadFilter;
  onFilter: (next: LeadFilter) => void;
  counts: Record<LeadFilter, number>;
  query: string;
  onQuery: (next: string) => void;
}) {
  const options: LeadFilter[] = ["all", ...LEAD_STATUSES];
  return (
    <div className={styles.toolbar}>
      <div className={styles.chips} role="group" aria-label={t.filterLabel[lang]}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={styles.chip}
            aria-pressed={filter === option}
            onClick={() => onFilter(option)}
          >
            {option === "all" ? t.filterAll[lang] : STATUS_LABEL[option][lang]}
            <span className={styles.chipCount}>{counts[option]}</span>
          </button>
        ))}
      </div>
      <input
        type="search"
        className={styles.search}
        aria-label={t.searchLabel[lang]}
        placeholder={t.searchPlaceholder[lang]}
        value={query}
        onChange={(event) => onQuery(event.target.value)}
      />
    </div>
  );
}
