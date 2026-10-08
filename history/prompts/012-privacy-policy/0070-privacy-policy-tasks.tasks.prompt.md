---
id: 0070
title: Privacy policy tasks
stage: tasks
date: 2026-10-08
surface: agent
model: claude-opus-5-5
feature: 012-privacy-policy
branch: 012-privacy-policy
user: talhawork257
command: /sp.tasks
labels: ["privacy", "tasks"]
links:
  spec: specs/012-privacy-policy/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/012-privacy-policy/tasks.md
  - history/prompts/012-privacy-policy/0070-privacy-policy-tasks.tasks.prompt.md
tests:
  - format check — all 22 tasks match "- [ ] T### [P?] [US?] description"
---

## Prompt

continue

## Response snapshot

Ran `/sp.tasks` and generated `specs/012-privacy-policy/tasks.md` with 22 tasks:

| Phase | Tasks | What they cover |
|---|---|---|
| Setup | T001 | Baseline build |
| Foundational | T002–T003 | `lib/strings/privacy.ts`, `privacy-sections.ts` |
| US1 (MVP) | T004–T009 | CSS, header, body, `app/privacy/page.tsx`, Urdu-digit masking in `lib/calls/mask.ts`, click-through check |
| US2 | T010–T015 | Reword three sentences; links in footer, agent card, pre-call form (new tab), mic explainer (new tab); check |
| US3 | T016–T017 | Draft notice behind `PRIVACY_POLICY_APPROVED`; owner editing comment |
| Polish | T018–T022 | Traceability review, file sizes, definition of done, PHR, commit (merge only when the owner says) |

There are no automated tests, because none were requested and the project has no suite; checks are quickstart click-throughs. Parallel opportunities:
- T002 with T003
- T004, T005 and T008 together
- T010 through T014 together

## Outcome

- ✅ Impact: the tasks are executable without extra context; ready for `/sp.implement`.
- 🧪 Tests: task format validated (22/22).
- 📁 Files: `tasks.md`.
- 🔁 Next prompts: `/sp.implement`. Owner actions are still pending: Supabase sign-up off, the Retell data-storage setting, retention confirmation.
- 🧠 Reflection: putting the draft notice in US3 keeps the stories independent, but the strategy says to ship US1 and US3 together so production never shows an unlabelled draft.

## Evaluation notes (flywheel)

- Failure modes observed: one placeholder (`className="visually hidden"`) slipped into T013 and was corrected before saving the PHR.
- Graders run and results (PASS/FAIL): format PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): grep tasks for quoted pseudo-code before reporting.
