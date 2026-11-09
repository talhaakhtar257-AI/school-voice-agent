---
id: 0086
title: "Mobile call: lost transcript, re-render hang, accurate STT"
stage: green
date: 2026-11-09
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["retell", "voice-agent", "transcript", "react-rerender", "stt-mode", "mobile", "greeting-length", "verification"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - components/landing/call/call-provider.tsx
 - docs/retell-agent-prompt.md
 - CLAUDE.local.md (gitignored, not committed)
 - history/prompts/013-call-speed-cost/0086-mobile-call-transcript-rerender-accurate-stt.green.prompt.md
tests:
 - npm run build (passed)
 - npx tsc --noEmit (passed)
 - npm run lint (1 pre-existing warning in lib/content/schema.ts, untouched)
 - npm ci --dry-run (lockfile consistent)
 - md5 of the production call bundle vs a local build of the fix (identical)
 - POST /v3/create-web-call + GET /v2/get-call -> binds to agent version 11
 - Word-level analysis of live call call_e9e4838d02dae9d551e0b620bc8 (9 Nov 22:00, 29.8s)
---

## Prompt

It was shocking that I didn't feel any kind of change. It was striking. Then I started the call. It didn't give me the answer. Basically, it's on the mobile, and there is many kind of problems. It was striking and connecting. First, it was showing me that connecting, then start conversation. I said hello, and then we will talk. But there is many problem, like something when she sent me something, so its question and its statement was not returned in the conversation. I watched it, and when I see something, it doesn't appear in the conversation box. That's a problem, and it was hanging too much on the mobile. Before starting the call, when I just start the call, it was connecting for a 5 second. It takes 5 seconds to start, and that's a point parents can left it. We have to fix it right now.

You are asking me in the start we are when the user comes on the website, visit the website, and it dialed the number, name and email. That's good. And after that it's take the line sometimes, and after that connected. I was talking about after the dialing all of things and after giving the all of things, when they start call to the agent, it takes time to connect, and then it takes time, and it was hanging on the phone and it was not giving the right answer, and it was like something hallucination and like hanging up and hanging like

continue

## Response snapshot

Read the owner's actual call out of the Retell API word by word, which produced
four distinct causes rather than the single "it is slow" story. Two were our
bugs, two were Retell configuration. Fixed all four and published agent version
11. The reported hallucination was not hallucination at all.

## Outcome

- Impact: **She was never hallucinating — she was answering a broken
  transcript.** `stt_mode` was `"fast"`, Retell's speed-over-accuracy speech
  recognition, and on the 22:00 call it reduced the owner's mixed Urdu and
  English to the fragments "School?" and "ہاں۔ One more thing, the admission—".
  She answered those faithfully. Set to `accurate`, which **reverses the 25 Sept
  2026 decision** recorded in the mirror; the old reasoning is kept beside the
  new, because `accurate` is what phone freezing was blamed for then, and the
  belief that the freezing was really cause 2 below is a belief, not a
  measurement.
  **Her words vanishing from the conversation box was ours.** The transcript
  held her turns back until her audio began, releasing them by *counting*:
  remember how many of her turns were spoken, show that many. The call broke it
  two ways at once. Retell split one of her sentences into two turns either side
  of the owner's interruption and sent them **out of order** — turn 4 begins at
  19.71s, before turn 3 at 19.82s — and a count means "the first N turns",
  which on a reordered list selects the wrong ones. Worse, a missing
  `agent_start_talking` never raised the count, so her words stayed hidden for
  the rest of the call. Replaced with a deadline that fails open: unspoken words
  appear when her voice starts **or** after 400ms, and only a trailing run of
  her turns is ever withheld, so a line already on screen cannot vanish. A lost
  event now costs 400ms of early text instead of a lost line.
  **The phone hanging was ours too.** `onTranscript` fires many times a second
  and every call handed React a brand-new array, re-rendering the whole
  conversation — including the many updates carrying only her held-back words,
  which changed nothing visible. The screen now updates only when the visible
  words differ.
  **The greeting was 23 words and measured 7.68s of speech** (0.25s to 7.93s).
  Not a gap and not a fault, just 23 words. Cut to 16, keeping the school's full
  name and dropping only filler.
  Measured, so the remaining ~3s reply gap is not mistaken for a bug: `llm` p50
  748ms, `tts` p50 242ms, `asr` p50 868ms, `e2e` p50 2985ms — about 1.1s of it
  is Retell's turn-taking wait — and **zero tool calls**, which confirms
  yesterday's preloaded brief is working.
- Tests: build, type check, lint and `npm ci --dry-run` all pass. The deployed
  bundle was proved to carry the fix by md5 against a local build of the same
  commit, and a throwaway web call confirmed agent version 11.
- Files: `components/landing/call/call-provider.tsx` (the two bug fixes, plus
  clearing the new hold timer in `stopTimers` so a pending release cannot
  repaint an ended call). `docs/retell-agent-prompt.md` (the `stt_mode`
  reversal with both arguments, the new greeting with its measurement, version
  11 in the table). `CLAUDE.local.md` rewritten around the live version, and
  repaired — an earlier edit of mine had spliced two bullets into one
  ungrammatical paragraph.
- Next prompts: the owner tests on mobile. If a phone hangs again, revert
  `stt_mode` to `fast` before anything else. Still outstanding and needing the
  owner: the placeholder office number `021-000-000-000`, which she reads aloud;
  the cheap-voice comparison by ear; prefetching the gate during form typing to
  remove ~1.2s of the connect wait; and the optional `agent_version` pin.
- Reflection: the owner's report was one undifferentiated complaint — slow,
  hanging, wrong answers, hallucinating. Four unrelated causes sat underneath
  it, and only the word-level `transcript_object` and the `latency` object
  separated them. Guessing from the description would have produced a plausible
  "make it faster" change that fixed none of them. Worth noting too that the
  owner's clarification narrowed the problem to *after* the form, which is
  exactly where all four causes were.

## Evaluation notes (flywheel)

- Failure modes observed: **a verification pattern of mine was wrong for the
  third time in two days**, and twice in this one turn. I reported the deploy as
  not landed when it had; the needle for the minified separator was mangled by
  quoting inside a nested `python -c` within a command substitution, so it
  matched nothing and every poll read "OLD". I then pushed an unnecessary empty
  re-trigger commit on the strength of it. Earlier in the same turn I announced
  that both calls recorded zero transcript turns, because `v3/list-calls` omits
  `transcript_object` and the print had died on Urdu characters under cp1252.
  The lesson is concrete: **a negative result from a hand-built grep is not
  evidence until the same probe has returned a positive on a known-good input.**
  The md5 comparison against a local build is the check that should have been
  used first, and the one to reach for next time.
- Graders run and results (PASS/FAIL): PASS — build, type check, lint,
  `npm ci --dry-run`; production bundle md5 identical to a local build of the
  fix; a live web call binds to version 11 with `stt_mode: accurate` and the
  16-word greeting.
- Prompt variant (if applicable): begin message v16 — 16 words, commas only, no
  sentence boundaries, so Retell's per-sentence gap cannot reappear.
- Next experiment (smallest change to try): one mobile call, watching three
  things — whether every one of her lines reaches the conversation box, whether
  the page still stutters while she speaks, and whether `accurate` transcribes
  the mixed Urdu and English correctly. Then compare `asr` p50 against this
  call's 868ms to price what `accurate` cost in latency.
