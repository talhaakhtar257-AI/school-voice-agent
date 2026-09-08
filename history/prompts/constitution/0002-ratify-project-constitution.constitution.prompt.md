---
id: 0002
title: Ratify project constitution
stage: constitution
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talha-professional97
command: /sp.constitution
labels: ["constitution", "governance", "principles", "setup"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
  - CLAUDE.md
  - .claude/rules/api.md
tests:
  - No bracket placeholders remain in constitution.md
  - No TODO( markers remain in constitution.md
  - Version footer reads 1.0.0 with both dates 2026-09-09
  - Constitution Check placeholder gone from plan-template.md
  - Ten principle gates present in plan-template.md
  - CLAUDE.md still under 200 lines
---

## Prompt

This project is an AI admissions assistant for a school in Karachi, Pakistan.
Parents talk to it in Urdu and English on a web page. It answers admission
questions and captures enquiries as leads for school staff to follow up.

NON-NEGOTIABLE PRINCIPLES

1. HONESTY. The agent never invents an answer. If something cannot be answered
   from approved content, it says it does not know and offers the school office.
2. NO AUTHORITY. It never confirms an admission, never offers a discount, never
   promises a seat. School staff decide.
3. DISCLOSURE. It says clearly that it is an AI when asked.
4. BILINGUAL. Urdu and English are equal. Mixed sentences are normal and must work.
5. CONFIRM BEFORE SAVING. Any phone number or name is read back to the parent and
   confirmed before it is stored.
6. NO SENSITIVE DATA. Never collect CNIC or B-Form numbers.
7. HUMAN EXIT. Every conversation has a route to a human.
8. SIMPLE OVER CLEVER. The maintainer is not an experienced developer. Prefer
   boring readable code and well-known libraries. No clever abstractions.
9. TESTABLE BY A NON-DEVELOPER. Every feature must be checkable by clicking, not
   by reading code.
10. SMALL STEPS. Prefer many small working changes over one large one.

TECH CONSTRAINTS
- Next.js with the App Router, TypeScript
- Supabase for database and staff authentication
- Deployed on Vercel
- Voice handled by Retell AI, configured outside this codebase
- No payments, no student portal, no file uploads in this phase

GOVERNANCE
- If a request conflicts with a principle above, stop and tell me instead of
  building it.
- Never invent school data such as fees or dates. Ask me.

## Response snapshot

Filled `.specify/memory/constitution.md` from the pasted text at version 1.0.0,
ratified 2026-09-09. The template offered six principle slots; the ratifying text
supplied ten, so four sections were added — the user's count wins over the
template's.

Each principle was written as a testable MUST or MUST NOT with a rationale, per
the command's prohibition on vague language. Sections 2 and 3 became "Technology
and Scope Constraints" and "Development Workflow and Quality Gates", the latter
carrying the six-item Definition of Done already agreed in `CLAUDE.md`.

Cross-checked all ten principles against the rules already committed in
`CLAUDE.md` and `.claude/rules/`. Eight matched. Three needed action, and both
open questions were put to the maintainer rather than resolved silently:

- **Principle V conflicted with `.claude/rules/api.md`.** The constitution extends
  read-back confirmation to names; `api.md` said "save what you have". Maintainer
  chose: drop the unconfirmed name, still save the lead — mirroring how the phone
  already behaves, and preserving `CLAUDE.md`'s "An incomplete lead is still saved".
- **Principles III and VII were absent from `CLAUDE.md`'s product-rules list**,
  which claims to derive from the constitution. Maintainer chose to propagate, so
  both were added.

Propagation: filled the `Constitution Check` gate in
`.specify/templates/plan-template.md` with ten pass/fail checkboxes, one per
principle, each phrased so a feature plan can genuinely fail it. Verified that
`spec-template.md`, `tasks-template.md` and all fourteen `.claude/commands/*.md`
need no change — their only constitution references are PHR routing.

## Outcome

- ✅ Impact: The project has binding principles. `/sp.plan` now has real gates to
  check a feature against, and `/sp.analyze` has a rule set to call CRITICAL
  violations against. `CLAUDE.md`'s claim that its product rules come from the
  constitution is now true.
- 🧪 Tests: All six verification checks pass. No placeholders, no deferred TODOs,
  ten gates present, `CLAUDE.md` at 164 lines.
- 📁 Files: 1 written from template, 3 amended.
- 🔁 Next prompts: `/sp.specify` for Feature 1. Optionally commit first —
  suggested message `docs: ratify project constitution v1.0.0`, which would be
  this repository's first commit.
- 🧠 Reflection: The valuable part was not transcribing the paste but diffing it
  against rules already committed. Two principles had no home in `CLAUDE.md` and
  one contradicted `api.md` outright — none of which is visible without reading
  the pasted text and the existing rules side by side.

## Evaluation notes (flywheel)

- Failure modes observed: The command's step 3 instructs running
  `.specify/scripts/bash/create-phr.sh`. That script does not exist — this project
  shipped only `.specify/scripts/powershell/`, with no PHR script in it. Wrote the
  PHR directly with agent tools, which is the command's own preferred path.
- Graders run and results (PASS/FAIL): PASS — placeholder scan, TODO scan, version
  footer format, plan-template gate replacement, gate count, CLAUDE.md line count.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): Principle IV says mixed Urdu-English
  sentences must work, but `.claude/rules/frontend.md` prescribes `dir="auto"`,
  which picks direction from the first strong character in an element. A sentence
  opening in English but mostly Urdu will render left-to-right and read wrong.
  Test with a real mixed transcript the first time Urdu renders on screen, and
  revisit the rule if it fails.
