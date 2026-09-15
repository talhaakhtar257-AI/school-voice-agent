import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import styles from "./sections.module.css";

/**
 * Hero text. Chips are limited to claims the product can keep — no "24 hours"
 * (the call caps can refuse a call) and no invented school statistics.
 */
export function Hero({ lang }: { lang: Lang }) {
  const chips = [s.chipLanguages, s.chipAi, s.chipStaff];
  return (
    <div className={styles.hero} id="top">
      <span className={styles.eyebrow}>{s.heroEyebrow[lang]}</span>
      <h1 className={styles.heroTitle}>{landingStrings.headline[lang]}</h1>
      <p className={styles.lead}>{s.heroLead[lang]}</p>
      <div className={styles.chips}>
        {chips.map((chip) => (
          <span key={chip.en} className={styles.chip}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            {chip[lang]}
          </span>
        ))}
      </div>
    </div>
  );
}
