"use client";

import { useState } from "react";
import type { EscalationTopic } from "@/lib/content/schema";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { BilingualField } from "./bilingual-field";
import { DeleteEscalationDialog } from "./delete-escalation-dialog";

const btn = { minHeight: "44px", padding: "0.4rem 0.75rem" };

function newId() {
  return `esc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Escalation topics — subjects the agent must never answer, each with the wording
 * used to hand the parent to a person (FR-005). Discounts and special cases
 * belong here. Removing one goes through DeleteEscalationDialog (FR-026).
 */
export function EscalationEditor({
  value,
  onChange,
}: {
  value: EscalationTopic[];
  onChange: (next: EscalationTopic[]) => void;
}) {
  const [pendingRemoveId, setPendingRemoveId] = useState<string | null>(null);
  const active = value.filter((t) => t.archivedAt === null);
  const pending = value.find((t) => t.id === pendingRemoveId) ?? null;

  function update(id: string, patch: Partial<EscalationTopic>) {
    onChange(value.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {active.length === 0 && (
        <p style={{ margin: 0, color: "var(--failure-border)" }}>
          No escalation topics. Add &ldquo;discounts&rdquo; and &ldquo;special
          cases&rdquo; at minimum — the agent must never answer these.
        </p>
      )}

      {active.map((t, i) => (
        <div
          key={t.id}
          style={{
            border: "1px solid rgba(128,128,128,0.3)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <strong style={{ fontSize: "0.9rem" }}>Topic {i + 1}</strong>
          <BilingualField
            label="Subject"
            value={t.topic}
            onChange={(topic) => update(t.id, { topic })}
          />
          <BilingualField
            label="What the agent says instead"
            value={t.handoffWording}
            onChange={(handoffWording) => update(t.id, { handoffWording })}
          />
          <button type="button" style={btn} onClick={() => setPendingRemoveId(t.id)}>
            {s.remove.en} · {s.remove.ur}
          </button>
        </div>
      ))}

      <button
        type="button"
        style={btn}
        onClick={() =>
          onChange([
            ...value,
            {
              id: newId(),
              topic: { en: "", ur: "" },
              handoffWording: { en: "", ur: "" },
              archivedAt: null,
            },
          ])
        }
      >
        {s.add.en} topic · {s.add.ur}
      </button>

      {pending && (
        <DeleteEscalationDialog
          topicLabel={pending.topic.en || pending.topic.ur || "(untitled)"}
          onCancel={() => setPendingRemoveId(null)}
          onConfirm={() => {
            update(pending.id, { archivedAt: new Date().toISOString() });
            setPendingRemoveId(null);
          }}
        />
      )}
    </div>
  );
}
