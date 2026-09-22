import { createClient } from "@/lib/supabase/server";

export type UnansweredQuestionRow = {
  id: string;
  question_text: string;
  language: "ur" | "en" | null;
  times_asked: number;
  created_at: string;
  updated_at: string;
  answered_at: string | null;
};

const COLUMNS = "id, question_text, language, times_asked, created_at, updated_at, answered_at";

/**
 * Every question the assistant could not answer, most-asked first (FR-007).
 * `onlyOpen` leaves out the ones staff have already answered (feature 010).
 * Goes through the signed-in staff member's own session — the
 * unanswered_questions_select_authenticated RLS policy allows it.
 */
export async function listUnansweredQuestions({ onlyOpen = true } = {}): Promise<UnansweredQuestionRow[]> {
  const supabase = await createClient();
  let query = supabase.from("unanswered_questions").select(COLUMNS).order("times_asked", { ascending: false });
  if (onlyOpen) query = query.is("answered_at", null);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as UnansweredQuestionRow[];
}

export async function getUnansweredQuestion(id: string): Promise<UnansweredQuestionRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("unanswered_questions").select(COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as unknown as UnansweredQuestionRow | null;
}

/** Mark a question answered once its answer is in the draft FAQs. */
export async function markQuestionAnswered(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("unanswered_questions")
    .update({ answered_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}
