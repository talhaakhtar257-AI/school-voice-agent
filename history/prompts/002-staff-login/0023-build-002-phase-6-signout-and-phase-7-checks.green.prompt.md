---
id: 0023
title: Build feature 002 Phase 6 sign-out and Phase 7 checks
stage: green
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: 002-staff-login
branch: 002-staff-login
user: talhaakhtar257-AI
command: Yes, shorten the OfficePhone label to remove the repetition. Then continue to Phase 6.
labels: [feature-002, us4, sign-out, polish, green]
links:
  spec: specs/002-staff-login/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - components/sign-out-button.tsx (new, T027)
  - app/dashboard/layout.tsx (sign-out button wired in, T028)
  - components/office-phone.tsx (label shortened)
tests:
  - npm run build — pass
  - npx tsc --noEmit — clean
  - T030 no sign-up path — pass
  - T032 all files < 200 lines (largest 175) — pass
  - T033 nothing logged — pass (no console/logger calls in app code)
commits:
  - a2470e4 feat: 002 Phase 6 — sign out (US4)
---

## Prompt

Yes, shorten the OfficePhone label to remove the repetition.
Then continue to Phase 6.

## Response snapshot

Shortened components/office-phone.tsx label from "Call the school office · اسکول
کے دفتر سے رابطہ کریں" to "School office · اسکول کا دفتر", so it no longer echoes
the forgot-password note's "Call the school office".

Phase 6 (User Story 4 — sign out):
- T027 components/sign-out-button.tsx — "use client" button. signOut() via the
  browser client clears the session cookie, then router.push("/login") +
  router.refresh(). Disabled in flight. try/catch because signOut() clears the
  local session before it returns even if the server revoke fails. The back
  button afterwards lands on /dashboard and the proxy redirects to /login.
- T028 app/dashboard/layout.tsx — SignOutButton added to the header beside the
  user's email; header given flexWrap so name/email/button stack at 360px.

Phase 7 automated checks run:
- T030 — grep for signup/signUp/createUser/register across app, components, lib:
  none. FR-005 holds.
- T032 — every feature file is under 200 lines; largest is login-form.tsx at 175.
- T033 — no console or logger calls anywhere in app code, so no password, token
  or email is ever logged.
- T036 — npm run build and npx tsc --noEmit both clean.
- T034 (partial) — via the page: no horizontal overflow, and the button, the
  tel: link and the email input are all exactly 44px tall. The browser window
  would not resize below ~1707px in this environment, so the full 360px visual
  pass is left to the user in Chrome DevTools device mode (quickstart Part 6).

## Outcome

- ✅ Impact: sign-out works and returns to /login; office-phone label no longer repeats; Phase 7 static checks pass.
- 🧪 Tests: build + tsc clean; T030/T032/T033 pass; T034 partially verified (44px targets, no overflow).
- 📁 Files: 3 changed, +65 / -4; one new file.
- 🔁 Next prompts: user runs the remaining click-throughs — T026 (error states), T029 (sign-out + back button), T017/T018 (expired session, deleted account), T031 (sign-in under 30s on a phone), T034 (360px visual), T035 (Vercel preview). Then feature 002 is done.
- 🧠 Reflection: the browser tooling could not emulate a 360px viewport, so the visual mobile check stays a human step; the measurable parts (touch target sizes, overflow) were automatable.

## Evaluation notes (flywheel)

- Failure modes observed: browser window resize did not take effect (stayed ~1707px wide).
- Graders run and results (PASS/FAIL): T030 PASS, T032 PASS, T033 PASS, T036 PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): use Chrome DevTools Protocol device metrics override for viewport emulation instead of window resize.
