import type { ContentDoc } from "./schema";
import { factCandidates, type Candidate } from "./simulate-sources";

export type SimulationResult =
  | { kind: "answer"; text: string }
  | { kind: "handoff"; text: string }
  | { kind: "none" };

const STOP = new Set([
  "the", "a", "an", "is", "are", "was", "were", "be", "do", "does", "did",
  "what", "which", "how", "when", "where", "who", "why",
  "i", "you", "we", "my", "our", "your", "me", "us", "it",
  "to", "of", "for", "in", "on", "at", "and", "or", "from", "with",
  "can", "could", "would", "will", "shall", "should", "have", "has", "had",
  "please", "tell", "about", "there", "any", "some", "get", "give", "need",
  "sir", "maam", "madam",
]);

/**
 * Crude singular form: "documents" → "document", "classes" → "class". A parent
 * types "discount" while the content says "discounts"; without this the lookup
 * finds nothing and the screen wrongly reads "no content for that question".
 */
function stem(word: string): string {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && (word.endsWith("ses") || word.endsWith("xes") || word.endsWith("hes"))) {
    return word.slice(0, -2);
  }
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(stem);
}

/** Fraction of the query's keywords that appear in `text`. */
export function score(queryTokens: string[], text: string): number {
  if (queryTokens.length === 0) return 0;
  const hay = new Set(tokenise(text));
  let hits = 0;
  for (const q of queryTokens) if (hay.has(q)) hits += 1;
  return hits / queryTokens.length;
}

const THRESHOLD = 0.34; // at least about a third of the keywords must match

/**
 * Escalation needs a higher bar than everything else, and is matched on the
 * SUBJECT only. Its hand-off wording is boilerplate — "the school office will
 * guide you" — so scoring against it made a plain "what is the Playgroup fee?"
 * come back as "discounts are decided by the office".
 */
const ESCALATION_MIN = 0.4;

/** Words too common in this school's content to identify a subject. */
const GENERIC = new Set(["fee", "school", "office", "admission", "call", "please", "guide", "decided", "case", "such"]);

function distinctive(text: string): string {
  return tokenise(text)
    .filter((t) => !GENERIC.has(t))
    .join(" ");
}

/**
 * A lookup, not a model (research D-004). It surfaces what the DRAFT says about a
 * question so staff can catch a typo before publishing. An escalation-topic
 * match always wins, so a discount question can never come back as an answer
 * (FR-005, FR-019). Pure function — no I/O, so running it changes nothing
 * (FR-020).
 */
export function simulate(question: string, doc: ContentDoc): SimulationResult {
  const q = tokenise(question);
  if (q.length === 0) return { kind: "none" };

  const escalation = doc.escalationTopics
    .filter((x) => x.archivedAt === null)
    .map<Candidate>((t) => ({
      kind: "handoff",
      text: t.handoffWording.en || t.handoffWording.ur,
      score: score(q, distinctive(`${t.topic.en} ${t.topic.ur}`)),
    }));

  const candidates: Candidate[] = [...factCandidates(q, doc, score)];

  for (const f of doc.faqs.filter((x) => x.archivedAt === null)) {
    candidates.push({
      kind: "answer",
      text: f.answer.en || f.answer.ur,
      score: Math.max(
        score(q, `${f.question.en} ${f.question.ur}`),
        score(q, f.answer.en),
      ),
    });
  }

  for (const p of doc.programs.filter((x) => x.archivedAt === null)) {
    candidates.push({
      kind: "answer",
      text: [p.title.en || p.title.ur, p.description.en || p.description.ur]
        .filter(Boolean)
        .join(": "),
      score: Math.max(
        score(q, `${p.title.en} ${p.title.ur} ${p.classes.join(" ")}`),
        score(q, p.description.en),
      ),
    });
  }

  // An escalation subject that really matches wins, so a discount question can
  // never come back as an answer (FR-005, FR-019).
  const winner = best(candidates);
  const bestEscalation = best(escalation);
  if (
    bestEscalation &&
    bestEscalation.score >= ESCALATION_MIN &&
    bestEscalation.score >= (winner?.score ?? 0)
  ) {
    return { kind: "handoff", text: bestEscalation.text };
  }

  if (!winner || winner.score < THRESHOLD) return { kind: "none" };
  return { kind: "answer", text: winner.text };
}

function best(candidates: Candidate[]): Candidate | null {
  return candidates.reduce<Candidate | null>(
    (acc, c) => (!acc || c.score > acc.score ? c : acc),
    null,
  );
}
