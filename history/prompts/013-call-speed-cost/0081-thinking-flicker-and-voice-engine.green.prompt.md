---
id: 0081
title: Thinking indicator flicker, and the faster voice engine
stage: green
date: 2026-11-09
surface: agent
model: claude
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: none
labels: ["latency", "ui", "voice", "retell", "agent-version", "trial-credit"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - Retell agent version 4 published — prompt v12 unchanged, voice engine eleven_v3 -> eleven_v3_conversational
  - components/landing/call/call-provider.tsx — the thinking indicator no longer flickers, and its threshold is 1500ms (commit 87c6ebf)
  - docs/retell-agent-prompt.md — voice row and §3 summary
  - CLAUDE.local.md (not committed) — account email, trial-credit position, version 4 and its rollback
  - history/prompts/013-call-speed-cost/0081-thinking-flicker-and-voice-engine.green.prompt.md
tests:
  - full check of the system before changing anything: every page and endpoint on production, all four agent endpoints reject a missing secret, the agent unchanged since v12, the database rows for every call since the deploy
  - speed and cost recording confirmed on real calls: the database matches Retell exactly (2,603ms / 30 cents on 3 Nov; 3 cents and correctly no delay on 8 Nov)
  - one lead per call, no duplicates; the 3 Nov afternoon call's two saves merged into one complete record
  - pauses with and without a tool call compared on the 3 Nov call before choosing a fix
  - read-back of version 4: 11/11 PASS, prompt and every other setting unchanged
  - build, type check and lint clean
  - NOT TESTED: no call on version 4 yet. Both changes are things the owner judges by watching and listening
---

## Prompt

Series of prompts:

- check every thing
- 1. what is the rotation means 
2. [email redacted]
3. we are buying it first we have to show then client pay for it
- what is remaining fix it like agent stucking and thinking more  then i test it

## Response snapshot

**The full check found the system working where it could be checked, and two
things that could not be.** Production pages and endpoints all correct; the
content lookup at 0.42-0.46s, the fastest yet; speed and cost recording matching
Retell to the cent on real calls; every call since the deploy with transcript,
summary, lead, school email and released minutes; one lead per call. My first
Health query reported zero calls — the error was in my SQL, which counted from
Monday where the code counts the last seven days. Not checkable without a call:
version 12 itself, and the email-sending path, which no one has used since the
deploy. Also found: the parent-facing home page takes 3.3s on a first visit and
about 1.2s after, because it re-reads the whole school document on every visit.
Outside 013's scope, offered rather than done.

**Billing turned out to matter more than expected.** The owner is demoing on
Retell's one-time $10 trial credit before the client buys, with no card added.
$1.25 spent over 6.8 minutes leaves about $8.75, roughly 47 minutes — and with no
card, calls stop at $0. The owner was told to keep enough for the demo itself;
the budget and auto-recharge settings wait until the client pays. The account
email went into the private notes only, and is redacted here because this
repository is public.

**Where "thinking" actually comes from, measured.** On the 3 Nov call, 14 of 16
pauses had no tool call in them and sat at a 2.3s median; the two with tool
calls were already fixed in v12. So the remaining wait is the ordinary gap on
almost every turn: hearing the parent finish, the model deciding, and the voice
starting — that last the largest single piece at about 600ms. Saving the enquiry
never sat between a question and its answer.

**Two faults of my own were making it look worse than it is.** Holding her words
until her voice starts had two side effects on the "thinking…" indicator. Every
streamed piece of her held reply cleared it and restarted its timer, so it
flickered on every turn — which reads as stuttering. And it now cleared about
600ms later than before, so the same 900ms threshold kept it up longer every
turn. Only the parent's own words restart the clock now, and the threshold is
1500ms, restoring the old on-screen timing.

**Version 4: the faster voice engine.** ElevenLabs v3 Conversational, the same v3
family the owner judged right for Urdu, built for real-time conversation, and
$0.080/min against $0.100 — which also stretches the trial credit to about 54
minutes. Version 3 is the rollback if the Urdu sounds wrong. Rejected options
recorded: passing the school brief through the browser as a dynamic variable
would save a model round trip on the first answer but would let a caller inject
their own "facts" and instructions — a breach of Constitution I and II. The fast
model tier would cut model time a little but adds cost while running on trial
credit. Removing boosted keywords might trim transcription time but risks the
agent not understanding Urdu words, which would itself feel like being stuck.

## Outcome

- ✅ Impact: the on-screen indicator no longer flickers or lingers; every reply
  should start sooner on the faster voice engine, at lower cost per minute.
- 🧪 Tests: full system check, 11/11 read-back, build and type check clean. No
  call on version 4.
- 📁 Files: commit 87c6ebf; agent version 4 in Retell.
- 🔁 Next prompts:
  - The owner's test call: does she start answering sooner, does "thinking…"
    stay steady instead of flickering, and does the Urdu still sound right on
    v3 Conversational? Ask her to email the details, to test that path too.
  - If the Urdu sounds wrong: roll back to agent version 3.
  - Split call-provider.tsx (424 lines; it was 347 before this work began)
    after the test call, not before it.
  - The slow home page, if the owner wants it.
  - Rotate the API key pasted into the chat — explained to the owner as
    replacing a password.
- 🧠 Reflection: twice now, the visible "thinking" was a side effect of my own
  earlier fix rather than slowness. Changing when text appears changed what the
  indicator around it does, and nothing type-checks a UI timing assumption.

## Evaluation notes (flywheel)

- Failure modes observed: a UI change (hold text until audio) silently changed
  the behaviour of a neighbouring indicator that keyed off the same transcript
  events — once by shifting its timing, once by making it flicker under
  streaming. My own SQL for the Health figures counted from Monday while the code
  counts seven days, which briefly read as a bug in the product.
- Graders run and results (PASS/FAIL): production checks PASS; database
  verification PASS; read-back 11/11 PASS; build and tsc PASS; call on version 4
  NOT RUN.
- Prompt variant (if applicable): none — prompt unchanged; voice engine changed
- Next experiment (smallest change to try): one short call watching only the
  "thinking…" indicator — steady, or flickering?
