---
id: 0011
title: Plan and tasks for staff login
stage: tasks
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: 002-staff-login
branch: 002-staff-login
user: talhawork257@gmail.com
command: /sp.tasks. git add -A && git commit -m "tasks: 002 staff login"
labels: [plan, tasks, authentication, supabase, staff-login]
links:
  spec: specs/002-staff-login/spec.md
  ticket: none
  adr: none
  pr: none
files:
  - specs/002-staff-login/plan.md
  - specs/002-staff-login/research.md
  - specs/002-staff-login/data-model.md
  - specs/002-staff-login/quickstart.md
  - specs/002-staff-login/tasks.md
tests:
  - none
---

## Prompt

/sp.tasks. git add -A && git commit -m "tasks: 002 staff login"

## Response snapshot

The maintainer interrupted a hand-written `plan.md` and asked for the `/sp.tasks`
skill instead, making the preference explicit: where a stage of the workflow has
a command behind it, run the command rather than authoring the file directly.

`/sp.tasks` refused to run. Its own prerequisite script reported that `plan.md`
was missing and said to run `/sp.plan` first, so `/sp.plan` was run, then
`/sp.tasks`.

`/sp.plan` produced four documents. `plan.md` carries the technical context, the
constitution gate and the structure decision. `research.md` records six technical
decisions with their rejected alternatives, the most consequential being cookie
sessions via `@supabase/ssr`, because the default Supabase client stores the
session in `localStorage`, which `CLAUDE.md` forbids, and because middleware and
Server Components can read a cookie but cannot read `localStorage`.
`data-model.md` records that this feature creates no table at all — Supabase Auth
owns the account — and sets out the anon key versus service key distinction.
`quickstart.md` is a click-through verification guide written for a
non-developer, covering setup, each user story, a 360px pass and the deployed
preview.

The constitution gate passes. Four principles were marked not applicable with a
reason rather than ticked falsely, because Honesty, No Authority, Disclosure and
Confirm Before Saving all govern the voice agent's conversation with parents and
have no surface in a staff sign-in screen.

`/sp.tasks` then produced `tasks.md`: 32 tasks across seven phases, grouped by
user story so each can be built and checked alone.

Two blockers are recorded at the top of both `plan.md` and `tasks.md`. First,
there is no application in this repository — no `package.json`, no `app/`, no
`lib/`. Feature `001-app-foundation` is the feature that creates it and has only
a specification and a plan on its own branch, with no `tasks.md` and no code.
Second, `@supabase/supabase-js` and `@supabase/ssr` both need the maintainer's
approval before installation, as Constitution VIII requires.

One incidental repair: `update-agent-context.ps1` reported adding the tech stack
to `CLAUDE.md` but actually only prepended a byte order mark, having failed to
find its insertion markers in the hand-written file. The change was reverted so
`CLAUDE.md` stayed clean.

## Outcome

- ✅ Impact: Feature 002 now has a plan, research, data model, quickstart and 32 tasks. The workflow is ready for `/sp.implement` once both blockers clear.
- 🧪 Tests: None. Decision D-006 records that verification is by clicking, per Constitution IX.
- 📁 Files: Created `plan.md`, `research.md`, `data-model.md`, `quickstart.md` and `tasks.md` under `specs/002-staff-login/`. Reverted an unwanted byte order mark in `CLAUDE.md`.
- 🔁 Next prompts: Approve the two dependencies, then decide whether feature 001 is implemented before this one.
- 🧠 Reflection: The prerequisite script caught the missing plan before any work was wasted, which is the workflow doing its job.

## Evaluation notes (flywheel)

- Failure modes observed: `update-agent-context.ps1` reported a successful update it had not performed, leaving only a byte order mark behind.
- Graders run and results (PASS/FAIL): Constitution gate — PASS, subject to dependency approval.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): Check `git diff` after any Spec Kit script that claims to edit a file, rather than trusting its summary.
