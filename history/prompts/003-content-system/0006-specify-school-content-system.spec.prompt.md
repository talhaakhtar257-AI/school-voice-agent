---
id: 0006
title: Specify school content system
stage: spec
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: 003-content-system
branch: 003-content-system
user: talha-professional97
command: /sp.specify
labels: ["spec", "content", "draft-live", "publishing", "bilingual"]
links:
  spec: specs/003-content-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/003-content-system/checklists/requirements.md
  - history/prompts/003-content-system/0006-specify-school-content-system.spec.prompt.md
tests:
  - Zero occurrences of NEEDS CLARIFICATION in spec.md
  - All mandatory sections present - User Scenarios and Testing, Requirements, Success Criteria
  - Four user stories present, each with priority, independent test and acceptance scenarios
  - FR-001 through FR-029 present and each states one observable behaviour
  - SC-001 through SC-008 present and each carries a number or a 100% condition
  - 16 of 16 quality checklist items pass on the first iteration
  - No unresolved template placeholders remain in this PHR
---

## Prompt

Build the school content system. This is the knowledge the voice agent uses to
answer parents.

The content has four levels:
1. Facts: fees per class, age criteria per class, class list, admission dates,
   office hours
2. Policies: admission process, document requirements
3. FAQs: common parent questions with answers
4. Escalation topics: subjects the agent must never answer and must pass to a
   human, such as discounts and special cases

Requirements:
- A database table storing this content, with a draft version and a live version
- An admin screen where staff can edit every field
- A Test button that lets staff try the draft version before it goes live
- A Publish button that makes the draft become live
- A change history recording what changed, when, and by whom
- An API endpoint that returns the current LIVE content as JSON, for the voice
  agent to read

Staff must never be able to publish by accident. Publishing is always a
deliberate click.

## Response snapshot

A specification for this exact description already existed at
`specs/003-content-system/spec.md`, written during an earlier session on the same branch and
recording the same input word for word. That earlier run stopped after writing the spec: the
quality checklist directory was empty and no PHR had been written.

Rather than regenerate the specification, the maintainer chose to finish the incomplete run.
The existing spec was kept unchanged and validated against the sixteen quality criteria in
step 6 of `/sp.specify`. All sixteen pass on the first iteration, so no spec edits followed
and the command's re-validation loop did not run.

The specification defines four prioritised user stories — the agent reading only published
content (P1), staff editing the draft (P2), staff testing the draft before it goes live (P3),
and deliberate publishing with confirmation and history (P4) — supported by twenty-nine
functional requirements grouped as content structure, language, draft and live, access,
testing the draft, history, data safety and presentation. Three key entities are named:
Content, Content change record, and Escalation topic. Eight measurable success criteria and
seven edge cases are recorded, along with six assumptions and an out-of-scope list.

Two validation judgements were documented in the checklist notes rather than passed
silently. First, FR-015, FR-016 and SC-006 use the words "endpoint" and "shared secret";
these were kept because they are the maintainer's own vocabulary and are fixed by the
constitution's Technology and Scope Constraints, and abstracting them would reduce clarity
for a non-technical reader. Second, the absence of NEEDS CLARIFICATION markers was confirmed
by search rather than by reading alone.

`create-new-feature.ps1` was deliberately not run — the branch and spec file it creates both
already exist, and the command specifies it runs once per feature. The repository has no git
remote, so the command's remote-branch numbering steps were inapplicable. No commit was made;
the working tree also carries an unrelated edit to `CLAUDE.md` from a separate task, so
committing here would have bundled two unrelated changes.

One blocking issue for the next stage was found and reported: the spec assumes the
application foundation from feature 001 exists, but there is no `package.json` on any branch,
including `001-app-foundation`. Feature 001 has to be built before 003 can be implemented.

## Outcome

- ✅ Impact: Feature 003 reaches a complete, recorded specification state. The spec is
  validated at 16 of 16 quality criteria and is ready for `/sp.clarify` or `/sp.plan`.
- 🧪 Tests: Seven validation assertions, listed in the `tests:` block above, all pass.
- 📁 Files: Two created — the requirements checklist and this record. `spec.md` unchanged.
- 🔁 Next prompts: `/sp.plan` to design the implementation, or `/sp.clarify` first if the
  draft-and-live storage shape needs settling. Before either, decide how feature 001
  (application foundation) gets built, since 003 depends on it.
- 🧠 Reflection: Re-running a command whose output already exists is a normal way to resume
  after a session ends. Checking the repository state before generating anything avoided
  overwriting sound work and turned the run into a much smaller job — finishing two missing
  artifacts instead of rewriting a specification.

## Evaluation notes (flywheel)

- Failure modes observed: the earlier `/sp.specify` run ended after step 5 and produced
  neither the step 6a checklist nor a PHR, leaving the feature in a state that looked
  finished from the spec file alone. Separately, the command's PHR instructions point at
  `.specify/scripts/bash/create-phr.sh`, which does not exist in this repository — only
  PowerShell scripts are present, and none of them creates a PHR. The documented
  write-it-by-hand fallback was used.
- Graders run and results (PASS/FAIL): PASS — 16 of 16 specification quality checklist items;
  PASS — zero NEEDS CLARIFICATION markers; PASS — zero unresolved template placeholders.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): add a `create-phr.ps1` beside the existing
  PowerShell scripts, so the PHR step stops depending on a script path that is absent on
  Windows and the record gets written even when a run is cut short.
