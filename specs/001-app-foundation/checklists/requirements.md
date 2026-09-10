# Specification Quality Checklist: Application Foundation

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-09
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

All items pass on the first validation pass. Two required deliberate handling, and
the reasoning is recorded here rather than left implicit.

**"No implementation details" — passes, with a caveat worth stating.** The
originating request named Next.js, TypeScript, Supabase and Vercel. Those names
survive in exactly two places: the verbatim `Input` line, which must not be
altered, and the Assumptions section, which explains *why* the specification does
not choose technology — the constitution's Technology and Scope Constraints already
fixed it. Every requirement and success criterion is written in outcome terms:
"reachable over https", "can reach its database", "no credential in any committed
file". A reader could satisfy this specification on a different stack and would not
learn the intended one from the requirements.

This was the item most at risk of failing, because a foundation feature is
substantially about infrastructure. The resolution was to specify what must be
*true* rather than what must be *installed*.

**"No [NEEDS CLARIFICATION] markers" — passes because the questions were asked
before drafting, not marked for later.** Three ambiguities were resolved with the
maintainer up front:

1. Whether the page counts as parent-facing, given that Principles IV and VII
   require Urdu and the office phone number on parent-facing screens. Answer: it is
   a technical placeholder; the deferral is recorded as FR-005 rather than waived.
2. Whether the hosting account and database project exist. Answer: they do not;
   their creation is part of this feature's task list.
3. Whether to commit `main` before branching. Answer: yes — done, so the feature
   branch has a base to return to.

**A constitutional conflict was raised and resolved rather than built past.** The
constitution's Governance section requires stopping when a request conflicts with a
principle. The request "nothing else on it yet" conflicts with Principle IV
(Bilingual) and Principle VII (Human Exit). Rather than silently complying with
either the request or the principle, the conflict was surfaced, the maintainer
chose, and FR-005 now carries the debt explicitly with the condition that
discharges it.

**One item to watch during `/sp.plan`.** FR-008 forbids the health check exposing
hostnames or error traces, and FR-007 requires it to be understandable to a
non-developer. These pull against each other: the most useful diagnostic message is
often the most revealing one. The plan must find wording that tells the maintainer
what to do next without telling a stranger anything about the infrastructure.
