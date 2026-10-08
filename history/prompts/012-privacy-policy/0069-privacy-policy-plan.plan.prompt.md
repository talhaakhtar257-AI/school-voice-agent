---
id: 0069
title: Privacy policy plan
stage: plan
date: 2026-10-08
surface: agent
model: claude-opus-5-5
feature: 012-privacy-policy
branch: 012-privacy-policy
user: talhawork257
command: /sp.plan
labels: ["privacy", "plan", "traceability", "masking"]
links:
  spec: specs/012-privacy-policy/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/012-privacy-policy/plan.md
  - specs/012-privacy-policy/research.md
  - specs/012-privacy-policy/data-model.md
  - specs/012-privacy-policy/contracts/privacy-page.md
  - specs/012-privacy-policy/quickstart.md
  - history/prompts/012-privacy-policy/0069-privacy-policy-plan.plan.prompt.md
tests:
  - Constitution Check (pre and post design) — all 11 gates pass
---

## Prompt

continue

## Response snapshot

Ran `/sp.plan` for 012-privacy-policy. I read the landing page frame:
- `app/page.tsx`
- `SiteHeader`, `SiteFooter`, `AnnouncementBar`, `DocumentLanguage`, `LanguageToggle`
- `PreCallForm`, `MicExplainer`, `AgentCard`
- `lib/office.ts`, `lib/language*.ts`, the `setLanguage` action
- the Next.js 16 `generateMetadata` docs

**Decisions.**
- **Page:** a server-rendered `app/privacy/page.tsx` that reuses the announcement bar (office phone), ribbon, footer and language toggle. It has a small new header, without `CallProvider`, so no Retell JavaScript loads.
- **Wording:** in `lib/strings/privacy.ts` and `privacy-sections.ts`. The draft flag and the "last updated" date are each stored once.
- **Links:**
  - In the call window (the pre-call consent tick and the mic explainer), the link opens a new tab, so typed details and a live call survive without browser storage.
  - In the footer and agent card, the link opens in the same tab.
- **Contradictory sentences:** reworded in `lib/strings/landing.ts`.

**Traceability.** Built the D-8 table mapping 20 policy statements to code or settings. This found that `lib/calls/mask.ts` misses Urdu and Arabic-Indic digits, so the plan widens `ID_NUMBER` (D-7) to make the "hidden if spoken" statement true and close a Constitution VI gap.

**Owner checks** go in `quickstart.md`:
- the Retell "opt out of data storage" setting
- the retention sentence
- the approval flag

**Agent context script.** `update-agent-context.ps1` only added a UTF-8 BOM to `CLAUDE.md`, so that was reverted. No ADR was suggested, because the decisions are local to one page.

## Outcome

- ✅ Impact: the plan is ready for `/sp.tasks`, in 4 independently building steps.
- 🧪 Tests: Constitution Check passes before and after design. Verification is the quickstart plus build, tsc and lint.
- 📁 Files: plan, research, data-model, contracts/privacy-page, quickstart.
- 🔁 Next prompts: `/sp.tasks`, then `/sp.implement`. Owner: switch off Supabase sign-up; check the Retell data-storage setting; confirm retention.
- 🧠 Reflection: deriving the policy from migrations and lib code exposed a real masking gap. A privacy-policy feature doubles as a privacy audit.

## Evaluation notes (flywheel)

- Failure modes observed: the agent-context script writes a BOM with no content change; the bash PHR script is missing.
- Graders run and results (PASS/FAIL): Constitution gates PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): make the update-agent-context script write UTF-8 without a BOM.
