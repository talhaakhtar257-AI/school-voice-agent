import type { Lang } from "@/lib/language";
import type { PeriodFigures, PeriodStats } from "@/lib/dashboard/period-stats";
import { formatDuration } from "@/lib/dashboard/format";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import { EmptyState } from "./empty-state";
import ui from "./ui.module.css";
import styles from "./stats-strip.module.css";

/**
 * Today and This week side by side (FR-010): calls, leads, average call
 * length and new questions the assistant couldn't answer. Zeroes are shown as
 * zeroes, so an empty day still reads as a real answer.
 */
export function StatsStrip({ stats, lang }: { stats: PeriodStats | null; lang: Lang }) {
  if (stats === null) {
    return (
      <section className={ui.card}>
        <EmptyState tone="error" title={s.loadErrorTitle[lang]} body={s.loadErrorBody[lang]} />
      </section>
    );
  }

  return (
    <div className={styles.strip}>
      <Period title={s.statsToday[lang]} figures={stats.today} lang={lang} />
      <Period title={s.statsWeek[lang]} hint={s.statsWeekHint[lang]} figures={stats.week} lang={lang} />
    </div>
  );
}

function Period({ title, hint, figures, lang }: { title: string; hint?: string; figures: PeriodFigures; lang: Lang }) {
  const items: [string, string][] = [
    [s.statsCalls[lang], figures.calls.toLocaleString("en-US")],
    [s.statsLeads[lang], figures.leads.toLocaleString("en-US")],
    [s.statsAvgLength[lang], figures.averageCallSeconds === null ? "—" : formatDuration(figures.averageCallSeconds)],
    [s.statsNewQuestions[lang], figures.newQuestions.toLocaleString("en-US")],
  ];
  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <div>
          <h2 className={ui.cardTitle}>{title}</h2>
          {hint && <div className={ui.sub}>{hint}</div>}
        </div>
      </div>
      <dl className={styles.figures}>
        {items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd className={ui.num}>
              {/* Isolated LTR so "3:05" never reorders inside an Urdu page. */}
              <span dir="ltr">{value}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
