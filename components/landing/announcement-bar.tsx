import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { currentOrNextWindow, formatDateKey, officeOpenNow, schoolToday } from "@/lib/landing/admissions";
import { heroStrings as h } from "@/lib/strings/landing-hero";
import styles from "./landing.module.css";

/**
 * The thin bar above the header: the admission window a parent cares about
 * now, and whether the office is open at this moment in Karachi. Each half
 * appears only when its published data can answer it; with neither, no bar.
 */
export function AnnouncementBar({ lang, facts }: { lang: Lang; facts: Facts | null }) {
  if (!facts) return null;
  const now = new Date();
  const admission = currentOrNextWindow(facts.admissionDates, schoolToday(now));
  const office = officeOpenNow(facts.officeHours, now);
  if (!admission && office === null) return null;

  return (
    <div className={styles.announce} role="note">
      <div className={`${styles.wrap} ${styles.announceInner}`}>
        {admission && (
          <span className={styles.announceItem}>
            <i className={`${styles.dot} ${admission.status === "open" ? styles.dotOpen : styles.dotInfo}`} aria-hidden="true" />
            {admission.status === "open" ? h.admissionsOpenUntil[lang] : h.nextAdmissions[lang]}{" "}
            <bdi>
              {formatDateKey(admission.status === "open" ? admission.range.endDate : admission.range.startDate, lang)}
            </bdi>
          </span>
        )}
        {office !== null && (
          <span className={styles.announceItem}>
            <i className={`${styles.dot} ${office ? styles.dotOpen : styles.dotClosed}`} aria-hidden="true" />
            {office ? h.officeOpenNow[lang] : h.officeClosedNow[lang]}
          </span>
        )}
      </div>
    </div>
  );
}
