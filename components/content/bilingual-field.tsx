"use client";

import type { Bilingual } from "@/lib/content/schema";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";

const box = {
  width: "100%",
  minHeight: "3rem",
  padding: "0.5rem",
  fontSize: "1rem",
  boxSizing: "border-box" as const,
};

const note = {
  margin: "0.2rem 0 0",
  fontSize: "0.8rem",
  color: "var(--failure-border)",
};

/**
 * One bilingual value — an English box and an Urdu box, side by side so a missing
 * translation is visible while editing (FR-007). Each side shows a note when it
 * is empty (FR-008 is enforced at publish; this is the live hint).
 */
export function BilingualField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: Bilingual;
  onChange: (next: Bilingual) => void;
}) {
  return (
    <fieldset
      style={{
        border: "1px solid rgba(128,128,128,0.3)",
        borderRadius: "0.4rem",
        padding: "0.6rem",
        margin: 0,
      }}
    >
      <legend style={{ fontSize: "0.85rem", padding: "0 0.3rem" }}>{label}</legend>

      <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
        English
      </label>
      <textarea
        value={value.en}
        onChange={(e) => onChange({ ...value, en: e.target.value })}
        style={box}
      />
      {value.en.trim() === "" && (
        <p role="alert" style={note}>
          {s.missingEn.en} · {s.missingEn.ur}
        </p>
      )}

      <label
        style={{
          display: "block",
          marginTop: "0.5rem",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
        }}
      >
        اردو
      </label>
      <textarea
        dir="rtl"
        value={value.ur}
        onChange={(e) => onChange({ ...value, ur: e.target.value })}
        style={box}
      />
      {value.ur.trim() === "" && (
        <p role="alert" style={note}>
          {s.missingUr.en} · {s.missingUr.ur}
        </p>
      )}
    </fieldset>
  );
}
