import { z } from "zod";

/**
 * What POST /api/unanswered accepts from the voice agent. Unlike a lead,
 * questionText is required (FR-004) — a row with no question is not a
 * meaningful record. language is optional: the agent may not always be able
 * to attribute a single language to a mixed-language question.
 */
export const incomingQuestion = z.object({
  questionText: z.string().trim().min(1).max(1000),
  language: z.enum(["ur", "en"]).optional(),
});

export type IncomingQuestion = z.infer<typeof incomingQuestion>;
