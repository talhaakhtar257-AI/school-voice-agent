import Image from "next/image";
import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { heroStrings as h } from "@/lib/strings/landing-hero";
import { CallButton } from "./call/call-button";
import { MicIcon } from "./icons";
import { LanguageToggle } from "./language-toggle";
import styles from "./landing.module.css";

/**
 * Sticky header, as in the design: logo and name, section links, language
 * switch and a Talk button. The office phone sits in the announcement bar
 * directly above, so it stays visible without making this row wrap.
 */
export function SiteHeader({ lang, tagline }: { lang: Lang; tagline: string }) {
  return (
    <header className={styles.header}>
      <div className={`${styles.wrap} ${styles.nav}`}>
        <a className={styles.brand} href="#top">
          <Image src="/school-logo.svg" alt="" width={42} height={42} priority />
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
      </div>
    </header>
  );
}
