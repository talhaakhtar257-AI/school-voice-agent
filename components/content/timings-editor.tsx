"use client";

import type { Facts } from "@/lib/content/schema";
import { BilingualField } from "./bilingual-field";

const input = {
  padding: "0.4rem",
  fontSize: "1rem",
  minHeight: "44px",
  boxSizing: "border-box" as const,
};
const row = { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const, alignItems: "center" };
const btn = { minHeight: "44px", padding: "0.3rem 0.6rem" };

type Timing = Facts["schoolTimings"][number];

/**
 * School-day timings, e.g. "Playgroup & KG — Mon–Sat 08:00–12:00". The label is
 * bilingual prose; the days and times are stored once (Constitution IV).
 */
export function TimingsEditor({
  value,
  onChange,
}: {
  value: Timing[];
  onChange: (next: Timing[]) => void;
}) {
  function update(index: number, patch: Partial<Timing>) {
    onChange(value.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  return (
    <div>
      <strong>School timings</strong>
      {value.map((t, i) => (
        <div
          key={i}
          style={{
            marginTop: "0.5rem",
            border: "1px solid rgba(128,128,128,0.3)",
            borderRadius: "0.5rem",
            padding: "0.6rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
          }}
        >
          <BilingualField label="Who this applies to" value={t.label} onChange={(label) => update(i, { label })} />
          <div style={row}>
            <input
              placeholder="Days (e.g. Mon-Sat)"
              value={t.days}
              onChange={(e) => update(i, { days: e.target.value })}
              style={input}
            />
            <input type="time" value={t.starts} onChange={(e) => update(i, { starts: e.target.value })} style={input} />
            <input type="time" value={t.ends} onChange={(e) => update(i, { ends: e.target.value })} style={input} />
            <button type="button" style={btn} onClick={() => onChange(value.filter((_, j) => j !== i))}>
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        style={{ ...btn, marginTop: "0.4rem" }}
        onClick={() => onChange([...value, { label: { en: "", ur: "" }, days: "", starts: "", ends: "" }])}
      >
        Add school timing
      </button>
    </div>
  );
}
