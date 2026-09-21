# Data Model: 010 Client Feedback Round

This needs 3 migrations: one for stages 2 and 4, one for stage 3, and one for stage 5. Each can be applied on its own.

## Plain English (for the maintainer)

- **Leads get 3 new boxes:** email, summary, and call length in seconds. All are optional.
- **One lead per call:** the call id on a lead becomes unique, so the same call can never make 2 leads.
- **A new `calls` table:** one row per conversation. It holds:
  - when the call started and ended;
  - whether it is still live;
  - its language;
  - the whole conversation and the summary;
  - an email the parent typed;
  - whether the school and parent emails were sent;
  - which lead it made.

  Staff can read it. Only the server can write it.
- **Unanswered questions get an "answered" date.** When staff answer one, it moves out of "needs an answer".
- **Knowledge documents** are not a table. They live inside the existing content (draft and live), next to the FAQs, so they are published the same way.

## Migration 1: `calls` and lead columns (stages 2 and 4)

### `calls` (new)

| Column | Type | Notes |
|---|---|---|
| `id` | uuid pk default `gen_random_uuid()` | |
| `retell_call_id` | text **unique not null** | from Retell |
| `status` | text not null, check in (`ongoing`, `ended`) | |
| `started_at` | timestamptz not null default now() | Retell `start_timestamp` when known |
| `ended_at` | timestamptz null | |
| `duration_seconds` | integer null, check ≥ 0 | from `duration_ms` |
| `language` | text null, check in (`ur`, `en`) | taken from the lead when known |
| `transcript` | jsonb null | `[{ "role": "agent" or "user", "content": text }]`, with 13-digit IDs masked |
| `summary` | text null | masked the same way |
| `visitor_id` | text null | the gate's visitor cookie; used only to authorise the email box |
| `parent_email` | text null | typed by the parent |
| `lead_id` | uuid null, references `leads(id)` on delete set null | |
| `school_email_sent_at` / `parent_email_sent_at` | timestamptz null | stage 5; each email is sent once |
| `email_error` | text null | stage 5 |
| `created_at` / `updated_at` | timestamptz default now() | `updated_at` trigger, as on `leads` |

Indexes:
- `(status, started_at desc)`, for the live list;
- `(started_at desc)`, for the analytics.

RLS:
- enabled;
- `select` allowed for `authenticated`;
- `update` for `authenticated` only on `lead_id` is **not** needed, because staff never edit calls;
- no insert or update policy, so writes come from the service role only.

### `leads` (changed)

- `email` text null, check that it looks like an email (`~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'`).
- `summary` text null.
- `call_duration_seconds` integer null.
- A unique index on `retell_call_id` where it is not null. Old rows have null, and nulls don't clash.
  - Before creating the index, the migration checks for duplicates and nulls out all but the newest.
  - Today there are 0 duplicates, because every lead so far has a null call id.

## Migration 2: unanswered questions (stage 3)

- `unanswered_questions.answered_at` timestamptz null.
- **Knowledge "questions"** means `answered_at is null`. The answered ones show under an "Answered" filter.

## Migration 3: nothing extra (stage 5)

The email columns are created in Migration 1, so stage 5 needs no schema change.

## Content document (jsonb, no migration)

`lib/content/schema.ts` → `contentDoc` gains:

```ts
knowledge: z.array(knowledgeDoc).default([])
knowledgeDoc = {
  id: string (uuid),
  title: bilingual,          // prose, so EN and UR (UR may be empty on import; staff can fill it)
  source: { kind: "pdf" | "website", name: string },   // file name or URL
  text: string,              // the imported text, as staff edited it (≤ 50 000 chars)
  importedAt: string (ISO),
  archivedAt: string | null  // same pattern as faqs/programs
}
```

- `parseDoc` defaults it to `[]`, so old content still loads.
- `forPublicApi` includes the active entries, so the agent receives them.
- `isEmptyDoc` also counts `knowledge`.

**Note on Principle IV:** imported text is kept in the language it was written in. It is reference material for the agent, not a sentence shown to parents on a screen, so it is not duplicated per language. Titles are bilingual.

## State transitions

- **Call:** (none) → `ongoing` on `call_started` → `ended` on `call_ended`. Then `call_analyzed` adds the transcript, summary and duration.
  - Events may arrive out of order. `call_ended` or `call_analyzed` for an unknown call creates the row directly as `ended`.
  - A call that is `ongoing` and more than 15 minutes old is shown as ended, though the row is not changed.
- **Lead link:**
  - When `save_lead` runs with a call id, the lead is upserted on `retell_call_id`.
  - Then `calls.lead_id` is set, if the call row exists.
  - The call's `parent_email`, summary and duration are copied onto the lead.
  - When `call_analyzed` arrives after the lead exists, the summary and duration are copied to the lead.
