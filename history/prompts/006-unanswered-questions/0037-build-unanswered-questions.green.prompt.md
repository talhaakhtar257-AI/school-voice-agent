---
id: 0037
title: Build unanswered questions capture
stage: green
date: 2026-09-11
surface: agent
model: claude-sonnet-5
feature: 006-unanswered-questions
branch: 006-unanswered-questions
user: talhaakhtar257-AI
command: none
labels: [migration, api, dashboard, unanswered-questions, feature-006]
links:
  spec: specs/006-unanswered-questions/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - supabase/migrations/20260911180335_unanswered_questions.sql (new)
  - supabase/migrations/20260911180725_upsert_unanswered_question_function.sql (new)
  - lib/unanswered/schema.ts (new)
  - lib/unanswered/queries.ts (new)
  - app/api/unanswered/route.ts (new)
  - lib/strings/unanswered-admin.ts (new)
  - lib/unanswered/list.ts (new)
  - app/dashboard/unanswered/page.tsx (new)
  - app/dashboard/layout.tsx (edited — added Unanswered nav link)
tests:
  - npm run build + npx tsc --noEmit + npm run lint — all clean
  - Manual SQL — normalized-text upsert proven race-safe and correct at the DB function level
  - Manual curl — 401 (no secret), 400 (missing questionText), 200 x2 with matching id and times_asked=2, verified through the real HTTP path
  - Manual browser — 3 test rows (incl. real Urdu script) rendered correctly, sorted most-asked first, language "—" fallback correct, dir="auto" confirmed correct for Urdu (a gap the Leads screen's earlier test had left unverified)
  - Test rows deleted afterward in all three verification passes
---

## Prompt

New small feature: capture questions the voice agent could not answer.

1. A migration creating an unanswered_questions table:
   id, created_at, question_text, language, times_asked
2. POST /api/unanswered — receives a question from the voice agent,
   protected by the same shared secret pattern as /api/leads.
   If the same question arrives again, increment times_asked instead
   of creating a duplicate row.
3. A dashboard screen listing them, most frequent first, with a
   designed empty state.

Read /api/leads first and follow the same patterns.
Do not build a calls table or transcripts. Out of scope.

Small steps, show me each change before making it.

## Response snapshot

Built in three approved steps after the spec was rewritten (PHR 0036) to
match this narrower scope. (1) Migration: unanswered_questions with a
generated normalized_text column (trim + collapse whitespace + lowercase)
and a unique index on it — read app/api/leads/route.ts and lib/leads/
schema.ts first, as instructed, before writing anything. (2) Caught and
fixed a real correctness bug before it shipped: the first drafted queries.ts
did a read-then-write for the increment, which isn't atomic and would race
under two near-simultaneous identical questions — replaced with a second
migration adding upsert_unanswered_question(), a SECURITY DEFINER function
(same pattern as reserve_voice_call from feature 005) doing a real
INSERT ... ON CONFLICT DO UPDATE SET times_asked = times_asked + 1 in one
statement, called via .rpc(). (3) The dashboard screen, matching the Leads
screen's Server Component + empty/error-state shape, ordered by times_asked
descending, no live polling (not asked for, and this data doesn't need the
same urgency as new leads).

Every step verified against a real running server and real Supabase data
before moving to the next, including one gap the earlier Leads screen build
had left unchecked: real Urdu-script text in a table cell, confirmed
correctly right-to-left via dir="auto".

## Outcome

- ✅ Impact: the voice agent now has a place to report unanswered questions, deduplicated by normalised text, and staff can see them ranked by frequency at /dashboard/unanswered — a small, self-contained feature, fully independent of the calls table this session decided to scrap.
- 🧪 Tests: build + tsc + lint clean; full manual verification at the SQL, HTTP, and browser layers (see tests above).
- 📁 Files: 2 migrations, 5 new lib/app files, 1 existing file edited.
- 🔁 Next prompts: point the Retell agent's configuration at POST /api/unanswered once it's being set up for real; the "jump to content editor" link on each question remains feature 004's job (spec Assumptions), not built here.
- 🧠 Reflection: n/a

## Evaluation notes (flywheel)

- Failure modes observed: the first drafted version of queries.ts was not actually atomic despite the migration being built for exactly that — caught by the user's own question before any code shipped, not discovered later under load.
- Graders run and results (PASS/FAIL): build PASS, tsc PASS, lint PASS, manual verification PASS at all three layers.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
