---
id: 0019
title: Align 002 plan and tasks with merged feature 001
stage: misc
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: 002-staff-login
branch: 002-staff-login
user: talhaakhtar257-AI
command: (manual request — fix five review findings, restructure lib/, commit)
labels: [correction, plan, tasks, lib-structure, feature-002]
links:
  spec: specs/002-staff-login/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - lib/supabase.ts -> lib/supabase/health.ts (renamed; internal import ./env -> ../env)
  - app/health/page.tsx (import path @/lib/supabase -> @/lib/supabase/health)
  - specs/002-staff-login/plan.md (findings A-E)
  - specs/002-staff-login/tasks.md (findings A-D)
tests:
  - npm run build — pass
  - npx tsc --noEmit — clean
---

## Prompt

Fix all five: A, B, C, D, E.

For B: your recommendation. Turn lib/supabase.ts into lib/supabase/,
move the health check to lib/supabase/health.ts, update the import in
app/health/page.tsx. CLAUDE.md's structure is the target, so feature
001 is the one that should move.

Update plan.md and tasks.md, then commit the corrections.

## Response snapshot

Acted on the five review findings raised in the previous turn about
specs/002-staff-login/plan.md and tasks.md being written before feature 001
existed:

- A — removed the "there is no application in this repository" blocking
  prerequisite from plan.md and tasks.md, plus the matching risk and follow-up.
  Replaced with a "prerequisite resolved" note citing merge commit 19eac1c.
- B — restructured lib/ to match CLAUDE.md: `git mv lib/supabase.ts
  lib/supabase/health.ts`, fixed its `./env` import to `../env`, and updated the
  single import site in app/health/page.tsx. Updated plan.md's file tree to mark
  which files are new to feature 002 versus inherited from feature 001.
- C — dependency approval in plan.md and tasks.md T001 now covers only
  @supabase/ssr; @supabase/supabase-js is already installed by feature 001
  (^2.58.0 in package.json).
- D — tasks.md T003 changed from "add the Supabase env vars" to "confirm" them,
  since feature 001 already set NEXT_PUBLIC_SUPABASE_URL and
  NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local and .env.example. Added an explicit
  check that .env.example's SUPABASE_SERVICE_ROLE_KEY is an empty placeholder
  only.
- E — plan.md Constitution Check re-pointed from v1.0.0 to v1.1.0. Principle IV
  renamed "Bilingual Prose"; noted the new feature-sequencing gate is satisfied.

Added dated "Corrected: 2026-09-10" markers to both documents. Verified with
`npm run build` (pass) and `npx tsc --noEmit` (clean). Committed as 63d4529 on
branch 002-staff-login. Not pushed — the request said commit only.

## Outcome

- ✅ Impact: 002's plan and tasks now describe the real codebase; lib/ matches CLAUDE.md's structure.
- 🧪 Tests: npm run build pass; npx tsc --noEmit clean.
- 📁 Files: 4 changed, +72 / -60; one file renamed.
- 🔁 Next prompts: get maintainer approval for @supabase/ssr, then begin 002 Phase 1 (T001-T003). Optionally push branch and commit the three dangling PHRs (0017, 0018, 0019).
- 🧠 Reflection: The corrections were only needed because 002 was specced against an unbuilt foundation — the exact situation the constitution's sequencing gate now forbids.

## Evaluation notes (flywheel)

- Failure modes observed: none this step; the underlying issue (planning ahead of the foundation) predates this session.
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
