import Image from "next/image";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { heroStrings as h } from "@/lib/strings/landing-hero";
import { CallButton } from "./call/call-button";
import { MicIcon } from "./icons";
import { LanguageToggle } from "./language-toggle";
import styles from "./landing.module.css";

/**
 * Sticky header, as in the design. The office phone lives here so it is
 * visible without scrolling at every screen width (FR-004); on phones it
 * wraps to its own row, and the Talk button moves to the floating button.
 */
export function SiteHeader({ lang, tagline }: { lang: Lang; tagline: string }) {
  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.nav}`}>
        <a className={styles.brand} href="#top">
          <Image src="/school-logo.svg" alt="" width={40} height={40} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>{landingStrings.schoolName[lang]}</span>
            {tagline && (
              <span className={styles.brandSub} dir="auto">
                {tagline}
              </span>
            )}
          </span>
        </a>

        <nav className={styles.navLinks} aria-label={h.navLabel[lang]}>
          <a href="#programs">{h.navPrograms[lang]}</a>
          <a href="#fees">{h.navFees[lang]}</a>
          <a href="#process">{h.navProcess[lang]}</a>
          <a href="#faq">{h.navFaq[lang]}</a>
        </nav>

        <LanguageToggle lang={lang} />

        <CallButton className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSm} ${styles.headerCall}`}>
          <MicIcon size={16} />
          {h.headerCall[lang]}
        </CallButton>

        <div className={styles.phoneRow}>
          <span>{h.officeLabel[lang]}</span>
          <a href={`tel:${OFFICE_PHONE_E164}`} className={`${styles.phoneLink} ${styles.latin}`}>
            {OFFICE_PHONE_DISPLAY}
          </a>
        </div>
      </div>
    </header>
  );
}
