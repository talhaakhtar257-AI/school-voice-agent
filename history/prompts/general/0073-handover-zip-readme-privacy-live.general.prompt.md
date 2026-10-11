---
id: 0073
title: Handover ZIP, README, privacy live
stage: general
date: 2026-10-09
surface: agent
model: claude-opus-5-5
feature: none
branch: main
user: talhawork257
command: none
labels: ["handover", "readme", "zip", "deploy", "secrets"]
links:
  spec: specs/012-privacy-policy/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - README.md (new)
  - CLAUDE.local.md (not committed): Retell account email, Node version, current Retell settings
  - history/prompts/general/0072-retell-new-account-move.general.prompt.md (a public key redacted)
  - outside the repo: Desktop/school-voice-agent-for-testing-2026-10-09.zip
tests:
  - main build and tsc pass after merging 012
  - live /, /privacy, /login return 200; privacy link and draft notice present live
  - ZIP scanned: no .env.local, CLAUDE.local.md, node_modules, debug.log, .next; 0 key-like strings after redaction
---

## Prompt

talhamobile1120@gmail.com complete it i have to give it today for testing

## Response snapshot

Saved the new Retell account email in `CLAUDE.local.md` (private), and corrected the Node version and Retell settings there.

**Release and handover:**
- Merged `012-privacy-policy` into `main` locally (no PR); the merge contained exactly 5 commits. The build passed.
- Added `README.md` for testers: live links, fake test data, local setup without keys, the code map, and the known issues from the QA review, so they are not re-reported.
- Pushed. Vercel deployed and `/privacy` was live in about 40 s.
- Built the ZIP with `git archive` from `main`, so only committed files are included.

**A key leaked and was redacted.** A key scan of the ZIP found the staff public key inside PHR 0072, which had copied the owner's prompt verbatim and had already been pushed to the public GitHub repo. It was redacted, pushed, and the ZIP rebuilt (0 keys). The owner was advised to rotate the staff key. A memory was saved: redact keys in verbatim PHR prompts.

## Outcome

- ✅ Impact: the project was handed over for testing on time, with the privacy policy live and a tester README.
- 🧪 Tests: build, live page checks, ZIP content and secret scans.
- 📁 Files: `README.md`, the PHR 0072 redaction, private notes.
- 🔁 Next prompts: rotate the staff public key; set Retell limits; feature 013 (staff-only RLS, voice-minute protection, 404/error pages).
- 🧠 Reflection: verbatim prompt logging and a public repo collide; scan before every push.

## Evaluation notes (flywheel)

- Failure modes observed: a public key in a verbatim PHR was pushed publicly before the scan.
- Graders run and results (PASS/FAIL): ZIP scan PASS after redaction; live checks PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): a pre-push secret grep as a habit for every push.
