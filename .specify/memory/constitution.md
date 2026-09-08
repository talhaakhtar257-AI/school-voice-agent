<!--
SYNC IMPACT REPORT
==================
Version change: (unfilled template) → 1.0.0
Bump rationale: First ratification. No prior version existed; every value in the
file was a placeholder. MAJOR/MINOR/PATCH rules apply from the next amendment on.

Principles defined (10, from the ratifying text — the template offered 6 slots,
the ratifying text supplied 10, so four sections were added):
  I.    Honesty
  II.   No Authority
  III.  Disclosure
  IV.   Bilingual
  V.    Confirm Before Saving
  VI.   No Sensitive Data
  VII.  Human Exit
  VIII. Simple Over Clever
  IX.   Testable By A Non-Developer
  X.    Small Steps

Sections added:
  - Technology and Scope Constraints  (template slot SECTION_2)
  - Development Workflow and Quality Gates  (template slot SECTION_3)
  - Governance  (filled)

Sections removed: none.

Templates and guidance files:
  UPDATED  .specify/templates/plan-template.md — Constitution Check gate filled
           with ten pass/fail checks, one per principle
  UPDATED  CLAUDE.md — product-rules list gained Principle III (disclosure) and
           Principle VII (human exit); the lead rule now covers names as well
           as phone
  UPDATED  .claude/rules/api.md — name-confirmation rule added under
           "Saving leads"
  NO CHANGE NEEDED  .specify/templates/spec-template.md (generic structure)
  NO CHANGE NEEDED  .specify/templates/tasks-template.md (generic structure)
  NO CHANGE NEEDED  .claude/commands/*.md — their only constitution references
                    are PHR routing, which is already correct

Deferred TODOs: none. Ratification date confirmed as the date of adoption.
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

### IV. Bilingual

Urdu and English are equal. Every parent-facing string MUST exist in both.

Mixed Urdu-English sentences are normal in Karachi speech and MUST render and
process correctly — they are the expected case, not an edge case. Transcript text
MUST NOT be assumed Latin-only, MUST NOT be truncated by a fixed character count,
and MUST NOT be rendered with fonts or components that break on right-to-left
text.

*Rationale: Parents switch language mid-sentence. Software that treats that as
malformed input fails the people it is built for.*

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

**Version**: 1.0.0 | **Ratified**: 2026-09-09 | **Last Amended**: 2026-09-09
