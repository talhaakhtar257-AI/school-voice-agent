"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { updateDraft } from "@/lib/knowledge/draft";
import { PDF_MAX_BYTES } from "@/lib/knowledge/pdf";
import type { DownloadItem } from "@/lib/content/schema";

/**
 * Files for parents, such as the admission form (feature 011, stage D).
 * The PDF goes into the public `downloads` store through the staff member's
 * own session (the store's rules only let signed-in staff add files); the
 * link goes into the DRAFT content, so it reaches the website, the emails
 * and the assistant only after Publish — the same as every other change.
 */

export type DownloadResult = { ok: true } | { ok: false; reason: string };

function logFailure(action: string, error: unknown) {
  console.error(`[downloads/${action}] ${error instanceof Error ? error.message : "unknown"} @ ${new Date().toISOString()}`);
}

export async function uploadDownloadAction(formData: FormData): Promise<DownloadResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, reason: "auth" };

  const file = formData.get("file");
  const titleEn = String(formData.get("titleEn") ?? "").trim().slice(0, 120);
  const titleUr = String(formData.get("titleUr") ?? "").trim().slice(0, 120);
  if (!(file instanceof File) || file.size === 0) return { ok: false, reason: "no-file" };
  if (file.size > PDF_MAX_BYTES) return { ok: false, reason: "too-big" };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return { ok: false, reason: "not-pdf" };
  if (!titleEn && !titleUr) return { ok: false, reason: "invalid" };

  try {
    // A random prefix keeps names unique and addresses unguessable before publishing.
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-80) || "file.pdf";
    const path = `${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("downloads")
      .upload(path, new Uint8Array(await file.arrayBuffer()), { contentType: "application/pdf", upsert: false });
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from("downloads").getPublicUrl(path);

    const item: DownloadItem = {
      id: crypto.randomUUID(),
      title: { en: titleEn, ur: titleUr },
      url: publicUrl.publicUrl,
      fileName: file.name,
      sizeBytes: file.size,
      archivedAt: null,
    };
    await updateDraft((doc) => ({ ...doc, downloads: [...doc.downloads, item] }));
    revalidatePath("/dashboard/knowledge");
    return { ok: true };
  } catch (error) {
    logFailure("upload", error);
    return { ok: false, reason: "error" };
  }
}

/** Remove a file from the draft. The stored PDF stays, so a published link never breaks mid-season. */
export async function archiveDownloadAction(id: string): Promise<DownloadResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { ok: false, reason: "auth" };
  try {
    await updateDraft((doc) => ({
      ...doc,
      downloads: doc.downloads.map((d) => (d.id === id ? { ...d, archivedAt: new Date().toISOString() } : d)),
    }));
    revalidatePath("/dashboard/knowledge");
    return { ok: true };
  } catch (error) {
    logFailure("archive", error);
    return { ok: false, reason: "error" };
  }
}
