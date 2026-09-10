"use client";

import { contentAdminStrings as s } from "@/lib/strings/content-admin";

/**
 * Removing an escalation topic needs the same deliberate confirmation as
 * publishing (FR-026): its absence lets the agent start answering a question it
 * must never answer.
 */
export function DeleteEscalationDialog({
  topicLabel,
  onConfirm,
  onCancel,
}: {
  topicLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
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
          <button
            type="button"
            onClick={onConfirm}
            style={{ minHeight: "44px", padding: "0.4rem 0.9rem", fontWeight: 600 }}
          >
            {s.remove.en} · {s.remove.ur}
          </button>
          <button
            type="button"
            onClick={onCancel}
            style={{ minHeight: "44px", padding: "0.4rem 0.9rem" }}
          >
            {s.cancel.en} · {s.cancel.ur}
          </button>
        </div>
      </div>
    </div>
  );
}
