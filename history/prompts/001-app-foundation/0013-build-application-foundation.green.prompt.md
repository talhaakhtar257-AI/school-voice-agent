---
id: 0013
title: Build the application foundation
stage: green
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: 001-app-foundation
branch: 001-app-foundation
user: talhawork257@gmail.com
command: /sp.implement. git add -A && git commit -m "feat: 002 staff login"
labels: [implement, nextjs, supabase, foundation, health-check]
links:
  spec: specs/001-app-foundation/spec.md
  ticket: none
  adr: none
  pr: none
files:
  - package.json
  - tsconfig.json
  - next.config.ts
  - eslint.config.mjs
  - .gitignore
  - app/layout.tsx
  - app/page.tsx
  - app/globals.css
  - app/health/page.tsx
  - lib/env.ts
  - lib/supabase.ts
  - specs/001-app-foundation/tasks.md
  - CLAUDE.md
tests:
  - "npm run build — PASS"
  - "npx tsc --noEmit — PASS, no errors"
  - "Manual: / returns 200 and shows both lines"
  - "Manual: /health returns 200 and reports failure correctly with no credentials present"
  - "Manual: /health output searched for nine credential patterns — all clean"
---

## Prompt

/sp.implement.git add -A && git commit -m "feat: 002 staff login"

## Response snapshot

`/sp.implement` was requested for feature 002, but it could not run: task T001 of
that feature is `npm install`, and there was no `package.json` to install into.
The maintainer was asked to choose, and decided to build feature
`001-app-foundation` first and approved `next`, `react`, `typescript` and
`@supabase/supabase-js`, satisfying the Constitution VIII dependency gate.

Work moved to the `001-app-foundation` branch, where that feature's specification
and plan already lived. Phase 2 had never been run, so `tasks.md` was written
first: 23 tasks across seven phases, with a requirement coverage table mapping all
thirteen functional requirements, two non-functional requirements and six success
criteria.

Implementation then followed. `create-next-app` refused to scaffold into a
directory that already contained files, so it was run in the scratchpad and only
its configuration was copied across — `tsconfig.json`, `next.config.ts`,
`eslint.config.mjs` and the favicon. Its generated `CLAUDE.md`, `README.md`,
placeholder pages and sample SVGs were deliberately left behind, since the
project's own `CLAUDE.md` must not be overwritten.

Six source files were written by hand. `lib/env.ts` reads the two required
settings and throws naming whichever is absent, per FR-011. `lib/supabase.ts`
builds the client with the anonymous key only and exposes one reachability
function that returns a plain boolean; it swallows the underlying error
deliberately, which is the one place in this codebase where discarding an error is
correct, because FR-008 forbids leaking hostnames or traces to a page anyone can
open. `app/health/page.tsx` is a page rather than an API route, because anything
under `app/api/` inherits the shared-secret rule and could not be opened in a
browser, which would break Principle IX.

Verified: `npm run build` passes, `npx tsc --noEmit` is clean, both routes return
200, and the health page correctly reports failure in plain English while no
credentials exist. Its output was searched for nine credential patterns —
`supabase.co`, `NEXT_PUBLIC`, `apikey`, `Bearer`, `eyJ` and others — all clean.
Both pages were also opened in a real browser and look correct. Every file is well
under the 200-line limit; the largest is 89 lines.

Three incidental repairs. Turbopack was walking up the folder tree and finding an
unrelated `package-lock.json` in the user's home directory, warning on every
build; `turbopack.root` now pins the project root. `tsconfig.tsbuildinfo` and
`next-env.d.ts` were being staged and are now in `.gitignore`. And `next dev`
appended a `nextjs-agent-rules` block to `CLAUDE.md` — Next.js 16 writes this
itself and re-adds it when removed, so it was committed rather than fought.

Fourteen of twenty-three tasks are complete. The nine remaining all need either a
real Supabase project or a deployment, both of which require the maintainer to
sign in.

## Outcome

- ✅ Impact: The application exists and runs. Two routes, six source files, a passing build. Feature 002's blocker is half cleared — the app now exists, though it is not yet deployed.
- 🧪 Tests: Build PASS. Type check PASS. Both routes return 200. Health failure path leaks nothing. No automated tests, per the specification.
- 📁 Files: Created `package.json`, `tsconfig.json`, `next.config.ts`, `eslint.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `app/health/page.tsx`, `lib/env.ts`, `lib/supabase.ts` and `specs/001-app-foundation/tasks.md`. Modified `.gitignore` and `CLAUDE.md`.
- 🔁 Next prompts: Create the Supabase project (T012), add `.env.local` (T013), then deploy to Vercel (T016) — all three need the maintainer signed in.
- 🧠 Reflection: The health check was worth building before anything else needed the database, because it turns a misconfigured connection from an afternoon of guessing into a page anyone can open.

## Evaluation notes (flywheel)

- Failure modes observed: `create-next-app` cannot scaffold into a non-empty directory, and generates a `CLAUDE.md` that would silently overwrite the project's own. `next dev` writes into `CLAUDE.md` without being asked.
- Graders run and results (PASS/FAIL): Build PASS. Type check PASS. Credential leak scan on `/health` PASS. File length limit PASS, largest 89 lines. Zero credentials in tracked files PASS.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): Scaffold future framework upgrades in the scratchpad and copy configuration across, rather than running a generator in place.
