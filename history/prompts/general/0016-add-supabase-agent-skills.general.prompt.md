---
id: 0016
title: Add Supabase agent skills
stage: general
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: none
branch: 004-admin-dashboard
user: talhaakhtar257-AI
command: npx skills add supabase/agent-skills
labels: [tooling, supabase, skills, setup]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .agents/skills/supabase/ (added, third-party skill)
 - .agents/skills/supabase-postgres-best-practices/ (added, third-party skill)
 - .claude/skills/supabase -> symlink into .agents/skills/supabase
 - .claude/skills/supabase-postgres-best-practices -> symlink into .agents/skills/supabase-postgres-best-practices
 - skills-lock.json (added)
 - WHERE-TO-PUT-THESE-FILES.md (installer deleted it; restored with git checkout)
tests:
 - none
---

## Prompt

npx skills add supabase/agent-skills

## Response snapshot

Ran the command. It cloned `supabase/agent-skills` from GitHub and installed two
skills into `.agents/skills/`, with symlinks under `.claude/skills/` so Claude
Code can load them:

- **Supabase** — general Supabase development and security guidance.
- **Postgres Best Practices** — schema, indexing, RLS, connection-pooling and
  query-performance references.

A `skills-lock.json` was written at the project root recording the source and
content hash of each skill. `.mcp.json` (the Supabase MCP server config, added
earlier by `/mcp`) was already present and contains no secrets — only the
project ref and feature list in the URL.

Side effect: the installer deleted `WHERE-TO-PUT-THESE-FILES.md`, the one-time
setup guide. That file had already served its purpose (CLAUDE.md and the rules
files it describes all exist), but the deletion was not requested, so it was
restored with `git checkout`. The user can remove it themselves if they want.

## Outcome

- ✅ Impact: Two Supabase skills available to Claude Code for database work on the admin dashboard and future features.
- 🧪 Tests: none
- 📁 Files: `.agents/`, `.claude/skills/`, `skills-lock.json` added; `WHERE-TO-PUT-THESE-FILES.md` restored.
- 🔁 Next prompts: Decide whether to commit `.agents/`, `.claude/skills/` and `skills-lock.json` or gitignore them; continue feature 004 admin dashboard.
- 🧠 Reflection: Third-party installers can touch unrelated files; check `git status` after running one.

## Evaluation notes (flywheel)

- Failure modes observed: installer removed an unrelated tracked file.
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
