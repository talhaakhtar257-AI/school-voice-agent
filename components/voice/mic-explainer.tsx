"use client";

import { landingStrings as s } from "@/lib/strings/landing";

/**
 * Shown before the browser's microphone permission prompt (FR-013). A step the
 * parent confirms, not a passive notice — talk-panel.tsx only calls the SDK
 * after this is confirmed, so the explanation is strictly first.
 */
export function MicExplainer({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      dir="auto"
      style={{
        border: "1px solid rgba(128,128,128,0.3)",
        borderRadius: "0.5rem",
        padding: "1rem",
        maxWidth: "28rem",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "0.6rem",
      }}
    >
      <strong>
        {s.micExplainerTitle.en}
        <br />
        {s.micExplainerTitle.ur}
      </strong>
      <p style={{ margin: 0, fontSize: "0.9rem" }}>
        {s.micExplainerBody.en}
        <br />
        {s.micExplainerBody.ur}
      </p>
      <button
        type="button"
        onClick={onContinue}
        style={{
          minHeight: "44px",
          padding: "0.5rem 1rem",
          fontWeight: 600,
          alignSelf: "flex-start",
        }}
      >
        {s.micExplainerContinue.en} · {s.micExplainerContinue.ur}
      </button>
    </div>
  );
}
