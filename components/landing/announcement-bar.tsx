import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { currentOrNextWindow, formatDateKey, officeOpenNow, schoolToday } from "@/lib/landing/admissions";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { heroStrings as h } from "@/lib/strings/landing-hero";
import { PhoneIcon } from "./icons";
import styles from "./landing.module.css";

/**
 * The bar above the header. It always carries the office phone, so the number
 * is visible without scrolling at every width (FR-004). The admission window
 * and the "office open now" badge appear only when published data can answer
 * them.
 */
export function AnnouncementBar({ lang, facts }: { lang: Lang; facts: Facts | null }) {
  const now = new Date();
  const admission = facts ? currentOrNextWindow(facts.admissionDates, schoolToday(now)) : null;
  const office = facts ? officeOpenNow(facts.officeHours, now) : null;

  return (
    <div className={styles.announce}>
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
        <a className={styles.announcePhone} href={`tel:${OFFICE_PHONE_E164}`}>
          <PhoneIcon size={14} />
          {h.officeLabel[lang]}
          <bdi className={styles.latin}>{OFFICE_PHONE_DISPLAY}</bdi>
        </a>
      </div>
    </div>
  );
}
