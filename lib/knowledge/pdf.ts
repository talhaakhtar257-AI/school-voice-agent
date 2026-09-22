import { extractText, getDocumentProxy } from "unpdf";

/**
 * Vercel refuses any request body over 4.5 MB, so a bigger PDF could never
 * reach this code; refusing at 4 MB gives staff a clear message instead.
 */
export const PDF_MAX_BYTES = 4 * 1024 * 1024;

/** Knowledge text the agent reads is capped so one document cannot crowd out the rest. */
export const KNOWLEDGE_MAX_CHARS = 50_000;

/**
 * The readable text of a PDF, one blank line between pages. Returns null when
 * nothing readable comes out — a scanned PDF is only pictures of text, and
 * reading those (OCR) is out of scope.
 */
export async function pdfToText(bytes: Uint8Array): Promise<string | null> {
  const pdf = await getDocumentProxy(bytes);
  const { text } = await extractText(pdf, { mergePages: false });
  const pages = text.map((page) => tidy(page)).filter((page) => page !== "");
  const joined = pages.join("\n\n").slice(0, KNOWLEDGE_MAX_CHARS).trim();
  return joined.length >= 20 ? joined : null;
}

function tidy(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
