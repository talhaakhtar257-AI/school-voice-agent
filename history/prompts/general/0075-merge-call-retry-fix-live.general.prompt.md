---
id: 0075
title: Merge call retry fix and verify live
stage: general
date: 2026-10-11
surface: agent
model: claude-opus-5-5
feature: none
branch: main
user: talhawork257
command: none
labels: ["deploy", "voice-call", "retry", "dns", "verification"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - (merge) fix/call-connect-retry into main, commit 771f279, pushed
  - history/prompts/general/0075-merge-call-retry-fix-live.general.prompt.md
tests:
  - pre-push key scan of the merge diff: 0 key-like lines
  - main tsc and build pass
  - live site, simulated 2 failures, then the 3rd try: 201 from create-web-call, "Listening…" (PASS)
  - an earlier identical run hit a real net::ERR_NAME_NOT_RESOLVED on the 3rd try (an intermittent DNS failure, captured)
  - 20/20 nslookup via router, 8.8.8.8 and 1.1.1.1; 10/10 fresh headless Chrome reaching api.retellai.com
---

## Prompt

merge and push

## Response snapshot

**Merge and deploy:**
- Previewed the merge: the 2 fix-branch commits, with a key scan of 0.
- Merged `--no-ff` into `main` locally; tsc and build passed; pushed. Vercel deployed.
- The watcher missed the new text because it is in a lazily loaded chunk, but behaviour on the live site confirmed the fix.

**Live verification:**
- Blocked Retell for 2 tries, then allowed it.
- First run: try 3 failed with a real `net::ERR_NAME_NOT_RESOLVED` for `api.retellai.com`. This is the root cause seen in the act: intermittent DNS failures on this network, which matches the owner's phone failing and then working.
- Second run: try 3 connected (201, "Listening…"). The fail-twice-then-recover path is verified end to end.
- DNS lookups (Windows and fresh Chrome) all succeeded afterwards, so the failure is rare and random.

**Test side effects:** "QA Test (delete me)" leads now total 4 (owner to delete), and October reserved minutes are up further. Both were reported.

## Outcome

- ✅ Impact: the fix is live. A parent on a flaky connection now gets "Still connecting, please wait…" and up to 3 tries without tapping again.
- 🧪 Tests: see the tests list.
- 📁 Files: the merge, this PHR.
- 🔁 Next prompts:
  - The owner tests on Android (Wi-Fi and mobile data).
  - The owner may set Android Private DNS to `dns.google` for their own device.
  - If a single tap still fails, lengthen the retry schedule (e.g. add a 4th try after 5 s).
  - Feature 013: release reservations for calls that never go live.
- 🧠 Reflection: request-level CDP logging (`blockedReason` vs `errorText`) separated harness artefacts from real network failures; without it, the DNS failure would have been blamed on the test.

## Evaluation notes (flywheel)

- Failure modes observed: the deploy watcher scanned only chunks referenced in the HTML; a real DNS failure surfaced only intermittently.
- Graders run and results (PASS/FAIL): build PASS; live retry PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): send a privacy-safe client error beacon (try number, HTTP status, error name) to the server, so failures on parents' phones become visible without asking for console access.
