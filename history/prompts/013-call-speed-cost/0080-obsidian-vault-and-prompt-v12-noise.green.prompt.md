---
id: 0080
title: Obsidian vault, and prompt v12 against background noise
stage: green
date: 2026-11-09
surface: agent
model: claude
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: none
labels: ["retell", "prompt", "agent-version", "background-noise", "interruptions", "obsidian"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - Retell agent version 3 published (prompt v12) — not in this repo
  - .obsidian/app.json, .obsidian/graph.json (git-ignored) — the project folder as an Obsidian vault
  - .gitignore — ignores .obsidian/ (commit c23d0e0)
  - docs/retell-agent-prompt.md — v12 mirrored; the v11 rule, missing from the mirrored prompt since v11 shipped, restored
  - CLAUDE.local.md (not committed) — version 3, rollbacks, current settings
  - history/prompts/013-call-speed-cost/0080-obsidian-vault-and-prompt-v12-noise.green.prompt.md
tests:
  - read the only call on v11 (8 Nov, 10.8s) word by word before changing anything
  - read Retell's background-noise guide before choosing settings
  - dry run asserting the v11 rule matched once, the noise-reacting clause is gone, the new rules sit before the deliberate-wait section, and all four tool secrets match .env.local
  - read-back of the published version 3, 21/21 checks PASS
  - doc mirror diffed line by line against the live prompt: 96 lines, 0 differences
  - NOT TESTED: no call has been made on v12
---

## Prompt

Series of prompts:

- Agent is not working. It is a thinking more than the previous agent works. So we have to fix it. But before fixing them, tell me what the LLM we use in this. And first, you have to connect this folder with the obstacle. Then I can check the graph flow.
- first fix issues

## Response snapshot

**"Obstacle" was Obsidian.** Confirmed from the machine rather than guessed:
Obsidian is installed and an earlier test vault, `school/`, sits inside this
project holding only Obsidian's default Welcome note — so its graph was empty.
Obsidian was running, so its own settings file was left alone; the project root
got a `.obsidian/` with `node_modules/` (1,087 package READMEs) and `school/`
excluded from the graph, colour groups by folder, and link arrows. The owner
opens it with Open folder as vault. Expectation set honestly: only 19 of about
150 project documents link to another, PHR links live in front matter which
Obsidian does not draw, and dot-folders (the constitution, `.claude/rules`)
are hidden by Obsidian itself.

**The model:** GPT-4.1 mini, standard tier, temperature 0.02, unchanged — and
not the slow part. On the only v11 call it answered in 607ms, the fastest of
any call.

**What "thinking more" was.** Only one call on v11, 10.8 seconds long. A
background voice ("ہاں، وہاں سے ریسپشن") and two "(unintelligible audio)" turns
reached her as the parent. She started speaking twice and was cut off after one
word each time — "One", then "جی ضرور،" — and her greeting never registered.

**The biggest audible cause was a filler phrase.** `get_school_content` was set
to say a static English "One moment please." while it ran — at the start of
every call, to Urdu callers too. It existed to cover a fetch of up to 1.5s;
feature 013 cached that to about 0.5s, so it had become pure audible
hesitation. The "One" cut off on the 8 Nov call was this phrase. And
`send_details` said "One moment, I'm sending that to your email" before the
prompt's own sending line, so once slice B made it answer instantly she said
"sending" twice.

**Prompt v12, published as agent version 3**, four changes:

1. Both tool fillers off. They still speak after the tool returns.
2. Interruption sensitivity 0.6 → 0.4, per Retell's guide for background sound.
   Her replies are one or two sentences, so a parent loses little.
3. My own v11 rule told her to answer "something you did not catch" — in a
   noisy room, that means answering the room. That clause is gone.
4. A new rule: ignore "(unintelligible audio)", background noise, a TV, other
   voices; finish the sentence or keep waiting; ask once, briefly, only when the
   parent clearly said something she could not make out.

**Deliberately not changed: the stronger noise filter.** I had proposed it.
Retell's guide says it removes other voices but can clip quiet or short replies,
can reduce non-English accuracy, costs +$0.005/min, and recommends the current
setting for most uses. A short Urdu "جی جی" going unheard is precisely what
caused the 28-second silence on 3 Nov, so switching it on blind risked
recreating the last fault while fixing this one. It gets its own test.

**And a gap of my own, closed.** Publishing v11 had updated the doc's change
notes but not the mirrored prompt text, so the doc had not matched the live
prompt since v11. Restored and verified by a line-by-line diff.

## Outcome

- ✅ Impact: the project is browsable in Obsidian; v12 removes the two audible
  fillers, makes her harder to cut off, and stops her answering background
  sound, without touching the noise filter that protects short Urdu replies.
- 🧪 Tests: 21/21 read-back checks, all secrets intact, doc mirror diffed to
  zero. No call yet on v12.
- 📁 Files: agent version 3 in Retell; doc, PHR and private notes here.
- 🔁 Next prompts:
  - One call from a quiet room, then one with some background noise: listen for
    her answering directly, no "One moment please", and not being cut off.
  - If other voices still reach her, test the background-speech filter on its
    own with Speech Removal Strength 0.6, listening for short Urdu replies.
  - If she now feels hard to interrupt, interruption sensitivity 0.5 is the
    next step back.
  - Still the owner's: rotate the pasted API key, the account email, confirm
    the $20 budget, concurrency 3, AI QA off.
- 🧠 Reflection: three rounds running, the fault the owner heard was not the
  one the obvious metric pointed at — a timer, then a filler phrase, then my own
  wording. Reading the call word by word found each one in minutes.

## Evaluation notes (flywheel)

- Failure modes observed: my v11 rule cured silence by telling her to answer
  anything she "did not catch", which turned background noise into turns. A
  speed change (the cache) left a filler phrase whose only purpose was to cover
  the old slowness — the cause had gone and its symptom-cover stayed. A doc
  update that changed the notes but not the mirrored text let the mirror drift
  for a version without anyone noticing.
- Graders run and results (PASS/FAIL): dry-run assertions PASS; read-back 21/21
  PASS; mirror diff 0 lines PASS; call on v12 NOT RUN.
- Prompt variant (if applicable): prompt v11 → v12
- Next experiment (smallest change to try): one quiet-room call — does she
  answer the first question directly, without "One moment please"?
