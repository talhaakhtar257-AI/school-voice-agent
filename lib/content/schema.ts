import { z } from "zod";

/**
 * The shape of the school content document, defined once.
 *
 * A half-filled draft is valid to *store* (FR-009) — the DB seeds both `content`
 * rows with `{}`, and staff save partial drafts. `parseDoc` fills any missing
 * top-level branch from `emptyDoc`, and `bilingual` fills a missing language with
 * "". Completeness is enforced only at publish time (`lib/content/validate.ts`).
 */

/** A sentence a parent hears — stored in both languages (FR-007). */
export const bilingual = z.object({
  en: z.string().default(""),
  ur: z.string().default(""),
});
export type Bilingual = z.infer<typeof bilingual>;

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

/** Facts — language-neutral values, stored once, formatted for display (FR-006). */
export const facts = z.object({
  classes: z.array(z.string()),
  feePerClass: z.record(z.string(), z.number()),
  ageCriteriaPerClass: z.record(z.string(), ageRange),
  admissionDates: z.array(admissionDate),
  officeHours: z.array(officeHours),
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

export const contentDoc = z.object({
  facts,
  policies: z.object({
    admissionProcess: bilingual,
    documentRequirements: bilingual,
  }),
  faqs: z.array(faqItem),
  escalationTopics: z.array(escalationTopic),
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
  },
  policies: {
    admissionProcess: { en: "", ur: "" },
    documentRequirements: { en: "", ur: "" },
  },
  faqs: [],
  escalationTopics: [],
};

/** Parse a stored jsonb value into a full ContentDoc, filling any missing branch. */
export function parseDoc(raw: unknown): ContentDoc {
  const r = (raw ?? {}) as Record<string, unknown>;
  const p = (r.policies ?? {}) as Record<string, unknown>;
  const merged = {
    facts: { ...emptyDoc.facts, ...((r.facts as object) ?? {}) },
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
  };
  return contentDoc.parse(merged);
}

/** True when a document has no content at all — used to answer "nothing published". */
export function isEmptyDoc(doc: ContentDoc): boolean {
  return (
    doc.facts.classes.length === 0 &&
    Object.keys(doc.facts.feePerClass).length === 0 &&
    doc.facts.admissionDates.length === 0 &&
    doc.facts.officeHours.length === 0 &&
    doc.policies.admissionProcess.en === "" &&
    doc.policies.admissionProcess.ur === "" &&
    doc.policies.documentRequirements.en === "" &&
    doc.policies.documentRequirements.ur === "" &&
    doc.faqs.length === 0 &&
    doc.escalationTopics.length === 0
  );
}

/** Strip archived items and the archivedAt marker — the shape the agent receives. */
export function forPublicApi(doc: ContentDoc) {
  return {
    facts: doc.facts,
    policies: doc.policies,
    faqs: doc.faqs
      .filter((f) => f.archivedAt === null)
      .map(({ archivedAt: _drop, ...rest }) => rest),
    escalationTopics: doc.escalationTopics
      .filter((t) => t.archivedAt === null)
      .map(({ archivedAt: _drop, ...rest }) => rest),
  };
}
