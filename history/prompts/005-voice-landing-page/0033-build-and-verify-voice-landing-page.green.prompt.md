---
id: 0033
title: Build and verify the voice landing page
stage: green
date: 2026-09-11
surface: agent
model: claude-sonnet-5
feature: 005-voice-landing-page
branch: 005-voice-landing-page
user: talhaakhtar257-AI
command: continue
labels: [feature-005, voice, retell, leads, rate-limiting, green]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - .env.example, .env.local (new voice env vars)
  - public/school-logo.svg (new, placeholder)
  - supabase/migrations/20260911111214_leads_and_voice_usage.sql (leads, voice_usage_daily, voice_usage_monthly)
  - supabase/migrations/20260911111622_reserve_voice_call_function.sql (atomic limit check+reserve)
  - lib/leads/{schema,queries}.ts, lib/voice/limits.ts, lib/strings/landing.ts
  - app/page.tsx (rewritten, server component)
  - app/api/leads/route.ts, app/api/retell/web-call/route.ts
  - components/voice/{talk-panel,mic-explainer,text-chat,how-it-works}.tsx
  - specs/005-voice-landing-page/tasks.md (27 of 33 verified done)
tests:
  - reserve_voice_call() verified via direct SQL — daily cap, monthly cap, cross-visitor independence all correct
  - leads endpoint — 401/401/200x3 via curl, DB-verified (confirmed fields stored, unconfirmed blanked, CNIC stripped), test rows cleaned up
  - gate route — no-content and not-configured reasons both verified
  - browser: page renders correctly (bilingual, RTL, published content, placeholder logo/phone); text chat answers correctly and writes nothing (0 leads after); mic-explainer appears before any permission prompt; not-configured fallback renders and returns panel to idle
  - raw HTML (curl) contains the FAQ text, phone tel: link, and all notices — proves the JS-off/no-Retell path
  - npm run build + npx tsc --noEmit clean
commits:
  - (all listed in files above, one per phase, on 005-voice-landing-page)
---

## Prompt

continue

(after approving the migration's plain-English description in the previous turn)

## Response snapshot

Applied the leads/voice_usage migration (T004-T006), verified via query. Then
built the whole remaining feature in one continuous pass rather than pausing
between phases, since none of the rest needed further approval:

- Phase 2 rest (T007-T010): lib/leads/schema.ts, lib/leads/queries.ts,
  lib/strings/landing.ts, and lib/voice/limits.ts. The last needed a second
  small migration: reserve_voice_call(), an atomic Postgres function (locks the
  visitor's daily row and the month's row via SELECT ... FOR UPDATE) so the
  monthly cap is a real hard ceiling under concurrent requests, not just a
  TypeScript check-then-write race. Verified interactively with a 2-call/day,
  1-minute, 3-minute-cap scenario before writing it into a migration file; test
  rows deleted after.
- Phase 3 (T011-T012): app/page.tsx rewritten as a server component.
- Phase 4 (T013-T015): components/voice/text-chat.tsx, reusing
  lib/content/simulate.ts (feature 003) directly.
- Phase 5 (T016-T020): mic-explainer.tsx, the gate route
  (app/api/retell/web-call/route.ts — pre-flight only, per the D-001 SDK
  correction from the previous turn), and talk-panel.tsx using the real
  RetellClient/createWebCall/hooks surface. Discovered mid-build that the
  per-call timer needs to know VOICE_MAX_CALL_SECONDS, which was designed
  server-only — fixed by having the gate route hand back maxCallSeconds in its
  { ok: true } response rather than duplicating the setting as a second
  NEXT_PUBLIC_ var; updated contracts/web-call-api.md and data-model.md to
  match.
- Phase 6 (T021-T022): app/api/leads/route.ts.
- Phase 7 (T023-T024): folded into the routes/components above as they were
  built, rather than as a separate later pass.
- Phase 8 partial (T026-T028, T032): verified no PII logged, no CNIC/B-Form
  field, every file under ~200 lines, build+tsc clean.

Verification: full curl suite for both new routes (DB-checked, test data
cleaned up afterward); browser testing of the actual page — screenshot,
raw-HTML check (proves the JS-off/Retell-down path holds without needing to
toggle Chrome's JS setting), the mic-explainer-before-permission-prompt
requirement, the not-configured fallback end to end, and the text chat
answering correctly from the user's own pre-existing feature-003 test content
while writing zero leads.

tasks.md updated: 27 of 33 tasks marked done. Open: T020 (needs a real Retell
agent), T025 (the deliberately-low-limits quickstart scenario), T029-T031 (real
devices, slow-3G, Vercel), T033 (restate the placeholder logo/phone reminder).

## Outcome

- ✅ Impact: feature 005 is code-complete and verified everywhere that doesn't require a live Retell agent or a real device.
- 🧪 Tests: all listed above pass; build+tsc clean throughout.
- 📁 Files: ~15 new/changed files across app/, components/voice/, lib/, two migrations.
- 🔁 Next prompts: maintainer sets up the Retell agent (T020), runs the low-limit and device/Vercel checks (T025, T029-T031), then this feature can merge into main.
- 🧠 Reflection: verifying the atomic reservation function with real SQL calls before trusting it, and reading the actual Retell SDK types before writing the call code, both caught real problems (a race condition, a deprecated class) that "it compiles" would not have.

## Evaluation notes (flywheel)

- Failure modes observed: browser automation coordinate-click occasionally missed elements (worked reliably once switched to ref-based clicks); a screenshot call timed out once (transient, unrelated to the app — retried successfully via get_page_text).
- Graders run and results (PASS/FAIL): reserve_voice_call PASS, leads endpoint PASS, gate route PASS, browser rendering PASS, JS-off-equivalent PASS, build/tsc PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
