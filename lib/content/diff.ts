import type { ContentDoc } from "./schema";

type Listed = { id: string; archivedAt: string | null };

/**
 * Human-readable lines describing what changed from `before` to `after`. Shown in
 * the publish confirmation dialog and stored on the history row so the change
 * list renders later without recomputing.
 */
export function summariseChanges(before: ContentDoc, after: ContentDoc): string[] {
  const lines: string[] = [];

  const bClasses = new Set(before.facts.classes);
  const aClasses = new Set(after.facts.classes);
  for (const c of after.facts.classes) if (!bClasses.has(c)) lines.push(`Class added: ${c}`);
  for (const c of before.facts.classes) if (!aClasses.has(c)) lines.push(`Class removed: ${c}`);

  for (const c of after.facts.classes) {
    const b = before.facts.feePerClass[c];
    const a = after.facts.feePerClass[c];
    if (b !== a) lines.push(`${c} fee: ${b ?? "—"} → ${a ?? "—"}`);
  }

  const age = (x?: { minYears: number; maxYears: number }) =>
    x ? `${x.minYears}-${x.maxYears}` : "—";
  for (const c of after.facts.classes) {
    const b = age(before.facts.ageCriteriaPerClass[c]);
    const a = age(after.facts.ageCriteriaPerClass[c]);
    if (b !== a) lines.push(`${c} age: ${b} → ${a}`);
  }

  if (
    JSON.stringify(before.facts.admissionDates) !==
    JSON.stringify(after.facts.admissionDates)
  ) {
    lines.push("Admission dates changed");
  }
  if (
    JSON.stringify(before.facts.officeHours) !==
    JSON.stringify(after.facts.officeHours)
  ) {
    lines.push("Office hours changed");
  }

  if (
    JSON.stringify(before.policies.admissionProcess) !==
    JSON.stringify(after.policies.admissionProcess)
  ) {
    lines.push("Policy changed: admission process");
  }
  if (
    JSON.stringify(before.policies.documentRequirements) !==
    JSON.stringify(after.policies.documentRequirements)
  ) {
    lines.push("Policy changed: document requirements");
  }

  diffList("FAQ", before.faqs, after.faqs, (f) => f.question.en || f.question.ur || f.id, lines);
  diffList(
    "Escalation topic",
    before.escalationTopics,
    after.escalationTopics,
    (t) => t.topic.en || t.topic.ur || t.id,
    lines,
  );

  if (lines.length === 0) lines.push("No visible changes.");
  return lines;
}

function diffList<T extends Listed>(
  noun: string,
  before: T[],
  after: T[],
  label: (x: T) => string,
  lines: string[],
) {
  const bById = new Map(before.map((x) => [x.id, x]));
  const seen = new Set<string>();

  for (const a of after) {
    seen.add(a.id);
    const b = bById.get(a.id);
    if (!b) {
      if (a.archivedAt === null) lines.push(`${noun} added: ${label(a)}`);
      continue;
    }
    if (b.archivedAt === null && a.archivedAt !== null) {
      lines.push(`${noun} removed: ${label(a)}`);
    } else if (b.archivedAt !== null && a.archivedAt === null) {
      lines.push(`${noun} restored: ${label(a)}`);
    } else if (
      a.archivedAt === null &&
      JSON.stringify(b) !== JSON.stringify(a)
    ) {
      lines.push(`${noun} edited: ${label(a)}`);
    }
  }
  for (const b of before) {
    if (!seen.has(b.id) && b.archivedAt === null) {
      lines.push(`${noun} removed: ${label(b)}`);
    }
  }
}
