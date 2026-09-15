"use client";

import type { ProgramItem } from "@/lib/content/schema";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { BilingualField } from "./bilingual-field";

const btn = { minHeight: "44px", padding: "0.4rem 0.75rem" };

function newId() {
  return `prog_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Program cards for the website, e.g. "Primary — Class 1 to 5". Classes are
 * ticked from the Facts list, so ages come from one place. Remove is a soft
 * delete via `archivedAt`, same as FAQs (FR-025).
 */
export function ProgramsEditor({
  value,
  classes,
  onChange,
}: {
  value: ProgramItem[];
  classes: string[];
  onChange: (next: ProgramItem[]) => void;
}) {
  const active = value.filter((p) => p.archivedAt === null);

  function update(id: string, patch: Partial<ProgramItem>) {
    onChange(value.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {active.length === 0 && (
        <p style={{ margin: 0, color: "var(--text-secondary)" }}>
          No programs yet. The website shows up to four program cards.
        </p>
      )}

      {active.map((p, i) => (
        <div
          key={p.id}
          style={{
            border: "1px solid rgba(128,128,128,0.3)",
            borderRadius: "0.5rem",
            padding: "0.75rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          <strong style={{ fontSize: "0.9rem" }}>Program {i + 1}</strong>
          <BilingualField label="Title" value={p.title} onChange={(title) => update(p.id, { title })} />
          <BilingualField
            label="Description"
            value={p.description}
            onChange={(description) => update(p.id, { description })}
          />
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: "0.85rem" }}>Classes in this program</legend>
            {classes.length === 0 && (
              <p style={{ margin: "0.3rem 0 0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Add classes under Facts first.
              </p>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25rem 1rem" }}>
              {classes.filter((c) => c.trim() !== "").map((c) => (
                <label key={c} style={{ display: "flex", alignItems: "center", gap: "0.4rem", minHeight: "44px" }}>
                  <input
                    type="checkbox"
                    checked={p.classes.includes(c)}
                    onChange={(e) =>
                      update(p.id, {
                        classes: e.target.checked ? [...p.classes, c] : p.classes.filter((x) => x !== c),
                      })
                    }
                    style={{ width: "20px", height: "20px" }}
                  />
                  {c}
                </label>
              ))}
            </div>
          </fieldset>
          <button type="button" style={btn} onClick={() => update(p.id, { archivedAt: new Date().toISOString() })}>
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
            { id: newId(), title: { en: "", ur: "" }, classes: [], description: { en: "", ur: "" }, archivedAt: null },
          ])
        }
      >
        {s.add.en} program · {s.add.ur}
      </button>
    </div>
  );
}
