import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { formatDateKey, schoolToday, windowStatus, type WindowStatus } from "@/lib/landing/admissions";
import { contentStrings as s } from "@/lib/strings/landing-content";
import { SectionState } from "./section-state";
import sections from "./sections.module.css";
import styles from "./features.module.css";

const DOT: Record<WindowStatus, string> = { open: styles.dotOpen, upcoming: styles.dotUpcoming, closed: "" };
const TAG: Record<WindowStatus, string> = { open: styles.tagOpen, upcoming: styles.tagUpcoming, closed: styles.tagClosed };
const LABEL = { open: s.statusOpen, upcoming: s.statusUpcoming, closed: s.statusClosed };

/**
 * Every published admission date range in order, each tagged Open now,
 * Upcoming or Closed by today's date in Karachi. The tag is a word as well as
 * a colour, so colour is never the only signal.
 */
export function AdmissionTimeline({
  lang,
  admissionDates,
  failed,
}: {
  lang: Lang;
  admissionDates: Facts["admissionDates"];
  failed: boolean;
}) {
  const today = schoolToday();
  const ranges = admissionDates
    .filter((range) => range.startDate && range.endDate)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  return (
    <div>
      <h3 className={sections.subTitle}>{s.datesTitle[lang]}</h3>
      {failed || ranges.length === 0 ? (
        <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.datesEmpty} lang={lang} />
      ) : (
        <ol className={styles.timeline}>
          {ranges.map((range, i) => {
            const status = windowStatus(range, today);
            return (
              <li key={i} className={styles.timelineItem}>
                <span className={`${styles.timelineDot} ${DOT[status]}`} aria-hidden="true" />
                <div className={styles.timelineBody}>
                  <div className={styles.timelineHead}>
                    <span className={styles.timelineLabel} dir="auto">
                      {range.label}
                    </span>
                    <span className={`${styles.tag} ${TAG[status]}`}>{LABEL[status][lang]}</span>
                  </div>
                  <div className={styles.timelineDates}>
                    <bdi>{formatDateKey(range.startDate, lang)}</bdi> – <bdi>{formatDateKey(range.endDate, lang)}</bdi>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
