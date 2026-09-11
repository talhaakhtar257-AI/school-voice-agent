import { createClient } from "@/lib/supabase/server";

export type UnansweredQuestionRow = {
  id: string;
  question_text: string;
  language: "ur" | "en" | null;
  times_asked: number;
  updated_at: string;
};

/**
 * Every unanswered question, most-asked first (FR-007). Goes through the
 * signed-in staff member's own session — the unanswered_questions_select_
 * authenticated RLS policy (this feature's migration) already allows it,
 * same as lib/leads/queries.ts's listLeads().
 */
export async function listUnansweredQuestions(): Promise<UnansweredQuestionRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("unanswered_questions")
    .select("id, question_text, language, times_asked, updated_at")
    .order("times_asked", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as UnansweredQuestionRow[];
}
