---
id: 0055
title: Implement stage 2 leads calls overview
stage: green
date: 2026-09-21
surface: agent
model: claude-opus-5
feature: 010-client-feedback
branch: 010-client-feedback
user: talhaakhtar257-AI
command: /sp.implement (stage 2, T001–T026)
labels: ["leads", "calls", "webhook", "email-box", "lead-details", "overview", "migration"]
links:
  spec: specs/010-client-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - supabase/migrations/20260921100000_calls_and_lead_fields.sql (new, applied)
 - lib/calls/{mask,retell-api,schema,queries}.ts (new)
 - lib/leads/{schema,queries,rows}.ts
 - lib/api/secret.ts
 - app/api/leads/route.ts
 - app/api/retell/webhook/route.ts (new)
 - app/api/leads/email/route.ts (new)
 - components/landing/call/{call-provider,call-overlay,email-box}.tsx, call.module.css
 - app/dashboard/leads/[id]/page.tsx (new)
 - components/leads/{leads-table,conversation,lead-summary,lead-status-control}.tsx, lead-details.module.css
 - components/dashboard/lead-drawer.tsx (deleted)
 - lib/dashboard/{pk-time,period-stats}.ts (new), format.ts
 - components/dashboard/stats-strip.tsx + .module.css (new)
 - app/dashboard/page.tsx
 - lib/strings/{lead-details (new),dashboard,landing-call}.ts
 - docs/retell-agent-prompt.md (prompt v5)
 - .claude/rules/api.md, .env.example
tests:
 - npx tsc --noEmit (pass)
 - npm run lint (pass, 1 existing warning)
 - npm run build (pass)
 - local curl: webhook 401 without secret, 200 ignored for other events; email box 403 without cookie, 400 bad email; lead save twice with the same call id -> one row, confirmed name kept, unconfirmed name ignored
---

## Prompt

yes

(Approval of the database changes, then continue: /sp.tasks and implementation of stage 2.)

## Response snapshot

Applied the calls/lead-fields migration (calls table with RLS read-only for staff; leads.email, summary, call_duration_seconds; unique call id). Built the Retell webhook (query secret, re-fetch every call from Retell's API, agent check, masked transcript and summary, idempotent merge), lead upsert by call id accepting flat and wrapped bodies, the optional email box on the call screen tied to session.callId and the visitor cookie, the lead details page (summary on top, details and status, full conversation), the new leads table columns, and the Overview Today/This week strip with the 10 newest leads. Prompt v5 saves the lead right after the phone is confirmed and mentions the email box.

## Outcome

- ✅ Impact: stage 2 built; one test lead (call_test_010, names prefixed TEST) left in the database from the upsert check.
- 🧪 Tests: tsc, lint, build, local route checks pass. Webhook and email box need RETELL_API_KEY in Vercel before a real call can be verified.
- 📁 Files: ~20 new, ~15 edited, 1 deleted.
- 🔁 Next prompts: maintainer adds RETELL_API_KEY, sets the webhook, turns args-only off on save_lead, pastes prompt v5; then a test call; then stage 3.
- 🧠 Reflection: the consent rule ("consent false -> no phone") was in the API rules but not in the old insert; the shared leadValues() now applies it to both insert and update.

## Evaluation notes (flywheel)

- Failure modes observed: a heredoc with `python -` hung the shell; a string-replace script failed on CRLF line endings.
- Graders run and results (PASS/FAIL): build PASS; upsert check PASS.
- Prompt variant (if applicable): retell prompt v5
- Next experiment (smallest change to try): verify call_started arrives for web calls, so the live count works in stage 4.
