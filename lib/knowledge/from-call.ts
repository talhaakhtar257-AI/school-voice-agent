import { maskIdNumbers, type Turn } from "@/lib/calls/mask";

/**
 * A call's conversation as Knowledge text (tester round 3): each thing the
 * parent said, then what the assistant answered. Staff edit it before it is
 * published, but personal details are removed up front, because published
 * knowledge is read to every future caller.
 */
const PK_MOBILE = /(?:\+?92[-\s]?|0)3\d{2}[-\s]?\d{7}/g;
const EMAIL = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function scrub(text: string, names: { value: string; label: string }[]): string {
  let out = maskIdNumbers(text).replace(PK_MOBILE, "[removed]").replace(EMAIL, "[removed]");
  for (const { value, label } of names) {
    // Each word of the name on its own too: "Ahmed Khan" is often just "Ahmed".
    const words = [value, ...value.split(/\s+/)].map((w) => w.trim()).filter((w) => w.length >= 3);
    // Whole words only ("Ali" must not change "quality"); \p{L} covers Urdu too.
    for (const word of words) out = out.replace(new RegExp(`(?<!\\p{L})${escapeRegExp(word)}(?!\\p{L})`, "giu"), label);
  }
  return out;
}

export function callToKnowledgeText(
  turns: Turn[],
  names: { parentName: string | null; studentName: string | null },
): string {
  const people = [
    names.parentName ? { value: names.parentName, label: "[parent]" } : null,
    names.studentName ? { value: names.studentName, label: "[child]" } : null,
  ].filter((n): n is { value: string; label: string } => n !== null);

  return turns
    .filter((t) => t.content.trim() !== "")
    .map((t) => `${t.role === "user" ? "Parent asked" : "Answer given"}: ${scrub(t.content.trim(), people)}`)
    .join("\n");
}
