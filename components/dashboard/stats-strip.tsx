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

const ICONS = {
  calls: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />,
  leads: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M19 8v6M22 11h-6" />
    </>
  ),
  length: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  questions: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
};

function Period({ title, hint, figures, lang }: { title: string; hint?: string; figures: PeriodFigures; lang: Lang }) {
  const items: { key: keyof typeof ICONS; label: string; value: string; gold?: boolean }[] = [
    { key: "calls", label: s.statsCalls[lang], value: figures.calls.toLocaleString("en-US") },
    { key: "leads", label: s.statsLeads[lang], value: figures.leads.toLocaleString("en-US") },
    {
      key: "length",
      label: s.statsAvgLength[lang],
      value: figures.averageCallSeconds === null ? "—" : formatDuration(figures.averageCallSeconds),
    },
    { key: "questions", label: s.statsNewQuestions[lang], value: figures.newQuestions.toLocaleString("en-US"), gold: true },
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
        {items.map((item) => (
          <div key={item.key} className={styles.figure}>
            <span className={`${styles.icon} ${item.gold ? styles.iconGold : ""}`} aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {ICONS[item.key]}
              </svg>
            </span>
            <div>
              <dt>{item.label}</dt>
              <dd className={ui.num}>
                {/* Isolated LTR so "3:05" never reorders inside an Urdu page. */}
                <span dir="ltr">{item.value}</span>
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
