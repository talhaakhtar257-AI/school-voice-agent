---
id: 0036
title: Narrow to unanswered questions only
stage: spec
date: 2026-09-11
surface: agent
model: claude-sonnet-5
feature: 006-unanswered-questions
branch: 006-unanswered-questions
user: talhaakhtar257-AI
command: none
labels: [spec, unanswered-questions, scope-change, feature-006]
links:
  spec: specs/006-unanswered-questions/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-unanswered-questions/spec.md (rewritten)
  - specs/006-unanswered-questions/checklists/requirements.md (rewritten)
  - branch renamed 006-voice-agent-api -> 006-unanswered-questions
  - specs/ and history/prompts/ directories renamed to match
tests:
  - Requirements checklist — all items pass
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

Flagged the conflict before touching anything: this contradicts the just-
committed `006-voice-agent-api` spec, which bundled unanswered questions with
a `calls` table and deliberately chose per-instance (non-deduplicated)
logging correlated to individual calls — the opposite of what was now being
asked (aggregated, `times_asked` counter, no calls table at all, standalone
endpoint). Asked the maintainer how to reconcile via AskUserQuestion; they
chose to scrap the broader design entirely.

Renamed the branch and both `specs/` and `history/prompts/` directories back
to `006-unanswered-questions` (matching the maintainer's own original branch
name from before it was broadened), then fully rewrote spec.md for the
smaller design: one table, one aggregated row per distinct question, an
atomic upsert-style increment (to stay race-safe under two near-simultaneous
identical questions), a stated normalised-text-match assumption for what
counts as "the same question" (trim + collapse whitespace + case-insensitive
— not fuzzy/semantic matching), and a plain ranked-list dashboard screen
(without the "jump to content editor" link, which stays feature 004's job).
Old checklist and spec content for the calls-table design is not preserved —
this is a real rewrite, not an addition.

## Outcome

- ✅ Impact: the feature's spec now honestly matches what will actually be built — no repository artifact still describes the abandoned calls-table design.
- 🧪 Tests: requirements checklist — all items pass on this rewrite.
- 📁 Files: spec.md and checklists/requirements.md rewritten; branch/directories renamed.
- 🔁 Next prompts: the migration (needs the maintainer's approval before applying), then POST /api/unanswered, then the dashboard screen — in that order, each shown before being made.
- 🧠 Reflection: n/a

## Evaluation notes (flywheel)

- Failure modes observed: none in this step — the conflict was caught and surfaced before any code was written, not after.
- Graders run and results (PASS/FAIL): requirements checklist PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
