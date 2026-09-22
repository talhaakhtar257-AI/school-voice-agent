import type { Lang } from "@/lib/language";
import type { LeadWithCall } from "@/lib/leads/rows";
import { leadDetailStrings as s } from "@/lib/strings/lead-details";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./lead-details.module.css";

/** The call summary, right under the lead's header (FR-009). */
export function LeadSummary({ lead, lang }: { lead: LeadWithCall; lang: Lang }) {
  const summary = lead.summary ?? lead.call?.summary ?? null;
  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <h2 className={ui.cardTitle}>{s.summaryTitle[lang]}</h2>
      </div>
      <div className={ui.cardBody}>
        {summary ? (
          <p className={styles.summary} dir="auto">
            {summary}
          </p>
        ) : (
          <p className={ui.muted} style={{ margin: 0 }}>
            {lead.call ? s.summaryPending[lang] : s.summaryNone[lang]}
          </p>
        )}
        {lead.call && (lead.call.school_email_sent_at || lead.call.parent_email_sent_at || lead.call.email_error) && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
            {lead.call.school_email_sent_at && <span className={`${ui.tag} ${ui.tagApplied}`}>✓ {s.emailSchoolSent[lang]}</span>}
            {lead.call.parent_email_sent_at && <span className={`${ui.tag} ${ui.tagApplied}`}>✓ {s.emailParentSent[lang]}</span>}
            {lead.call.email_error && (
              <span className={`${ui.tag} ${ui.tagContacted}`} title={lead.call.email_error}>
                ! {s.emailProblem[lang]}: <bdi dir="ltr">{lead.call.email_error}</bdi>
              </span>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
