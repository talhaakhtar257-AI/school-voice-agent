---
id: 0082
title: Agent silent and costly: noise, sentence gaps, preloaded brief
stage: red
date: 2026-11-09
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["retell", "voice-agent", "tts-gaps", "background-noise", "cost", "eleven_v4_turbo", "dynamic-variables"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - app/api/retell/web-call/route.ts
 - components/landing/call/call-provider.tsx
 - docs/retell-agent-prompt.md
 - history/prompts/013-call-speed-cost/0082-agent-silent-noise-sentence-gaps-preloaded-brief.red.prompt.md
tests:
 - npm run build (passed, compiled in 2.6s)
 - npx tsc --noEmit (passed, no errors)
 - npm run lint (1 pre-existing warning in lib/content/schema.ts, untouched)
 - Live call on production, agent version 5 (call_12e3bb0102c00f28eb6eb6fdc35) — greeting measured word-by-word
 - Live call on production, agent version 4 (call_0dcd360810f564ee6e0263f28d1) — phantom-speech reproduction
---

## Prompt

the retail AI account, and I said you that we have to move than more cheaper and more reliable, but agent is not working. I start the test call, and I said first it was not answering me or asking me something you can that, and it didn't give me the it didn't tell me about the first hello sentence or question or something. So I start talking with him, but it doesn't give me the answer anything, but it shows just assistant is thinking, and suddenly call ends automatically. So it is not working, and we have to show the client as soon. So go to the Chrome Retail AI, access the Retail AI, and fix the problem what we are facing right now, and we need more cheaper. The previous, you know what the previous features and how we fix it, and right now it is not working, so you have to fix it. If you want consider that retail is not working perfectly or something problem in the LLM, so change it and you have to fix it.

The length word 257 is not at right now retail accounts. Right now we created the account and connected the account, which is on the talaprofessional92@gmail.com. I open it. You can access it by the API key. You have a key, so access it by the API key.

## Response snapshot

Diagnosed three independent faults from the Retell API plus a live Chrome test call, then fixed what could be fixed in Retell config and prepared the rest. The LLM was never the problem (measured 0.65–1.0s per reply). Published agent versions 5 and 6; left versions 7 and 8 as labelled drafts.

## Outcome

- ✅ Impact: Three root causes found and evidenced, not guessed.
  **(1) Retell speaks one sentence at a time with 0.88–1.2s of silence at every
  sentence boundary** (TTS first-byte latency is only ~240ms). The
  four-sentence begin message therefore took 7.5 seconds with three audible
  holes — this is the "it didn't tell me the first hello sentence" report.
  Fixed free by rewriting the greeting as one sentence (agent version 6).
  **(2) The microphone hears the room and the room gets answered.** On a test
  call with nothing said to the mic, Retell transcribed real background
  conversation as the parent ("کیک یا بسکٹ؟", "دو دو نہیں ہیں، چکن", "بارش بھی
  ہو رہی ہے") and the assistant replied to it. The 8 Nov log says it outright:
  `Recovering from false VAD interruption (no ASR words)`. Each phantom turn
  starts a new turn, which is what sticks "Assistant is thinking…" on screen.
  Mitigated with the background-speech filter and interruption sensitivity
  0.15 (agent version 5); not cured — a headset matters more.
  **(3) The first answer carried a mid-call content fetch.** On the 9 Nov call
  the parent spoke at 7.8s and the reply had still not begun at 10.6s when the
  call ended: two model round-trips plus `get_school_content` in front of the
  first word.
  Also corrected the cost record: the real price is **$0.263/min, not $0.18**,
  because every line bills at **1.667× Retell's list price**. The 9 Nov switch
  to v3 Conversational was recorded as $0.080/min but bills at $0.1333/min.
  Audio delivery and the microphone were ruled out by measuring WebRTC
  inbound-rtp levels in the browser: her voice arrives at full level.
- 🧪 Tests: build, type check and lint all pass; two live production calls
  measured word-by-word from `transcript_object`.
- 📁 Files: `app/api/retell/web-call/route.ts` (returns `schoolBrief`),
  `components/landing/call/call-provider.tsx` (passes `school_brief` as a
  dynamic variable), `docs/retell-agent-prompt.md` (settings table, version
  table, and three new findings sections).
  Retell, outside the repo: agent v5 (`eleven_v4_turbo`, interruption 0.15,
  background-speech filter on, PII removal off), v6 published (one-sentence
  greeting), v7 draft (OpenAI Coral cheap-voice comparison), v8 draft (prompt
  using `{{school_brief}}`).
- 🔁 Next prompts: deploy the website change, then publish agent version 8;
  listen to version 7 and decide the voice by ear; consider a more patient
  reconnect after one connection attempt failed three times in four seconds.
- 🧠 Reflection: the owner's three symptoms ("no hello", "no answer",
  "thinking then it ends") all traced back to causes that only word-level
  audio timing and the call log could show. Reading the Retell dashboard would
  not have surfaced any of them; `transcript_object` word timings and
  `public_log_url` did.

## Evaluation notes (flywheel)

- Failure modes observed: the earlier note recorded a voice's **list** price as
  if it were the bill, which made a cost regression look like a saving — any
  future price claim must come from `call_cost.product_costs` on a real call.
  Separately, `form_input` on the pre-call consent checkbox set the DOM value
  without React registering it, so the first test call never started; clicking
  the checkbox worked. Testing also consumed the page's 10-calls-per-visitor
  daily limit for that browser, which is a real demo hazard.
- Graders run and results (PASS/FAIL): PASS — `npm run build`, `npx tsc
  --noEmit`, `npm run lint` (1 pre-existing warning), and live-call
  verification that agent version 5 cut greeting gaps from 1.76s to 0.88s.
- Prompt variant (if applicable): begin message v14 — one sentence, commas
  instead of full stops, to avoid Retell's per-sentence TTS gap.
- Next experiment (smallest change to try): publish agent version 8 after the
  deploy and measure the time from the parent's last word to the first word of
  her first answer; it should fall from over 5s to about 1s.
