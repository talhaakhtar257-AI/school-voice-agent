import { z } from "zod";

/**
 * The shape of the school content document, defined once.
 *
 * A half-filled draft is valid to *store* (FR-009) — the DB seeds both `content`
 * rows with `{}`, and staff save partial drafts. `parseDoc` fills any missing
 * branch from `emptyDoc`, and every field added after the first release has a
 * default, so older stored documents still load. Completeness is enforced only
 * at publish time (`lib/content/validate.ts`).
 */

/** A sentence a parent hears — stored in both languages (FR-007). */
export const bilingual = z.object({
  en: z.string().default(""),
  ur: z.string().default(""),
});
export type Bilingual = z.infer<typeof bilingual>;
const blankPair = { en: "", ur: "" };

const ageRange = z.object({
  minYears: z.number().int().min(0),
  maxYears: z.number().int().min(0),
});

const admissionDate = z.object({
  label: z.string(),
  startDate: z.string(), // ISO date, e.g. "2026-11-01"
  endDate: z.string(),
});

const officeHours = z.object({
  days: z.string(), // e.g. "Mon-Fri"
  opens: z.string(), // "HH:MM" 24h
  closes: z.string(),
});

/** A school-day timing: a label parents read, around language-neutral times. */
const schoolTiming = z.object({
  label: bilingual,
  days: z.string(),
  starts: z.string(), // "HH:MM" 24h
  ends: z.string(),
});

const count = z.number().int().min(0).nullable().default(null);
const emptyStats = { studentsEnrolled: null, teachers: null, foundedYear: null };

/** Facts — language-neutral values, stored once, formatted for display (FR-006). */
export const facts = z.object({
  classes: z.array(z.string()),
  feePerClass: z.record(z.string(), z.number()), // monthly fee
  ageCriteriaPerClass: z.record(z.string(), ageRange),
  admissionDates: z.array(admissionDate),
  officeHours: z.array(officeHours),
  admissionFeePerClass: z.record(z.string(), z.number()).default({}), // one-time fee
  schoolTimings: z.array(schoolTiming).default([]),
  stats: z
    .object({ studentsEnrolled: count, teachers: count, foundedYear: count })
    .default(emptyStats),
});
export type Facts = z.infer<typeof facts>;

export const faqItem = z.object({
  id: z.string(),
  question: bilingual,
  answer: bilingual,
  archivedAt: z.string().nullable(), // soft delete (FR-025)
});
export type FaqItem = z.infer<typeof faqItem>;

export const escalationTopic = z.object({
  id: z.string(),
  topic: bilingual, // the subject, e.g. "discounts"
  handoffWording: bilingual, // what the agent says instead of answering (FR-005)
  archivedAt: z.string().nullable(),
});
export type EscalationTopic = z.infer<typeof escalationTopic>;

/** A program card on the website, e.g. "Primary" covering several classes. */
export const programItem = z.object({
  id: z.string(),
  title: bilingual,
  classes: z.array(z.string()).default([]), // names from facts.classes
  description: bilingual,
  archivedAt: z.string().nullable(),
});
export type ProgramItem = z.infer<typeof programItem>;

/** Who the school is — shown on the website and available to the agent. */
export const profile = z.object({
  tagline: bilingual.default(blankPair),
  about: bilingual.default(blankPair),
  address: bilingual.default(blankPair),
  // Shows a "sample content" ribbon on the website while placeholder data is live.
  showSampleBanner: z.boolean().default(false),
});
export type Profile = z.infer<typeof profile>;

/**
 * Reference text imported from a PDF or a website (feature 010). Kept in the
 * language it was written in: it is material the agent reads, not a sentence
 * shown to parents, so it is not duplicated per language. The title is.
 */
export const knowledgeDoc = z.object({
  id: z.string(),
  title: bilingual,
  source: z.object({ kind: z.enum(["pdf", "website"]), name: z.string() }),
  text: z.string().max(60_000),
  importedAt: z.string(),
  archivedAt: z.string().nullable(),
});
export type KnowledgeDoc = z.infer<typeof knowledgeDoc>;

/**
 * A file parents can download, such as the admission form (feature 011).
 * Staff upload it; `url` is its public address in the `downloads` store.
 */
export const downloadItem = z.object({
  id: z.string(),
  title: bilingual,
  url: z.string().url(),
  fileName: z.string(),
  sizeBytes: z.number().int().min(0),
  archivedAt: z.string().nullable(),
});
export type DownloadItem = z.infer<typeof downloadItem>;

export const contentDoc = z.object({
  facts,
  policies: z.object({
    admissionProcess: bilingual,
    documentRequirements: bilingual,
  }),
  faqs: z.array(faqItem),
  escalationTopics: z.array(escalationTopic),
  profile: profile.default({ tagline: blankPair, about: blankPair, address: blankPair, showSampleBanner: false }),
  programs: z.array(programItem).default([]),
  knowledge: z.array(knowledgeDoc).default([]),
  downloads: z.array(downloadItem).default([]),
});
export type ContentDoc = z.infer<typeof contentDoc>;

/** The empty document — what both `content` rows hold before anything is entered. */
export const emptyDoc: ContentDoc = {
  facts: {
    classes: [],
    feePerClass: {},
    ageCriteriaPerClass: {},
    admissionDates: [],
    officeHours: [],
    admissionFeePerClass: {},
    schoolTimings: [],
    stats: emptyStats,
  },
  policies: {
    admissionProcess: { en: "", ur: "" },
    documentRequirements: { en: "", ur: "" },
  },
  faqs: [],
  escalationTopics: [],
  profile: { tagline: blankPair, about: blankPair, address: blankPair, showSampleBanner: false },
  programs: [],
  knowledge: [],
  downloads: [],
};

/** Parse a stored jsonb value into a full ContentDoc, filling any missing branch. */
export function parseDoc(raw: unknown): ContentDoc {
  const r = (raw ?? {}) as Record<string, unknown>;
  const f = (r.facts ?? {}) as Record<string, unknown>;
  const p = (r.policies ?? {}) as Record<string, unknown>;
  const merged = {
    facts: {
      ...emptyDoc.facts,
      ...f,
      stats: { ...emptyDoc.facts.stats, ...((f.stats as object) ?? {}) },
    },
    policies: {
      admissionProcess: {
        ...emptyDoc.policies.admissionProcess,
        ...((p.admissionProcess as object) ?? {}),
      },
      documentRequirements: {
        ...emptyDoc.policies.documentRequirements,
        ...((p.documentRequirements as object) ?? {}),
      },
    },
    faqs: Array.isArray(r.faqs) ? r.faqs : [],
    escalationTopics: Array.isArray(r.escalationTopics) ? r.escalationTopics : [],
    profile: { ...emptyDoc.profile, ...((r.profile as object) ?? {}) },
    programs: Array.isArray(r.programs) ? r.programs : [],
    knowledge: Array.isArray(r.knowledge) ? r.knowledge : [],
    downloads: Array.isArray(r.downloads) ? r.downloads : [],
  };
  return contentDoc.parse(merged);
}

const blank = (v: Bilingual) => v.en === "" && v.ur === "";

/** True when a document has no content at all — used to answer "nothing published". */
export function isEmptyDoc(doc: ContentDoc): boolean {
  return (
    doc.facts.classes.length === 0 &&
    Object.keys(doc.facts.feePerClass).length === 0 &&
    doc.facts.admissionDates.length === 0 &&
    doc.facts.officeHours.length === 0 &&
    doc.facts.schoolTimings.length === 0 &&
    blank(doc.policies.admissionProcess) &&
    blank(doc.policies.documentRequirements) &&
    doc.faqs.length === 0 &&
    doc.escalationTopics.length === 0 &&
    doc.programs.length === 0 &&
    doc.knowledge.length === 0 &&
    doc.downloads.length === 0 &&
    blank(doc.profile.tagline) &&
    blank(doc.profile.about) &&
    blank(doc.profile.address)
  );
}

/** Strip archived items and the archivedAt marker — the shape the agent receives. */
export function forPublicApi(doc: ContentDoc) {
  const active = <T extends { archivedAt: string | null }>(items: T[]) =>
    items.filter((item) => item.archivedAt === null).map(({ archivedAt: _drop, ...rest }) => rest);
  return {
    facts: doc.facts,
    policies: doc.policies,
    profile: doc.profile,
    faqs: active(doc.faqs),
    escalationTopics: active(doc.escalationTopics),
    programs: active(doc.programs),
    downloads: active(doc.downloads).map(({ title, url }) => ({ title, url })),
    knowledge: active(doc.knowledge).map(({ title, source, text }) => ({ title, source: source.name, text })),
  };
}
