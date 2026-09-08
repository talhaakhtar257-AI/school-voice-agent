---
id: 0001
title: File setup guide documents
stage: general
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talha-professional97
command: none
labels: ["setup", "claude-md", "rules", "git"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - CLAUDE.md
  - CLAUDE.local.md
  - .gitignore
  - .env.example
  - .claude/rules/api.md
  - .claude/rules/frontend.md
  - .claude/rules/database.md
  - .claude/rules/sdd-workflow.md
tests:
  - git rev-parse --show-toplevel returns the project path
  - git status --short lists only project files
  - git check-ignore -v CLAUDE.local.md .env.local reports both ignored
  - .claude/rules/*.md open with intact paths frontmatter
---

## Prompt

"C:\Users\scs\Desktop\school-voice-agent\school-voice-agent\WHERE-TO-PUT-THESE-FILES.md" read this file and set files

## Response snapshot

Read the guide and inspected the project. Four setup files were loose in the
root, unfiled. Three problems surfaced beyond the plain moves:

1. `CLAUDE.md` collision — the guide's file had downloaded as `CLAUDE (1).md`
   because `sp init` had already written its own 163-line SpecKit workflow file.
2. No git repository in the project. `git rev-parse --show-toplevel` returned
   `C:/` — a repo at the root of the C: drive — so a `.gitignore` here would
   have protected nothing.
3. `.gitignore`, `CLAUDE.local.md` and `.env.example` did not exist.

Asked the user to decide on 1 and 2. They chose to merge the two CLAUDE.md files
(guide's product rules verbatim plus a condensed SDD workflow section, archiving
the full SpecKit rules to `.claude/rules/sdd-workflow.md`) and to run `git init`
in the project folder.

Executed: `git init`; moved `rules-api.md`, `rules-frontend.md` and
`rules-database.md` into `.claude/rules/` as `api.md`, `frontend.md` and
`database.md`; archived the SpecKit `CLAUDE.md` to
`.claude/rules/sdd-workflow.md`; wrote the merged 160-line `CLAUDE.md` and
deleted `CLAUDE (1).md`; created `.gitignore`, `.env.example` and
`CLAUDE.local.md`. Left `WHERE-TO-PUT-THESE-FILES.md` in place.

## Outcome

- ✅ Impact: Every setup file is where the guide specifies. The project is now
  its own git repository, so `.gitignore` actually protects `.env.local` and
  `CLAUDE.local.md`. `CLAUDE.md` is 160 lines, under the guide's 200-line ceiling.
- 🧪 Tests: All four automated verification checks pass. The remaining check is
  user-run — `/context` in a fresh session must list `CLAUDE.md` under Memory files.
- 📁 Files: 8 created or moved, 1 deleted (`CLAUDE (1).md`), 1 left untouched
  (`WHERE-TO-PUT-THESE-FILES.md`).
- 🔁 Next prompts: Run `/sp.constitution` and paste the constitution from the
  master guide, then start Feature 1.
- 🧠 Reflection: The guide's step 5 assumed a git repository already existed.
  Checking `git rev-parse --show-toplevel` before writing a `.gitignore` is worth
  doing on any project that was not explicitly `git init`-ed.

## Evaluation notes (flywheel)

- Failure modes observed: The `.claude/rules/` with `paths:` frontmatter
  convention could not be confirmed as a mechanism Claude Code loads natively;
  no other example exists on this machine to compare against.
- Graders run and results (PASS/FAIL): PASS — git toplevel, git status scope,
  check-ignore, rules frontmatter integrity.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Run `/context` in a fresh session and
  confirm whether the `.claude/rules/` files load when their matching paths are
  touched. If they never load, move each into a nested `CLAUDE.md` inside the
  folder it governs once `app/`, `components/` and `lib/supabase/` exist.
