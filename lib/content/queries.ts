import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type ContentDoc, parseDoc } from "./schema";

/** Thrown by saveDraft when another staff member saved since this editor loaded. */
export class DraftConflict extends Error {
  constructor() {
    super("The draft changed since you opened it.");
    this.name = "DraftConflict";
  }
}

type ContentRow = { doc: unknown; updated_at: string };

export type LoadedDoc = { doc: ContentDoc; updatedAt: string };

async function readChannel(channel: "draft" | "live"): Promise<LoadedDoc> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content")
    .select("doc, updated_at")
    .eq("channel", channel)
    .single<ContentRow>();
  if (error) throw error;
  return { doc: parseDoc(data.doc), updatedAt: data.updated_at };
}

export const readDraft = () => readChannel("draft");
export const readLive = () => readChannel("live");

/**
 * Read the live document with the service-role client, for the API route, which
 * has no staff session. Returns null on any error rather than throwing, so the
 * route can answer cleanly.
 */
export async function readLiveForApi(): Promise<LoadedDoc | null> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("content")
      .select("doc, updated_at")
      .eq("channel", "live")
      .single<ContentRow>();
    if (error || !data) return null;
    return { doc: parseDoc(data.doc), updatedAt: data.updated_at };
  } catch {
    return null;
  }
}

/**
 * Save the draft, but only if `expectedUpdatedAt` still matches the stored value
 * (optimistic concurrency, FR-027). Returns the new updated_at on success.
 */
export async function saveDraft(
  doc: ContentDoc,
  expectedUpdatedAt: string,
): Promise<string> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content")
    .update({ doc })
    .eq("channel", "draft")
    .eq("updated_at", expectedUpdatedAt)
    .select("updated_at")
    .maybeSingle<{ updated_at: string }>();
  if (error) throw error;
  if (!data) throw new DraftConflict();
  return data.updated_at;
}

export type HistoryRow = {
  id: string;
  published_at: string;
  published_by_email: string | null;
  change_summary: string[];
  doc_before: unknown;
  doc_after: unknown;
};

const HISTORY_PAGE_SIZE = 20;

export async function listHistory(
  page: number,
): Promise<{ rows: HistoryRow[]; hasMore: boolean }> {
  const supabase = await createClient();
  const from = page * HISTORY_PAGE_SIZE;
  const { data, error } = await supabase
    .from("content_history")
    .select(
      "id, published_at, published_by_email, change_summary, doc_before, doc_after",
    )
    .order("published_at", { ascending: false })
    .range(from, from + HISTORY_PAGE_SIZE);
  if (error) throw error;
  const rows = (data ?? []) as unknown as HistoryRow[];
  return {
    rows: rows.slice(0, HISTORY_PAGE_SIZE),
    hasMore: rows.length > HISTORY_PAGE_SIZE,
  };
}

export async function getHistoryRecord(id: string): Promise<HistoryRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_history")
    .select(
      "id, published_at, published_by_email, change_summary, doc_before, doc_after",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return (data as unknown as HistoryRow) ?? null;
}

/**
 * Publish the draft. Calls the DB function through the service-role client — its
 * EXECUTE grant was revoked from every other role. Returns "noop" when the draft
 * already equals live (Publish pressed twice).
 */
export async function publish(
  actorId: string,
  actorEmail: string,
  summary: string[],
): Promise<"published" | "noop"> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("publish_content", {
    actor_id: actorId,
    actor_email: actorEmail,
    summary,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return row?.result === "published" ? "published" : "noop";
}
