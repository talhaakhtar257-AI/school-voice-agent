---
id: 0004
title: App foundation specification
stage: spec
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: 001-app-foundation
branch: 001-app-foundation
user: talha-professional97
command: /sp.specify
labels: ["spec", "foundation", "deployment", "health-check", "secrets"]
links:
  spec: specs/001-app-foundation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-app-foundation/spec.md
  - specs/001-app-foundation/checklists/requirements.md
  - history/prompts/001-app-foundation/
tests:
  - No NEEDS CLARIFICATION markers remain in spec.md
  - No unreplaced template placeholders remain
  - Framework names appear only in the Input line and Assumptions
  - FR-005 records the parent-facing deferral
  - All 16 checklist items pass
---

## Prompt

Create the foundation for the application.

A Next.js app with TypeScript, connected to Supabase, deployed on Vercel.

One public page that shows the school name "Al-Noor Public School" and the
line "Admissions Assistant". Nothing else on it yet.

Set up the database connection and prove it works with a simple health check
that confirms the app can reach Supabase.

Set up environment variables properly so no keys are ever written in the code.

This feature is complete when the site is live on a public https URL and the
health check passes.

## Response snapshot

Wrote the specification for feature 001. Three questions were resolved with the
maintainer before drafting, so no `[NEEDS CLARIFICATION]` markers were needed.

**A constitutional conflict was surfaced rather than built past.** The request
asks for a public page showing only the school name and one line — "Nothing else
on it yet". Principle VII and `CLAUDE.md` require the office phone number on every
parent-facing screen, and Principle IV requires every parent-facing string in Urdu
and English. Governance requires stopping and saying so. The maintainer ruled the
page a technical placeholder, so the deferral became FR-005: the page is explicitly
NOT parent-facing, and Urdu plus the office number MUST be added before its address
reaches any parent.

**The completion criterion depends on accounts that do not exist.**
`CLAUDE.local.md` still shows the hosting account and database project as
`FILL THIS IN`. The maintainer chose to keep the full criterion — live https URL —
and carry account setup into the task list as guided steps they perform.

**`main` was committed first.** The repository had zero commits, so `main` had no
ref, and `create-new-feature.ps1` runs `git checkout -b`, which on an unborn branch
renames rather than branches. Running it first would have destroyed `main` and left
no base to merge into. Committed 37 files as `3ebf7b1`, verified no credential file
was included, then branched.

The specification is written in outcome terms rather than tooling terms: the stack
is already fixed by the constitution, so restating it would add nothing and would
fail the quality checklist. Framework names survive only in the verbatim Input line
and in Assumptions, where their absence from the requirements is explained.

Three user stories, each independently testable: the site is live and identifies
the school (P1); anyone can confirm the database is reachable (P2); the project
holds no secrets (P3). Thirteen functional requirements, two non-functional, six
measurable success criteria, five edge cases, and an explicit Out of Scope list.

## Outcome

- ✅ Impact: Feature 001 has a specification that a non-developer can verify
  against, with the Urdu and office-phone debt recorded as a requirement rather
  than left in conversation. `main` now exists as a real base branch.
- 🧪 Tests: All five verification checks pass; all 16 checklist items pass on the
  first iteration.
- 📁 Files: 2 written, 2 directories created, 1 commit made.
- 🔁 Next prompts: `/sp.plan` for feature 001. `/sp.clarify` is not needed — the
  ambiguities were resolved before drafting rather than marked.
- 🧠 Reflection: The valuable output was not the specification but the conflict it
  exposed. "Nothing else on it yet" reads as a simplification and is actually a
  request to skip two ratified principles. A constitution earns its keep the first
  time it makes an innocuous-sounding request stop and get a decision.

## Evaluation notes (flywheel)

- Failure modes observed: `create-new-feature.ps1` fails on Windows PowerShell 5.1.
  Line ~`Join-Path $repoRoot 'history' 'prompts' $branchName` uses the
  three-argument form of `Join-Path`, which exists only in PowerShell 6+. On 5.1
  it throws `PositionalParameterNotFound`. The branch, the specs directory and the
  spec skeleton are all created before that line, so the failure is partial: only
  `history/prompts/<branch>/` is missing, and no JSON is printed. Created the
  directory by hand rather than re-running the script, which must run once only.
- Graders run and results (PASS/FAIL): PASS — clarification-marker scan, placeholder
  scan, framework-name placement, FR-005 presence, checklist completion, no
  credential file tracked in the commit.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Patch `create-new-feature.ps1` to nest
  the calls — `Join-Path (Join-Path $repoRoot 'history') 'prompts'` — so it works on
  Windows PowerShell 5.1. Not applied: it is a vendored SpecKit Plus file and the
  maintainer has not asked for it to be changed. It will fail the same way on every
  future `/sp.specify`.
