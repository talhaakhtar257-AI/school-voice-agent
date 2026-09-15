"use client";

import type { Problem } from "@/lib/content/validate";
import type { Lang } from "@/lib/language";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { cancelButton, confirmButton } from "./button-classes";

/**
 * The publish confirmation (FR-011). Shows either the blocking problems (Confirm
 * disabled) or the list of changes that will go live. Cancel publishes nothing.
 */
export function PublishDialog({
  changes,
  problems,
  busy,
  onConfirm,
  onCancel,
  lang,
}: {
  changes: string[];
  problems: Problem[];
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  lang: Lang;
}) {
  const blocking = problems.filter((p) => p.severity === "block");
  const warnings = problems.filter((p) => p.severity === "warn");
  const canConfirm = blocking.length === 0 && !busy;

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
          maxWidth: "30rem",
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {blocking.length > 0 ? (
          <>
            <strong style={{ color: "var(--failure-border)" }}>
              {s.publishBlocked.en}
              <br />
              {s.publishBlocked.ur}
            </strong>
            <ul style={{ margin: 0, paddingInlineStart: "1.2rem", fontSize: "0.9rem" }}>
              {blocking.map((p, i) => (
                <li key={i}>
                  <strong>{p.path}:</strong> {p.message}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <>
            <strong>
              {s.publishHeading.en}
              <br />
              {s.publishHeading.ur}
            </strong>
            <ul style={{ margin: 0, paddingInlineStart: "1.2rem", fontSize: "0.9rem" }}>
              {changes.map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
            {warnings.length > 0 && (
              <ul
                style={{
                  margin: 0,
                  paddingInlineStart: "1.2rem",
                  fontSize: "0.85rem",
                  color: "var(--failure-border)",
                }}
              >
                {warnings.map((p, i) => (
                  <li key={i}>{p.message}</li>
                ))}
              </ul>
            )}
          </>
        )}

        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" className={confirmButton} onClick={onConfirm} disabled={!canConfirm}>
            {busy ? s.saving[lang] : s.confirm[lang]}
          </button>
          <button type="button" className={cancelButton} onClick={onCancel} disabled={busy}>
            {s.cancel[lang]}
          </button>
        </div>
      </div>
    </div>
  );
}
