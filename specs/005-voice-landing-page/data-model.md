# Data Model: Parent-Facing Voice Landing Page

**Feature**: `005-voice-landing-page` | **Date**: 2026-09-11
**Phase**: 1 — Design

One new table, `leads`. Follows `.claude/rules/database.md`: `id`, `created_at`,
`updated_at` on every table; UTC timestamps; RLS on; no row ever deleted; the
migration is a reviewable SQL file.

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

## The web-call token response (not stored)

`POST /api/retell/web-call` returns one of:

```jsonc
{ "accessToken": "…", "agentId": "agent_…" }   // 200 — start the call
{ "reason": "no-content" }                        // 200 — nothing published; show the fallback
{ "reason": "not-configured" }                    // 200 — RETELL_API_KEY / agent id absent
{ "reason": "retell-error" }                      // 200 — Retell refused; show the fallback
```

A `reason` is always a 200 so the panel can render a calm bilingual message
rather than treating it as a crash. Nothing about the token or the key is logged.
