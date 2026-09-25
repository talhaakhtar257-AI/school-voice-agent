import type { ContentDoc } from "./schema";

/**
 * The published content as a compact plain-text brief, for the voice agent
 * only (feature 011). Retell charges extra on every reply once the context is
 * large, and the full bilingual JSON is ~3,300 tokens that ride along on every
 * turn of a call. The same facts as short English lines are about a third of
 * that; the agent speaks Urdu from them as it already does. The one exception
 * is the hand-off wording for office topics: staff approved it in both
 * languages, so both are kept word for word.
 *
 * Constitution I still holds — every line comes from the live content.
 */
const KNOWLEDGE_BUDGET = 6000; // characters of imported documents, in total

export function agentBrief(doc: ContentDoc): string {
  const out: string[] = [];
  const add = (title: string, lines: string[]) => {
    const clean = lines.map((l) => l.trim()).filter(Boolean);
    if (clean.length > 0) out.push(`## ${title}\n${clean.join("\n")}`);
  };
  const split = (t: string) => t.split(/\r?\n/);
  const active = <T extends { archivedAt: string | null }>(xs: T[]) => xs.filter((x) => x.archivedAt === null);
  const { facts, policies, profile } = doc;

  add("School", [
    profile.about.en,
    profile.address.en ? `Address: ${profile.address.en}` : "",
    facts.stats.foundedYear ? `Founded ${facts.stats.foundedYear}; ${facts.stats.studentsEnrolled ?? "?"} students; ${facts.stats.teachers ?? "?"} teachers` : "",
  ]);
  add(
    "Classes — age, monthly fee, one-time admission fee (Rs)",
    facts.classes.map((c) => {
      const a = facts.ageCriteriaPerClass[c];
      return `${c}: age ${a ? `${a.minYears}-${a.maxYears}` : "?"}; monthly ${facts.feePerClass[c] ?? "?"}; admission ${facts.admissionFeePerClass[c] ?? "?"}`;
    }),
  );
  add("Admission dates", facts.admissionDates.map((d) => `${d.label}: ${d.startDate} to ${d.endDate}`));
  add("Office hours", facts.officeHours.map((h) => `${h.days} ${h.opens}-${h.closes}`));
  add("School timings", facts.schoolTimings.map((t) => `${t.label.en || t.label.ur}: ${t.days} ${t.starts}-${t.ends}`));
  add("Admission process (in order)", split(policies.admissionProcess.en || policies.admissionProcess.ur));
  add("Required documents", split(policies.documentRequirements.en || policies.documentRequirements.ur));
  add("Programs", active(doc.programs).map((p) => `${p.title.en} (${p.classes.join(", ")}): ${p.description.en}`));
  add("FAQs", active(doc.faqs).map((f) => `Q: ${f.question.en || f.question.ur} A: ${f.answer.en || f.answer.ur}`));
  add(
    "Topics that must go to the office — say this wording, never answer yourself",
    active(doc.escalationTopics).map((t) => `${t.topic.en || t.topic.ur} → EN: "${t.handoffWording.en}" UR: "${t.handoffWording.ur}"`),
  );
  add("Downloadable forms (send_details with topic form emails these)", active(doc.downloads).map((d) => `${d.title.en || d.title.ur}`));

  let budget = KNOWLEDGE_BUDGET;
  const knowledge = active(doc.knowledge).map((k) => {
    const text = k.text.slice(0, Math.max(0, budget));
    budget -= text.length;
    return text ? `### ${k.title.en || k.title.ur || k.source.name}\n${text}` : "";
  });
  add("Knowledge documents", knowledge);

  return out.join("\n\n");
}
