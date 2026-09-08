---
paths:
  - "lib/supabase/**/*.ts"
  - "supabase/**/*.sql"
  - "**/*.sql"
---

# Database rules

## Tables in this phase

| Table | Holds |
|---|---|
| `leads` | One row per parent enquiry captured by the agent |
| `calls` | One row per completed conversation, including the transcript |
| `content` | The school knowledge, with a draft version and a live version |
| `content_history` | Every published change, with who and when |
| `unanswered_questions` | Questions the agent could not answer |

Do not create tables outside this list without asking me first.

## Rules

- Every table has `id`, `created_at`, and `updated_at`.
- Timestamps are stored in UTC. Convert for display only.
- Never delete a row. Add a status or an `archived_at` column instead.
- `leads.status` is one of: `new`, `contacted`, `applied`, `closed`.
- `calls.outcome` is one of: `answered`, `transferred`, `lead_captured`, `dropped`.
- Every lead column except `id` and `created_at` is nullable. A parent may refuse
  to answer any question.

## Never store

- CNIC numbers
- B-Form numbers
- Any payment or card information

If a field like this appears in a request, drop it and continue. Do not save it.

## Content table

- Keep a draft version and a live version as separate rows or columns.
- The public content endpoint returns only the live version.
- Publishing copies draft to live and writes a row into `content_history`.
- Publishing is never automatic. It happens only on an explicit request.

## Security

- Turn on row level security on every table.
- The dashboard reads through an authenticated session, never a service key from
  the browser.
- The service key is used only in server-side API routes.
- Write migrations as SQL files so changes are reviewable. No silent schema edits.

## Before any schema change

Tell me in plain English what the change is and what data could be lost. Wait for
my answer before running it.
