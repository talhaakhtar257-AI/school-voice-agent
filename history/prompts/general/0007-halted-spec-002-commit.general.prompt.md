---
id: 0007
title: Halted commit of spec 002 — no spec exists and nested duplicate folder would be staged
stage: misc
date: 2026-09-09
surface: cli
model: claude-opus-5
feature: 002-staff-login
branch: 002-staff-login
user: talhawork257@gmail.com
command: git add -A && git commit -m "spec: 002 staff login"
labels: [git, workflow, halted]
links:
  spec: none
  ticket: none
  adr: none
  pr: none
files:
  - none
tests:
  - none
---

## Prompt

git add -A && git commit -m "spec: 002 staff login"

## Response snapshot

Did not run the command. A dry run of `git add -A` showed it would stage 30 files,
and none of them is a specification for staff login.

Two problems were found.

First, there is no `specs/` directory in the repository at all, so
`specs/002-staff-login/spec.md` does not exist. The commit message
"spec: 002 staff login" would describe work that has not been written.

Second, `git add -A` stages everything including the untracked nested folder
`school-voice-agent/`, which holds 27 files that duplicate the project's own
scaffolding — a copy of `.claude/commands/`, `.specify/scripts/`,
`.specify/templates/`, `.specify/memory/constitution.md` and `CLAUDE.md`, all of
which are already tracked at the repository root. Committing it would create a
confusing second copy of the project inside itself. A search for `.env` files
inside that folder found none, so no secrets were at risk.

The only genuinely new files are the three PHRs from this session, recording the
branch switch, the pull and the branch creation.

Stopped and asked the user how to proceed, per the CLAUDE.md instruction to stop
when an instruction contradicts a project rule and to flag suspected mistakes.

## Outcome

- ✅ Impact: No commit made. Repository left unchanged and nothing staged.
- 🧪 Tests: None run — no code changed.
- 📁 Files: No files created or modified beyond this PHR.
- 🔁 Next prompts: Delete or ignore the nested `school-voice-agent/` folder, then write the actual staff login specification before committing it.
- 🧠 Reflection: A dry run with `git add -An` before `git add -A` reveals exactly what a broad stage would sweep in.

## Evaluation notes (flywheel)

- Failure modes observed: Commit message described artifacts that did not exist; broad staging would have captured a duplicate project tree.
- Graders run and results (PASS/FAIL): Not applicable.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): Add `school-voice-agent/` to `.gitignore` if the folder must stay on disk.
