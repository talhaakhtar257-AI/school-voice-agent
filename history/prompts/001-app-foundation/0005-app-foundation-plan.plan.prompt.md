---
id: 0005
title: App foundation implementation plan
stage: plan
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: 001-app-foundation
branch: 001-app-foundation
user: talha-professional97
command: /sp.plan
labels: ["plan", "foundation", "deployment", "health-check", "least-privilege"]
links:
  spec: specs/001-app-foundation/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-app-foundation/plan.md
  - specs/001-app-foundation/research.md
  - specs/001-app-foundation/data-model.md
  - specs/001-app-foundation/contracts/health-check.md
  - specs/001-app-foundation/quickstart.md
tests:
  - Constitution Check completed; 8 of 10 gates pass
  - Both failing gates recorded in Complexity Tracking with justification
  - No unresolved NEEDS CLARIFICATION in plan.md
  - Every Phase 0 and Phase 1 artifact present
---

## Prompt

Use Next.js App Router with TypeScript. Supabase for the database.
Deploy to Vercel from GitHub. Keep the folder structure flat and obvious.
Explain the deployment steps to me in plain English as we go — I have not
deployed a site before.

## Response snapshot

Produced the implementation plan and all Phase 0 and Phase 1 artifacts for feature
001. No code was written; that is `/sp.tasks` and `/sp.implement`.

**Constitution Check: 8 of 10 gates pass.** Principle IV (Bilingual) and Principle
VII (Human Exit) do not, and both are recorded in Complexity Tracking rather than
quietly ticked. They are the same deferral accepted during `/sp.specify` and
written into the spec as FR-005. Each row states the rejected simpler alternative:
translating placeholder text that will be discarded, and using a placeholder phone
number — the latter rejected outright, since a wrong phone number on a school's
site is worse than none.

**Four design decisions, all recorded in research.md with rejected alternatives:**

1. *The health check is a page, not an API route.* Anything under `app/api/`
   inherits `.claude/rules/api.md`, which requires a shared secret header on every
   endpoint. That would make the health check impossible to open in a browser and
   break Principle IX and FR-006. Making it a page avoids the conflict without
   carving an exception into a security rule.
2. *Anonymous key, never the service role key.* Reachability needs no privilege;
   the service key bypasses row level security. The constitution permits the
   service key in server-side code — permission, not encouragement.
3. *Probe the REST root, not a table.* FR-009 requires success on an empty
   database, and `database.md` forbids creating a table without agreement. The
   alternative — reading a "relation does not exist" error as proof of
   connectivity — works but was rejected under Principle VIII as cleverness a
   learning maintainer could not safely modify.
4. *Require two settings, keep three optional.* Requiring all five would fail
   deployment for a missing Retell value that nothing reads.

**The FR-007 / FR-008 tension flagged during `/sp.specify` is resolved** in
contracts/health-check.md with one line: name the setting, never the value.
`NEXT_PUBLIC_SUPABASE_URL` is already public in `.env.example` and makes the
message actionable; its contents are not. A stranger who finds the page learns one
bit — healthy or not.

**quickstart.md is the substantial artifact**, since the maintainer has not
deployed before. It explains what each of the four services does and why each step
exists, warns that dashboard wording changes and to trust the description over the
label, tells them explicitly not to copy the service_role key, and requires proving
the health check can report failure before trusting it to report success.

**The agent context script was deliberately not run.** See Evaluation notes.

## Outcome

- ✅ Impact: Feature 001 has an implementation plan, four design decisions with
  reasoning preserved, and a deployment walkthrough written for someone who has
  never deployed. The two constitutional deferrals are visible in the plan rather
  than buried in conversation.
- 🧪 Tests: Constitution Check complete; all artifacts present; no unresolved
  clarifications.
- 📁 Files: 5 created.
- 🔁 Next prompts: `/sp.tasks` to break this into steps. An ADR was suggested and
  awaits consent.
- 🧠 Reflection: The most useful output was noticing that `app/api/` carries a
  security rule that would have made the health check unopenable in a browser. That
  only surfaced because the rules files were read as constraints on the design
  rather than as documentation. Path-scoped rules are easy to forget precisely
  because they are not loaded until something matches them.

## Evaluation notes (flywheel)

- Failure modes observed: `update-agent-context.ps1` was not run, deliberately.
  Reading it first showed it targets the root `CLAUDE.md` and inserts only beneath
  `## Active Technologies` and `## Recent Changes` headings, neither of which this
  hand-curated `CLAUDE.md` has — so the content result is a no-op. It rewrites with
  `Set-Content -Encoding utf8`, which on Windows PowerShell 5.1 adds a UTF-8 byte
  order mark and normalises line endings. Net effect: BOM and line-ending churn on
  a curated file for zero gain. The stack is already documented under that file's
  own `## Stack` heading. Skipping was reported to the maintainer, not done
  silently.
- Graders run and results (PASS/FAIL): PASS — constitution gates evaluated and both
  failures justified in Complexity Tracking; all Phase 0/1 artifacts written;
  FR-007 versus FR-008 resolved rather than deferred again.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): During `/sp.implement`, verify the
  health check's failure path first and its success path second. A check that
  cannot report failure is indistinguishable from one that always says healthy, and
  the success path passing tells you nothing about that.
