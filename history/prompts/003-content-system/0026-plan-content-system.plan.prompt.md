---
id: 0026
title: Plan the school content system
stage: plan
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: 003-content-system
branch: 003-content-system
user: talhaakhtar257-AI
command: /sp.plan
labels: [plan, feature-003, content, sdd]
links:
  spec: specs/003-content-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-content-system/plan.md (new)
  - specs/003-content-system/research.md (new)
  - specs/003-content-system/data-model.md (new)
  - specs/003-content-system/contracts/content-api.md (new)
  - specs/003-content-system/quickstart.md (new)
  - merge commit 798b4f4 (main -> 003-content-system, brings features 001 + 002)
tests:
  - npm run build on 003-content-system after the merge — pass
commits:
  - 798b4f4 Merge main into 003-content-system
  - d9c5c10 plan: 003 content system
---

## Prompt

start building as our spec.

## Response snapshot

Feature 002 is complete and merged into main, so feature 003 is clear to start
(sequencing gate passes). The 003 branch had only a spec — no plan, no tasks, no
code — and had branched off before 001/002 merged.

Actions:
1. Switched to 003-content-system and merged main into it (798b4f4) so it has the
   app foundation and staff login this feature builds on. Build passes.
2. Ran /sp.plan and drafted the full Phase 0/1 artifact set:
   - plan.md — JSON-document-per-version storage; atomic publish_content Postgres
     function; optimistic concurrency on the draft; keyword-match test tool (no
     LLM); zod for validation; GET /api/content gated by RETELL_WEBHOOK_SECRET
     via an X-Agent-Secret header. Constitution check passes. Six assumptions
     flagged at the top for the maintainer.
   - research.md — nine decisions (D-001..D-009) with rationale and alternatives.
   - data-model.md — content (two rows, draft/live) and content_history tables;
     publish_content function; RLS matrix; the ContentDoc jsonb shape and its
     validation rules.
   - contracts/content-api.md — GET /api/content request/response contract, 200
     published / 200 not-published / 401 / 405 / 500, with a curl test block.
   - quickstart.md — a nine-part click-through covering the editor, bilingual
     gap, test tool, publish confirmation, the API endpoint, history, escalation
     removal, and the 360px check.
3. update-agent-context.ps1 only added a spurious BOM to CLAUDE.md; reverted it.
4. Committed (d9c5c10) and pushed the branch.

## Outcome

- ✅ Impact: feature 003 has a complete, reviewable implementation plan and design set.
- 🧪 Tests: build passes on the merged branch; no code written yet.
- 📁 Files: 5 new spec docs, +751 lines; branch pushed.
- 🔁 Next prompts: maintainer reviews the six assumptions in plan.md (JSON storage, keyword test tool, zod, shared-secret choice, English admin chrome, no roles); then /sp.tasks; then implement, migration first (needs explicit approval per .claude/rules/database.md).
- 🧠 Reflection: the JSON-document model makes FR-013 "never a mixture" true by construction rather than by transaction care — the simplest thing that satisfies the spec's hardest requirement.

## Evaluation notes (flywheel)

- Failure modes observed: update-agent-context.ps1 wrote a BOM into CLAUDE.md.
- Graders run and results (PASS/FAIL): build PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): confirm assumptions before /sp.tasks so tasks are not written against guesses.
