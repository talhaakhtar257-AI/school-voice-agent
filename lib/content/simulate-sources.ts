import type { ContentDoc } from "./schema";

export type Candidate = { kind: "answer" | "handoff"; text: string; score: number };

type Score = (queryTokens: string[], text: string) => number;

/**
 * Candidates built from the parts of the content that are not free prose: the
 * facts, the two policy texts and the school profile. Before this existed the
 * lookup searched only FAQs, programs and timings, so "which documents do I
 * need?" came back empty while the answer sat in Policies.
 */
export function factCandidates(q: string[], doc: ContentDoc, score: Score): Candidate[] {
  const out: Candidate[] = [];
  const add = (text: string, value: number) => {
    if (text.trim() !== "") out.push({ kind: "answer", text, score: value });
  };

  const { facts, policies, profile } = doc;

  // --- The class a question names, if any: "what is the Class 1 fee?" ---
  const named = facts.classes.filter((c) => {
    const parts = c.toLowerCase().split(/\s+/).filter((p) => p.length > 1);
    return parts.length > 0 && parts.every((p) => q.includes(p.replace(/s$/, "")));
  });
  const feeLine = (c: string) => {
    const monthly = facts.feePerClass[c];
    const admission = facts.admissionFeePerClass[c];
    const age = facts.ageCriteriaPerClass[c];
    const details = [
      monthly === undefined ? null : `monthly fee ${monthly}`,
      admission === undefined ? null : `admission fee ${admission}`,
      age ? `age ${age.minYears}-${age.maxYears} years` : null,
    ].filter(Boolean);
    return `${c}: ${details.join(", ")}`;
  };

  // One haystack: the class names plus the words used to ask about them, so
  // "fees of all classes" and "which class for a 6 year old" both land here.
  if (facts.classes.length > 0) {
    const factsWords = [
      facts.classes.join(" "),
      "fee fees cost costs charge charges monthly rupees money price",
      "age ages year years old grade level class classes",
      "teach teaches offer offers admission",
    ].join(" ");
    // A question that names a class wants that class's line, and should beat
    // any long prose that happens to share a word or two.
    const value = named.length > 0 ? 0.8 : score(q, factsWords);
    const lines = (named.length > 0 ? named : facts.classes).map(feeLine);
    add(lines.join("\n"), Math.max(value, score(q, factsWords)));
  }

  // --- Admission dates: the labels themselves are the best keywords ---
  if (facts.admissionDates.length > 0) {
    const labels = facts.admissionDates.map((d) => d.label).join(" ");
    add(
      facts.admissionDates.map((d) => `${d.label}: ${d.startDate} to ${d.endDate}`).join("\n"),
      Math.max(
        score(q, "admission admissions date dates open opens close closes session intake new begin begins start starts test tests deadline last"),
        score(q, labels),
      ),
    );
  }

  // --- Office hours ---
  if (facts.officeHours.length > 0) {
    add(
      facts.officeHours.map((h) => `Office: ${h.days} ${h.opens}-${h.closes}`).join("\n"),
      score(q, "office hour hours open opens closed closing visit call contact reception"),
    );
  }

  // --- School timings ---
  if (facts.schoolTimings.length > 0) {
    add(
      facts.schoolTimings
        .map((t) => `${t.label.en || t.label.ur}: ${t.days} ${t.starts}-${t.ends}`)
        .join("\n"),
      score(q, "school timing timings time times start starts end ends finish day days shift"),
    );
  }

  // Long prose shares words with almost any question, so its own text can only
  // ever be a weak signal — the keyword list is what identifies it.
  const PROSE_CAP = 0.5;
  const prose = (text: string, keywords: string) =>
    Math.max(score(q, keywords), Math.min(score(q, text), PROSE_CAP));

  // --- Admission process ---
  const process = policies.admissionProcess.en || policies.admissionProcess.ur;
  if (process.trim() !== "") {
    add(
      process,
      prose(process, "process procedure step steps apply application form enroll enrolment seat confirm result interview"),
    );
  }

  // --- Required documents ---
  const documents = policies.documentRequirements.en || policies.documentRequirements.ur;
  if (documents.trim() !== "") {
    add(
      documents,
      prose(documents, "document documents paper papers certificate birth photo photos card copy copies required requirement bring submit"),
    );
  }

  // --- About the school, address and figures ---
  const about = profile.about.en || profile.about.ur;
  if (about.trim() !== "") {
    add(about, prose(about, "school about history founded started since story information"));
  }
  const address = profile.address.en || profile.address.ur;
  if (address.trim() !== "") {
    add(address, score(q, "address location located where area campus branch map direction"));
  }
  const { studentsEnrolled, teachers, foundedYear } = facts.stats;
  if (studentsEnrolled !== null || teachers !== null || foundedYear !== null) {
    add(
      [
        foundedYear === null ? null : `Founded in ${foundedYear}`,
        studentsEnrolled === null ? null : `${studentsEnrolled} students`,
        teachers === null ? null : `${teachers} teachers`,
      ]
        .filter(Boolean)
        .join(", "),
      score(q, "student students teacher teachers staff founded year size big strength many number"),
    );
  }

  return out;
}
