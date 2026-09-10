import type { ContentDoc } from "./schema";

export type SimulationResult =
  | { kind: "answer"; text: string }
  | { kind: "handoff"; text: string }
  | { kind: "none" };

const STOP = new Set([
  "the", "a", "an", "is", "are", "what", "how", "do", "does", "i", "you",
  "to", "of", "for", "in", "on", "at", "and", "or", "my", "me", "can",
  "could", "would", "please", "tell", "about", "there", "any",
]);

function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

/** Fraction of the query's keywords that appear in `text`. */
function score(queryTokens: string[], text: string): number {
  if (queryTokens.length === 0) return 0;
  const hay = new Set(tokenise(text));
  let hits = 0;
  for (const q of queryTokens) if (hay.has(q)) hits += 1;
  return hits / queryTokens.length;
}

const THRESHOLD = 0.34; // at least about a third of the keywords must match

/**
 * A lookup, not a model (research D-004). It surfaces what the DRAFT says about a
 * question so staff can catch a typo before publishing. An escalation-topic
 * match always shows the hand-off wording, never an answer (FR-019). Pure
 * function — no I/O, so running it changes nothing (FR-020).
 */
export function simulate(question: string, doc: ContentDoc): SimulationResult {
  const q = tokenise(question);
  if (q.length === 0) return { kind: "none" };

  type Candidate = { kind: "answer" | "handoff"; text: string; s: number };
  const candidates: Candidate[] = [];

  for (const t of doc.escalationTopics.filter((x) => x.archivedAt === null)) {
    candidates.push({
      kind: "handoff",
      text: t.handoffWording.en || t.handoffWording.ur,
      s: Math.max(
        score(q, `${t.topic.en} ${t.topic.ur}`),
        score(q, t.handoffWording.en),
      ),
    });
  }

  for (const f of doc.faqs.filter((x) => x.archivedAt === null)) {
    candidates.push({
      kind: "answer",
      text: f.answer.en || f.answer.ur,
      s: Math.max(
        score(q, `${f.question.en} ${f.question.ur}`),
        score(q, f.answer.en),
      ),
    });
  }

  // A fee / age / dates / hours question can hit the Facts directly.
  const factsKeywords = [
    ...doc.facts.classes,
    ...Object.keys(doc.facts.feePerClass),
    "fee", "fees", "cost", "age", "admission", "date", "dates", "office", "hours", "timing",
  ].join(" ");
  const factsScore = score(q, factsKeywords);
  if (factsScore >= THRESHOLD) {
    const lines = doc.facts.classes.map((c) => {
      const fee = doc.facts.feePerClass[c] ?? "?";
      const age = doc.facts.ageCriteriaPerClass[c];
      return `${c}: fee ${fee}, age ${age?.minYears ?? "?"}-${age?.maxYears ?? "?"} years`;
    });
    candidates.push({
      kind: "answer",
      text: lines.join("\n") || "No facts entered yet.",
      s: factsScore,
    });
  }

  const best = candidates.reduce<Candidate | null>(
    (acc, c) => (!acc || c.s > acc.s ? c : acc),
    null,
  );

  if (!best || best.s < THRESHOLD) return { kind: "none" };
  return best.kind === "handoff"
    ? { kind: "handoff", text: best.text }
    : { kind: "answer", text: best.text };
}
