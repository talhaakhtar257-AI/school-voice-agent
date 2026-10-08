/**
 * Strings for the privacy policy page and the "Privacy policy" links in the
 * call flow (feature 012). The policy's eleven sections live in
 * privacy-sections.ts; this file holds the page around them.
 */

// The wording is a draft until the school approves it. While this is false the
// page says so, so no parent mistakes a draft for an approved legal document.
// Set it to true only after the school has signed off the English and Urdu text.
export const PRIVACY_POLICY_APPROVED = false;

// Stored once and formatted per language where shown (CLAUDE.md: dates stored once).
// Change it whenever the meaning of the policy changes.
export const PRIVACY_LAST_UPDATED = "2026-10-08";

/**
 * One section of the policy. `{phone}` and `{school}` in any sentence are
 * replaced when the page renders, so the office number and school name are
 * never typed into the wording and can never disagree with the rest of the site.
 */
export type PrivacySection = {
  id: string;
  heading: { en: string; ur: string };
  paragraphs: { en: string[]; ur: string[] };
  list?: { en: string[]; ur: string[] };
  // Paragraphs shown after the list, when a section needs a closing sentence.
  after?: { en: string[]; ur: string[] };
};

export const privacyStrings = {
  title: { en: "Privacy policy", ur: "رازداری کی پالیسی" },
  description: {
    en: "How the school's AI admissions assistant collects, uses and protects parents' information.",
    ur: "اسکول کا اے آئی داخلہ اسسٹنٹ والدین کی معلومات کیسے لیتا، استعمال کرتا اور محفوظ رکھتا ہے۔",
  },
  heading: { en: "Privacy policy", ur: "رازداری کی پالیسی" },
  draftNotice: {
    en: "Draft — awaiting the school's approval. This is not legal advice.",
    ur: "مسودہ — اسکول کی منظوری کا انتظار ہے۔ یہ قانونی مشورہ نہیں ہے۔",
  },
  lastUpdatedLabel: { en: "Last updated:", ur: "آخری بار تبدیل کی گئی:" },
  backHome: { en: "Back to admissions", ur: "داخلے کے صفحے پر واپس" },
  linkLabel: { en: "Privacy policy", ur: "رازداری کی پالیسی" },
  opensNewTab: { en: " (opens in a new tab)", ur: " (نئے ٹیب میں کھلتا ہے)" },
  contactLine: {
    en: "Questions about your information? Call the school office: {phone}",
    ur: "اپنی معلومات کے بارے میں کوئی سوال؟ اسکول کے دفتر کو کال کریں: {phone}",
  },
} as const;
