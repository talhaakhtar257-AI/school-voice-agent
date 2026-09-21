import { createClient } from "@/lib/supabase/server";
import { startOfTodayPk, startOfWeekPk } from "./pk-time";

export type PeriodFigures = {
  calls: number;
  leads: number;
  /** Seconds, over ended calls with a known length; null when there are none. */
  averageCallSeconds: number | null;
  newQuestions: number;
};

export type PeriodStats = { today: PeriodFigures; week: PeriodFigures };

/**
 * The Overview's Today / This week strip (FR-010). One read per table for the
 * whole week, then split in code — a school has tens of calls a day, so this
 * stays small. Reads through the staff session.
 */
export async function getPeriodStats(now = new Date()): Promise<PeriodStats> {
  const todayStart = startOfTodayPk(now);
  const weekStart = startOfWeekPk(now).toISOString();
  const supabase = await createClient();

  const [calls, leads, questions] = await Promise.all([
    supabase.from("calls").select("started_at, duration_seconds").gte("started_at", weekStart),
    supabase.from("leads").select("created_at").gte("created_at", weekStart),
    supabase.from("unanswered_questions").select("created_at").gte("created_at", weekStart),
  ]);
  if (calls.error) throw calls.error;
  if (leads.error) throw leads.error;
  if (questions.error) throw questions.error;

  const callRows = (calls.data ?? []) as { started_at: string; duration_seconds: number | null }[];
  const leadRows = (leads.data ?? []) as { created_at: string }[];
  const questionRows = (questions.data ?? []) as { created_at: string }[];
  const isToday = (iso: string) => new Date(iso) >= todayStart;

  function figures(onlyToday: boolean): PeriodFigures {
    const pick = <T,>(rows: T[], at: (row: T) => string) => (onlyToday ? rows.filter((r) => isToday(at(r))) : rows);
    const periodCalls = pick(callRows, (r) => r.started_at);
    const lengths = periodCalls.map((c) => c.duration_seconds).filter((d): d is number => d !== null);
    return {
      calls: periodCalls.length,
      leads: pick(leadRows, (r) => r.created_at).length,
      averageCallSeconds: lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : null,
      newQuestions: pick(questionRows, (r) => r.created_at).length,
    };
  }

  return { today: figures(true), week: figures(false) };
}
