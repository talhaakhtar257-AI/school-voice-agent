import { runHealthChecks, type CheckKey } from "@/lib/dashboard/health";
import { callsStartedOn, minutesReservedThisMonth } from "@/lib/dashboard/usage";
import { formatCost, formatDelay, getCallMetrics } from "@/lib/dashboard/call-metrics";
import { orNull } from "@/lib/dashboard/overview";
import { utcDateKey } from "@/lib/dashboard/format";
import { voiceLimits } from "@/lib/dashboard/settings";
import { listUnansweredQuestions } from "@/lib/unanswered/list";
import { readLang } from "@/lib/language-server";
import { dashboardStrings } from "@/lib/strings/dashboard";
import { screenStrings as h } from "@/lib/strings/dashboard-screens";
import { StatTile } from "@/components/dashboard/stat-tile";
import ui from "@/components/dashboard/ui.module.css";
import panels from "@/components/dashboard/panels.module.css";

export const dynamic = "force-dynamic";

type Text = { en: string; ur: string };

const CHECK_TEXT: Record<CheckKey, { name: Text; ok: Text; bad: Text; demo?: Text }> = {
  db: { name: h.checkDb, ok: h.checkDbOk, bad: h.checkDbBad },
  content: { name: h.checkContent, ok: h.checkContentOk, bad: h.checkContentBad },
  retell: { name: h.checkRetell, ok: h.checkRetellOk, bad: h.checkRetellBad },
  limits: { name: h.checkLimits, ok: h.checkLimitsOk, bad: h.checkLimitsBad },
  phone: { name: h.checkPhone, ok: h.checkPhoneOk, bad: h.checkPhoneBad, demo: h.checkPhoneDemo },
};

/**
 * Staff health screen (004 User Story 3, as far as today's data allows). No
 * invented uptime figures. The response delay is no longer invented either: it
 * is the figure Retell measured for each call, stored by the webhook since
 * feature 013, which is what 004 FR-012 was waiting for. Every check reads as a
 * word and an icon, never colour alone (FR-011).
 */
export default async function DashboardHealthPage() {
  const lang = await readLang();
  const limits = voiceLimits();
  const [checks, callsToday, minutes, gaps, metrics] = await Promise.all([
    runHealthChecks(),
    orNull("calls-today", callsStartedOn(utcDateKey())),
    orNull("minutes-month", minutesReservedThisMonth()),
    orNull("gaps", listUnansweredQuestions()),
    orNull("call-metrics", getCallMetrics()),
  ]);

  const unavailable = dashboardStrings.notAvailable[lang];
  const cap = limits.monthlyCapMinutes;

  // This week, not today: a single day often holds too few measured calls to
  // mean anything, and FR-013 forbids showing one call as a trend.
  const week = metrics?.week ?? null;
  const basedOn = (n: number) => h.healthBasedOn[lang].replace("{n}", String(n));
  const delay = formatDelay(week?.averageReplyDelayMs ?? null);
  const worst = formatDelay(week?.worstReplyDelayMs ?? null);
  const cost = formatCost(week?.totalCostCents ?? null);
  const perCall = formatCost(week?.averageCostCents ?? null);

  return (
    <div className={ui.stack}>
      <div className={ui.tiles}>
        <StatTile
          label={h.healthCallsToday[lang]}
          value={callsToday === null ? "—" : String(callsToday)}
          hint={callsToday === null ? unavailable : dashboardStrings.tileCallsTodayHint[lang]}
        />
        <StatTile
          label={h.healthMinutes[lang]}
          value={minutes === null ? "—" : `${Math.round(minutes)} / ${cap ?? "—"}`}
          percent={minutes !== null && cap ? (minutes / cap) * 100 : undefined}
          hint={minutes === null ? unavailable : h.healthMinutesHint[lang]}
        />
        <StatTile
          label={h.healthGaps[lang]}
          value={gaps === null ? "—" : String(gaps.length)}
          hint={gaps === null ? unavailable : dashboardStrings.tileGapsHint[lang]}
        />
        {/*
         * Reply delay and cost (004 FR-012, finally). Three states each, all
         * reachable: unavailable when the read failed, not-measured when no
         * call in the period carried a figure, and the figure itself with the
         * number of calls it rests on. Over target is said in words, never by
         * colour alone (FR-014, Constitution IX).
         */}
        <StatTile
          label={h.healthReplyDelay[lang]}
          value={week === null ? "—" : (delay ?? "—")}
          hint={
            week === null
              ? unavailable
              : delay === null
                ? h.healthNotMeasuredYet[lang]
                : `${basedOn(week.measuredCalls)}${worst ? ` · ${h.healthReplyDelayWorst[lang]}: ${worst}` : ""}${
                    week.overTarget ? ` · ${h.healthReplyDelayOver[lang]}` : ""
                  }`
          }
        />
        <StatTile
          label={h.healthCost[lang]}
          value={week === null ? "—" : (cost ?? "—")}
          hint={
            week === null
              ? unavailable
              : cost === null
                ? h.healthNotMeasuredYet[lang]
                : `${basedOn(week.costedCalls)}${perCall ? ` · ${perCall} ${h.healthPerCall[lang]}` : ""}`
          }
        />
      </div>

      <section className={ui.card}>
        <div className={ui.cardHead}>
          <h2 className={ui.cardTitle}>{h.checksTitle[lang]}</h2>
        </div>
        <ul className={panels.checks}>
          {checks.map((check) => {
            const text = CHECK_TEXT[check.key];
            return (
              <li key={check.key} className={panels.hrow}>
                <span className={panels.hname}>{text.name[lang]}</span>
                <span className={`${panels.hstat} ${check.ok ? panels.hstatOk : panels.hstatWarn}`}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    {check.ok ? (
                      <path d="M20 6 9 17l-5-5" />
                    ) : (
                      <path d="M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
                    )}
                  </svg>
                  {check.ok ? h.ok[lang] : h.attention[lang]}
                </span>
                <span className={panels.hdetail}>
                  {check.demo && text.demo ? text.demo[lang] : check.ok ? text.ok[lang] : text.bad[lang]}
                </span>
              </li>
            );
          })}
        </ul>
        <p className={panels.note}>{h.phase2Note[lang]}</p>
      </section>
    </div>
  );
}
