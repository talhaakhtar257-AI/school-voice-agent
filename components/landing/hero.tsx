import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { currentOrNextWindow, schoolToday } from "@/lib/landing/admissions";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { heroStrings as h } from "@/lib/strings/landing-hero";
import { AgentCard } from "./agent-card";
import { CallButton } from "./call/call-button";
import { CheckIcon, MicIcon, PhoneIcon } from "./icons";
import landing from "./landing.module.css";
import styles from "./hero.module.css";

/**
 * The design's two-column hero: words and the two main actions on one side,
 * the green agent card on the other. The Talk button is the largest control
 * and sits above the fold on a phone (FR-003). Chips only make claims the
 * product keeps — no "24 hours", no invented figures.
 */
export function Hero({
  lang,
  admissionDates,
  schoolName,
}: {
  lang: Lang;
  admissionDates: Facts["admissionDates"];
  schoolName: string;
}) {
  const admission = currentOrNextWindow(admissionDates, schoolToday());
  const eyebrow = admission?.range.label.trim() || h.heroEyebrow[lang];
  const chips = [h.chipLanguages, h.chipAi, h.chipStaff];

  return (
    <section className={styles.hero} id="top">
      <div className={`${landing.wrap} ${styles.heroGrid}`}>
        <div>
          <span className={styles.eyebrow} dir="auto">
            <i aria-hidden="true" />
            {eyebrow}
          </span>
          <h1 className={styles.heroTitle}>{h.heroTitle[lang]}</h1>
          <p className={styles.heroLead}>{h.heroLead[lang]}</p>

          <div className={styles.heroActions}>
            <CallButton className={`${landing.btn} ${landing.btnPrimary} ${landing.btnCall}`}>
              <MicIcon size={20} />
              {landingStrings.talkButton[lang]}
            </CallButton>
            <a className={`${landing.btn} ${landing.btnGhost} ${landing.btnCall}`} href={`tel:${OFFICE_PHONE_E164}`}>
              <PhoneIcon size={18} />
              {h.callOffice[lang]}
              <bdi className={landing.latin}>{OFFICE_PHONE_DISPLAY}</bdi>
            </a>
          </div>

          <div className={styles.chips}>
            {chips.map((chip) => (
              <span key={chip.en} className={styles.chip}>
                <CheckIcon size={15} strokeWidth={2.4} />
                {chip[lang]}
              </span>
            ))}
          </div>
        </div>

        <AgentCard lang={lang} schoolName={schoolName} />
      </div>
    </section>
  );
}
