---
id: 0056
title: Implement stages 3 4 5 knowledge live email
stage: green
date: 2026-09-22
surface: agent
model: claude-opus-5
feature: 010-client-feedback
branch: 010-client-feedback
user: talhaakhtar257-AI
command: /sp.implement (stages 3–5, T027–T050)
labels: ["knowledge", "pdf-import", "website-import", "live-calls", "takeover", "email", "resend", "retell"]
links:
  spec: specs/010-client-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - supabase/migrations/20260922100000_unanswered_answered_at.sql (new, applied)
 - lib/content/{schema,diff,simulate-sources}.ts
 - lib/knowledge/{pdf,html-text,crawl,draft}.ts (new)
 - lib/unanswered/list.ts
 - app/dashboard/knowledge/{page.tsx,[id]/page.tsx,actions.ts} (new)
 - app/dashboard/unanswered/page.tsx (now a redirect)
 - components/knowledge/{import-forms,answer-form,document-editor}.tsx, knowledge.module.css (new)
 - lib/calls/live.ts, app/dashboard/live/page.tsx, components/live/* (new)
 - components/dashboard/{nav-links,sidebar}.tsx, shell.module.css, app/dashboard/layout.tsx
 - lib/email/{resend,templates,send-summaries}.ts (new), app/api/retell/webhook/route.ts
 - components/leads/lead-summary.tsx, lib/strings/{knowledge,live-calls,lead-details,dashboard}.ts
 - next.config.ts (server action body limit 4.5 MB), package.json (unpdf)
 - docs/retell-agent-prompt.md, docs/agent-test-scenarios.md
tests:
 - npx tsc --noEmit (pass); npm run lint (pass, 1 existing warning); npm run build (pass)
 - unpdf extracted text from a generated one-page PDF in Node
 - Retell published v7 re-read through the API: tools, headers, secret, timers, prompt intact
---

## Prompt

check whole project is every thing fine and what is remaining

complete all work then i test call

## Response snapshot

Checked the project (build, live site, Retell v6, database, advisors) and then built the three remaining stages. Stage 3: Gap list renamed Knowledge with its own page per question and per document; answering a question adds a draft FAQ and marks it answered (new answered_at column); PDF import (unpdf, 4 MB — Vercel's body cap) and same-host website import (≤10 pages, private-address guard) into a draft knowledge list that the agent receives only after Publish. Stage 4: Live calls screen and menu badge from the calls table, 10-second refresh, watch/listen/take over through retell-client-js-sdk monitorCall with a server-held staff key (falls back to the site's public key), Call parent now marks the lead contacted. Stage 5: school and parent summary emails through Resend's HTTP API, claimed once per call, failures recorded and shown on the lead page. Pushed the knowledge wording to Retell via its API and published v7.

## Outcome

- ✅ Impact: all client feedback items are built; only the takeover spike (T038) needs a real live call.
- 🧪 Tests: tsc, lint, build pass; PDF extraction verified; Retell config verified.
- 📁 Files: ~30 new, ~15 edited.
- 🔁 Next prompts: maintainer test call; Resend account + 3 env vars; optional staff key; real office phone.
- 🧠 Reflection: Vercel's 4.5 MB request cap overrode the spec's 10 MB PDF limit; the spec's number was never reachable.

## Evaluation notes (flywheel)

- Failure modes observed: react-hooks lint rule on setState inside an effect (fixed with a deferred timer).
- Graders run and results (PASS/FAIL): build PASS.
- Prompt variant (if applicable): retell prompt v5 + knowledge wording (Retell v7)
- Next experiment (smallest change to try): monitorCall with the public key on a live call, to learn whether a separate staff key is needed.
