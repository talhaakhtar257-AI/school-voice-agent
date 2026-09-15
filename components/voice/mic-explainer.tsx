"use client";

import type { Lang } from "@/lib/language";
import { landingStrings as s } from "@/lib/strings/landing";
import styles from "@/components/landing/call/call.module.css";

/**
 * Shown inside the call window before the browser's microphone permission
 * prompt (FR-013). A step the parent confirms, not a passive notice — the call
 * provider only contacts Retell after Continue, so the explanation is strictly
 * first. The AI, recording, privacy and decision notices sit here too, so they
 * are seen before any conversation starts (FR-005, FR-014).
 */
export function MicExplainer({ lang, onContinue }: { lang: Lang; onContinue: () => void }) {
  return (
    <div className={styles.explainer}>
      <p className={styles.explainerTitle}>{s.micExplainerTitle[lang]}</p>
      <p className={styles.explainerText}>{s.micExplainerBody[lang]}</p>
      <ul className={styles.notices}>
        <li>{s.aiDisclosure[lang]}</li>
        <li>{s.recordingNotice[lang]}</li>
        <li>{s.privacyLine[lang]}</li>
        <li>{s.decisionNotice[lang]}</li>
      </ul>
      <button type="button" onClick={onContinue} className={styles.continue}>
        {s.micExplainerContinue[lang]}
      </button>
    </div>
  );
}
