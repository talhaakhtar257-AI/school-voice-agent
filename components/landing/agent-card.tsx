import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { agentQuote, heroStrings as h } from "@/lib/strings/landing-hero";
import { CallButton } from "./call/call-button";
import { MicIcon } from "./icons";
import styles from "./hero.module.css";

/**
 * The green agent card from the design. Its id lets the floating talk card
 * know when this card has scrolled out of view. The AI, decision, recording
 * and privacy notices are visible here before any call starts (FR-005, FR-014).
 */
export function AgentCard({ lang, schoolName }: { lang: Lang; schoolName: string }) {
  return (
    <div className={styles.agentCard} id="hero-agent-card">
      <div className={styles.acTop}>
        <span className={styles.liveDot}>
          <i aria-hidden="true" />
          {h.assistantReady[lang]}
        </span>
        <span className={styles.acLang}>English · اردو</span>
      </div>

      <div className={styles.orbWrap} aria-hidden="true">
        <div className={styles.orb}>
          <MicIcon strokeWidth={1.8} />
        </div>
      </div>
      <div className={styles.wave} aria-hidden="true">
        {Array.from({ length: 7 }, (_, i) => (
          <span key={i} />
        ))}
      </div>

      <p className={styles.acQuote}>{agentQuote(schoolName, lang)}</p>

      <CallButton className={styles.acButton}>
        <MicIcon size={18} />
        {h.startCall[lang]}
      </CallButton>
      <p className={styles.acNote}>{h.micNote[lang]}</p>

      <ul className={styles.acNotices}>
        <li>{landingStrings.aiDisclosure[lang]}</li>
        <li>{landingStrings.decisionNotice[lang]}</li>
        <li>{landingStrings.recordingNotice[lang]}</li>
        <li>{landingStrings.privacyLine[lang]}</li>
      </ul>
    </div>
  );
}
