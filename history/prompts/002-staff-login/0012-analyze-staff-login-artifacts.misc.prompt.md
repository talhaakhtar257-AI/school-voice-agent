---
id: 0012
title: Analyze staff login artifacts and fix gaps
stage: misc
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: 002-staff-login
branch: 002-staff-login
user: talhawork257@gmail.com
command: /sp.analyze. git add -A && git commit -m "docs: 002 analyze fixes"
labels: [analyze, consistency, coverage, staff-login]
links:
  spec: specs/002-staff-login/spec.md
  ticket: none
  adr: none
  pr: none
files:
  - specs/002-staff-login/plan.md
  - specs/002-staff-login/tasks.md
tests:
  - none
---

## Prompt

/sp.analyze.git add -A && git commit -m "docs: 002 analyze fixes"

## Response snapshot

Ran a cross-artifact consistency analysis over `spec.md`, `plan.md` and
`tasks.md` against the constitution. Ten findings: two critical, two high, three
medium, three low. Requirement coverage before the pass was 20 of 23 requirements
with at least one task, or 87 percent.

`/sp.analyze` is defined as read-only and asks before remediating. The
maintainer's own commit message, `docs: 002 analyze fixes`, named fixes as the
expected output, so the five fixable findings were applied rather than merely
proposed. The five that are decisions rather than defects were left alone.

Applied: the constitution check in `plan.md` claimed sixteen tasks where
`tasks.md` held thirty-two, a direct contradiction (H1). Two edge cases named in
the specification had no task at all — a session expiring while a dashboard
screen is open, and an account deleted in Supabase while its owner is signed in
(M1, M2). Both are now verification tasks in the User Story 2 phase, since they
are access-control behaviour. The thirty-second-sign-in success criterion had no
task measuring it (L1), and the "no way to create an account" requirement had
nothing confirming it (L2); both are now polish tasks. Adding four tasks required
renumbering, so `tasks.md` was regenerated with thirty-six sequential IDs, and a
requirement coverage table was added mapping all seventeen functional
requirements and all six success criteria to their tasks. Coverage is now 23 of
23.

Left unfixed, because each is a decision for the maintainer rather than a defect
in the documents. The two critical findings are the ones already flagged: no
application exists in the repository, so all thirty-six tasks are blocked on
feature `001-app-foundation`; and `@supabase/supabase-js` and `@supabase/ssr`
remain unapproved, which Constitution VIII treats as a hard gate. The specification
is still marked Draft with seven unconfirmed assumptions while the plan and tasks
are fully built on them. FR-017, which requires row level security on any table
this feature reads or writes, is vacuous because the feature creates no table; it
was left as written since it correctly binds whichever feature first creates one,
and the coverage table now says so explicitly.

Verified after the edit: thirty-six tasks, IDs T001 to T036 with no gaps or
duplicates, and all twenty-three requirement identifiers now referenced.

## Outcome

- ✅ Impact: Requirement coverage raised from 87 percent to 100 percent; a contradiction between plan and tasks removed; four missing verification tasks added.
- 🧪 Tests: None. Verification for this feature is by clicking, per decision D-006.
- 📁 Files: Edited `specs/002-staff-login/plan.md` and regenerated `specs/002-staff-login/tasks.md`.
- 🔁 Next prompts: Approve the two dependencies and confirm the seven assumptions, then decide whether feature 001 is built first.
- 🧠 Reflection: The two edge cases that had no tasks were both ones the specification named but no user story owned, which is where coverage gaps tend to hide.

## Evaluation notes (flywheel)

- Failure modes observed: A hand-written count in the plan ("sixteen tasks") drifted from the generated task list without anything catching it until an explicit cross-check.
- Graders run and results (PASS/FAIL): Task ID sequence T001–T036 — PASS. Requirement coverage 23/23 — PASS. Constitution gate — PASS, subject to dependency approval.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): Avoid restating counts in prose across artifacts; reference the generated summary table instead so there is one number to be wrong.
