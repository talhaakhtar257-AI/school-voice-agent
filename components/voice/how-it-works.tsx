import type { Lang } from "@/lib/language";
import { landingStrings as s } from "@/lib/strings/landing";
import { contentStrings } from "@/lib/strings/landing-content";
import landing from "@/components/landing/landing.module.css";
import sections from "@/components/landing/sections.module.css";

// The step strings carry their own number ("1." / "١۔"); the card shows the
// number as a badge instead, so the prefix is dropped for display.
const STEP_PREFIX = /^\s*[0-9٠-٩]+\s*[.۔]\s*/;

/** The three-step strip, shown before a parent starts a conversation (FR-006). */
export function HowItWorks({ lang }: { lang: Lang }) {
  const steps = [s.howItWorksStep1, s.howItWorksStep2, s.howItWorksStep3];

  return (
    <section className={sections.section} id="how">
      <div className={landing.wrap}>
        <h2 className={sections.sectionTitle}>{s.howItWorksTitle[lang]}</h2>
        <p className={sections.sectionLead}>{contentStrings.howLead[lang]}</p>
        <ol className={sections.grid3}>
          {steps.map((step, i) => (
            <li key={i} className={sections.card}>
              <div className={sections.stepN} aria-hidden="true">
                {i + 1}
              </div>
              <p>{step[lang].replace(STEP_PREFIX, "")}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
