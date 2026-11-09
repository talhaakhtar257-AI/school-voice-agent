---
id: 0087
title: Transcript never retracts, hold removed
stage: green
date: 2026-11-09
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["retell", "voice-agent", "transcript", "thinking-indicator", "simplification", "verification", "mobile"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - components/landing/call/call-provider.tsx
 - history/prompts/013-call-speed-cost/0087-transcript-never-retracts-hold-removed.green.prompt.md
tests:
 - npm run build (passed)
 - npx tsc --noEmit (passed)
 - npm run lint (1 pre-existing warning in lib/content/schema.ts, untouched)
 - md5 of the production call bundle vs the local build of the fix (identical, probe positive-checked first)
 - Turn-order analysis of live call call_6f3cf8f5cd5d3b89b2f8050b41b (9 Nov, 128.8s, 18 turns, agent version 11)
---

## Prompt

Next, did another one called, so it was good right now, but there is one more issue that it was going to be perfectly, but the transcript of the calls and her statement was stuck in and it didn't show it was going on when we were talked to it. So there is a problem. If you didn't understand it, tell me, I will explain you more. Like when she was talking to me, the message she was putting or telling me, it show on the in the box of the call transcript and conversation, but the statement and message was hanging up and show sometime and hidden automatically, and show message assistant and thinking, even though she was talking to me. That is a problem.

## Response snapshot

The call itself was good this time; the remaining fault was the transcript
retracting her lines and showing "thinking" over her voice. Both were one bug in
my own previous fix. Rather than patch the same feature a third time, removed
it: the transcript now shows every turn it is given.

## Outcome

- Impact: **One cause, both symptoms, and it was mine.** Retell grows her reply
  by extending the *same* turn rather than appending new ones, so a final chunk
  of text routinely lands just after `agent_stop_talking`. My deadline-based
  hold then re-applied to the trailing run of her turns — which is the turn she
  had just finished saying and the parent was already reading. Her words
  appeared, vanished for 400ms and came back. And once her line was hidden the
  last *visible* line was the parent's, which is precisely the condition that
  arms the thinking indicator, so "thinking…" appeared while she was speaking.
  My claim in PHR 0086 that "a line already on screen cannot vanish" was wrong.
  **Removed the hold rather than fixing it a third time.** I first wrote a
  monotonic high-water mark, then stress-tested it against the turn order in
  the new call and found it still breaks: any such scheme has to *name* the
  turns it withholds, position is the only name Retell gives us, and Retell
  inserts turns in the middle — in `call_6f3cf8f5cd5d3b89b2f8050b41b` a parent
  turn timed at **67.48s sits between her turns at 67.54s and 71.30s** — which
  shifts every position after it. There is no stable name to hold by, so the
  feature cannot be made correct, only made to fail less often. The transcript
  now shows every turn, always, and is append-only by construction.
  The price is honest and small: her words can lead her voice by the ~600ms the
  model's stream runs ahead. That had been reported **never**; the vanishing had
  been reported **twice**. Correctness over a cosmetic preference, especially
  with a client demo pending.
  Kept the two things that were working: the screen still redraws only when the
  visible words change (the Android hanging fix), and the thinking indicator now
  refuses to appear while her voice is playing — checked both when it is armed
  and again when it fires, so it cannot be armed before she speaks and land
  during.
- Tests: build, type check and lint pass. Deploy confirmed by md5 of the
  production bundle against a local build of the same commit.
- Files: `components/landing/call/call-provider.tsx` only — net smaller: one
  constant, three refs and one callback removed.
- Next prompts: the owner tests the conversation box again. Still outstanding
  and needing the owner: the placeholder office number `021-000-000-000` that
  she reads aloud; the cheap-voice comparison by ear; prefetching the gate
  during form typing to remove ~1.2s of connect wait; and the `agent_version`
  pin.
- Reflection: I shipped the same feature twice and broke it both times, each
  time with a confident claim in the commit message about what could no longer
  happen. The tell was there to be read after the first failure — the feature's
  correctness depended on turn *position* being stable, and the very call that
  exposed bug one also showed turns arriving out of order. Reading that as "the
  count is wrong, use a deadline" fixed a symptom; reading it as "position is
  not a reliable identity" would have deleted the feature a day earlier. When
  the second bug in a feature has the same shape as the first, the fix is
  usually removal, not a third mechanism.

## Evaluation notes (flywheel)

- Failure modes observed: two in sequence here. **Patching a symptom instead of
  questioning the premise** — bug one and bug two were both "the hold hides the
  wrong turns", and only the second time did I ask whether the hold could be
  correct at all. And **asserting an invariant in a commit message without
  testing it**: "a line already on screen cannot vanish" was written as a
  guarantee and was false within one call. The counter-practice adopted:
  before claiming an invariant, name the input that would break it and check
  whether real data contains that input — the out-of-order turns were already
  in the call I had analysed.
  On verification, the md5-against-local-build check was used again and, this
  time, the probe was shown to return a positive on known-good input *before*
  being trusted on production — the discipline added after three false negatives
  in two days.
- Graders run and results (PASS/FAIL): PASS — build, type check, lint; the
  production chunk `2mx9jknl08vy6.js` md5-matches the local build exactly.
- Prompt variant (if applicable): none — no Retell or prompt change in this
  turn; agent version 11 is untouched.
- Next experiment (smallest change to try): one call watching only the
  conversation box — every line of hers should arrive and then stay put, and
  "thinking…" should never appear while she is audibly speaking. If her text now
  visibly runs ahead of her voice enough to be distracting, the answer is to
  reveal it per word against the audio clock, not to hide whole turns again.
