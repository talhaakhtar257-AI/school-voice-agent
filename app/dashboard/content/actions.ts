"use server";

import { createClient } from "@/lib/supabase/server";
import { contentDoc, parseDoc } from "@/lib/content/schema";
import {
  DraftConflict,
  publish,
  readDraft,
  readLive,
  saveDraft,
} from "@/lib/content/queries";
import {
  checkPublishReadiness,
  hasBlockingProblems,
  type Problem,
} from "@/lib/content/validate";
import { summariseChanges } from "@/lib/content/diff";

export type SaveResult =
  | { ok: true; updatedAt: string }
  | { ok: false; reason: "conflict" | "invalid" | "error" };

/** Save the working document as the draft (FR-009). Never publishes (FR-010). */
export async function saveDraftAction(
  rawDoc: unknown,
  expectedUpdatedAt: string,
): Promise<SaveResult> {
  const parsed = contentDoc.safeParse(parseDoc(rawDoc));
  if (!parsed.success) return { ok: false, reason: "invalid" };
  try {
    const updatedAt = await saveDraft(parsed.data, expectedUpdatedAt);
    return { ok: true, updatedAt };
  } catch (e) {
    if (e instanceof DraftConflict) return { ok: false, reason: "conflict" };
    console.error(
      `[content/save] ${e instanceof Error ? e.message : "unknown"} @ ${new Date().toISOString()}`,
    );
    return { ok: false, reason: "error" };
  }
}

export type PreparePublishResult =
  | { ok: true; changes: string[]; problems: Problem[] }
  | { ok: false; reason: "error" };

/**
 * What the confirm dialog needs: the change list and any readiness problems,
 * computed from the STORED draft vs the STORED live version. The editor blocks
 * this while there are unsaved changes, so the stored draft is what the staff
 * member sees.
 */
export async function preparePublishAction(): Promise<PreparePublishResult> {
  try {
    const [{ doc: draft }, { doc: live }] = await Promise.all([
      readDraft(),
      readLive(),
    ]);
    return {
      ok: true,
      changes: summariseChanges(live, draft),
      problems: checkPublishReadiness(draft),
    };
  } catch (e) {
    console.error(
      `[content/prepare-publish] ${e instanceof Error ? e.message : "unknown"}`,
    );
    return { ok: false, reason: "error" };
  }
}

export type ConfirmPublishResult =
  | { ok: true; outcome: "published" | "noop" }
  | { ok: false; reason: "auth" | "blocked" | "error"; problems?: Problem[] };

/** Do the publish (FR-011 confirmation has already happened in the dialog). */
export async function confirmPublishAction(): Promise<ConfirmPublishResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { ok: false, reason: "auth" };

  try {
    const [{ doc: draft }, { doc: live }] = await Promise.all([
      readDraft(),
      readLive(),
    ]);

    const problems = checkPublishReadiness(draft);
    if (hasBlockingProblems(problems)) {
      return { ok: false, reason: "blocked", problems };
    }

    const summary = summariseChanges(live, draft);
    const outcome = await publish(user.id, user.email, summary);
    return { ok: true, outcome };
  } catch (e) {
    console.error(
      `[content/confirm-publish] ${e instanceof Error ? e.message : "unknown"} @ ${new Date().toISOString()}`,
    );
    return { ok: false, reason: "error" };
  }
}
