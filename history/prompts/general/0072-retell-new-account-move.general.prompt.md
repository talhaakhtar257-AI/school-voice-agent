---
id: 0072
title: Move agent to another new Retell account
stage: general
date: 2026-10-09
surface: agent
model: claude-opus-5-5
feature: none
branch: 012-privacy-policy
user: talhawork257
command: none
labels: ["retell", "account-move", "secret-rotation", "config"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .env.local (not committed) — RETELL_WEBHOOK_SECRET rotated, RETELL_STAFF_PUBLIC_KEY added
  - specs/012-privacy-policy/quickstart.md, research.md — Retell "Data Storage Settings" wording (commit 35d119d)
  - history/prompts/general/0072-retell-new-account-move.general.prompt.md
tests:
  - read-only export of the old agent and LLM (prompt v9, 5 tools, 34 agent settings)
  - dry run of the import, all checks PASS
  - read-back of the new agent matches the old one (prompt, tools, model, voice, languages, limits, data storage, new secret)
  - owner's live test call; database shows calls 13→14, leads 16→17, transcript, summary, lead link and school email all present
---

## Prompt

Series of prompts:
- 2 point tell stepby step
- can you tell our last email we use to create reetell account
- we need to create another account tell me what i have to give you that you create again perfectly account of retell and do all setting
- check and create perfectly acccount
- which url give in pblic key for staff
- public_key_365e7f03b754414972ac2   this is staff key  check i add some in local and one is here check them and i didn't change them in vercel
- i test it works

## Response snapshot

**Retell settings guide.** Gave step-by-step Retell instructions from the official docs:
- "Data Storage Settings" must be Everything.
- Concurrency limit 3 and Burst off; Retell has no monthly spend cap.

Corrected the old "opt out of data storage" wording in the 012 docs.

**Account email.** The email of the previous Retell account is not recorded anywhere. Explained how to find it.

**New account.** I am not allowed to create the account or enter a password, so the owner did. Then:
1. Took a read-only backup of the old agent and LLM.
2. **Mistake:** the backup summary printed the old webhook secret, which sits in the webhook URL query, into the chat. That secret was rotated as part of the move.
3. Found that `.env.local` held a webhook secret different from the live one, and that it was a copy of the API key.
4. Confirmed the new key belongs to the new account: it cannot see the old agent, and its only agent is a template.
5. Filled that template in place, keeping its id:
   - **Prompt and tools:** prompt v9, and exactly the 5 Al-Noor tools; the template's transfer_call was removed.
   - **Model and voice:** gpt-4.1-mini; Monika on ElevenLabs v3 at temperature 0.3.
   - **Agent settings:** English + Urdu, 10-minute calls, 30-second silence, fast speech recognition, noise cancellation, data storage Everything.
   - **Secret:** a new 64-hex secret in the 4 tool headers and the webhook URL.
6. Published it and verified by reading it back.
7. Updated `.env.local` with the new secret and the staff key; the old file is backed up in the scratchpad.

**Owner steps.** The owner updated 5 Vercel variables, redeployed, and made a test call. It worked, and the database confirms it.

**Also confirmed:** Supabase public sign-up is now disabled.

## Outcome

- ✅ Impact: the voice agent runs on the new Retell account with an identical configuration and a fresh shared secret. Local and production secrets now match. The QA critical finding (open sign-up) is closed.
- 🧪 Tests: export, dry run, read-back comparison, live test call, and a database check.
- 📁 Files: no app code changed. `.env.local` updated (git-ignored). Scripts are in the session scratchpad: `retell-export.mjs`, `retell-import.mjs`, `which-account.mjs`, `inspect-new.mjs`.
- 🔁 Next prompts:
  - The owner saves the new Retell account email in `CLAUDE.local.md`.
  - The owner sets Retell limits (concurrency 3, Burst off).
  - Merge 012 when approved.
  - Feature 013: staff-only RLS, voice-minute protection, and 404/error pages.
- 🧠 Reflection: print only what a summary needs. A URL can carry a secret, so redact query strings by default. Scripted export, dry run, update and read-back made the account move verifiable rather than trusted.

## Evaluation notes (flywheel)

- Failure modes observed: the secret was printed via webhook_url; `.env.local` had drifted from production (wrong secret value); the owner put keys into existing lines instead of the suggested NEW_ lines, which needed account detection before writing.
- Graders run and results (PASS/FAIL): dry-run checks PASS; read-back verify PASS; live call PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add a URL-redaction helper to every config-export script.
