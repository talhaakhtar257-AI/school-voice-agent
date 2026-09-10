---
id: 0022
title: Build feature 002 Phase 5 error messages
stage: green
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: 002-staff-login
branch: 002-staff-login
user: talhaakhtar257-AI
command: Continue to Phase 5
labels: [feature-002, us3, errors, bilingual, green]
links:
  spec: specs/002-staff-login/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - components/login-form.tsx (rewritten, T020-T024)
  - lib/strings/staff-login.ts (forgotPassword loses {phone})
  - app/login/page.tsx (forgot-password note, T025)
tests:
  - npm run build — pass
  - npx tsc --noEmit — clean
  - user click-through: wrong-password message renders bilingual, email field keeps its value
commits:
  - 2b03e49 feat: 002 Phase 5 — specific bilingual error messages (US3)
---

## Prompt

All four steps pass. Bilingual error message renders correctly,
email field keeps its value. Continue to Phase 5.

## Response snapshot

Phase 5 (User Story 3 — every sign-in error is clear and bilingual) built in two
approved steps.

- T020-T024: rewrote components/login-form.tsx. State is now emailError,
  passwordError, formError, each a MessageKey | null. On submit: trim email;
  empty email -> emailRequired; non-matching EMAIL_PATTERN -> emailMalformed;
  empty password -> passwordRequired (all per-field, nothing sent);
  !navigator.cookieEnabled -> cookiesBlocked (form-level, nothing sent);
  signInWithPassword error with code "invalid_credentials" -> wrongCredentials,
  any other error or a thrown fetch -> networkFailure. Unknown email and wrong
  password give the identical message (FR-006). noValidate on the form disables
  the browser's English-only popups. A field error clears on the next edit. A
  small Message helper renders both languages with role="alert".
- T025: forgot-password note added to app/login/page.tsx between the form and
  <OfficePhone/>, both languages. lib/strings/staff-login.ts forgotPassword
  dropped its {phone} slot because the tappable number is already in
  <OfficePhone/> right below — inlining it would show the number twice.

npm run build and npx tsc --noEmit pass. User verified US1/US2 end to end
beforehand (all four steps of quickstart Part 2, plus wrong-password).

## Outcome

- ✅ Impact: every sign-in failure now has its own bilingual message; no silent failures, no English-only browser popups.
- 🧪 Tests: build + tsc clean; user confirmed the wrong-credentials message and email retention.
- 📁 Files: 3 changed, +100 / -29.
- 🔁 Next prompts: user runs T026 (click-through of each error state). Then Phase 6 (sign-out).
- 🧠 Reflection: login-form.tsx is 175 lines — under the 200 limit but the largest file in the feature; a further error case would justify splitting the validation out.

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
