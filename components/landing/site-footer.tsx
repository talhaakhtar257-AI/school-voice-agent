import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import styles from "./landing.module.css";

/** Footer: name, the office phone again, and published office hours. */
export function SiteFooter({ lang, officeHours }: { lang: Lang; officeHours: Facts["officeHours"] }) {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.wrap} ${styles.footGrid}`}>
        <div>
          <h2>{landingStrings.schoolName[lang]}</h2>
          <p>{landingStrings.decisionNotice[lang]}</p>
        </div>

        <div>
          <h2>{s.footerContact[lang]}</h2>
          <p>{s.officeLabel[lang]}</p>
          <a href={`tel:${OFFICE_PHONE_E164}`} className={`${styles.phoneLink} ${styles.latin}`}>
            {OFFICE_PHONE_DISPLAY}
          </a>
        </div>

        <div>
          <h2>{s.footerOfficeHours[lang]}</h2>
          {officeHours.length === 0 ? (
            <p>{s.footerHoursEmpty[lang]}</p>
          ) : (
            officeHours.map((hours, i) => (
              // Days and times are stored language-neutral, shown in Latin digits.
              <p key={i} className={styles.latin} dir="ltr">
                {hours.days}: {hours.opens} – {hours.closes}
              </p>
            ))
          )}
        </div>
      </div>
    </footer>
  );
}
