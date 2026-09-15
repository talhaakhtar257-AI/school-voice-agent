import Link from "next/link";
import { readLang } from "@/lib/language-server";
import { callsStartedOn } from "@/lib/dashboard/usage";
import { countNewLeads, leadsLast7Days, orNull, recentLeads } from "@/lib/dashboard/overview";
import { formatDate, utcDateKey } from "@/lib/dashboard/format";
import { listUnansweredQuestions } from "@/lib/unanswered/list";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import { leadsAdminStrings as l } from "@/lib/strings/leads-admin";
import { StatTile } from "@/components/dashboard/stat-tile";
import { BarRows } from "@/components/dashboard/bar-rows";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LeadsChart } from "@/components/dashboard/leads-chart";
import { LanguageTag, StatusTag } from "@/components/dashboard/status-tag";
import ui from "@/components/dashboard/ui.module.css";

export const dynamic = "force-dynamic";

function show(value: number | null) {
  return value === null ? "—" : value.toLocaleString("en-US");
}

/**
 * Overview. Every figure is real data: there is no calls table, so call counts
 * come from the voice usage tables and the chart shows leads, not calls. Each
 * card reads independently, so one failed query shows one error card.
 */
export default async function DashboardOverviewPage() {
  const lang = await readLang();
  const [days, recent, newLeads, gaps, callsToday] = await Promise.all([
    orNull("leads-7-days", leadsLast7Days()),
    orNull("recent-leads", recentLeads()),
    orNull("new-leads", countNewLeads()),
    orNull("gaps", listUnansweredQuestions()),
    orNull("calls-today", callsStartedOn(utcDateKey())),
  ]);

  const leads7 = days ? days.reduce((sum, day) => sum + day.en + day.ur + day.none, 0) : null;
  const loadError = <EmptyState tone="error" title={s.loadErrorTitle[lang]} body={s.loadErrorBody[lang]} />;
  const smallGhost = `${ui.btn} ${ui.btnGhost} ${ui.btnSmall} ${ui.headAction}`;

  return (
    <div className={ui.stack}>
      <div className={ui.tiles}>
        <StatTile label={s.tileCallsToday[lang]} value={show(callsToday)} hint={callsToday === null ? s.notAvailable[lang] : s.tileCallsTodayHint[lang]} />
        <StatTile label={s.tileLeads7[lang]} value={show(leads7)} hint={leads7 === null ? s.notAvailable[lang] : undefined} />
        <StatTile label={s.tileNewLeads[lang]} value={show(newLeads)} hint={newLeads === null ? s.notAvailable[lang] : s.tileNewLeadsHint[lang]} />
        <StatTile label={s.tileGaps[lang]} value={show(gaps?.length ?? null)} hint={gaps === null ? s.notAvailable[lang] : s.tileGapsHint[lang]} />
      </div>

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
                  <th scope="col">{l.classWanted[lang]}</th>
                  <th scope="col">{l.language[lang]}</th>
                  <th scope="col">{l.status[lang]}</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((lead) => (
                  <tr key={lead.id}>
                    <td className={ui.num}>{formatDate(lead.created_at, lang)}</td>
                    <td dir="auto"><b>{lead.parent_name ?? l.notGiven[lang]}</b></td>
                    <td dir="auto">{lead.class_wanted ?? l.notGiven[lang]}</td>
                    <td><LanguageTag language={lead.language} lang={lang} /></td>
                    <td><StatusTag status={lead.status} lang={lang} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
