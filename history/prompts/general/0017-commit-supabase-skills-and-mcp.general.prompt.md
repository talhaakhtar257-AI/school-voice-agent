---
id: 0017
title: Commit Supabase skills and MCP config
stage: general
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: none
branch: 004-admin-dashboard
user: talhaakhtar257-AI
command: git commit -m "feat: 001 running locally with supabase"
labels: [git, tooling, supabase]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .agents/skills/** (new, Supabase agent skills)
  - .claude/skills/** (new, duplicate copies of the above; symlinks followed because core.symlinks=false)
  - .mcp.json (new, Supabase MCP server config)
  - skills-lock.json (new, pins installed skill versions)
  - history/prompts/general/0016-add-supabase-agent-skills.general.prompt.md (new)
  - WHERE-TO-PUT-THESE-FILES.md (deleted)
tests:
  - none
---

## Prompt

git commit -m "feat: 001 running locally with supabase"

## Response snapshot

Staged changes were committed as c051330 on branch 004-admin-dashboard: 84 files
changed, +4601 / -129. The commit contains the Supabase MCP server config
(.mcp.json), the two installed agent skills under .agents/skills/, duplicate
copies of those skill files under .claude/skills/ (git followed the local
symlinks because core.symlinks is false on this Windows machine), the
skills-lock.json version lock, PHR 0016, and the deletion of
WHERE-TO-PUT-THESE-FILES.md.

Before running the commit, the assistant twice flagged that the message
"feat: 001 running locally with supabase" is misleading: the diff contains no
feature-001 code and no application code, and feature 001 was already committed
in cf70d04. The conventional prefix for developer tooling is chore:, not feat:.
The user re-issued the same command unchanged, so the assistant committed with
the requested message and noted it can be corrected with git commit --amend
before the branch is pushed. The commit was NOT pushed.

## Outcome

- ✅ Impact: Supabase MCP config and agent skills are now tracked in git on the 004-admin-dashboard branch.
- 🧪 Tests: none run (no application code changed).
- 📁 Files: 84 files changed; see files list above.
- 🔁 Next prompts: optionally `git commit --amend` to correct the message; then `git push -u origin 004-admin-dashboard`.
- 🧠 Reflection: The commit message does not describe its contents. If the branch is not yet pushed, amend it to something like "chore: add Supabase MCP server and agent skills".

## Evaluation notes (flywheel)

- Failure modes observed: commit message / diff mismatch accepted at user insistence after two warnings.
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
