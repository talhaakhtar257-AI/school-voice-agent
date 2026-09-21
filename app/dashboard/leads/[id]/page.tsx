import Link from "next/link";
import { getLeadWithCall } from "@/lib/leads/queries";
import { orNull } from "@/lib/dashboard/overview";
import { formatDateTime, formatDuration } from "@/lib/dashboard/format";
import { readLang } from "@/lib/language-server";
import { leadsAdminStrings as l } from "@/lib/strings/leads-admin";
import { leadDetailStrings as s } from "@/lib/strings/lead-details";
import { screenStrings as d } from "@/lib/strings/dashboard-screens";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LeadSummary } from "@/components/leads/lead-summary";
import { Conversation } from "@/components/leads/conversation";
import { LeadStatusControl } from "@/components/leads/lead-status-control";
import { LeadAvatar } from "@/components/leads/lead-avatar";
import ui from "@/components/dashboard/ui.module.css";
import styles from "@/components/leads/lead-details.module.css";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One lead (FR-009): the summary first, then the details and status, then the
 * whole conversation. Replaces the old side drawer.
 */
export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await readLang();
  // null = the read failed; "missing" = no such lead.
  const lead = UUID.test(id)
    ? await orNull("lead-details", getLeadWithCall(id).then((row) => row ?? ("missing" as const)))
    : ("missing" as const);

  const backLink = (
    <Link href="/dashboard/leads" className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
      ← {s.allLeads[lang]}
    </Link>
  );

  if (lead === null || lead === "missing") {
    const failed = lead === null;
    return (
      <div className={styles.stack}>
        <div>{backLink}</div>
        <section className={ui.card}>
          <EmptyState
            tone={failed ? "error" : "empty"}
            title={failed ? s.errorTitle[lang] : s.notFoundTitle[lang]}
            body={failed ? s.errorBody[lang] : s.notFoundBody[lang]}
          />
        </section>
      </div>
    );
  }

  const dash = l.notGiven[lang];
  const admissionType =
    lead.admission_type === "fresh" ? l.fresh[lang] : lead.admission_type === "transfer" ? l.transfer[lang] : dash;
  const language = lead.language === "ur" ? l.urdu[lang] : lead.language === "en" ? l.english[lang] : dash;
  const fields: [{ en: string; ur: string }, string, "ltr" | "auto"][] = [
    // Name, phone and date are in the header above.
    [s.email, lead.email ?? dash, "ltr"],
    [l.studentName, lead.student_name ?? dash, "auto"],
    [l.classWanted, lead.class_wanted ?? dash, "auto"],
    [l.age, lead.student_age?.toString() ?? dash, "auto"],
    [l.currentClass, lead.current_class ?? dash, "auto"],
    [l.previousSchool, lead.previous_school ?? dash, "auto"],
    [l.admissionType, admissionType, "auto"],
    [l.language, language, "auto"],
    [s.callLength, lead.call_duration_seconds !== null ? formatDuration(lead.call_duration_seconds) : dash, "ltr"],
  ];

  const subParts = [formatDateTime(lead.created_at, lang), lead.class_wanted].filter(Boolean);

  return (
    <div className={styles.stack}>
      <div>{backLink}</div>

      <section className={ui.card}>
        <div className={styles.header}>
          <LeadAvatar name={lead.parent_name} large />
          <div className={styles.personText}>
            <h2 className={styles.headerName}>
              {lead.parent_name ? <bdi>{lead.parent_name}</bdi> : <span className={ui.muted}>{s.noName[lang]}</span>}
            </h2>
            <div className={styles.headerSub}>
              {s.enquiry[lang]} · {subParts.map((part, i) => (
                <span key={i}>
                  {i > 0 && " · "}
                  <bdi>{part}</bdi>
                </span>
              ))}
            </div>
          </div>
          <div className={styles.headerActions}>
            {lead.phone ? (
              <a className={`${ui.btn} ${ui.btnPrimary}`} href={`tel:${lead.phone.replace(/s/g, "")}`}>
                {d.callBack[lang]} <bdi dir="ltr">{lead.phone}</bdi>
              </a>
            ) : (
              <span className={ui.muted}>{d.noPhone[lang]}</span>
            )}
            <LeadStatusControl id={lead.id} initial={lead.status} lang={lang} />
          </div>
        </div>
      </section>

      <LeadSummary lead={lead} lang={lang} />

      <section className={ui.card}>
        <div className={ui.cardHead}>
          <h2 className={ui.cardTitle}>{s.detailsTitle[lang]}</h2>
        </div>
        <dl className={`${styles.meta} ${ui.cardBody}`}>
          {fields.map(([label, value, dir]) => (
            <div key={label.en}>
              <dt>{label[lang]}</dt>
              <dd>
                <bdi dir={dir}>{value}</bdi>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={ui.card}>
        <div className={ui.cardHead}>
          <h2 className={ui.cardTitle}>{s.conversationTitle[lang]}</h2>
        </div>
        <Conversation call={lead.call} lang={lang} />
      </section>
    </div>
  );
}
