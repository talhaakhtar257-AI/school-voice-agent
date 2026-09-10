"use client";

import { useState } from "react";
import type { ContentDoc } from "@/lib/content/schema";
import { simulate, type SimulationResult } from "@/lib/content/simulate";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";

const noticeBox = {
  margin: 0,
  fontSize: "0.85rem",
  color: "var(--text-secondary)",
  border: "1px solid rgba(128,128,128,0.3)",
  borderRadius: "0.4rem",
  padding: "0.6rem",
};

/**
 * Try a question against the draft. Runs entirely in the browser — `simulate` is
 * a pure function — so testing cannot touch the draft, the live version, or the
 * history (FR-020). Every result carries the simulation notice (FR-018).
 */
export function TestTool({ draft }: { draft: ContentDoc }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<SimulationResult | null>(null);

  return (
    <div
      dir="auto"
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
      }}
    >
      <h2>
        {s.testHeading.en} · {s.testHeading.ur}
      </h2>

      <p role="note" style={noticeBox}>
        {s.simulationNotice.en}
        <br />
        {s.simulationNotice.ur}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setResult(simulate(question, draft));
        }}
        style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={s.testPlaceholder.en}
          style={{ minHeight: "44px", padding: "0.5rem", fontSize: "1rem" }}
        />
        <button
          type="submit"
          style={{ minHeight: "44px", padding: "0.5rem 1rem", fontWeight: 600 }}
        >
          {s.testRun.en} · {s.testRun.ur}
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
              {s.testNoMatch.en}
              <br />
              {s.testNoMatch.ur}
            </p>
          )}
          {result.kind === "handoff" && (
            <>
              <strong style={{ color: "var(--failure-border)" }}>
                {s.testHandoff.en} · {s.testHandoff.ur}
              </strong>
              <p style={{ margin: "0.4rem 0 0", whiteSpace: "pre-line" }}>
                {result.text}
              </p>
            </>
          )}
          {result.kind === "answer" && (
            <p style={{ margin: 0, whiteSpace: "pre-line" }}>{result.text}</p>
          )}
          <p
            role="note"
            style={{
              margin: "0.6rem 0 0",
              fontSize: "0.8rem",
              color: "var(--text-secondary)",
            }}
          >
            {s.simulationNotice.en}
          </p>
        </div>
      )}
    </div>
  );
}
