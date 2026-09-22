---
id: 0057
title: Switch summary email to Brevo
stage: green
date: 2026-09-22
surface: agent
model: claude-opus-5
feature: 010-client-feedback
branch: 010-client-feedback
user: talhaakhtar257-AI
command: none
labels: ["email", "brevo", "resend"]
links:
  spec: specs/010-client-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - lib/email/send.ts (renamed from resend.ts; Brevo first, Resend fallback)
 - lib/email/send-summaries.ts
 - .env.example
 - specs/010-client-feedback/quickstart.md
tests:
 - npx tsc --noEmit (pass); npm run lint (pass, 1 existing warning); npm run build (pass)
---

## Prompt

yes

(Answer to "Should I switch to Brevo?" — after asking whether Resend works on the free Vercel URL without a domain, and whether there is a way without buying a domain.)

## Response snapshot

Resend without a verified domain only delivers to the account owner, and a vercel.app address cannot be verified. Switched the email sender to Brevo's HTTP API (single verified sender such as a Gmail address, no domain, free 300/day), with Resend kept as a fallback when BREVO_API_KEY is empty. No new package; the send-once and failure-recording logic is unchanged.

## Outcome

- ✅ Impact: summary emails can reach the school and parents without buying a domain.
- 🧪 Tests: tsc, lint, build pass. Real sending needs the maintainer's Brevo key.
- 📁 Files: 1 renamed and rewritten, 3 edited.
- 🔁 Next prompts: maintainer creates Brevo account, verifies sender, adds BREVO_API_KEY / EMAIL_FROM / SCHOOL_NOTIFY_EMAIL.
- 🧠 Reflection: "works on Vercel" was the wrong question; the real limit was sender verification.

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): build PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
