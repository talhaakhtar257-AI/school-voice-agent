"use client";

import type { Lang } from "@/lib/language";
import { landingStrings as s } from "@/lib/strings/landing";
import styles from "@/components/landing/talk-card.module.css";

/**
 * Shown before the browser's microphone permission prompt (FR-013). A step the
 * parent confirms, not a passive notice — talk-panel.tsx only calls the SDK
 * after this is confirmed, so the explanation is strictly first.
 */
export function MicExplainer({ lang, onContinue }: { lang: Lang; onContinue: () => void }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="mic-explainer-title" className={styles.explainer}>
      <strong id="mic-explainer-title">{s.micExplainerTitle[lang]}</strong>
      <p>{s.micExplainerBody[lang]}</p>
      <button type="button" onClick={onContinue} className={styles.continueButton}>
        {s.micExplainerContinue[lang]}
      </button>
    </div>
  );
}
