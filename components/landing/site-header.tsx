import Image from "next/image";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import { LanguageToggle } from "./language-toggle";
import styles from "./landing.module.css";

/**
 * Sticky header. The office phone lives here so it is visible without
 * scrolling at every screen width (FR-004); on phones it wraps to its own row.
 */
export function SiteHeader({ lang }: { lang: Lang }) {
  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.nav}`}>
        <a className={styles.brand} href="#top">
          <Image src="/school-logo.svg" alt="" width={40} height={40} />
          <span className={styles.brandName}>{landingStrings.schoolName[lang]}</span>
        </a>

        <nav className={styles.navLinks} aria-label={landingStrings.schoolName[lang]}>
          <a href="#programs">{s.navPrograms[lang]}</a>
          <a href="#fees">{s.navFees[lang]}</a>
          <a href="#process">{s.navProcess[lang]}</a>
          <a href="#faq">{s.navFaq[lang]}</a>
        </nav>

        <LanguageToggle lang={lang} />

        <div className={styles.phone}>
          <span>{s.officeLabel[lang]}</span>
          <a href={`tel:${OFFICE_PHONE_E164}`} className={`${styles.phoneLink} ${styles.latin}`}>
            {OFFICE_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </header>
  );
}
