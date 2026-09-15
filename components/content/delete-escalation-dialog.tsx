"use client";

import type { Lang } from "@/lib/language";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { cancelButton, confirmButton } from "./button-classes";

/**
 * Removing an escalation topic needs the same deliberate confirmation as
 * publishing (FR-026): its absence lets the agent start answering a question it
 * must never answer.
 */
export function DeleteEscalationDialog({
  topicLabel,
  onConfirm,
  onCancel,
  lang,
}: {
  topicLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  lang: Lang;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 50,
      }}
    >
      <div
        dir="auto"
        style={{
          background: "var(--page-background)",
          color: "var(--text-primary)",
          borderRadius: "0.5rem",
          padding: "1.25rem",
          maxWidth: "24rem",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <strong>
          {s.removeEscalationHeading.en}
          <br />
          {s.removeEscalationHeading.ur}
        </strong>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          &ldquo;{topicLabel}&rdquo;
        </p>
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--failure-border)" }}>
          {s.removeEscalationWarning.en}
          <br />
          {s.removeEscalationWarning.ur}
        </p>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className={confirmButton} onClick={onConfirm}>
            {s.remove[lang]}
          </button>
          <button type="button" className={cancelButton} onClick={onCancel}>
            {s.cancel[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}
