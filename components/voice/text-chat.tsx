"use client";

import { useState } from "react";
import type { ContentDoc } from "@/lib/content/schema";
import { simulate, type SimulationResult } from "@/lib/content/simulate";
import { landingStrings as s } from "@/lib/strings/landing";

const box = { minHeight: "44px", padding: "0.5rem", fontSize: "1rem" };

/**
 * A parent types a question and gets an answer looked up from the published
 * content — the same keyword matcher the content editor's test tool uses
 * (feature 003, lib/content/simulate.ts). Runs entirely in the browser: no
 * network call, so it cannot write a lead or log anything (FR-018, FR-020).
 * An escalation-topic match shows the hand-off wording, never an answer
 * (FR-017).
 */
export function TextChat({ content }: { content: ContentDoc }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  return (
    <section
      dir="auto"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
        maxWidth: "32rem",
        margin: "0 auto",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
        {s.textChatTitle.en} · {s.textChatTitle.ur}
      </h2>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        {s.textChatFromPublished.en}
        <br />
        {s.textChatFromPublished.ur}
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResult(simulate(question, content));
        }}
        style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={s.textChatPlaceholder.en}
          style={{ ...box, flex: 1, minWidth: "10rem" }}
        />
        <button type="submit" style={{ ...box, fontWeight: 600 }}>
          {s.textChatSend.en} · {s.textChatSend.ur}
        </button>
      </form>

      {result && (
        <div
          style={{
            border: "1px solid rgba(128,128,128,0.3)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
          }}
        >
          {result.kind === "none" && (
            <p style={{ margin: 0 }}>
              {s.textChatNoMatch.en}
              <br />
              {s.textChatNoMatch.ur}
            </p>
          )}
          {result.kind === "handoff" && (
            <>
              <strong style={{ color: "var(--failure-border)" }}>
                {s.textChatHandoff.en} · {s.textChatHandoff.ur}
              </strong>
              <p style={{ margin: "0.4rem 0 0", whiteSpace: "pre-line" }}>
                {result.text}
              </p>
            </>
          )}
          {result.kind === "answer" && (
            <p style={{ margin: 0, whiteSpace: "pre-line" }}>{result.text}</p>
          )}
        </div>
      )}
    </section>
  );
}
