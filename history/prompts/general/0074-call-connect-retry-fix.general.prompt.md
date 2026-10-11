---
id: 0074
title: Call connect retry fix
stage: general
date: 2026-10-11
surface: agent
model: claude-opus-5-5
feature: none
branch: fix/call-connect-retry
user: talhawork257
command: none
labels: ["bugfix", "retell", "voice-call", "network", "retry"]
links:
  spec: specs/011-tester-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - components/landing/call/call-provider.tsx
  - components/landing/call/call-overlay.tsx
  - lib/strings/landing.ts
  - package.json, package-lock.json (retell-client-js-sdk 3.0.1 -> 3.0.2)
  - history/prompts/general/0074-call-connect-retry-fix.general.prompt.md
tests:
  - live site, headless Android profile, fake mic, 3 runs: 3/3 live (create-web-call 201; Retell min SDK 2.0.8)
  - localhost, all tries failing: "Still connecting" shown, retries at +1 s and +2.5 s, then "couldn't connect"
  - localhost 401 ("Public key is not allowed for this domain"): gives up after try 1
  - tsc, lint (0 errors), build pass
---

## Prompt

agent show error before start talking 2 times and third time she start talking

## Response snapshot

**Investigation, read-only in plan mode:**
- The gate passed all 3 taps (`voice_usage_daily` count 3).
- Retell's call list (all statuses) had no record of the failures. So the browser's first request (`POST /v3/create-web-call`) never reached Retell or was refused. "Couldn't connect" means 2 failures each, so 4 in a row.
- DNS was fine at that moment.

**Approved plan: reproduce, then fix.**
- **Reproduced** on the live site from this PC as an Android profile: 3/3 went live, and the SDK version is above Retell's minimum. The failure is network-path specific to the owner's phone; a curl to Retell also failed once silently from this PC.
- **Fix on `fix/call-connect-retry`:**
  - 3 tries with 1 s and 2.5 s pauses on the same reservation
  - a "Still connecting, please wait…" status in EN/UR
  - no retry on HTTP 401/403
  - console log with the try number, HTTP status or "no status", and the message
  - SDK upgraded to 3.0.2
- **Local tests:** confirmed the retry timing and the immediate give-up on 401. They also revealed that the new public key does not allow `localhost:3000`, so a full fail-then-succeed run needs `localhost` added to the key, or a test on the live domain after merge.

**Side effects, reported to the owner:**
- 3 "QA Test (delete me)" leads, left for the owner to delete.
- October reserved minutes went from 29 to 72, because failed local attempts are never released. That is feature 013's "voice-minute protection".

## Outcome

- ✅ Impact: on a flaky mobile network, a parent's call now recovers on its own instead of showing "couldn't connect" and forcing re-taps. Failures are diagnosable from the console message.
- 🧪 Tests: see the tests list. The fail-then-succeed path is not yet verified end to end, because `localhost` is not allowed on the public key.
- 📁 Files: 3 source files, the package files, this PHR.
- 🔁 Next prompts:
  - The owner adds `localhost:3000` to the website public key, or approves merge and push.
  - Then rerun `retry-check.mjs 2`, and the owner tests on Android (mobile data and Wi-Fi).
  - Delete the QA leads.
- 🧠 Reflection: an empty Retell call list was the decisive evidence that the failure was before Retell. Logging the HTTP status turned "couldn't connect" into "401 Public key is not allowed for this domain" within one run.

## Evaluation notes (flywheel)

- Failure modes observed: CDP Fetch interception never delivered requestPaused events (switched to Network.setBlockedURLs); localhost blocked by the public key's allowed domains; test attempts consumed monthly reservations.
- Graders run and results (PASS/FAIL): tsc PASS, lint PASS, build PASS, retry timing PASS, 401 give-up PASS, live 3/3 PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): release the reservation when no call ever goes live (feature 013).
