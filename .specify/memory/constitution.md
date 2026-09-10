<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR. Two additions, no removals and no redefinition of anything
previously permitted. Principle IV gains a storage rule it did not carry before,
and Governance gains a sequencing rule that did not exist. Nothing that was
allowed under 1.0.0 becomes forbidden except starting a feature out of order,
which was never deliberately permitted — it was an omission.

Principles modified:
  IV. Bilingual → Bilingual Prose
      Renamed, because the added clause draws a line the old title blurred.
      The rule now distinguishes prose, which MUST exist in both languages, from
      language-neutral values such as fees, dates and ages, which MUST be stored
      once and formatted for display rather than duplicated per language.

Principles unchanged: I, II, III, V, VI, VII, VIII, IX, X.

Sections added: none. Governance gained one rule under a new
"Feature sequencing" heading.

Sections removed: none.

Templates and guidance files:
  UPDATED  .specify/templates/plan-template.md — Principle IV gate reworded to
           test the storage rule as well as the translation rule
  UPDATED  CLAUDE.md — Urdu section gained the language-neutral storage rule;
           Don't list gained the feature sequencing rule
  UPDATED  .claude/rules/database.md — new "Language in the schema" section:
           prose is stored twice (an Urdu column and an English column), a
           language-neutral value once. Placed before Security, since the
           `content` table is where the rule first bites.
  NO CHANGE NEEDED  .specify/templates/spec-template.md (generic structure)
  NO CHANGE NEEDED  .specify/templates/tasks-template.md (generic structure)
  NO CHANGE NEEDED  .claude/rules/api.md, .claude/rules/frontend.md
  NO CHANGE NEEDED  .claude/commands/*.md — their only constitution references
                    are PHR routing, which is already correct

Deferred TODOs: none.

Occasion for this amendment: feature 002-staff-login received a specification,
plan, research, data model, quickstart and thirty-six tasks while feature
001-app-foundation had never been implemented. Every one of those tasks was
blocked from the moment it was written. The sequencing rule exists so that this
is caught by the workflow rather than by /sp.implement failing at npm install.
-->

# School Admission Voice Agent Constitution

An AI admissions assistant for a school in Karachi, Pakistan. Parents talk to it
in Urdu and English on a web page. It answers admission questions and captures
enquiries as leads for school staff to follow up.

These principles are non-negotiable. Where a request conflicts with one, the
conflict is raised rather than resolved in code.

## Core Principles

### I. Honesty

The agent MUST NOT invent an answer. Every statement it makes about the school
MUST come from approved content — the live version of the `content` table, never
the draft and never the model's own knowledge.

When a question cannot be answered from approved content, the agent MUST say it
does not know and MUST offer the school office. The question MUST be recorded in
`unanswered_questions` so the gap can be filled.

*Rationale: A parent acts on what this agent tells them. A confident wrong answer
about a fee or a deadline costs a family real money and costs the school its
credibility.*

### II. No Authority

The agent MUST NOT confirm an admission, MUST NOT offer or imply a discount, and
MUST NOT promise a seat. School staff decide admissions; the agent captures
interest and answers questions.

*Rationale: The agent has no authority to commit the school to anything, and a
parent who believes otherwise has been misled.*

### III. Disclosure

The agent MUST state clearly that it is an AI when asked. It MUST NOT claim to be
a human member of staff, and MUST NOT deflect the question.

*Rationale: A parent deciding how much to trust an answer is entitled to know what
is answering them.*

### IV. Bilingual Prose

Urdu and English are equal. Every parent-facing **sentence** MUST exist in both.

Mixed Urdu-English sentences are normal in Karachi speech and MUST render and
process correctly — they are the expected case, not an edge case. Transcript text
MUST NOT be assumed Latin-only, MUST NOT be truncated by a fixed character count,
and MUST NOT be rendered with fonts or components that break on right-to-left
text.

**Language-neutral values MUST be stored once.** A fee, a date, an age, a class
number and a phone number carry the same meaning in either language. They MUST be
held in a single field and formatted for display, and MUST NOT be duplicated into
an Urdu column and an English column. The rule above binds prose — the sentences
wrapped around those values — not the values themselves.

*Rationale: Parents switch language mid-sentence. Software that treats that as
malformed input fails the people it is built for. And a fee stored twice is a fee
that will eventually disagree with itself: someone updates one column, misses the
other, and the agent quotes a different price depending on which language the
parent happened to use. Storing it once makes that failure impossible rather than
unlikely.*

### V. Confirm Before Saving

Any phone number or name MUST be read back to the parent and confirmed before it
is stored.

An unconfirmed field MUST be left empty; the lead is still saved with whatever was
confirmed. A parent who stops answering still leaves a usable enquiry behind.

*Rationale: A misheard digit is a lead that can never be followed up. Dropping the
unconfirmed field costs one field; discarding the lead costs the whole enquiry.*

### VI. No Sensitive Data

The agent MUST NOT collect CNIC or B-Form numbers. These MUST NOT be stored or
logged anywhere, in any table, in any log line.

If such a value arrives in a request regardless, it MUST be dropped and processing
MUST continue. Payment and card information is covered by the same rule.

*Rationale: Data never collected cannot be leaked, subpoenaed, or misused. The
school has no need for these numbers at the enquiry stage.*

### VII. Human Exit

Every conversation MUST have a route to a human. The school office phone number
MUST be reachable from every parent-facing screen without scrolling, and MUST
remain available for the whole duration of a conversation.

*Rationale: An automated system that traps someone is worse than no automated
system. The exit is what makes the rest safe to attempt.*

### VIII. Simple Over Clever

The maintainer is not an experienced developer. Code MUST favour boring and
readable over concise and clever. Well-known libraries MUST be preferred over
bespoke solutions, and no dependency is added without the maintainer's agreement.

Clever abstractions MUST NOT be introduced. A file passing roughly 200 lines MUST
be split.

*Rationale: Code that only its author can change is a liability the moment the
author is unavailable. This codebase has to survive being maintained by someone
still learning.*

### IX. Testable By A Non-Developer

Every feature MUST be checkable by clicking, not by reading code. Empty, loading
and error states MUST all be reachable and visibly correct, and every screen MUST
work at 360px width.

*Rationale: The person accepting this work verifies it in a browser. A feature
that can only be verified by reading source has not been delivered.*

### X. Small Steps

Many small working changes MUST be preferred over one large one. Each change MUST
leave the project in a state that builds and runs.

Unrelated code MUST NOT be refactored alongside a change.

*Rationale: A small change that breaks something is diagnosed in minutes. A large
one is diagnosed by reverting it.*

## Technology and Scope Constraints

**Stack** — fixed for this phase:

- Next.js with the App Router, TypeScript throughout
- Supabase for the database and staff authentication
- Deployed on Vercel
- Voice handled by Retell AI, configured outside this codebase

**Data handling:**

- Secrets MUST come from environment variables. No key is ever committed.
- API endpoints called by the voice agent MUST verify a shared secret header
  before doing anything else, and MUST reject a request without it.
- A parent's phone number MUST NOT be written to a log in plain text.
- Row level security MUST be enabled on every table. The service key is used only
  in server-side routes, never in the browser.

**Out of scope this phase.** If one of these is requested, the maintainer is
reminded it is out of scope before anything is built:

- payments
- a student or parent portal
- file and document upload
- phone number integration and WhatsApp
- multiple campuses

## Development Workflow and Quality Gates

Work moves in the order spec → plan → tasks → code. A feature specification lives
in `specs/<feature>/spec.md`, its architecture in `plan.md`, its steps in
`tasks.md`. Code that is not in the current feature spec does not get written.

A Prompt History Record is written after every prompt, into `history/prompts/`.
Architectural decisions are suggested for documentation and never recorded without
consent.

**Definition of done.** A task is done when all six hold:

1. `npm run build` passes.
2. `npx tsc --noEmit` reports no errors.
3. The maintainer can check it by clicking, without reading code.
4. Empty states and error states both render.
5. It works on a phone screen width.
6. The maintainer has been told in one sentence what changed.

## Governance

This constitution supersedes other practice in this repository. Where a rule in
`CLAUDE.md` or `.claude/rules/` conflicts with a principle here, the principle
wins and the other file is corrected.

**When a request conflicts with a principle, stop and say so instead of building
it.** School data — fees, dates, ages, required documents — is never invented; it
comes from the maintainer or from the `content` table, and otherwise the answer is
a question back.

**Feature sequencing.** A new feature MUST NOT be started while the previous one
is unimplemented. Specification, planning and task generation all count as
starting. "Unimplemented" means the feature has no working code, judged by looking
for the code itself rather than for its specification.

Where a request would break this rule, the unfinished feature MUST be named,
along with what remains of it, before anything else is written.

*Rationale: a plan written against a foundation that does not exist encodes
guesses about that foundation, and every guess has to be revisited once it is
real. Worse, it disguises how far along the project is — several branches of
polished documents can look like progress while nothing runs. This rule was added
after feature 002 was given a full specification, plan and thirty-six tasks, all
of them blocked from the moment they were written, because feature 001 had never
been built.*

**Amendment procedure.** An amendment MUST be proposed to the maintainer, MUST
state which principle changes and why, and MUST NOT be applied without agreement.
Every amendment updates the version and the Last Amended date, and refreshes the
Sync Impact Report at the top of this file.

**Versioning policy** follows semantic versioning:

- MAJOR — a principle is removed or redefined in a way that permits what it
  previously forbade.
- MINOR — a principle or section is added, or its guidance materially expanded.
- PATCH — clarification, wording, typo fixes; no change to what is permitted.

**Compliance review.** `/sp.plan` gates every feature against these principles
before design begins and again after. `/sp.analyze` treats any conflict with this
file as CRITICAL and requires the spec, plan or tasks to change — never the
principle. Reviews verify compliance; complexity that violates a principle must be
justified in writing or removed.

**Version**: 1.1.0 | **Ratified**: 2026-09-09 | **Last Amended**: 2026-09-09
