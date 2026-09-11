import { createAdminClient } from "@/lib/supabase/admin";
import type { IncomingQuestion } from "./schema";

/**
 * Log an unanswered question, or increment times_asked if the same question
 * (by normalised text) already has a row. Calls upsert_unanswered_question()
 * so the increment-or-insert is one atomic database statement, not a
 * read-then-write — two near-simultaneous identical questions both count
 * correctly (spec Assumptions).
 */
export async function upsertUnansweredQuestion(
  question: IncomingQuestion,
): Promise<string> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("upsert_unanswered_question", {
    p_question_text: question.questionText,
    p_language: question.language ?? null,
  });
  if (error) throw error;
  return data as string;
}
