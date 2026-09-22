import { DraftConflict, readDraft, saveDraft } from "@/lib/content/queries";
import { contentDoc, type ContentDoc } from "@/lib/content/schema";

/**
 * Change the draft content in one step: read it, apply `change`, save it.
 * The save only succeeds if nobody saved in between (optimistic concurrency);
 * if someone did, the change is applied once more to their newer draft.
 * Nothing here publishes — staff still press Publish, as for every edit.
 */
export async function updateDraft(change: (doc: ContentDoc) => ContentDoc): Promise<void> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { doc, updatedAt } = await readDraft();
    const next = contentDoc.parse(change(structuredClone(doc)));
    try {
      await saveDraft(next, updatedAt);
      return;
    } catch (error) {
      if (!(error instanceof DraftConflict) || attempt === 1) throw error;
    }
  }
}
