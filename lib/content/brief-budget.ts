import type { ContentDoc } from "./schema";
import { agentBrief, KNOWLEDGE_BUDGET } from "./agent-brief";

/**
 * How much of the agent's per-reply budget the content uses.
 *
 * Every turn of every call carries the brief, so its size is not a detail: on
 * the 3 November 2026 call Retell began charging an `llm_token_surcharge` of
 * $0.06/min that had read $0.00 across the previous account's calls. The brief
 * measured 5,927 bytes against a 6,000-character knowledge budget — already
 * full. Longer context is also slower to first token, so the same growth costs
 * money and delay together (feature 013, D-006).
 *
 * The existing budget caps imported documents only. Classes, FAQs, programs,
 * the admission process, the documents text and the escalation wording in both
 * languages are all uncapped, so staff adding FAQs after handover make every
 * future call slower and dearer with nobody watching. This measures the whole
 * brief so they can see it happening.
 *
 * Nothing here changes what the brief contains. Constitution I forbids quietly
 * dropping school content — a lost FAQ makes the assistant *wrong*, not merely
 * slow, and a parent would be told the school has no answer when it has one.
 * So staff are told instead, and the overflow is named.
 */

/**
 * The whole brief's comfortable size. Beyond this the surcharge and the extra
 * time to first token start to bite. Generous against the 6,000 characters of
 * imported documents, because the structured sections ride along too.
 */
export const BRIEF_BUDGET_CHARS = 12_000;

/** Warn before the cliff, not at it, so staff can still act. */
const WARN_AT = 0.8;

export type BriefBudget = {
  /** Characters the rendered brief currently uses. */
  used: number;
  budget: number;
  /** 0-100, capped at 100 for display. */
  percent: number;
  /** Past the warning line but still inside the budget. */
  nearLimit: boolean;
  /** Over the budget: calls are now slower and more expensive. */
  overBudget: boolean;
  /**
   * Imported documents cut short by the knowledge cap, by title. Named rather
   * than silently lost (FR-019).
   */
  truncatedDocuments: string[];
};

export function measureBrief(doc: ContentDoc): BriefBudget {
  const used = agentBrief(doc).length;

  // Which imported documents the knowledge cap cut, worked out the same way
  // agentBrief spends that budget: in order, until it runs out.
  const truncatedDocuments: string[] = [];
  let remaining = KNOWLEDGE_BUDGET;
  for (const k of doc.knowledge.filter((x) => x.archivedAt === null)) {
    const allowed = Math.max(0, remaining);
    if (k.text.length > allowed) {
      truncatedDocuments.push(k.title.en || k.title.ur || k.source.name);
    }
    remaining -= Math.min(k.text.length, allowed);
  }

  return {
    used,
    budget: BRIEF_BUDGET_CHARS,
    percent: Math.min(100, Math.round((used / BRIEF_BUDGET_CHARS) * 100)),
    nearLimit: used >= BRIEF_BUDGET_CHARS * WARN_AT && used < BRIEF_BUDGET_CHARS,
    overBudget: used >= BRIEF_BUDGET_CHARS,
    truncatedDocuments,
  };
}
