import { runHealthChecks, type CheckKey } from "@/lib/dashboard/health";
import { callsStartedOn, minutesReservedThisMonth } from "@/lib/dashboard/usage";
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

const CHECK_TEXT: Record<CheckKey, { name: Text; ok: Text; bad: Text }> = {
  db: { name: h.checkDb, ok: h.checkDbOk, bad: h.checkDbBad },
  content: { name: h.checkContent, ok: h.checkContentOk, bad: h.checkContentBad },
  retell: { name: h.checkRetell, ok: h.checkRetellOk, bad: h.checkRetellBad },
  limits: { name: h.checkLimits, ok: h.checkLimitsOk, bad: h.checkLimitsBad },
  phone: { name: h.checkPhone, ok: h.checkPhoneOk, bad: h.checkPhoneBad },
};

/**
 * Staff health screen (004 User Story 3, as far as today's data allows). No
 * invented uptime or response-delay figures: those need call records. Every
 * check reads as a word and an icon, never colour alone (FR-011).
 */
export default async function DashboardHealthPage() {
  const lang = await readLang();
  const limits = voiceLimits();
  const [checks, callsToday, minutes, gaps] = await Promise.all([
    runHealthChecks(),
    orNull("calls-today", callsStartedOn(utcDateKey())),
    orNull("minutes-month", minutesReservedThisMonth()),
    orNull("gaps", listUnansweredQuestions()),
  ]);

  const unavailable = dashboardStrings.notAvailable[lang];
  const cap = limits.monthlyCapMinutes;

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
                <span className={panels.hdetail}>{check.ok ? text.ok[lang] : text.bad[lang]}</span>
              </li>
            );
          })}
        </ul>
        <p className={panels.note}>{h.phase2Note[lang]}</p>
      </section>
    </div>
  );
}
