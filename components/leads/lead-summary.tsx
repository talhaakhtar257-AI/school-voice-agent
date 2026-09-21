import type { Lang } from "@/lib/language";
import type { LeadWithCall } from "@/lib/leads/rows";
import { leadDetailStrings as s } from "@/lib/strings/lead-details";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./lead-details.module.css";

/** The call summary, first thing on the lead details page (FR-009). */
export function LeadSummary({ lead, lang }: { lead: LeadWithCall; lang: Lang }) {
  const summary = lead.summary ?? lead.call?.summary ?? null;
  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <h2 className={ui.cardTitle}>{s.summaryTitle[lang]}</h2>
      </div>
      {summary ? (
        <p className={styles.summary} dir="auto">
          {summary}
        </p>
      ) : (
        <p className={ui.muted}>{lead.call ? s.summaryPending[lang] : s.summaryNone[lang]}</p>
      )}
    </section>
  );
}
