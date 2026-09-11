---
id: 0035
title: Specify voice agent API
stage: spec
date: 2026-09-11
surface: agent
model: claude-sonnet-5
feature: 006-voice-agent-api
branch: 006-voice-agent-api
user: talhaakhtar257-AI
command: /sp.specify
labels: [spec, calls, unanswered-questions, feature-006]
links:
  spec: specs/006-voice-agent-api/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/006-voice-agent-api/spec.md (new)
  - specs/006-voice-agent-api/checklists/requirements.md (new)
  - .specify/scripts/powershell/create-new-feature.ps1 (fixed — Join-Path bug)
tests:
  - Requirements checklist — all items pass, no NEEDS CLARIFICATION markers
---

## Prompt

Build the voice-agent API that the admin dashboard's Calls, Health, Charts, and Gap List screens all depend on. This is server-side only — no screens, no UI. It gives the Retell agent a place to report what happened after a conversation ends, and gives the dashboard real data to read instead of permanent empty states.

Two new tables, both already named in the project's database rules:

1. calls — one row per completed conversation. Holds: the transcript (both the parent's and the agent's turns, in order, with Urdu script preserved correctly), which language the call was mostly in, how long the call lasted, when it started, and an outcome: answered, transferred, lead_captured, or dropped. Correlates to a lead via the same retell_call_id the leads table already stores, but is not a hard foreign key — a call can exist with no matching lead (parent hung up before giving details) and a lead can exist with no matching call yet (webhook arrives late or fails).

2. unanswered_questions — one row per question the agent could not answer during a call, logged as it happens (not pre-aggregated) — the dashboard's Gap List will group and rank these by frequency later, in feature 004, not here. Holds the question text, when it was asked, and which call it happened during, if known.

One endpoint for Retell to call when a conversation ends: it accepts the outcome, transcript, language, duration, and a list of any unanswered questions from that call, saves the calls row and any unanswered_questions rows together, and is guarded by the same shared-secret header pattern as POST /api/leads — reject anything without it, never leak a database error to the caller.

Every field on both tables is optional except id and the timestamps, same rule as leads — a call record that arrives incomplete is still saved, not rejected.

Out of scope: the calls table's data does not get created by this feature under Retell only — a completed call can also be inserted manually for testing but that's not a defined user flow. Out of scope entirely: the six dashboard screens themselves (feature 004 owns all of that), agent on/off and working-hours settings (also owned by 004's Settings screen), page-visit and funnel-source tracking on the public landing page (still an unowned gap, flagged but not fixed here), and any change to the leads table or its endpoint (both already exist and are untouched).

## Response snapshot

Created branch `006-voice-agent-api` off `main` (renamed once, from an
earlier manual `git checkout -b` the user ran directly, after confirming the
scope should cover both `calls` and `unanswered_questions` together rather
than just the latter). The project's own `create-new-feature.ps1` script hit
a real bug — a 4-argument `Join-Path` call, which Windows PowerShell 5.1
doesn't support (that's a PowerShell 7+/Core feature) — confirmed to be the
only instance of that pattern across all the SDD scripts, and fixed with the
user's approval before continuing.

Wrote spec.md with three user stories (call records kept permanently,
unanswered questions logged individually, partial/malformed reports handled
gracefully), 12 functional requirements, two key entities, five measurable
success criteria, and an Assumptions section resolving three genuinely
open questions (duplicate retell_call_id handling, duration's unit,
transcript's stored shape) with stated reasoning rather than leaving
NEEDS CLARIFICATION markers — consistent with drafting complete artifacts
over blocking on questions. Requirements checklist passes on first draft.

## Outcome

- ✅ Impact: feature 006 has a complete, validated spec ready for `/sp.plan` — the dependency the remaining 004 dashboard screens (Calls, Health, Charts, Gap List) are blocked on.
- 🧪 Tests: requirements checklist — all items pass.
- 📁 Files: spec.md + checklists/requirements.md (new); one script bugfix.
- 🔁 Next prompts: `/sp.plan` for feature 006, then `/sp.tasks`, then implementation (migration approval needed for the two new tables).
- 🧠 Reflection: n/a

## Evaluation notes (flywheel)

- Failure modes observed: the SDD tooling script itself had a Windows-PowerShell-5.1 incompatibility bug, caught and fixed rather than worked around silently each time.
- Graders run and results (PASS/FAIL): requirements checklist PASS (all items, first draft).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
