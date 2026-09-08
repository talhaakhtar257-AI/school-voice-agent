---
id: 0003
title: Scope sdd-workflow rules file
stage: general
date: 2026-09-09
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talha-professional97
command: /loop
labels: ["context", "claude-rules", "autonomous-check", "frontmatter"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .claude/rules/sdd-workflow.md
tests:
  - head -5 shows the paths frontmatter block
  - all four .claude/rules/*.md files open with ---
  - user-run in a fresh session, /context shows Memory files dropping ~2k tokens
---

## Prompt

/loop

(invoked with no prompt and no interval — autonomous check in dynamic-pacing mode)

## Response snapshot

Ran the autonomous check. No remote, no commits, no CI, no pull request, so no PR
maintenance was possible. Everything else outstanding — the first commit, and
starting Feature 1 — is blocked on Talha, not on time passing. Stopped the loop
rather than re-arming it.

The check did surface one real finding. When this session restarted, the harness
reported which instruction files it loaded: `CLAUDE.md`, `CLAUDE.local.md` and
`.claude/rules/sdd-workflow.md`, but **not** `api.md`, `frontend.md` or
`database.md`. The three that stayed out all carry `paths:` frontmatter;
`sdd-workflow.md` had none, because it was archived as reference material rather
than as path-scoped rules.

Two consequences:

1. The `.claude/rules/` + `paths:` mechanism is confirmed working. It had been
   flagged as unverified twice, and the proposed fallback (nested `CLAUDE.md`
   files once `app/` and `lib/` exist) is no longer needed.
2. The archive was not saving any context. All 163 lines of the SpecKit file were
   still loading on every message — the move from `CLAUDE.md` into
   `.claude/rules/` changed the folder and nothing else. Memory files were costing
   6.7k tokens per message.

Fixed by adding `paths:` frontmatter scoped to `specs/**/*.md`, `history/**/*.md`
and `.specify/**/*.md` — a genuine scope match, since the file's content is the
PHR procedure, the ADR significance test and the architect guidelines, all of
which matter while running `/sp.*` commands and none of which matter while
building a landing page. Four lines added, nothing removed.

The condensed SDD section in `CLAUDE.md` is untouched, so the always-on rules —
write a PHR after every prompt, suggest ADRs but never create them, where the
artifacts live — still apply in every session.

## Outcome

- ✅ Impact: The long-form SDD procedure became conditional instead of always-on.
  All four rules files now behave consistently. An open risk carried through two
  plans is closed with evidence.
- 🧪 Tests: Both automated checks pass. The measurable one is user-run — `/context`
  in a fresh session should show Memory files down roughly 2k from 6.7k.
- 📁 Files: 1 modified.
- 🔁 Next prompts: `/sp.specify` for Feature 1. Optionally commit first —
  `docs: ratify project constitution v1.0.0` remains unrun and unauthorised.
- 🧠 Reflection: The evidence came free, from the session restart notice listing
  exactly which instruction files loaded. Worth reading that notice deliberately
  rather than skimming past it — it is the only direct signal about what is
  actually costing context.

## Evaluation notes (flywheel)

- Failure modes observed: Archiving a file to a new folder was treated as
  achieving a context saving without checking whether the loading rule followed it
  there. The claim was asserted in two approved plans before evidence contradicted
  it.
- Graders run and results (PASS/FAIL): PASS — frontmatter present, all four rules
  files consistent. PENDING — the `/context` token measurement needs a fresh
  session.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): In a fresh session, read a file under
  `history/prompts/` and confirm the SDD guidance loads on demand. If it does not,
  widen the globs — a rules file that never loads is worse than one that always
  does.
