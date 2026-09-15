"use client";

import { useState } from "react";
import type { ContentDoc } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { simulate, type SimulationResult } from "@/lib/content/simulate";
import { landingStrings as s } from "@/lib/strings/landing";
import styles from "@/components/landing/sections.module.css";

/**
 * A parent types a question and gets an answer looked up from the published
 * content — the same keyword matcher the content editor's test tool uses
 * (feature 003, lib/content/simulate.ts). Runs entirely in the browser: no
 * network call, so it cannot write a lead or log anything (FR-018, FR-020).
 * An escalation-topic match shows the hand-off wording, never an answer
 * (FR-017).
 */
export function TextChat({ content, lang }: { content: ContentDoc; lang: Lang }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  return (
    <section className={styles.section} id="ask">
      <h2 className={styles.title}>{s.textChatTitle[lang]}</h2>
      <p className={styles.lead}>{s.textChatFromPublished[lang]}</p>
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
        <button type="submit" className={styles.button} style={{ marginTop: 0, minHeight: "48px" }}>
          {s.textChatSend[lang]}
        </button>
      </form>

      {result && (
        <div className={`${styles.card} ${styles.chatResult}`} aria-live="polite">
          {result.kind === "none" && <p>{s.textChatNoMatch[lang]}</p>}
          {result.kind === "handoff" && (
            <>
              <strong className={styles.handoff}>{s.textChatHandoff[lang]}</strong>
              <p dir="auto" style={{ marginTop: "0.4rem", whiteSpace: "pre-line" }}>
                {result.text}
              </p>
            </>
          )}
          {result.kind === "answer" && (
            <p dir="auto" style={{ whiteSpace: "pre-line" }}>
              {result.text}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
