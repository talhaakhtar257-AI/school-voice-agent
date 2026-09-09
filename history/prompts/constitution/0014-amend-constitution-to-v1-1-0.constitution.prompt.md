---
id: 0014
title: Amend constitution to version 1.1.0
stage: constitution
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: none
branch: 001-app-foundation
user: talhawork257@gmail.com
command: /sp.constitution
labels: [constitution, governance, bilingual, feature-sequencing]
links:
  spec: none
  ticket: none
  adr: none
  pr: none
files:
  - .specify/memory/constitution.md
  - .specify/templates/plan-template.md
  - .claude/rules/database.md
  - CLAUDE.md
tests:
  - "No unresolved placeholders in constitution.md — PASS"
  - "Version line reads 1.1.0 — PASS"
---

## Prompt

/sp.constitution. This project is an AI admissions assistant for a school in Karachi, Pakistan.
Parents talk to it in Urdu and English on a web page. It answers admission
questions and captures enquiries as leads for school staff to follow up.

NON-NEGOTIABLE PRINCIPLES

1. HONESTY. The agent never invents an answer. If something cannot be answered
   from approved content, it says it does not know and offers the school office.
2. NO AUTHORITY. It never confirms an admission, never offers a discount, never
   promises a seat. School staff decide.
3. DISCLOSURE. It says clearly that it is an AI when asked.
4. BILINGUAL PROSE. Every parent-facing sentence exists in Urdu and English.
   Language-neutral values such as fees, dates and ages are stored once, not
   duplicated per language.
5. CONFIRM BEFORE SAVING. Any phone number or name is read back to the parent
   and confirmed before it is stored.
6. NO SENSITIVE DATA. Never collect CNIC or B-Form numbers.
7. HUMAN EXIT. Every conversation has a route to a human.
8. SIMPLE OVER CLEVER. The maintainer is not an experienced developer. Prefer
   boring readable code and well-known libraries.
9. TESTABLE BY A NON-DEVELOPER. Every feature must be checkable by clicking.
10. SMALL STEPS. Many small working changes, never one large one.

TECH CONSTRAINTS
- Next.js App Router, TypeScript
- Supabase for database and staff authentication
- Deployed on Vercel
- Voice handled by Retell AI, configured outside this codebase
- No payments, no student portal, no file uploads in this phase

GOVERNANCE
- If a request conflicts with a principle above, stop and tell me.
- Never invent school data such as fees or dates. Ask me.
- Never start a new feature while the previous one is unimplemented.

## Response snapshot

Compared the restated text against constitution v1.0.0. Eight of the ten
principles, every technology constraint and two of the three governance rules
were already present and unchanged, so the amendment came down to two genuine
additions. Both are additive and neither permits something previously forbidden,
which makes this a MINOR bump to 1.1.0 rather than MAJOR.

Principle IV was renamed from "Bilingual" to "Bilingual Prose", because the new
clause draws a line the old title blurred. The rule now separates prose, which
must exist in both languages, from language-neutral values — a fee, a date, an
age, a class number, a phone number — which must be stored once and formatted for
display rather than duplicated into an Urdu column and an English column. The
rationale records why this matters concretely: a fee stored twice eventually
disagrees with itself when someone updates one column and misses the other, and
the agent then quotes a different price depending on which language the parent
happened to be speaking.

Governance gained a "Feature sequencing" rule: a new feature must not be started
while the previous one is unimplemented, where specification, planning and task
generation all count as starting, and "unimplemented" is judged by looking for
the code rather than for a specification. The rule's rationale names the incident
that prompted it — feature 002 received a specification, plan, research, data
model, quickstart and thirty-six tasks while feature 001 had never been built, so
every one of those tasks was blocked from the moment it was written.

Propagation, as the amendment procedure requires. `plan-template.md` had its
Principle IV gate reworded to test storage as well as translation, gained a
feature sequencing gate, and had its version reference updated to 1.1.0.
`CLAUDE.md` gained the language-neutral storage rule in its Urdu section and the
sequencing rule in its Don't list. `.claude/rules/database.md` gained a new
"Language in the schema" section stating that prose is stored twice and a
language-neutral value once; it is placed before Security because the `content`
table is where the rule first bites. That file had carried no language rule at
all, which is exactly the gap the amendment closes.

Validated: no unresolved placeholders, version line reads 1.1.0, dates in ISO
format.

## Outcome

- ✅ Impact: Constitution at v1.1.0. One principle materially expanded, one governance rule added, four files brought into line.
- 🧪 Tests: Placeholder scan PASS. Version line PASS.
- 📁 Files: Amended `.specify/memory/constitution.md`, `.specify/templates/plan-template.md`, `.claude/rules/database.md` and `CLAUDE.md`.
- 🔁 Next prompts: Finish feature 001 — create the Supabase project, add `.env.local`, deploy to Vercel — before any further work on feature 002.
- 🧠 Reflection: The sequencing rule was written from a mistake this project actually made, which is why its rationale names the incident rather than arguing in the abstract.

## Evaluation notes (flywheel)

- Failure modes observed: `.claude/rules/database.md` held no language rule whatsoever, so a schema designed against it could have duplicated a fee per language without breaking any written rule.
- Graders run and results (PASS/FAIL): Placeholder scan — PASS. Version consistency between constitution and plan template — PASS.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): When amending, diff the restated text against the current version first; here it reduced ten principles and three governance rules to two real changes.
