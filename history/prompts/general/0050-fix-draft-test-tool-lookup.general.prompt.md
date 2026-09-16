---
id: 0050
title: Fix draft test tool lookup
stage: general
date: 2026-09-16
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhaakhtar257-AI
command: none
labels: ["content", "test-tool", "simulate", "dashboard"]
links:
  spec: specs/003-content-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - lib/content/simulate.ts
 - lib/content/simulate-sources.ts (new)
tests:
 - 50 scenarios from docs/agent-test-scenarios.md run against the live published content through the compiled lib/content/simulate.ts — 25 OK before, 42 OK after (3 known limitations, 5 behaviour-only)
 - npx tsc --noEmit (pass)
 - npm run lint (pass after removing stray compiled .js from the working tree)
 - npm run build (pass)
---

## Prompt

yes

## Response snapshot

Ran the 50 test scenarios against the published content and found the dashboard's "Test the draft" tool, not the content, was at fault: it searched only FAQs, programs and timings, so it never looked at the admission process or the document list, and it had no plural handling, so "discount" missed the topic "Fee discounts…".

Changes:
- New `lib/content/simulate-sources.ts` builds candidates from the facts (class names, fees, ages), admission dates (scored against the real labels), office hours, school timings, the two policy texts and the school profile (about, address, figures).
- `lib/content/simulate.ts` now stems plurals, uses a larger stop-word list, and ranks escalation separately: the subject only (never the boilerplate hand-off wording), with a higher bar of 0.4, winning ties.
- Long prose can only score up to 0.5 on its own text, so the admission process stopped being returned for unrelated questions.

Measured on the live content: 25 → 42 of 45 answerable scenarios. Remaining three are keyword-lookup limits, not content gaps: "does the fee increase every year?" returns the fee table, and two three-word questions match only one keyword, just under the one-third bar.

## Outcome

- ✅ Impact: the draft test screen now answers process, document, date, office-hours, address and figure questions, and no longer answers a plain fee question with the discount hand-off.
- 🧪 Tests: scenario run 42/45; tsc, lint and build pass.
- 📁 Files: 1 edited, 1 new.
- 🔁 Next prompts: Retell prompt v3 paste and a test call; dashboard auto-refresh; real office phone; rotate the shared secret.
- 🧠 Reflection: scoring a hand-off against its own boilerplate wording ("the school office will guide you") made common words like fee and office trigger escalation — subjects must be matched on subject text alone.

## Evaluation notes (flywheel)

- Failure modes observed: policies never searched; no stemming; escalation false positives after the first fix.
- Graders run and results (PASS/FAIL): 50-scenario run PASS at 42/45.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): score against Urdu text as well, so Urdu questions typed into the test screen match.
