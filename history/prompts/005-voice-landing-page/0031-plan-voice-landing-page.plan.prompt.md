---
id: 0031
title: Plan the voice landing page
stage: plan
date: 2026-09-11
surface: agent
model: claude-sonnet-5
feature: 005-voice-landing-page
branch: 005-voice-landing-page
user: talhaakhtar257-AI
command: /sp.plan
labels: [plan, feature-005, voice, retell, leads, sdd]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-voice-landing-page/plan.md (new)
  - specs/005-voice-landing-page/research.md (new)
  - specs/005-voice-landing-page/data-model.md (new)
  - specs/005-voice-landing-page/contracts/leads-api.md (new)
  - specs/005-voice-landing-page/contracts/web-call-api.md (new)
  - specs/005-voice-landing-page/quickstart.md (new)
tests:
  - constitution check — passes (parent-facing, most principles apply)
  - web research confirmed retell-client-js-sdk v2.x is the current browser SDK
commits:
  - plan: 005 parent-facing voice landing page
---

## Prompt

go

(proceed to /sp.plan with the two spec assumptions as drafted — on-screen
transcript kept, no rate limiting for the demo)

## Response snapshot

Drafted the full Phase 0/1 plan for feature 005.

Design:
- `app/page.tsx` becomes a server component: the written FAQ (from
  `readLiveForApi()`, feature 003) and the recording/privacy notices render as
  plain HTML, so FR-014 (JavaScript off) and FR-015 (assistant down) hold by
  construction. The only client island is `components/voice/talk-panel.tsx`.
- `POST /api/retell/web-call` mints the Retell token server-side with a new
  `RETELL_API_KEY`, keeping the key off the browser and giving FR-007 ("refuse
  when nothing published") one home. Returns typed reasons (`no-content`,
  `not-configured`, `retell-error`) all as 200 so the panel shows a calm
  bilingual message, never a crash.
- `POST /api/leads` per `.claude/rules/api.md`: `X-Agent-Secret` vs
  `RETELL_WEBHOOK_SECRET` first, Zod with every field optional and no
  CNIC/B-Form/payment field, `parentName`/`studentName`/`phone` stored only when
  a paired `*Confirmed` boolean is true (FR-018), status always `new`, a new row
  per request, route+message-only logging.
- One new table `leads` — the fields feature 004's dashboard expects, all
  nullable except id/created_at, status constrained and defaulting to `new`.
- One new dependency `retell-client-js-sdk` (v2.x, confirmed current via web
  search) — the plan flags it for approval and reads the exact event names from
  the installed types rather than guessing.

Constitution check passes on all ten principles plus sequencing (003 is on
main). research.md records nine decisions (D-001..D-008); data-model.md the table,
the Zod schema, and the confirmed-field mapping; two contract files; a
nine-part quickstart covering the JS-off check, the nothing-published state, the
curl tests, and the live conversation.

Committed and pushed on 005-voice-landing-page.

## Outcome

- ✅ Impact: feature 005 has a complete, reviewable plan and design set.
- 🧪 Tests: constitution check pass; no code yet.
- 📁 Files: 6 new spec docs.
- 🔁 Next prompts: maintainer approves `retell-client-js-sdk` and the `leads` migration; then /sp.tasks; then build — the server-rendered page first, then the leads endpoint, then the token route, then the live call.
- 🧠 Reflection: making `app/page.tsx` a server component is what turns "works with JavaScript off" from a testing chore into a property that cannot regress.

## Evaluation notes (flywheel)

- Failure modes observed: WebFetch of the Retell docs conflated the v1 and v2 SDK surfaces; the plan defers exact event names to the installed .d.ts.
- Graders run and results (PASS/FAIL): constitution check PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): confirm the SDK and migration before /sp.tasks so tasks are not written against a guessed API.
