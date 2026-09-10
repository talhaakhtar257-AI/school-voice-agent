"use client";

import type { Facts } from "@/lib/content/schema";

const input = {
  padding: "0.4rem",
  fontSize: "1rem",
  minHeight: "44px",
  boxSizing: "border-box" as const,
};
const row = { display: "flex", gap: "0.5rem", flexWrap: "wrap" as const, alignItems: "center" };
const smallBtn = { minHeight: "44px", padding: "0.3rem 0.6rem" };

/**
 * The Facts section — language-neutral values, stored once (FR-006).
 * Classes drive the fee and age maps: a fee or age is keyed by class name.
 */
export function FactsEditor({
  value,
  onChange,
}: {
  value: Facts;
  onChange: (next: Facts) => void;
}) {
  function setClasses(classes: string[]) {
    // keep fee/age maps in step with the class list
    const feePerClass: Record<string, number> = {};
    const ageCriteriaPerClass: Record<string, { minYears: number; maxYears: number }> = {};
    for (const c of classes) {
      feePerClass[c] = value.feePerClass[c] ?? 0;
      ageCriteriaPerClass[c] = value.ageCriteriaPerClass[c] ?? { minYears: 0, maxYears: 0 };
    }
    onChange({ ...value, classes, feePerClass, ageCriteriaPerClass });
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
              Fee&nbsp;
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
            <button type="button" style={smallBtn} onClick={() => setClasses(value.classes.filter((_, j) => j !== i))}>
              Remove class
            </button>
          </div>
        ))}
        <button type="button" style={{ ...smallBtn, marginTop: "0.4rem" }} onClick={() => setClasses([...value.classes, ""])}>
          Add class
        </button>
      </div>

      <div>
        <strong>Admission dates</strong>
        {value.admissionDates.map((d, i) => (
          <div key={i} style={{ ...row, marginTop: "0.4rem" }}>
            <input
              placeholder="Label"
              value={d.label}
              onChange={(e) => {
                const next = [...value.admissionDates];
                next[i] = { ...d, label: e.target.value };
                onChange({ ...value, admissionDates: next });
              }}
              style={input}
            />
            <input
              type="date"
              value={d.startDate}
              onChange={(e) => {
                const next = [...value.admissionDates];
                next[i] = { ...d, startDate: e.target.value };
                onChange({ ...value, admissionDates: next });
              }}
              style={input}
            />
            <input
              type="date"
              value={d.endDate}
              onChange={(e) => {
                const next = [...value.admissionDates];
                next[i] = { ...d, endDate: e.target.value };
                onChange({ ...value, admissionDates: next });
              }}
              style={input}
            />
            <button
              type="button"
              style={smallBtn}
              onClick={() => onChange({ ...value, admissionDates: value.admissionDates.filter((_, j) => j !== i) })}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          style={{ ...smallBtn, marginTop: "0.4rem" }}
          onClick={() => onChange({ ...value, admissionDates: [...value.admissionDates, { label: "", startDate: "", endDate: "" }] })}
        >
          Add date range
        </button>
      </div>

      <div>
        <strong>Office hours</strong>
        {value.officeHours.map((h, i) => (
          <div key={i} style={{ ...row, marginTop: "0.4rem" }}>
            <input
              placeholder="Days (e.g. Mon-Fri)"
              value={h.days}
              onChange={(e) => {
                const next = [...value.officeHours];
                next[i] = { ...h, days: e.target.value };
                onChange({ ...value, officeHours: next });
              }}
              style={input}
            />
            <input
              type="time"
              value={h.opens}
              onChange={(e) => {
                const next = [...value.officeHours];
                next[i] = { ...h, opens: e.target.value };
                onChange({ ...value, officeHours: next });
              }}
              style={input}
            />
            <input
              type="time"
              value={h.closes}
              onChange={(e) => {
                const next = [...value.officeHours];
                next[i] = { ...h, closes: e.target.value };
                onChange({ ...value, officeHours: next });
              }}
              style={input}
            />
            <button
              type="button"
              style={smallBtn}
              onClick={() => onChange({ ...value, officeHours: value.officeHours.filter((_, j) => j !== i) })}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          style={{ ...smallBtn, marginTop: "0.4rem" }}
          onClick={() => onChange({ ...value, officeHours: [...value.officeHours, { days: "", opens: "", closes: "" }] })}
        >
          Add hours
        </button>
      </div>
    </div>
  );
}
