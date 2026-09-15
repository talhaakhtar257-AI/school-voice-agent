import Link from "next/link";
import type { Facts, Profile } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { heroStrings } from "@/lib/strings/landing-hero";
import { contentStrings as s } from "@/lib/strings/landing-content";
import styles from "./landing.module.css";

/**
 * The design's three-column footer: who we are, how to reach us, and when.
 * Its id lets the floating talk card hide once the footer is in view.
 */
export function SiteFooter({
  lang,
  profile,
  officeHours,
  schoolTimings,
}: {
  lang: Lang;
  profile: Profile | null;
  officeHours: Facts["officeHours"];
  schoolTimings: Facts["schoolTimings"];
}) {
  const schoolName = landingStrings.schoolName[lang];
  const tagline = profile?.tagline[lang] ?? "";
  const address = profile?.address[lang] ?? "";

  return (
    <footer className={styles.footer} id="site-footer">
      <div className={styles.wrap}>
        <div className={styles.footGrid}>
          <div>
            <h2 className={styles.footTitle}>{schoolName}</h2>
            {tagline && <p dir="auto">{tagline}</p>}
            <p>{landingStrings.decisionNotice[lang]}</p>
          </div>

          <div>
            <h2 className={styles.footTitle}>{s.visitTitle[lang]}</h2>
            {address && <p dir="auto">{address}</p>}
            <p>{heroStrings.officeLabel[lang]}</p>
            <a href={`tel:${OFFICE_PHONE_E164}`} className={`${styles.phoneLink} ${styles.latin}`}>
              {OFFICE_PHONE_DISPLAY}
            </a>
          </div>

          <div>
            <h2 className={styles.footTitle}>{s.footerHours[lang]}</h2>
            <p>
              <strong>{s.officeHoursTitle[lang]}</strong>
            </p>
            {officeHours.length === 0 ? (
              <p>{s.noOfficeHours[lang]}</p>
            ) : (
              officeHours.map((row, i) => (
                <p key={i}>
                  <bdi className={styles.latin}>
                    {row.days}: {row.opens}–{row.closes}
                  </bdi>
                </p>
              ))
            )}
            {schoolTimings.length > 0 && (
              <>
                <p>
                  <strong>{s.timingsTitle[lang]}</strong>
                </p>
                {schoolTimings.map((timing, i) => (
                  <p key={i}>
                    <span dir="auto">{timing.label[lang] || timing.label.en || timing.label.ur}</span>:{" "}
                    <bdi className={styles.latin}>
                      {timing.days} {timing.starts}–{timing.ends}
                    </bdi>
                  </p>
                ))}
              </>
            )}
          </div>
        </div>

        <div className={styles.footBottom}>
          <span>
            © <span className={styles.latin}>{new Date().getFullYear()}</span> {schoolName}
          </span>
          <Link href="/login">{s.footerStaff[lang]}</Link>
        </div>
      </div>
    </footer>
  );
}
