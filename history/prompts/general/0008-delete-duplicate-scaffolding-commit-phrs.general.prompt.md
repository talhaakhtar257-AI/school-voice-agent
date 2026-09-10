---
id: 0008
title: Delete duplicate scaffolding folder and commit session PHRs
stage: misc
date: 2026-09-09
surface: cli
model: claude-opus-5
feature: 002-staff-login
branch: 002-staff-login
user: talhawork257@gmail.com
command: git add -A && git commit -m "spec: 002 staff login"
labels: [git, workflow, cleanup]
links:
  spec: none
  ticket: none
  adr: none
  pr: none
files:
  - history/prompts/general/0004-git-checkout-main.general.prompt.md
  - history/prompts/general/0005-git-pull-main.general.prompt.md
  - history/prompts/general/0006-create-staff-login-branch.general.prompt.md
  - history/prompts/general/0007-halted-spec-002-commit.general.prompt.md
tests:
  - none
---

## Prompt

git add -A && git commit -m "spec: 002 staff login"

## Response snapshot

Follow-up to the halt recorded in PHR 0007. The user chose to delete the nested
`school-voice-agent/` folder and to commit only the PHR files.

Before deleting, every file in the nested folder was compared against its
top-level counterpart. Twenty-four were byte-identical. Three differed:
`.specify/memory/constitution.md`, `.specify/templates/plan-template.md` and
`CLAUDE.md`. Inspection showed the nested versions were unfilled Spec Kit Plus
scaffolding — the constitution still read `# [PROJECT_NAME] Constitution`, the
plan template still read `[Gates determined based on constitution file]`, and
`CLAUDE.md` was the generic "generated during init" boilerplate. The top-level
versions held the real work: the ratified constitution v1.0.0 with ten
principles, the plan template with ten filled constitution gates, and the school
project's own instructions.

The nested files carried a later modification time (22:33) than the top-level
ones, meaning a Spec Kit Plus setup was re-run tonight and wrote fresh empty
scaffolding into a subfolder. Newer timestamp, emptier content — so nothing
unique was lost by deleting it.

Deleted `school-voice-agent/`, then staged only `history/prompts/general/` and
committed as `0a4e5a3` with an honest message describing PHRs rather than a
specification. No specification was written, because none exists yet.

## Outcome

- ✅ Impact: Duplicate scaffolding tree removed; four PHRs committed as `0a4e5a3` on branch `002-staff-login`.
- 🧪 Tests: None run — no application code exists yet.
- 📁 Files: Four PHR files committed. Twenty-seven duplicate files deleted, none tracked.
- 🔁 Next prompts: Write `specs/002-staff-login/spec.md` for the staff login feature before any code.
- 🧠 Reflection: Comparing file contents rather than trusting modification times prevented deleting real work — and revealed the newer copy was the empty one.

## Evaluation notes (flywheel)

- Failure modes observed: A re-run of project setup silently created a nested duplicate of the whole scaffolding tree.
- Graders run and results (PASS/FAIL): Not applicable.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): Run Spec Kit Plus setup only from the repository root to avoid nesting.
