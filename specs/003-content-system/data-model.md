# Data Model: School Content System

**Feature**: `003-content-system` | **Date**: 2026-09-10
**Phase**: 1 — Design

Two new tables. Both follow `.claude/rules/database.md`: `id`, `created_at`,
`updated_at` on every table; UTC timestamps; RLS on; no row ever deleted; the
migration is a reviewable SQL file.

---

## Table `content`

Exactly two rows for the life of the project.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` primary key | default `gen_random_uuid()` |
| `channel` | `text` | `'draft'` or `'live'`. `CHECK (channel IN ('draft','live'))`, `UNIQUE` |
| `doc` | `jsonb` | the whole content document (shape below). `NOT NULL`, default `'{}'::jsonb` |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()`, bumped by trigger on update |

- The migration seeds both rows with an empty document.
- `draft` is the only row the editor writes. `live` is written only by the
  `publish_content` function.
- The `updated_at` on `draft` is the optimistic-concurrency token (D-003).

## Table `content_history`

One row per successful publish. Never updated, never deleted (FR-022).

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` primary key | |
| `published_at` | `timestamptz` | default `now()` (FR-021) |
| `published_by` | `uuid` | `auth.users(id)` — the staff member (FR-021) |
| `published_by_email` | `text` | denormalised so history reads without a join even if the user is later removed |
| `doc_before` | `jsonb` | the live document *before* this publish (FR-024 — full prior content) |
| `doc_after` | `jsonb` | the live document *after* — equal to the draft that was published |
| `change_summary` | `jsonb` | a list of human-readable change lines produced by `lib/content/diff.ts`, stored so the list renders without recomputing |
| `created_at` | `timestamptz` | default `now()` |
| `updated_at` | `timestamptz` | default `now()` — never changes in practice |

- Ordered `published_at DESC` for display (FR-023).
- The screen paginates (e.g. 20 per page) so a large history stays usable
  (FR: "history grows large").

## Function `publish_content(actor_id uuid, actor_email text)`

`SECURITY DEFINER`. In one transaction:

1. `SELECT doc FROM content WHERE channel = 'draft'` → `d`
2. `SELECT doc FROM content WHERE channel = 'live'` → `l`
3. If `d = l` (jsonb equality): return `('noop', null)` — nothing published, no
   history row (edge case: Publish pressed twice).
4. `INSERT INTO content_history (published_by, published_by_email, doc_before,
   doc_after, change_summary) VALUES (actor_id, actor_email, l, d, <summary>)`.
   The summary is passed in by the caller (computed in TypeScript) or recomputed
   here — caller-passed is simpler.
5. `UPDATE content SET doc = d, updated_at = now() WHERE channel = 'live'`.
6. Return `('published', new_history_id)`.

Readiness (required facts present, no half-filled bilingual field) is checked in
`lib/content/validate.ts` *before* this function is called; the function assumes a
valid draft.

## RLS

| Table | `authenticated` (staff session) | `anon` | service role |
|---|---|---|---|
| `content` | `SELECT`, `UPDATE` (draft only, enforced by the app; policy allows both rows) | none | full (used only by `/api/content`, server-side) |
| `content_history` | `SELECT` | none | `INSERT` via the function |

The `/api/content` route does **not** use the staff session — it uses the
service-role client and reads `live` after checking the shared secret. The draft
is never selected in that route (FR-016).

---

## The content document (`doc jsonb`)

Defined once as a `zod` schema in `lib/content/schema.ts`; the type below is
derived from it.

```ts
type Bilingual = { en: string; ur: string };

type ContentDoc = {
  facts: {
    classes: string[];                              // ordered; e.g. ["Nursery", "Class 1", ...]
    feePerClass: Record<string, number>;            // class name -> monthly fee in PKR
    ageCriteriaPerClass: Record<string,             // class name -> age range
      { minYears: number; maxYears: number }>;
    admissionDates: {
      label: string;                                // neutral tag, e.g. "Session 2027 intake"
      startDate: string;                            // ISO date
      endDate: string;                              // ISO date
    }[];
    officeHours: {
      days: string;                                 // e.g. "Mon-Fri"
      opens: string;                                // "HH:MM" 24h
      closes: string;                               // "HH:MM"
    }[];
  };

  policies: {
    admissionProcess: Bilingual;                    // FR-003, FR-007
    documentRequirements: Bilingual;
  };

  faqs: {
    id: string;                                     // stable id, generated on add
    question: Bilingual;
    answer: Bilingual;
    archivedAt: string | null;                      // soft delete (FR-025); hidden from content when set
  }[];

  escalationTopics: {
    id: string;
    topic: Bilingual;                               // what subject this is, e.g. "discounts"
    handoffWording: Bilingual;                      // what the agent says instead of answering (FR-005)
    archivedAt: string | null;                      // removing needs the publish-style confirm (FR-026)
  }[];
};
```

### Validation rules (from requirements)

- **Required facts** (FR-002, FR-012): `classes` non-empty; every class in
  `classes` has an entry in `feePerClass` and `ageCriteriaPerClass`; at least one
  `admissionDates` entry; at least one `officeHours` entry.
- **Bilingual completeness** (FR-007, FR-008): for every `Bilingual` value in
  `policies`, non-archived `faqs`, and non-archived `escalationTopics`, both `en`
  and `ur` are non-empty after trimming. A failure names the path
  (e.g. "FAQ 3 answer") and the missing language.
- **Escalation minimum** (FR-005): at least one non-archived escalation topic
  whose `topic.en` matches "discount" and one matching "special case" — or,
  softer, a warning if neither is present. Default: warn, do not block, since the
  wording is the school's to choose.
- **Formats** (FR: "a fee or date typed in the wrong format"): `feePerClass`
  values are positive integers; `admissionDates` are valid ISO dates with
  `startDate <= endDate`; `officeHours` times are `HH:MM` with `opens < closes`.
  Checked at save, not only at publish.
- **Archived items** are excluded from `/api/content` output and from the test
  tool, but remain in `doc` (FR-025).

### State

- A `Bilingual` or `Facts` value has no lifecycle of its own.
- An `faq` / `escalationTopic` is **active** (`archivedAt === null`) or
  **archived** (`archivedAt` set). There is no un-archive button in scope; a
  staff member can clear the field by editing if needed.
- The document as a whole is either **draft** or **live** depending on which
  `content` row holds it. `publish_content` is the only transition.
