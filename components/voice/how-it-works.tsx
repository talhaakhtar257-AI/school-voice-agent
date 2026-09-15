import type { Lang } from "@/lib/language";
import { landingStrings as s } from "@/lib/strings/landing";
import { sectionStrings } from "@/lib/strings/landing-sections";
import styles from "@/components/landing/sections.module.css";

// The step strings carry their own number ("1." / "١۔"); the card shows the
// number as a badge instead, so the prefix is dropped for display.
const STEP_PREFIX = /^\s*[0-9٠-٩]+\s*[.۔]\s*/;

/** The three-step strip, shown before a parent starts a conversation (FR-006). */
export function HowItWorks({ lang }: { lang: Lang }) {
  const steps = [s.howItWorksStep1, s.howItWorksStep2, s.howItWorksStep3];

  return (
    <section className={styles.section} id="how">
      <h2 className={styles.title}>{s.howItWorksTitle[lang]}</h2>
      <p className={styles.lead}>{sectionStrings.howLead[lang]}</p>
      <ol className={`${styles.grid} ${styles.gridThree}`} style={{ listStyle: "none", padding: 0 }}>
        {steps.map((step, i) => (
          <li key={i} className={styles.card}>
            <div className={styles.stepNumber} aria-hidden="true">
              {i + 1}
            </div>
            <p>{step[lang].replace(STEP_PREFIX, "")}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
