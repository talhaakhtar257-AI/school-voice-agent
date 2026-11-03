---
id: 0079
title: Prompt v10, send_details tense and 60s silence
stage: green
date: 2026-11-03
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: none
labels: ["retell", "prompt", "agent-version", "honesty", "latency", "urdu"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - Retell agent version 1 published (prompt v10) — not in this repo
  - app/api/send-details/route.ts — the tool's say field carries both sentences as an instruction (commit 2a9b687)
  - docs/retell-agent-prompt.md — §2 silence row, §3 heading and the three prompt lines mirrored; boosted keywords recorded as the one open tuning item
  - docs/pending-prompt-change-013.md — created, then deleted once applied
  - CLAUDE.local.md (not committed) — published version 1, version 0 as rollback, and how to change a frozen agent
  - history/prompts/013-call-speed-cost/0079-prompt-v10-send-details-tense-60s-silence.green.prompt.md
tests:
  - dry run asserted each of the three prompt edits matched exactly once; it refuses to continue otherwise
  - read-back of the published version: 16/16 checks PASS, including that nothing else moved (voice, model and tier, 5 tools, data storage, max call, webhook secret, languages)
  - prompt length 9,581 -> 9,665 chars as predicted
  - version 0 retained and listed, so the rollback exists
  - cache from feature 013 slice A confirmed live on production: 2,647ms during deploy, then 440-493ms, against 670-1,530ms before
  - NOT TESTED: no call has been made on prompt v10. The tense is an ears check
---

## Prompt

Series of prompts:

- is there any work on you instead of calling from me
- yes complete it

## Response snapshot

**Answered the question by auditing my own work, and found a defect in it.**
Feature 013 slice B made `send_details` answer before the email is sent. Prompt
v9 hardcoded the past tense for what the agent then says:

> English: "I have sent these details to your email."
> Urdu: "جی، میں نے یہ تفصیلات آپ کی ای میل پر بھیج دی ہیں۔"

Both were true while the tool waited for the send. After slice B they are not:
the agent claimed a delivery that had not happened, and would have said
something untrue to a parent if the provider then failed. Constitution I. A
second line was dead rather than wrong — "If send_details reports it could not
send, say the admissions office will send it when they call" — because the tool
can no longer report a failure, so the parent is no longer told.

**Fixed in two steps.** First, code only, deployed immediately: the tool's `say`
is now an instruction carrying both sentences in the present continuous, which
steers the agent off the prompt's line without touching the agent. Then, with
the owner's go-ahead, prompt v10.

**Prompt v10, published as agent version 1.** A published agent is frozen, so
this went through create-agent-version, patch that version, publish it. Three
prompt edits and one setting:

1. The past tense replaced with "I'm sending these details to your email now." /
   "میں یہ تفصیلات ابھی آپ کی ای میل پر بھیج رہی ہوں۔", keeping the feminine verb
   form the rest of v9 uses for the assistant.
2. The dead failure line replaced with one that covers both what the tool can
   now report: a send that failed, and the three-per-call cap.
3. The heading "never refuse" softened to "never refuse without offering the
   office", since the API now caps sends at three.
4. The silence timer 30s → 60s. Decided on 21 September after a tester was hung
   up on while fetching his sister, recorded in `docs/retell-agent-prompt.md`,
   and never actually applied to any agent until now.

The import script asserts each edit matches exactly once and refuses to run
otherwise, so a drifted prompt cannot be silently half-patched.

**Also answered, and could not be settled alone:** whether Monika runs on the
cheaper ElevenLabs engines. Retell lists 328 voices and reports no engine
support per voice, because the engine is set on the agent — so `11labs-Monika`
can be paired with `eleven_v4_turbo` at $0.080/min against the $0.100 being paid
now, and only listening decides whether the Urdu survives. Noted in passing:
`openai-Monika` exists at $0.015/min, a different voice despite the name.

**And confirmed slice A works.** The endpoint every call's first answer waits on
went from 670-1,530ms to 440-493ms on production.

## Outcome

- ✅ Impact: the honesty gap my own change opened is closed in both the code and
  the published prompt; a decision from 21 September that was written down and
  lost is finally applied; the repo doc mirrors what is actually live; version 0
  is kept as the rollback.
- 🧪 Tests: dry run with exact-match assertions, 16/16 read-back checks, cache
  timing on production. No call made on v10.
- 📁 Files: commit 2a9b687 (code), plus the doc mirror in this commit. The agent
  itself lives in Retell, not here.
- 🔁 Next prompts:
  - One call on v10: listen for the tense when asking for emailed details, and
    check the 60-second silence by going quiet for ~40 seconds.
  - The voice A/B — v4 Turbo or v3 Conversational at $0.080/min, and possibly
    openai-Monika at $0.015/min. Ears only.
  - Boosted keywords: one A/B before removing, since they are what makes
    "daakhla" and "beti" recognisable.
  - Still the owner's: rotate the pasted API key, the account email, and
    confirming the $20 budget / concurrency 3 / AI QA off.
- 🧠 Reflection: the defect was mine and the audit that found it was cheap —
  reading the live prompt against the code I had just changed. Worth doing as a
  habit after any change to what a tool returns, because the prompt is a caller
  that type checking cannot see.

## Evaluation notes (flywheel)

- Failure modes observed: changing a tool's response contract silently broke two
  lines of a prompt that no build or type check can reach — the prompt is an
  untyped caller living in another system. I had been careful to keep the `say`
  field honest and still missed that the prompt overrides it with its own
  sentence. Also: `git merge -m` broke on a `$` in the message and `git merge -F
  -` cannot read stdin, so the merge silently did not happen the first time and
  only the branch check revealed it.
- Graders run and results (PASS/FAIL): dry-run match assertions PASS; read-back
  16/16 PASS; nothing-else-moved PASS; rollback version present PASS; cache
  timing PASS; call on v10 NOT RUN.
- Prompt variant (if applicable): prompt v9 → v10
- Next experiment (smallest change to try): one call asking for emailed details,
  listening only for "I'm sending" rather than "I have sent" — a single yes/no
  the owner can answer by ear.
