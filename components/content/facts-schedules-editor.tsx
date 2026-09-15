"use client";

import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { addButton, removeButton } from "./button-classes";

const input = {
  padding: "0.4rem",
  fontSize: "1rem",
  minHeight: "44px",
  boxSizing: "border-box" as const,
};
const row = {
  display: "flex",
  gap: "0.5rem",
  flexWrap: "wrap" as const,
  alignItems: "center",
};

/** The date-range and office-hours parts of Facts — repeatable rows. */
export function FactsSchedulesEditor({
  value,
  onChange,
  lang,
}: {
  value: Facts;
  onChange: (next: Facts) => void;
  lang: Lang;
}) {
  return (
    <>
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
              className={removeButton}
              onClick={() =>
                onChange({
                  ...value,
                  admissionDates: value.admissionDates.filter((_, j) => j !== i),
                })
              }
            >
              {s.remove[lang]}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={addButton}
          style={{ marginTop: "0.6rem" }}
          onClick={() =>
            onChange({
              ...value,
              admissionDates: [
                ...value.admissionDates,
                { label: "", startDate: "", endDate: "" },
              ],
            })
          }
        >
          {s.addDateRange[lang]}
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
              className={removeButton}
              onClick={() =>
                onChange({
                  ...value,
                  officeHours: value.officeHours.filter((_, j) => j !== i),
                })
              }
            >
              {s.remove[lang]}
            </button>
          </div>
        ))}
        <button
          type="button"
          className={addButton}
          style={{ marginTop: "0.6rem" }}
          onClick={() =>
            onChange({
              ...value,
              officeHours: [
                ...value.officeHours,
                { days: "", opens: "", closes: "" },
              ],
            })
          }
        >
          {s.addHours[lang]}
        </button>
      </div>
    </>
  );
}
