---
id: 0020
title: Build feature 002 Phase 2 foundational
stage: green
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: 002-staff-login
branch: 002-staff-login
user: talhaakhtar257-AI
command: (build feature 002 from the corrected plan, small steps)
labels: [feature-002, supabase-ssr, foundational, green]
links:
  spec: specs/002-staff-login/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - package.json, package-lock.json (@supabase/ssr ^0.12.7)
  - specs/002-staff-login/{plan,tasks,data-model,quickstart,research}.md (middleware -> proxy rename)
  - lib/supabase/client.ts (new, T004)
  - lib/supabase/server.ts (new, T005)
  - lib/supabase/proxy.ts (new, T007)
  - lib/strings/staff-login.ts (new, T006)
  - lib/office.ts (new, T008)
  - components/office-phone.tsx (new, T008)
tests:
  - npm run build — pass
  - npx tsc --noEmit — clean
commits:
  - 777a2dc chore: install @supabase/ssr and rename middleware->proxy in 002 docs
  - c9e17b5 feat: 002 Phase 2 foundational — Supabase clients, strings, office phone
---

## Prompt

Approved: install @supabase/ssr. Then build feature 002 from the corrected plan.
Small steps, show me each change before making it.

(followed by six "yes" confirmations, one per step)

## Response snapshot

Installed @supabase/ssr (^0.12.7). Built feature 002 Phase 1 setup and Phase 2
foundational in seven approved steps, each shown before writing:

1. Renamed `middleware.ts` to `proxy.ts` across plan.md, tasks.md, data-model.md,
   quickstart.md and research.md. This was a new discrepancy found in the Next.js
   16 bundled docs: Next 16 renamed the Middleware file convention to Proxy;
   `middleware.ts` is deprecated. Recorded as correction F.
2. `lib/supabase/client.ts` (T004) — browser client via `createBrowserClient`,
   session in cookies.
3. `lib/supabase/server.ts` (T005) — Server Component client, async `cookies()`
   from `next/headers`, guarded no-op `setAll`.
4. `lib/supabase/proxy.ts` (T007) — `updateSession(request)` helper that calls
   `supabase.auth.getUser()` (validated, not `getSession()`) and rewrites the
   session cookie onto request and response; returns `{ response, user }` so the
   root `proxy.ts` (T014, not yet built) owns redirect decisions.
5. `lib/strings/staff-login.ts` (T006) — all sign-in and dashboard-shell strings,
   English and Urdu per entry. Urdu is developer-written; flagged for
   native-speaker review before the client sees it.
6. `lib/office.ts` + `components/office-phone.tsx` (T008) — office phone stored
   once, rendered as a 44px `tel:` link in both languages. Per the user's
   instruction the number is an obvious placeholder (`+920000000000` /
   `021-000-000-000`) with a "replace before any demo" comment.

Committed as 777a2dc (setup + doc corrections) and c9e17b5 (Phase 2 code). Not
pushed. `npm run build` and `npx tsc --noEmit` pass after every step.

## Outcome

- ✅ Impact: Feature 002 Phase 2 foundational complete — Supabase cookie wiring, bilingual strings, office-phone component all in place. No screens yet.
- 🧪 Tests: npm run build pass; npx tsc --noEmit clean (checked after each file).
- 📁 Files: 6 new source files, 5 spec docs corrected, package manifests updated.
- 🔁 Next prompts: user does T002 (create a Supabase staff account) and T003 (confirm env vars); then Phase 3 (User Story 1 — sign-in screen): T009 login-form, T010 login page, T011 dashboard layout, T012 dashboard home, T013 verify.
- 🧠 Reflection: The proxy rename would have caused a build-time deprecation warning and a stale plan if not caught; reading the bundled Next 16 docs first surfaced it.

## Evaluation notes (flywheel)

- Failure modes observed: none — each step built clean.
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
