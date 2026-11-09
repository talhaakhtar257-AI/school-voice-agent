---
id: 0085
title: Prompt mirror resynced to live version 15
stage: green
date: 2026-11-09
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["retell", "voice-agent", "documentation", "prompt-mirror", "office-phone", "placeholder"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - docs/retell-agent-prompt.md
 - history/prompts/013-call-speed-cost/0085-prompt-mirror-resynced-to-v15.green.prompt.md
tests:
 - npm run build (passed)
 - npx tsc --noEmit (passed)
 - npm run lint (1 pre-existing warning in lib/content/schema.ts, untouched)
 - byte comparison of the doc's fenced prompt block against GET /get-retell-llm?version=10 (identical)
---

## Prompt

isthere remaining things which you have to do , do it then i test cal

## Response snapshot

Swept for genuinely open work rather than inventing some. Found the prompt
mirror in `docs/retell-agent-prompt.md` two versions behind what is live and
resynced it byte-for-byte, and surfaced the placeholder office phone number as
the one thing left that needs the owner's input.

## Outcome

- ✅ Impact: **The mirror required by CLAUDE.md was describing an agent that no
  longer exists.** Its heading said "Prompt, version 12" while version 15 is
  live, and the body still contained `## FIRST ACTION OF EVERY CALL — not
  optional`, the instruction to call `get_school_content` before the first word,
  which is exactly the behaviour removed yesterday to fix the slow first answer.
  It was also missing the two sections that replaced it, `## THE SCHOOL
  INFORMATION YOU ALREADY HAVE` and `## SCHOOL CONTENT`. Anyone reading the file
  to answer "what does she actually say" would have been told the opposite of
  the truth. The fenced block is now the live prompt verbatim, confirmed by a
  byte comparison against `GET /get-retell-llm?version=10` (10,981 characters,
  100 lines, equality asserted in code rather than eyeballed), and the section
  gained the v13/v14/v15 history it was missing.
  **Flagged, not fixed, because it is the owner's data:** the office phone number
  is still the placeholder `021-000-000-000`. It is read aloud by the assistant
  and rendered on the landing page, the announcement bar, the login page and the
  dashboard. It is centralised in `lib/office.ts`, so it is a one-line change
  plus a Retell prompt edit — but the real number has to come from the owner
  (CLAUDE.md: never invent school data), and a client demo where the assistant
  recites a fake number is a bad look.
  Also checked and dismissed: the untracked `school/` folder is a 25 KB personal
  Obsidian vault, left alone; no application code needed changing.
- 🧪 Tests: build, type check and lint pass; the mirror equality check passes.
- 📁 Files: `docs/retell-agent-prompt.md` only.
- 🔁 Next prompts: the owner's test call on agent version 10 is the open
  question. Then the office number, the cheap-voice comparison by ear, and the
  optional `agent_version` pin from PHR 0084.
- 🧠 Reflection: "is there anything left?" is a prompt that invites inventing
  work. The honest sweep was to walk the standing obligations — the mirror
  CLAUDE.md demands, the untracked file, the known placeholders — and report
  that two of the three needed nothing. The mirror drift is the interesting one,
  because it was created by yesterday's own fix: changing the prompt in Retell
  and updating the settings tables in the same file, while leaving the prompt
  text below them untouched. A doc that is 90% updated reads as fully updated.
- 🧪 Also corrected: the "11,614 characters" prompt length quoted in PHR 0083 was
  an artefact of decoding the API response through a pipe on Windows, which
  mangled the em-dashes and Urdu into surrogates. Reading the bytes and decoding
  explicitly gives 10,981. The version-equality conclusion in 0083 still holds,
  because all three versions were measured the same way.

## Evaluation notes (flywheel)

- Failure modes observed: a third unit/encoding error in two days, this one a
  character count inflated by a bad decode — the fix is to write the API
  response to a file and decode it explicitly rather than piping it into
  `python -c`, which on this machine does not use UTF-8 for stdin. Separately,
  the mirror drift shows that "update the doc" is not one action: this file
  holds settings tables, a version table and the prompt text, and yesterday's
  change touched the first two and silently left the third stale.
- Graders run and results (PASS/FAIL): PASS — `npm run build`, `npx tsc
  --noEmit`, `npm run lint`, and an asserted byte comparison between the doc's
  fenced block and the live prompt.
- Prompt variant (if applicable): none — the prompt itself was not changed, only
  its mirror in the repo.
- Next experiment (smallest change to try): after any future Retell prompt edit,
  re-run the byte comparison in this PHR as the check that the mirror is current,
  instead of trusting that the file was updated.
