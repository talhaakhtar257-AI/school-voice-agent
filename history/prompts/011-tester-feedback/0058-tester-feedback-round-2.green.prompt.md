---
id: 0058
title: Tester feedback round 2
stage: green
date: 2026-09-25
surface: agent
model: claude-opus-5-5
feature: 011-tester-feedback
branch: 011-tester-feedback
user: talhaakhtar257-AI
command: plan mode, then implementation of stages A–D
labels: ["retell", "latency", "pre-call-form", "email", "whatsapp", "downloads", "storage"]
links:
  spec: specs/011-tester-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - supabase/migrations/20260925100000_release_voice_minutes.sql (new, applied)
 - supabase/migrations/20260925110000_downloads_bucket.sql (new, applied)
 - components/landing/call/{pre-call-form.tsx (new), call-provider.tsx, call-overlay.tsx, call.module.css}
 - components/landing/call/email-box.tsx (deleted)
 - app/api/leads/intake/route.ts (new), app/api/send-details/route.ts (new), app/api/retell/webhook/route.ts
 - lib/email/{info-pack.ts (new), templates.ts, send-summaries.ts}
 - lib/voice/limits.ts, lib/calls/queries.ts, lib/content/{schema,diff}.ts
 - app/dashboard/knowledge/{download-actions.ts (new), page.tsx}, components/knowledge/downloads-panel.tsx (new)
 - components/landing/process-documents-section.tsx, app/page.tsx
 - lib/strings/{pre-call,downloads}.ts (new)
 - docs/retell-agent-prompt.md (prompt v6)
 - specs/011-tester-feedback/{spec,plan,tasks}.md
tests:
 - npx tsc --noEmit (pass); npm run lint (pass, 1 existing warning); npm run build (pass)
 - live: send-details 401 without secret, "no-email" for unknown call, "sent" for a real call; intake 403 without cookie, 400 on a bad phone
 - Retell read-back: gpt-4.1-mini, max 600000 ms, send_details tool present, prompt v6 published
---

## Prompt

team tested and here is review : 

- I dint get summary on email after call ended
- call is limited to 5 mins only, and then auto disconnectiong.
- half of time went to correct my name. AI is writing and pronouncing my name wrong. it will be much better to take Name, email and phoen number input before starting call.
- it is saying it can't whtasapp me details. better to whatsapp the details which user is asking
- AI has all details then why it is asking to call on office number
- If user is asking to give documents or admission form in PDF, then provide the deirect link of the file or better to whastapp them or email them
- AI sometimes replying very late, and not indicating 
- after one call, it is not allowing to call again

got nthe summary on email but you cannot send such summary on email. it is acutally not call transcript
(the parent email text followed)

 and more point need to note

## Response snapshot

Checked the testers' calls: e2e latency p50 3.5 s with the model (gpt-6-astra) taking up to 8 s; the call stopped at our 5-minute timer; the repeat call failed with error_retell and the browser had used 4 of 5 daily calls; the lead had no name. User chose 10-minute calls, name/phone/email all required up front, email now plus a WhatsApp "message yourself" button (API sending out of scope), and staff-uploaded PDFs. Built: Retell model gpt-4.1-mini, silent save_lead, 10-min max, prompt v6 with send_details tool and office-number rule; unused-minutes release; connection retry and thinking indicator; pre-call form with dynamic variables and an intake endpoint; parent info-pack email and school email with transcript; downloads store and upload panel with links on the website.

## Outcome

- ✅ Impact: every tester point has a fix live; WhatsApp from the school's own number remains a later phase.
- 🧪 Tests: build and live endpoint checks pass; a real info-pack email was sent to the maintainer's test address.
- 📁 Files: ~12 new, ~15 edited, 1 deleted; 2 migrations.
- 🔁 Next prompts: maintainer sets VOICE_MAX_CALL_SECONDS=600 and VOICE_MAX_CALLS_PER_VISITOR_PER_DAY=10 in Vercel, checks Retell balance, uploads the admission form, test call.
- 🧠 Reflection: the parent email had been Retell's staff-facing summary; content meant for parents should be built from approved content, not from the model's narration of the call.

## Evaluation notes (flywheel)

- Failure modes observed: slow LLM choice; summary written about the assistant; details spoken aloud were misheard.
- Graders run and results (PASS/FAIL): build PASS.
- Prompt variant (if applicable): retell prompt v6
- Next experiment (smallest change to try): measure e2e latency on the next call; if still above 1.5 s, try model_high_priority.
