---
id: 0089
title: A refused microphone says so
stage: green
date: 2026-11-11
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["pre-demo", "audit", "microphone", "permissions", "error-states", "urdu", "dead-strings", "verification"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - components/landing/call/call-provider.tsx
 - history/prompts/013-call-speed-cost/0089-refused-microphone-says-so.green.prompt.md
tests:
 - npm run build (passed)
 - npx tsc --noEmit (passed)
 - npm run lint (1 pre-existing warning in lib/content/schema.ts, untouched)
 - md5 of the production call chunk vs the local build (identical, after confirming both markers exist locally)
 - Audit of every parent-facing string in lib/strings for one nothing renders
---

## Prompt

continue

## Response snapshot

Kept sweeping for demo risks in the paths nobody exercises. Found that a refused
microphone told the parent the assistant was unavailable, and fixed it using a
translated string that had been sitting unused since the landing page was built.
Audited every parent-facing string the same way; the other three unused ones are
dead leftovers, not faults.

## Outcome

- Impact: **A denied microphone blamed the assistant.** The failure fell through
  to the generic branch, so the parent read "The assistant is not available
  right now. Please call the office." That is false, and it points away from the
  single action that fixes it — tapping Allow. On a phone that has never run
  this app, which on demo day is the client's phone, it is the likeliest way a
  first call fails, and it makes a working product look broken.
  The `micRefused` wording already existed in `lib/strings/landing.ts` in
  English and Urdu. **Nothing on the parent-facing side had ever rendered it**;
  the only use in the codebase was the staff monitor panel's own separate copy.
  It now shows in the existing fallback slot, which already carries
  `role="alert"` and picks the parent's language.
  Detected from the browser's own error `name` — `NotAllowedError`,
  `NotFoundError`, `NotReadableError`, `SecurityError` — which Retell's SDK
  passes through, with a message-text backstop for wrappers that flatten the
  DOMException. Deliberately checked **ahead of the retry logic**: retrying
  cannot win a permission back, and three attempts would hold the parent on
  "still connecting" for about four seconds before telling them the wrong thing
  anyway.
  **Audited every parent-facing string for the same class of fault** — written,
  translated, never shown. Three others came up and all three are dead
  leftovers rather than gaps: `faqUnavailable` and the landing `headline` are
  superseded (the FAQ's failure path is handled, via `SectionState` and
  `sectionUnavailable`), and `emailBoxDuringCall` is superseded by `emailLabel`,
  which the email box renders as a real `<label>`. Left them alone: dead strings
  are not worth a refactor in demo week.
  Also confirmed good while looking: transcript bubbles carry `dir="auto"` per
  bubble, so mixed Urdu and English render correctly, and the email input is
  `dir="ltr"` with `aria-invalid` and `aria-describedby` wired up.
- Tests: build, type check and lint pass. Deploy confirmed by md5 of the
  production call chunk against the local build —
  `60016a0c6c2809bbbf8e3322323c066c` both sides — and this time the two markers
  were confirmed present in the local build *before* trusting them in
  production.
- Files: `components/landing/call/call-provider.tsx` only.
- Next prompts: the demo. Deferred by the owner: the placeholder office number.
  Still open and optional: the cheap-voice comparison by ear, the gate prefetch
  (~1.2s off the connect wait, declined for demo week), the `agent_version`
  pin, and splitting the 445-line `call-provider.tsx`.
- Reflection: the two bugs found in this sweep and the last one share a shape —
  **a path no test and no demo rehearsal has ever walked.** `send_details` had
  never fired on a real call; a microphone has never been refused in testing
  because the owner's browser granted it months ago and remembers. Neither
  would appear in any amount of re-testing the happy path, and both would have
  surfaced in front of the client. "Is anything remaining?" is best answered by
  listing what has never run, not by polishing what has.

## Evaluation notes (flywheel)

- Failure modes observed: I nearly reported the deploy as missing again. The
  first probe searched production for `NotAllowedError`, which appears in
  Retell's own SDK bundle as well as in my code, so it was present in two
  chunks and proved nothing; the hash of the chunk I had picked locally did not
  match any of them. Narrowing to the chunk that carries `school_brief` and
  checking two markers that only my change introduces settled it, and the md5s
  then matched exactly. The discipline that is now routine — confirm a probe
  returns a positive on known-good input first — is what stopped a fourth false
  negative, but the better lesson is to choose a marker that *only* the change
  could have produced.
- Graders run and results (PASS/FAIL): PASS — build, type check, lint; the
  production chunk md5-matches the local build.
- Prompt variant (if applicable): none. Agent version 11 untouched.
- Next experiment (smallest change to try): open the site in a browser profile
  that has never granted the microphone, deny the prompt, and confirm the
  parent reads the microphone message rather than "the assistant is not
  available" — the one way to exercise this path without waiting for a real
  parent to do it.
