"use client";

import { useState } from "react";
import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import { TalkPanel } from "@/components/voice/talk-panel";
import styles from "./talk-card.module.css";

/**
 * The green card holding the call. On wide screens it sits in the sticky side
 * column; on phones it is the first block under the header, so the Talk button
 * is above the fold (FR-003). The decision, recording and privacy notices are
 * shown before any conversation starts (FR-005, FR-014).
 */
export function TalkCard({ lang }: { lang: Lang }) {
  const [speaking, setSpeaking] = useState(false);

  return (
    <div className={`${styles.card} ${speaking ? styles.speaking : ""}`}>
      <div className={styles.top}>
        <h2 className={styles.cardTitle}>{s.talkCardTitle[lang]}</h2>
        <span className={styles.liveDot}>
          <i aria-hidden="true" />
          {s.talkCardReady[lang]}
        </span>
      </div>

      <div className={styles.orbWrap} aria-hidden="true">
        <div className={styles.orb}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
          </svg>
        </div>
      </div>

      <TalkPanel lang={lang} onSpeakingChange={setSpeaking} />

      <ul className={styles.notices}>
        <li>{landingStrings.aiDisclosure[lang]}</li>
        <li>{landingStrings.decisionNotice[lang]}</li>
        <li>{landingStrings.recordingNotice[lang]}</li>
        <li>{landingStrings.privacyLine[lang]}</li>
      </ul>
    </div>
  );
}
