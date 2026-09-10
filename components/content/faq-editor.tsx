"use client";

import type { FaqItem } from "@/lib/content/schema";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { BilingualField } from "./bilingual-field";

const btn = { minHeight: "44px", padding: "0.4rem 0.75rem" };

function newId() {
  return `faq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * The FAQ list — parent questions each paired with an answer (FR-004).
 * Remove is a soft delete: the item's record stays, hidden by `archivedAt`
 * (FR-025). Archived items are not shown here.
 */
export function FaqEditor({
  value,
  onChange,
}: {
  value: FaqItem[];
  onChange: (next: FaqItem[]) => void;
}) {
  const active = value.filter((f) => f.archivedAt === null);

  function update(id: string, patch: Partial<FaqItem>) {
    onChange(value.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {active.length === 0 && (
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          No FAQs yet. Add the questions parents ask most.
        </p>
      )}

      {active.map((f, i) => (
        <div
          key={f.id}
          style={{
            border: "1px solid rgba(128,128,128,0.3)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <strong style={{ fontSize: "0.9rem" }}>FAQ {i + 1}</strong>
          <BilingualField
            label="Question"
            value={f.question}
            onChange={(question) => update(f.id, { question })}
          />
          <BilingualField
            label="Answer"
            value={f.answer}
            onChange={(answer) => update(f.id, { answer })}
          />
          <button
            type="button"
            style={btn}
            onClick={() => update(f.id, { archivedAt: new Date().toISOString() })}
          >
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
              question: { en: "", ur: "" },
              answer: { en: "", ur: "" },
              archivedAt: null,
            },
          ])
        }
      >
        {s.add.en} FAQ · {s.add.ur}
      </button>
    </div>
  );
}
