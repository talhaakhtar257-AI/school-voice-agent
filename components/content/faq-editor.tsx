"use client";

import type { FaqItem } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { BilingualField } from "./bilingual-field";
import { addButton, fitContent, removeButton } from "./button-classes";

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
  lang,
}: {
  value: FaqItem[];
  onChange: (next: FaqItem[]) => void;
  lang: Lang;
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
            className={removeButton}
            style={fitContent}
            onClick={() => update(f.id, { archivedAt: new Date().toISOString() })}
          >
            {s.remove[lang]}
          </button>
        </div>
      ))}

      <button
        type="button"
        className={addButton}
        style={fitContent}
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
        {s.addFaq[lang]}
      </button>
    </div>
  );
}
