"use client";

import { useState } from "react";
import type { ContentDoc } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { simulate, type SimulationResult } from "@/lib/content/simulate";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings as s } from "@/lib/strings/landing";
import styles from "@/components/landing/features.module.css";

/**
 * A parent types a question and gets an answer looked up from the published
 * content — the same keyword matcher the content editor's test tool uses
 * (feature 003, lib/content/simulate.ts). Runs entirely in the browser: no
 * network call, so it cannot write a lead or log anything (FR-018, FR-020).
 * An escalation-topic match shows the hand-off wording, never an answer
 * (FR-017). The surrounding band supplies the heading.
 */
export function TextChat({ content, lang }: { content: ContentDoc; lang: Lang }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  const officeLink = (
    <p className={styles.chatOffice}>
      <a href={`tel:${OFFICE_PHONE_E164}`}>{OFFICE_PHONE_DISPLAY}</a>
    </p>
  );

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResult(simulate(question, content));
        }}
        className={styles.chatForm}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={s.textChatPlaceholder[lang]}
          aria-label={s.textChatTitle[lang]}
          dir="auto"
          className={styles.chatInput}
        />
        <button type="submit" className={styles.chatButton}>
          {s.textChatSend[lang]}
        </button>
      </form>

      {result && (
        <div className={styles.chatResult} aria-live="polite">
          {result.kind === "none" && (
            <>
              <p>{s.textChatNoMatch[lang]}</p>
              {officeLink}
            </>
          )}
          {result.kind === "handoff" && (
            <>
              <strong className={styles.chatHandoff}>{s.textChatHandoff[lang]}</strong>
              <p dir="auto">{result.text}</p>
              {officeLink}
            </>
          )}
          {result.kind === "answer" && <p dir="auto">{result.text}</p>}
        </div>
      )}
    </div>
  );
}
