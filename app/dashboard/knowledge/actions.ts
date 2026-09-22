"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { bilingual, type KnowledgeDoc } from "@/lib/content/schema";
import { updateDraft } from "@/lib/knowledge/draft";
import { KNOWLEDGE_MAX_CHARS, PDF_MAX_BYTES, pdfToText } from "@/lib/knowledge/pdf";
import { CrawlRefused, crawlSite } from "@/lib/knowledge/crawl";
import { getUnansweredQuestion, markQuestionAnswered } from "@/lib/unanswered/list";

/**
 * Knowledge screen actions (contracts/api.md §4). Every one checks the staff
 * session first and writes only the DRAFT content — nothing reaches parents
 * until staff press Publish, exactly as for every other content edit (FR-017).
 */

export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { value: T }))
  | { ok: false; reason: string };

async function signedIn(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return Boolean(data.user);
}

function logFailure(action: string, error: unknown) {
  console.error(`[knowledge/${action}] ${error instanceof Error ? error.message : "unknown"} @ ${new Date().toISOString()}`);
}

const answerInput = z.object({
  questionId: z.string().uuid(),
  question: bilingual,
  answer: bilingual,
});

/** Turn a parent's question into a draft FAQ, and mark the question answered (FR-014). */
export async function answerQuestionAction(input: unknown): Promise<ActionResult> {
  if (!(await signedIn())) return { ok: false, reason: "auth" };
  const parsed = answerInput.safeParse(input);
  if (!parsed.success) return { ok: false, reason: "invalid" };
  const { questionId, question, answer } = parsed.data;
  if ((!question.en.trim() && !question.ur.trim()) || (!answer.en.trim() && !answer.ur.trim())) {
    return { ok: false, reason: "invalid" };
  }
  try {
    if (!(await getUnansweredQuestion(questionId))) return { ok: false, reason: "missing" };
    await updateDraft((doc) => ({
      ...doc,
      faqs: [
        ...doc.faqs,
        {
          id: crypto.randomUUID(),
          question: { en: question.en.trim(), ur: question.ur.trim() },
          answer: { en: answer.en.trim(), ur: answer.ur.trim() },
          archivedAt: null,
        },
      ],
    }));
    await markQuestionAnswered(questionId);
    revalidatePath("/dashboard/knowledge");
    return { ok: true };
  } catch (error) {
    logFailure("answer", error);
    return { ok: false, reason: "error" };
  }
}

function newKnowledge(title: string, source: KnowledgeDoc["source"], text: string): KnowledgeDoc {
  return {
    id: crypto.randomUUID(),
    title: { en: title.slice(0, 200), ur: "" },
    source,
    text: text.slice(0, KNOWLEDGE_MAX_CHARS),
    importedAt: new Date().toISOString(),
    archivedAt: null,
  };
}

async function addKnowledge(item: KnowledgeDoc): Promise<void> {
  await updateDraft((doc) => ({ ...doc, knowledge: [...doc.knowledge, item] }));
  revalidatePath("/dashboard/knowledge");
}

/** Read a PDF's text into a new draft Knowledge document (FR-015). */
export async function importPdfAction(formData: FormData): Promise<ActionResult<string>> {
  if (!(await signedIn())) return { ok: false, reason: "auth" };
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, reason: "no-file" };
  if (file.size > PDF_MAX_BYTES) return { ok: false, reason: "too-big" };
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return { ok: false, reason: "not-pdf" };
  try {
    const text = await pdfToText(new Uint8Array(await file.arrayBuffer()));
    if (!text) return { ok: false, reason: "no-text" };
    const item = newKnowledge(file.name.replace(/\.pdf$/i, ""), { kind: "pdf", name: file.name }, text);
    await addKnowledge(item);
    return { ok: true, value: item.id };
  } catch (error) {
    logFailure("pdf", error);
    return { ok: false, reason: "not-pdf" };
  }
}

/** Read up to 10 pages of one website into a new draft Knowledge document (FR-016). */
export async function importWebsiteAction(url: string): Promise<ActionResult<string>> {
  if (!(await signedIn())) return { ok: false, reason: "auth" };
  try {
    const pages = await crawlSite(url);
    if (pages.length === 0) return { ok: false, reason: "no-text" };
    const text = pages.map((p) => `## ${p.title}\n${p.url}\n\n${p.text}`).join("\n\n");
    const host = new URL(pages[0].url).host;
    const item = newKnowledge(pages[0].title || host, { kind: "website", name: url.trim() }, text);
    await addKnowledge(item);
    return { ok: true, value: item.id };
  } catch (error) {
    if (error instanceof CrawlRefused) return { ok: false, reason: error.message };
    logFailure("website", error);
    return { ok: false, reason: "error" };
  }
}

const saveInput = z.object({
  id: z.string().min(1).max(100),
  title: bilingual,
  text: z.string().max(KNOWLEDGE_MAX_CHARS),
});

/** Staff corrections to an imported document, saved in the draft. */
export async function saveKnowledgeAction(input: unknown): Promise<ActionResult> {
  if (!(await signedIn())) return { ok: false, reason: "auth" };
  const parsed = saveInput.safeParse(input);
  if (!parsed.success || parsed.data.text.trim() === "") return { ok: false, reason: "invalid" };
  const { id, title, text } = parsed.data;
  try {
    await updateDraft((doc) => ({
      ...doc,
      knowledge: doc.knowledge.map((k) => (k.id === id ? { ...k, title, text: text.trim() } : k)),
    }));
    revalidatePath("/dashboard/knowledge");
    return { ok: true };
  } catch (error) {
    logFailure("save", error);
    return { ok: false, reason: "error" };
  }
}

/** Remove a document from the draft (kept, marked archived — rows are never deleted). */
export async function archiveKnowledgeAction(id: string): Promise<ActionResult> {
  if (!(await signedIn())) return { ok: false, reason: "auth" };
  try {
    await updateDraft((doc) => ({
      ...doc,
      knowledge: doc.knowledge.map((k) => (k.id === id ? { ...k, archivedAt: new Date().toISOString() } : k)),
    }));
    revalidatePath("/dashboard/knowledge");
    return { ok: true };
  } catch (error) {
    logFailure("archive", error);
    return { ok: false, reason: "error" };
  }
}
