import type { Facts, Profile } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { heroStrings } from "@/lib/strings/landing-hero";
import { contentStrings as s } from "@/lib/strings/landing-content";
import { ClockIcon, PhoneIcon, PinIcon } from "./icons";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

/** About the school, beside a "Visit us" card with address, phone and office hours. */
export function AboutSection({
  lang,
  profile,
  officeHours,
  failed,
}: {
  lang: Lang;
  profile: Profile | null;
  officeHours: Facts["officeHours"];
  failed: boolean;
}) {
  const about = profile?.about[lang] ?? "";
  const address = profile?.address[lang] ?? "";

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} id="about">
      <div className={`${landing.wrap} ${styles.split}`}>
        <div>
          <h2 className={styles.sectionTitle}>{s.aboutTitle[lang]}</h2>
          {failed || !about ? (
            <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.aboutEmpty} lang={lang} />
          ) : (
            <p className={styles.prose} dir="auto">
              {about}
            </p>
          )}
        </div>

        <div className={`${styles.card} ${styles.visitCard}`}>
          <h3>{s.visitTitle[lang]}</h3>
          {address && (
            <div className={styles.visitRow}>
              <PinIcon />
              <div>
                <div className={styles.visitLabel}>{s.addressLabel[lang]}</div>
                <div dir="auto">{address}</div>
              </div>
            </div>
          )}
          <div className={styles.visitRow}>
            <PhoneIcon />
            <div>
              <div className={styles.visitLabel}>{heroStrings.officeLabel[lang]}</div>
              <a href={`tel:${OFFICE_PHONE_E164}`} className={`${landing.phoneLink} ${landing.latin}`}>
                {OFFICE_PHONE_DISPLAY}
              </a>
            </div>
          </div>
          <div className={styles.visitRow}>
            <ClockIcon />
            <div>
              <div className={styles.visitLabel}>{s.officeHoursTitle[lang]}</div>
              {officeHours.length === 0 ? (
                <div>{s.noOfficeHours[lang]}</div>
              ) : (
                officeHours.map((row, i) => (
                  <div key={i}>
                    <bdi className={landing.latin}>
                      {row.days}: {row.opens}–{row.closes}
                    </bdi>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
