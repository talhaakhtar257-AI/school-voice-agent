import type { ContentDoc } from "./schema";

export type Problem = {
  path: string;
  message: string;
  severity: "block" | "warn";
};

const blank = (s: string) => s.trim() === "";

/**
 * Whether the draft is ready to publish. Returns a flat list of problems, each
 * naming where it is and — for bilingual gaps — which language is missing
 * (FR-008, FR-012). `block` problems stop publishing; `warn` problems are shown
 * but do not (research D-007, e.g. the discounts reminder).
 */
export function checkPublishReadiness(doc: ContentDoc): Problem[] {
  const out: Problem[] = [];
  const block = (path: string, message: string) =>
    out.push({ path, message, severity: "block" });
  const warn = (path: string, message: string) =>
    out.push({ path, message, severity: "warn" });

  // --- Required facts (FR-002, FR-012) ---
  if (doc.facts.classes.length === 0) {
    block("Facts / Classes", "Add at least one class.");
  }
  for (const c of doc.facts.classes) {
    const name = c || "(unnamed class)";
    if (blank(c)) block("Facts / Classes", "A class name is empty.");
    const fee = doc.facts.feePerClass[c];
    if (fee === undefined || fee <= 0) {
      block(`Facts / Fee for ${name}`, "Enter a fee greater than zero.");
    }
    const age = doc.facts.ageCriteriaPerClass[c];
    if (!age || (age.minYears === 0 && age.maxYears === 0)) {
      block(`Facts / Age for ${name}`, "Enter an age range.");
    } else if (age.minYears > age.maxYears) {
      block(`Facts / Age for ${name}`, "Minimum age is above the maximum.");
    }
  }
  if (doc.facts.admissionDates.length === 0) {
    block("Facts / Admission dates", "Add at least one admission date range.");
  }
  doc.facts.admissionDates.forEach((d, i) => {
    if (blank(d.label) || blank(d.startDate) || blank(d.endDate)) {
      block(`Facts / Admission date ${i + 1}`, "Fill the label and both dates.");
    } else if (d.startDate > d.endDate) {
      block(`Facts / Admission date ${i + 1}`, "Start date is after the end date.");
    }
  });
  if (doc.facts.officeHours.length === 0) {
    block("Facts / Office hours", "Add at least one set of office hours.");
  }
  doc.facts.officeHours.forEach((h, i) => {
    if (blank(h.days) || blank(h.opens) || blank(h.closes)) {
      block(`Facts / Office hours ${i + 1}`, "Fill the days and both times.");
    } else if (h.opens >= h.closes) {
      block(`Facts / Office hours ${i + 1}`, "Opening time is not before closing time.");
    }
  });

  // --- Bilingual completeness (FR-007, FR-008) ---
  const bilingual = (path: string, v: { en: string; ur: string }) => {
    if (blank(v.en)) block(path, "English is missing.");
    if (blank(v.ur)) block(path, "Urdu is missing.");
  };
  bilingual("Policies / Admission process", doc.policies.admissionProcess);
  bilingual("Policies / Document requirements", doc.policies.documentRequirements);
  doc.faqs
    .filter((f) => f.archivedAt === null)
    .forEach((f, i) => {
      bilingual(`FAQ ${i + 1} / Question`, f.question);
      bilingual(`FAQ ${i + 1} / Answer`, f.answer);
    });
  const activeEsc = doc.escalationTopics.filter((t) => t.archivedAt === null);
  activeEsc.forEach((t, i) => {
    bilingual(`Escalation topic ${i + 1} / Subject`, t.topic);
    bilingual(`Escalation topic ${i + 1} / Hand-off wording`, t.handoffWording);
  });

  // --- Website extras: fees, timings, figures, profile, programs ---
  for (const c of doc.facts.classes) {
    const admissionFee = doc.facts.admissionFeePerClass[c];
    if (admissionFee === undefined || admissionFee <= 0) {
      warn(`Facts / Admission fee for ${c || "(unnamed class)"}`, "No one-time admission fee entered.");
    }
  }
  if (doc.facts.schoolTimings.length === 0) {
    warn("Facts / School timings", "No school timings entered.");
  }
  doc.facts.schoolTimings.forEach((t, i) => {
    if (blank(t.days) || blank(t.starts) || blank(t.ends)) {
      block(`Facts / School timing ${i + 1}`, "Fill the days and both times.");
    } else if (t.starts >= t.ends) {
      block(`Facts / School timing ${i + 1}`, "Start time is not before end time.");
    }
    bilingual(`Facts / School timing ${i + 1} / Label`, t.label);
  });
  const { studentsEnrolled, teachers, foundedYear } = doc.facts.stats;
  if (studentsEnrolled === null && teachers === null && foundedYear === null) {
    warn("School profile / Figures", "No figures entered — the website hides the figures strip.");
  }
  if (foundedYear !== null && foundedYear > new Date().getFullYear()) {
    block("School profile / Founded year", "The founded year is in the future.");
  }
  // A profile field may be left out entirely, but never translated only halfway.
  const halfTranslated = (path: string, v: { en: string; ur: string }) => {
    if (blank(v.en) && blank(v.ur)) warn(path, "Empty — this part is hidden on the website.");
    else bilingual(path, v);
  };
  halfTranslated("School profile / Tagline", doc.profile.tagline);
  halfTranslated("School profile / About", doc.profile.about);
  halfTranslated("School profile / Address", doc.profile.address);
  doc.programs
    .filter((p) => p.archivedAt === null)
    .forEach((p, i) => {
      bilingual(`Program ${i + 1} / Title`, p.title);
      bilingual(`Program ${i + 1} / Description`, p.description);
      if (p.classes.length === 0) warn(`Program ${i + 1}`, "No classes ticked — the age tag is hidden.");
    });

  // --- Escalation minimum (FR-005) — warnings only ---
  const escText = activeEsc.map((t) => t.topic.en.toLowerCase()).join(" | ");
  if (!escText.includes("discount")) {
    warn("Escalation topics", "No topic mentions discounts — the agent must never discuss them.");
  }
  if (!escText.includes("special case")) {
    warn("Escalation topics", "No topic mentions special cases.");
  }

  return out;
}

export const hasBlockingProblems = (problems: Problem[]) =>
  problems.some((p) => p.severity === "block");
