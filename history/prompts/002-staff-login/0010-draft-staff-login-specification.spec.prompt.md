---
id: 0010
title: Draft staff login specification
stage: spec
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: 002-staff-login
branch: 002-staff-login
user: talhawork257@gmail.com
command: git add -A && git commit -m "plan: 002 staff login"
labels: [spec, authentication, supabase, staff-login]
links:
  spec: specs/002-staff-login/spec.md
  ticket: none
  adr: none
  pr: none
files:
  - specs/002-staff-login/spec.md
tests:
  - none
---

## Prompt

git add -A && git commit -m "plan: 002 staff login"

## Response snapshot

The third consecutive commit command for feature 002 artifacts that did not
exist. The working tree was clean, so the commit would have saved nothing, and a
plan cannot precede the specification it is derived from.

Asked the maintainer what was happening rather than writing another record of a
commit that did nothing. They answered that they had expected the work to be
built already. That is a fair correction: the previous exchanges asked
requirement questions instead of producing anything, and open questions read to
them as work in progress rather than as a blocked task.

Wrote `specs/002-staff-login/spec.md` from sensible defaults instead, with an
"Assumptions Made" section at the top recording each decision so it can be
corrected. The seven assumptions cover: a single staff role with no tiers; email
and password rather than a magic link, because a magic link makes a live demo
wait on email delivery; no public sign-up, with accounts created by the
maintainer in Supabase; no self-service password reset this phase; landing on
`/dashboard` after sign-in; the office phone number shown on the sign-in screen
because a parent may reach it by mistake; and sessions lasting until sign-out.

The specification has four prioritised user stories — signing in, keeping
everyone else out, refusing wrong credentials clearly, and signing out —
seventeen functional requirements, edge cases, six measurable success criteria,
and an explicit out-of-scope list.

Two constraints from the project rules shaped it materially. `CLAUDE.md` forbids
browser storage, so FR-009 requires the session to live in cookies rather than in
`localStorage`, which is the Supabase JavaScript client's default and will need
the cookie-based helper at the plan stage. `CLAUDE.md` also forbids adding
authentication to the public landing page, so FR-004 states that `/` stays open.
Constitution IV drove the bilingual requirement covering error and loading text,
and Constitution VII drove the office phone number on the sign-in screen.

## Outcome

- ✅ Impact: Feature 002 now has a specification. The workflow can move to `/sp.clarify` or `/sp.plan`.
- 🧪 Tests: None — no code written yet.
- 📁 Files: Created `specs/002-staff-login/spec.md`.
- 🔁 Next prompts: Confirm or correct the seven assumptions, then run `/sp.plan`.
- 🧠 Reflection: Drafting with marked assumptions gave the maintainer something concrete to react to, where three rounds of questions had produced nothing.

## Evaluation notes (flywheel)

- Failure modes observed: Asking requirement questions instead of drafting left the maintainer believing work was underway when nothing was being produced.
- Graders run and results (PASS/FAIL): Not applicable.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): Draft the artifact first with a visible assumptions section, and ask for corrections rather than for requirements.
