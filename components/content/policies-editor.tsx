"use client";

import type { ContentDoc } from "@/lib/content/schema";
import { BilingualField } from "./bilingual-field";

type Policies = ContentDoc["policies"];

/** The two policy statements — admission process and document requirements (FR-003). */
export function PoliciesEditor({
  value,
  onChange,
}: {
  value: Policies;
  onChange: (next: Policies) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        One item per line — on the website each line becomes one numbered step or one checklist item.
      </p>
      <BilingualField
        label="Admission process"
        value={value.admissionProcess}
        onChange={(admissionProcess) => onChange({ ...value, admissionProcess })}
      />
      <BilingualField
        label="Document requirements"
        value={value.documentRequirements}
        onChange={(documentRequirements) => onChange({ ...value, documentRequirements })}
      />
    </div>
  );
}
