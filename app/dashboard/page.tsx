import Link from "next/link";
import { readLang } from "@/lib/language-server";
import { leadsLast7Days, orNull, recentLeads } from "@/lib/dashboard/overview";
import { getPeriodStats } from "@/lib/dashboard/period-stats";
import { formatDate } from "@/lib/dashboard/format";
import { listUnansweredQuestions } from "@/lib/unanswered/list";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import { leadsAdminStrings as l } from "@/lib/strings/leads-admin";
import { leadDetailStrings as t } from "@/lib/strings/lead-details";
import { StatsStrip } from "@/components/dashboard/stats-strip";
import { BarRows } from "@/components/dashboard/bar-rows";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LeadsChart } from "@/components/dashboard/leads-chart";
import { StatusTag } from "@/components/dashboard/status-tag";
import { LeadAvatar } from "@/components/leads/lead-avatar";
import ui from "@/components/dashboard/ui.module.css";
import people from "@/components/leads/lead-details.module.css";

export const dynamic = "force-dynamic";

/**
 * Overview. Today / This week figures on top (FR-010), then the leads chart,
 * the top gaps, and the 10 newest leads, each opening its details page. Each
 * card reads independently, so one failed query shows one error card.
 */
export default async function DashboardOverviewPage() {
  const lang = await readLang();
  const [days, recent, gaps, stats] = await Promise.all([
    orNull("leads-7-days", leadsLast7Days()),
    orNull("recent-leads", recentLeads(10)),
    orNull("gaps", listUnansweredQuestions()),
    orNull("period-stats", getPeriodStats()),
  ]);

  const leads7 = days ? days.reduce((sum, day) => sum + day.en + day.ur + day.none, 0) : null;
  const loadError = <EmptyState tone="error" title={s.loadErrorTitle[lang]} body={s.loadErrorBody[lang]} />;
  const smallGhost = `${ui.btn} ${ui.btnGhost} ${ui.btnSmall} ${ui.headAction}`;

  return (
    <div className={ui.stack}>
      <StatsStrip stats={stats} lang={lang} />

      <section className={ui.card}>
        <div className={ui.cardHead}>
          <h2 className={ui.cardTitle}>{s.recentTitle[lang]}</h2>
          <Link href="/dashboard/leads" className={smallGhost}>
            {s.seeAllLeads[lang]}
          </Link>
        </div>
        {recent === null ? loadError : recent.length === 0 ? (
          <EmptyState title={l.emptyTitle[lang]} body={l.emptyBody[lang]} />
        ) : (
          <div className={ui.tscroll}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th scope="col">{l.date[lang]}</th>
                  <th scope="col">{l.parentName[lang]}</th>
                  <th scope="col">{l.phone[lang]}</th>
                  <th scope="col">{l.classWanted[lang]}</th>
                  <th scope="col">{l.status[lang]}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((lead) => (
                  <tr key={lead.id}>
                    <td className={ui.num}>{formatDate(lead.created_at, lang)}</td>
                    <td>
                      <Link href={`/dashboard/leads/${lead.id}`} className={people.person} style={{ color: "inherit", textDecoration: "none" }}>
                        <LeadAvatar name={lead.parent_name} />
                        {lead.parent_name ? (
                          <b><bdi>{lead.parent_name}</bdi></b>
                        ) : (
                          <span className={ui.muted} style={{ fontStyle: "italic" }}>{t.noName[lang]}</span>
                        )}
                      </Link>
                    </td>
                    <td className={ui.num} style={{ whiteSpace: "nowrap" }}>
                      {lead.phone ? <bdi dir="ltr">{lead.phone}</bdi> : <span className={ui.muted}>{l.notGiven[lang]}</span>}
                    </td>
                    <td>{lead.class_wanted ? <bdi>{lead.class_wanted}</bdi> : <span className={ui.muted}>{l.notGiven[lang]}</span>}</td>
                    <td><StatusTag status={lead.status} lang={lang} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className={ui.row2}>
        <section className={ui.card}>
          <div className={ui.cardHead}>
            <div>
              <h2 className={ui.cardTitle}>{s.chartTitle[lang]}</h2>
              <div className={ui.sub}>{s.chartSub[lang]}</div>
            </div>
          </div>
          {days === null ? loadError : leads7 === 0 ? (
            <EmptyState title={s.chartTitle[lang]} body={s.chartEmpty[lang]} />
          ) : (
            <LeadsChart days={days} lang={lang} />
          )}
        </section>

        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2 className={ui.cardTitle}>{s.topGapsTitle[lang]}</h2>
            <Link href="/dashboard/unanswered" className={smallGhost}>
              {s.seeAllGaps[lang]}
            </Link>
          </div>
          {gaps === null ? loadError : gaps.length === 0 ? (
            <EmptyState title={s.topGapsTitle[lang]} body={s.topGapsEmpty[lang]} />
          ) : (
            <BarRows
              rows={gaps.slice(0, 5).map((gap) => ({
                key: gap.id,
                label: gap.question_text,
                value: gap.times_asked,
                valueLabel: `${gap.times_asked} ${s.timesShort[lang]}`,
              }))}
            />
          )}
        </section>
      </div>
    </div>
  );
}
