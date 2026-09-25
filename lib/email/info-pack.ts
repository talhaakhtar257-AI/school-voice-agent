import type { ContentDoc } from "@/lib/content/schema";
import { OFFICE_PHONE_DISPLAY } from "@/lib/office";

/**
 * The details a parent asked for, built from the school's PUBLISHED content
 * (feature 011). Testers objected to receiving Retell's summary of the call;
 * a parent wants the fees, documents, steps and form, not a description of
 * what the assistant did. Values come only from approved content
 * (constitution I).
 */
export const INFO_TOPICS = ["fees", "documents", "process", "dates", "form"] as const;
export type InfoTopic = (typeof INFO_TOPICS)[number];

export type InfoPackInput = {
  doc: ContentDoc;
  classWanted: string | null;
  studentAge: number | null;
  topics: readonly InfoTopic[];
};

type Section = { title: { en: string; ur: string }; lines: string[]; urLines?: string[] };

const esc = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const rupees = (n: number) => `Rs ${n.toLocaleString("en-US")}`;

/** "class 2", "Class-2" and "2" all find "Class 2". */
function findClass(doc: ContentDoc, wanted: string | null): string | null {
  if (!wanted) return null;
  const key = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/^class/, "");
  return doc.facts.classes.find((c) => key(c) === key(wanted)) ?? null;
}

function lines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*[-•*\d.)]+\s*/, "").trim())
    .filter(Boolean);
}

function sections(input: InfoPackInput): Section[] {
  const { doc, topics } = input;
  const cls = findClass(doc, input.classWanted);
  const out: Section[] = [];

  if (topics.includes("fees")) {
    const classes = cls ? [cls] : doc.facts.classes;
    out.push({
      title: { en: cls ? `Fees for ${cls}` : "Fees", ur: cls ? `${cls} کی فیس` : "فیس" },
      lines: classes.map((c) => {
        const monthly = doc.facts.feePerClass[c];
        const admission = doc.facts.admissionFeePerClass[c];
        const age = doc.facts.ageCriteriaPerClass[c];
        return [
          cls ? null : c,
          monthly !== undefined ? `Monthly fee: ${rupees(monthly)}` : null,
          admission !== undefined ? `One-time admission fee: ${rupees(admission)}` : null,
          age ? `Age: ${age.minYears}–${age.maxYears} years` : null,
        ]
          .filter(Boolean)
          .join(cls ? "\n" : " · ");
      }).flatMap((l) => l.split("\n")),
    });
  }
  if (topics.includes("documents")) {
    const docs = doc.policies.documentRequirements;
    out.push({ title: { en: "Documents required", ur: "درکار دستاویزات" }, lines: lines(docs.en), urLines: lines(docs.ur) });
  }
  if (topics.includes("process")) {
    const proc = doc.policies.admissionProcess;
    out.push({ title: { en: "Admission process", ur: "داخلے کا طریقہ" }, lines: lines(proc.en), urLines: lines(proc.ur) });
  }
  if (topics.includes("dates") && doc.facts.admissionDates.length > 0) {
    out.push({
      title: { en: "Admission dates", ur: "داخلے کی تاریخیں" },
      lines: doc.facts.admissionDates.map((d) => `${d.label}: ${d.startDate} to ${d.endDate}`),
    });
  }
  if (topics.includes("form")) {
    const files = doc.downloads.filter((d) => d.archivedAt === null);
    if (files.length > 0) {
      out.push({
        title: { en: "Forms to download", ur: "ڈاؤن لوڈ کے لیے فارم" },
        lines: files.map((f) => `${f.title.en || f.title.ur}: ${f.url}`),
      });
    }
  }
  return out.filter((s) => s.lines.length > 0);
}

function officeHours(doc: ContentDoc): string {
  return doc.facts.officeHours.map((h) => `${h.days} ${h.opens}–${h.closes}`).join(", ");
}

/** HTML and plain-text versions of the info pack, English then Urdu. */
export function renderInfoPack(input: InfoPackInput): { html: string; text: string } {
  const secs = sections(input);
  const link = (l: string) => esc(l).replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" style="color:#0f5c4a">$1</a>');
  const block = (s: Section, ur: boolean) => {
    const items = ur && s.urLines && s.urLines.length > 0 ? s.urLines : s.lines;
    return `<p style="margin:14px 0 6px;font-weight:bold">${esc(ur ? s.title.ur : s.title.en)}</p><ul style="margin:0;padding-inline-start:20px">${items
      .map((l) => `<li style="margin-bottom:4px">${link(l)}</li>`)
      .join("")}</ul>`;
  };
  const hours = officeHours(input.doc);
  const html = `${secs.map((s) => block(s, false)).join("")}
<p style="margin:16px 0 0">Office: <b>${OFFICE_PHONE_DISPLAY}</b>${hours ? ` (${esc(hours)})` : ""}</p>
<div dir="rtl" style="text-align:right;border-top:1px solid #e4e9e6;margin-top:18px;padding-top:8px">${secs.map((s) => block(s, true)).join("")}
<p style="margin:16px 0 0">دفتر: <b dir="ltr">${OFFICE_PHONE_DISPLAY}</b></p></div>`;
  const text = [
    ...secs.map((s) => `${s.title.en}\n${s.lines.map((l) => `- ${l}`).join("\n")}`),
    `Office: ${OFFICE_PHONE_DISPLAY}${hours ? ` (${hours})` : ""}`,
    "",
    ...secs.map((s) => `${s.title.ur}\n${(s.urLines && s.urLines.length > 0 ? s.urLines : s.lines).map((l) => `- ${l}`).join("\n")}`),
  ].join("\n\n");
  return { html, text };
}
