---
id: 0062
title: Focused emails, knowledge from call, steady voice
stage: green
date: 2026-09-28
surface: agent
model: claude-opus-5-5
feature: 011-tester-feedback
branch: 011-tester-feedback
user: talhaakhtar257-AI
command: plan mode, then build
labels: ["email", "knowledge", "retell-prompt", "voice"]
links:
  spec: specs/011-tester-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - lib/calls/retell-api.ts
 - lib/email/info-pack.ts
 - lib/email/send-summaries.ts
 - lib/email/templates.ts
 - app/api/send-details/route.ts
 - app/api/retell/webhook/route.ts
 - lib/content/schema.ts
 - lib/knowledge/from-call.ts (new)
 - app/dashboard/knowledge/actions.ts
 - components/leads/add-to-knowledge.tsx (new)
 - components/leads/lead-details.module.css
 - app/dashboard/leads/[id]/page.tsx
 - app/dashboard/knowledge/page.tsx
 - app/dashboard/knowledge/[id]/page.tsx
 - lib/strings/knowledge.ts
 - lib/strings/lead-details.ts
 - docs/retell-agent-prompt.md (prompt v8)
 - Retell: prompt v8, send_details.class_wanted, voice temperature 0.3 + eleven_v3, published
tests:
 - renderInfoPack on live content: Playgroup (its fee only, no "Class 1 and above" documents), no class (no fee table), Class 6 (its fee, all documents), nothing requested (no details section)
 - callToKnowledgeText: name, phone, email and a 13-digit ID removed; "quality" untouched
 - npx tsc --noEmit, npm run lint (one old warning), npm run build: pass
 - Retell diff before push: exactly the four intended prompt lines
---

## Prompt

on email, he gave me doc detials for every class, fee details for every class whcih is wrong, AI should give me docs, fee and required details only which i need or which i asked and in admin section > Leads/overview > details: It should have an option to feed the data to knowlegdebase and when ai tell ducment list tell in point by point and ai agent was changing she was good in start but change the voice in between and end and at the time of swithing language

## Response snapshot

The test call (Playgroup) had no class saved, so the email listed all 13 classes' fees and every document, and the after-call email always sent every topic. Now: the webhook reads the send_details calls from Retell and the after-call email repeats only those topics; fees show only the parent's class (no class → a line asking for it); "(Class N and above)" documents are dropped for younger classes; send_details takes class_wanted. Fixed an old bug that dropped the "4" from "4 recent passport-size photos". Added "Add to Knowledge" on the lead page: the call's Q&A becomes a draft Knowledge document with names, phones, emails and ID numbers removed, opened in the editor; nothing reaches parents before Publish. Prompt v8 speaks lists point by point for the child's class and saves the class immediately. Voice temperature 0.92 → 0.3 on eleven_v3 to stop the voice drifting on language switches. User chose the Add-to-Knowledge button and steadying the same voice.

## Outcome

- ✅ Impact: parent emails carry only what was asked, for their class; staff can teach the assistant from a real call.
- 🧪 Tests: render checks on live content, privacy check, tsc/lint/build pass.
- 📁 Files: 16 repo files, Retell LLM and agent.
- 🔁 Next prompts: test call — ask for Playgroup documents and fee by email, switch English↔Urdu; click Add to Knowledge on that lead.
- 🧠 Reflection: the Add to Knowledge button was not clicked in a browser (no staff password in this session); the user checks it.

## Evaluation notes (flywheel)

- Failure modes observed: local DNS cannot resolve api.retellai.com; scripts use Google DNS.
- Graders run and results (PASS/FAIL): PASS.
- Prompt variant (if applicable): prompt v8.
- Next experiment (smallest change to try): if the voice still drifts, test ElevenLabs Multilingual v2 in one call.
