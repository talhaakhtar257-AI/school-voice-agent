"use client";

import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { addButton, removeButton } from "./button-classes";
import { FactsSchedulesEditor } from "./facts-schedules-editor";
import { TimingsEditor } from "./timings-editor";

const input = {
  padding: "0.4rem",
  fontSize: "1rem",
  minHeight: "44px",
  boxSizing: "border-box" as const,
};
const row = { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const, alignItems: "center" };

/**
 * The Facts section — language-neutral values, stored once (FR-006).
 * Classes drive the fee and age maps: a fee or age is keyed by class name.
 */
export function FactsEditor({
  value,
  onChange,
  lang,
}: {
  value: Facts;
  onChange: (next: Facts) => void;
  lang: Lang;
}) {
  function setClasses(classes: string[]) {
    // keep fee/age maps in step with the class list
    const feePerClass: Record<string, number> = {};
    const admissionFeePerClass: Record<string, number> = {};
    const ageCriteriaPerClass: Record<string, { minYears: number; maxYears: number }> = {};
    for (const c of classes) {
      feePerClass[c] = value.feePerClass[c] ?? 0;
      admissionFeePerClass[c] = value.admissionFeePerClass[c] ?? 0;
      ageCriteriaPerClass[c] = value.ageCriteriaPerClass[c] ?? { minYears: 0, maxYears: 0 };
    }
    onChange({ ...value, classes, feePerClass, admissionFeePerClass, ageCriteriaPerClass });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <strong>Classes</strong>
        {value.classes.map((c, i) => (
          <div key={i} style={{ ...row, marginTop: "0.4rem" }}>
            <input
              value={c}
              onChange={(e) => {
                const next = [...value.classes];
                next[i] = e.target.value;
                setClasses(next);
              }}
              style={input}
            />
            <span style={{ fontSize: "0.9rem" }}>
              Monthly fee&nbsp;
              <input
                type="number"
                inputMode="numeric"
                value={value.feePerClass[c] ?? 0}
                onChange={(e) =>
                  onChange({
                    ...value,
                    feePerClass: { ...value.feePerClass, [c]: Number(e.target.value) },
                  })
                }
                style={{ ...input, width: "6rem" }}
              />
            </span>
            <span style={{ fontSize: "0.9rem" }}>
              Admission fee (one time)&nbsp;
              <input
                type="number"
                inputMode="numeric"
                value={value.admissionFeePerClass[c] ?? 0}
                onChange={(e) =>
                  onChange({
                    ...value,
                    admissionFeePerClass: { ...value.admissionFeePerClass, [c]: Number(e.target.value) },
                  })
                }
                style={{ ...input, width: "6rem" }}
              />
            </span>
            <span style={{ fontSize: "0.9rem" }}>
              Age&nbsp;
              <input
                type="number"
                value={value.ageCriteriaPerClass[c]?.minYears ?? 0}
                onChange={(e) =>
                  onChange({
                    ...value,
                    ageCriteriaPerClass: {
                      ...value.ageCriteriaPerClass,
                      [c]: {
                        minYears: Number(e.target.value),
                        maxYears: value.ageCriteriaPerClass[c]?.maxYears ?? 0,
                      },
                    },
                  })
                }
                style={{ ...input, width: "4rem" }}
              />
              &nbsp;to&nbsp;
              <input
                type="number"
                value={value.ageCriteriaPerClass[c]?.maxYears ?? 0}
                onChange={(e) =>
                  onChange({
                    ...value,
                    ageCriteriaPerClass: {
                      ...value.ageCriteriaPerClass,
                      [c]: {
                        minYears: value.ageCriteriaPerClass[c]?.minYears ?? 0,
                        maxYears: Number(e.target.value),
                      },
                    },
                  })
                }
                style={{ ...input, width: "4rem" }}
              />
            </span>
            <button type="button" className={removeButton} onClick={() => setClasses(value.classes.filter((_, j) => j !== i))}>
              {s.removeClass[lang]}
            </button>
          </div>
        ))}
        <button type="button" className={addButton} style={{ marginTop: "0.6rem" }} onClick={() => setClasses([...value.classes, ""])}>
          {s.addClass[lang]}
        </button>
      </div>

      <FactsSchedulesEditor value={value} onChange={onChange} lang={lang} />
      <TimingsEditor
        value={value.schoolTimings}
        onChange={(schoolTimings) => onChange({ ...value, schoolTimings })}
        lang={lang}
      />
    </div>
  );
}
