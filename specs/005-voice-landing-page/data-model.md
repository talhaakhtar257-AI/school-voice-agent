# Data Model: Parent-Facing Voice Landing Page

**Feature**: `005-voice-landing-page` | **Date**: 2026-09-11
**Revised**: 2026-09-11 — added `voice_usage_daily` and `voice_usage_monthly` for
the three call limits (FR-030–034).

**Phase**: 1 — Design

Three new tables: `leads` (on the documented table list) and
`voice_usage_daily` / `voice_usage_monthly` (**not** on it — flagged in `plan.md`
for explicit approval; no personal data in either). Follows
`.claude/rules/database.md` where it applies: `id`, `created_at`, `updated_at` on
`leads`; UTC timestamps; RLS on; no row ever deleted; the migration is a
reviewable SQL file. The two usage tables are pure counters with no `id`/staff
visibility need — see their own notes below.

---

## Table `leads`

One row per completed conversation that produced an enquiry. Never updated by
this feature (the dashboard, feature 004, will update `status`), never deleted.

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` primary key | default `gen_random_uuid()` |
| `created_at` | `timestamptz` | default `now()` — the only non-nullable data column |
| `updated_at` | `timestamptz` | default `now()`, bumped by trigger |
| `status` | `text` | `CHECK (status IN ('new','contacted','applied','closed'))`, default `'new'`. This feature only ever inserts `'new'`. |
| `parent_name` | `text` | nullable. Stored only when confirmed (FR-018). |
| `student_name` | `text` | nullable. Stored only when confirmed. |
| `class_wanted` | `text` | nullable |
| `student_age` | `integer` | nullable |
| `phone` | `text` | nullable. Stored only when confirmed (FR-018). |
| `current_class` | `text` | nullable |
| `previous_school` | `text` | nullable |
| `admission_type` | `text` | nullable. `CHECK (admission_type IN ('fresh','transfer'))` allowing NULL. |
| `language` | `text` | nullable. `CHECK (language IN ('ur','en'))` allowing NULL. The language the conversation happened in. |
| `consent` | `boolean` | nullable. The recording/contact consent flag (`.claude/rules/api.md`). |
| `retell_call_id` | `text` | nullable. Retell's id for the conversation, for later correlation — not a transcript. |

- Every column except `id` and `created_at` is nullable (`.claude/rules/database.md`).
- No column for a CNIC, a B-Form, or any payment detail. The endpoint's schema
  has no such field, so one arriving in a request is dropped on parse (FR-022).

## Table `voice_usage_daily`

Counts voice conversations per visitor per day, for FR-031. No personal data —
`visitor_id` is a random value from a cookie, not linked to a lead or a name.

| Column | Type | Notes |
|---|---|---|
| `visitor_id` | `uuid` | from the `visitor_id` cookie (D-010) |
| `usage_date` | `date` | the day, server time |
| `call_count` | `integer` | default `0`, incremented at token-mint time |
| `updated_at` | `timestamptz` | default `now()`, bumped on each increment |

- Primary key `(visitor_id, usage_date)`.
- Old rows are harmless clutter, not a privacy concern (no personal data); a
  periodic cleanup is a future nice-to-have, not required by this feature.
- RLS: no `anon`/`authenticated` access at all. Read and written only by the
  service-role client in `POST /api/retell/web-call`.

## Table `voice_usage_monthly`

One running total for the whole school, for FR-032. Also no personal data.

| Column | Type | Notes |
|---|---|---|
| `usage_month` | `text` primary key | `'2026-09'` format |
| `reserved_minutes` | `numeric` | default `0`. Incremented by the configured max-call-length at every successful token mint (D-009) |
| `updated_at` | `timestamptz` | default `now()`, bumped on each increment |

- A new month simply has no row yet; the check-and-increment does an upsert
  starting from `0`.
- RLS: no `anon`/`authenticated` access. Service-role client only.
- This is a reservation, not a record of actual usage — see D-009 in
  `research.md` for why, and the trade-off it accepts.
- Ordered `created_at DESC` when the dashboard reads it (feature 004).

## Trigger

`content_system` already created `set_updated_at()`. This migration adds only the
trigger binding:

```sql
create trigger leads_set_updated_at
  before update on leads
  for each row execute function set_updated_at();
```

## RLS

| Role | `leads` |
|---|---|
| `authenticated` (staff session) | `SELECT`, `UPDATE` — for the future dashboard. No `INSERT`, no `DELETE`. |
| `anon` | none |
| service role | full — used by `POST /api/leads` server-side after the secret check |

The insert path is the service-role client in the API route, gated by the shared
secret. RLS is on so a stray `anon` key cannot read enquiries.

---

## The incoming enquiry (Zod schema — `lib/leads/schema.ts`)

What `POST /api/leads` accepts. Every field optional; unknown fields stripped
(Zod `.strip()`, the default). No CNIC/B-Form/payment field exists here.

```ts
const incomingEnquiry = z.object({
  parentName: z.string().max(200).optional(),
  parentNameConfirmed: z.boolean().optional(),
  studentName: z.string().max(200).optional(),
  studentNameConfirmed: z.boolean().optional(),
  classWanted: z.string().max(100).optional(),
  studentAge: z.number().int().min(0).max(25).optional(),
  phone: z.string().max(30).optional(),
  phoneConfirmed: z.boolean().optional(),
  currentClass: z.string().max(100).optional(),
  previousSchool: z.string().max(200).optional(),
  admissionType: z.enum(["fresh", "transfer"]).optional(),
  language: z.enum(["ur", "en"]).optional(),
  consent: z.boolean().optional(),
  retellCallId: z.string().max(200).optional(),
});
```

### Mapping to the row

- `parent_name` = `parentName` only if `parentNameConfirmed === true`, else NULL.
- `student_name` = `studentName` only if `studentNameConfirmed === true`, else NULL.
- `phone` = `phone` only if `phoneConfirmed === true`, else NULL.
- All other fields map straight across (already validated by Zod).
- `status` = `'new'`, set in code, never read from the body.
- The `*Confirmed` booleans are not stored — they only decide what is kept.

### Validation failures

- Missing or wrong `X-Agent-Secret` → `401 { error: "unauthorized" }`, nothing stored.
- Body fails the schema (e.g. `studentAge` a string) → `400` with a plain message.
- Everything valid but every field empty → still a `200 { ok: true, id }` with a
  row that has only `id`, timestamps, and `status = 'new'` (FR-017).

---

## The web-call gate response (not stored)

`POST /api/retell/web-call` is a pre-flight check only — Retell's browser SDK
connects directly using a publishable key (research D-001), so there is no
token to return. The route responds with one of:

```jsonc
{ "ok": true, "maxCallSeconds": 300 } // 200 — proceed; maxCallSeconds drives the client's own countdown (T024)
{ "reason": "no-content" }   // 200 — nothing published; show the fallback
{ "reason": "not-configured" } // 200 — NEXT_PUBLIC_RETELL_PUBLIC_KEY / agent id absent
{ "reason": "capped" }       // 200 — a usage limit is in force; show the fallback
```

A `reason` is always a 200 so the panel can render a calm bilingual message
rather than treating it as a crash. Nothing about the key is logged (there is no
secret to log — the key is meant to be public).
