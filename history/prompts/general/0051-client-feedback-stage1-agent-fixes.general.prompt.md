---
id: 0051
title: Client feedback stage 1 agent fixes
stage: general
date: 2026-09-21
surface: agent
model: claude-opus-5
feature: none
branch: 010-client-feedback
user: talhaakhtar257-AI
command: none
labels: ["retell", "prompt", "landing", "call", "wake-lock", "client-feedback"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - docs/retell-agent-prompt.md
 - components/landing/call/use-wake-lock.ts (new)
 - components/landing/call/call-provider.tsx
 - components/landing/call/call-overlay.tsx
 - components/landing/call/call.module.css
 - lib/strings/landing-call.ts
tests:
 - npx tsc --noEmit (pass)
 - npm run lint (pass, 1 existing warning)
 - npm run build (pass)
---

## Prompt

- Reply should be on the same language of user, currently it is only replying on URDU
- It should first ask for his name, phone number. and ask them to confirm if AI recorded the name and phone number correctly,
- it should also show input for their email address if necessary.
- Voice freezing most of the time when AI Replying
- User screen is getting off (due to screensaver) and then call dropped
- AI is considering everyone is female which is wrong, even we are correcting it but AI is still talking like she is talkign to female

ADMIN
- Live conversation takeover option, where it is showing how many conversation is currently going on and option to switch to human and handle that call by human
- Small Analytics on the top (today, weekly)
- Lead  Table with Name, Contact, email and Summary  field
- Leads Report should be on front, last 10 records with complete conservation on details page, sumamry shoudl be on top on the details page
- GAP  List should be renamed to  Knowledge. And each knowlege entry should have separate page isntead of all together
- Option to  add knowlege from PDF docs, website (crawling),  AI should send summary to both User and School through email professional team tested it and found these missing we have to add these all  and createccount again i created another account now  tell step by step what to do now

## Response snapshot

Planned the whole round as five stages (approved): 1 agent fixes and new Retell account, 2 leads with email/summary/transcript plus analytics, 3 Gap list renamed Knowledge with per-entry pages and PDF/website import, 4 live-calls monitor with "call parent now" (Retell web calls cannot be taken over by voice), 5 summary emails through Resend's HTTP API. Built stage 1: prompt v4 (reply in the parent's last language, name and phone first with one read-back, gender-neutral "aap … chahte hain", child's gender only from the parent's words) and a screen wake lock during calls with a "keep this page open" line.

## Outcome

- ✅ Impact: the agent no longer defaults to Urdu or to feminine forms; screens stay on during a call.
- 🧪 Tests: tsc, lint, build pass; call behaviour to be checked by a test call on the new Retell account.
- 📁 Files: 5 edited, 1 new.
- 🔁 Next prompts: stage 2 via /sp.specify for 010-client-feedback.
- 🧠 Reflection: version 3's examples were all Roman Urdu and "bachi", which taught the model both the language and the gender bias.

## Evaluation notes (flywheel)

- Failure modes observed: "if they mix, reply in Urdu" plus Urdu-only examples pushed replies to Urdu; feminine example sentences.
- Graders run and results (PASS/FAIL): build PASS.
- Prompt variant (if applicable): retell prompt v4
- Next experiment (smallest change to try): an early save_lead once leads can be updated by call id.
