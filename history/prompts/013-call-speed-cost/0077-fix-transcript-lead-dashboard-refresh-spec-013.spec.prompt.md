---
id: 0077
title: Transcript and refresh fixes, then spec 013
stage: spec
date: 2026-11-03
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: 013-call-speed-cost
user: talhawork257
command: /sp.specify
labels: ["latency", "cost", "transcript", "dashboard", "spec", "retell", "diagnosis"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - components/landing/call/call-provider.tsx — an assistant turn is held until her voice starts (commit 0415706)
  - app/dashboard/page.tsx — the overview refreshes itself every 30s (commit da3d449)
  - specs/013-call-speed-cost/spec.md — new feature specification
  - specs/013-call-speed-cost/checklists/requirements.md — spec quality checklist, all items pass
  - history/prompts/013-call-speed-cost/0077-fix-transcript-lead-dashboard-refresh-spec-013.spec.prompt.md
tests:
  - npm run build and npx tsc --noEmit pass; lint clean apart from the pre-existing warning in lib/content/schema.ts
  - the 3 Nov 2026 test call verified end to end in Supabase: call row ended/300s, transcript present, summary present, lead linked (Class 8, transfer, consent true), parent name/phone/email all saved
  - Retell's own verdict on that call: successful, sentiment Positive
  - spec validated against the quality checklist in one pass, 16/16 items
  - NOT TESTED: the two fixes are unverified in a live call — the transcript timing in particular can only be judged by making one
---

## Prompt

Series of prompts:

- One thing I want to discuss with you about our agent. When I was talking to the agent, it was to hang up and it was hanging and just checking while speaking. And when I check the dashboard, so I have to reload it when it shows the data. After, before reloading, it is not showing me the data about the today call. So there is a problem in our agent. It was struggling while speaking, and his message shown before she was speaking. So that's the problem I faced while calling it.
- yes

(The "yes" approved the plan offered in reply: fix the dashboard refresh and the
transcript timing now, and write the 013 spec for the rest.)

## Response snapshot

**The owner's three complaints were all real, and each was traced to a cause
rather than guessed at.** The 3 Nov test call was pulled from Retell and the
database before any code was touched.

**First, the account move was confirmed finished.** The call produced a `calls`
row (ended, 300s) with transcript and summary, linked to a lead holding Class 8,
transfer, consent, parent name, phone and email, with the school email sent.
Retell rated the call successful, sentiment Positive. All four tools and the
webhook work on the new account.

**"Struggling while speaking"** — measured: e2e p50 2,279ms, p90 2,913ms, max
3,233ms, against the 1.5s target. Broken down: ASR 583ms, LLM 738ms (p90
1,647ms, max 2,210ms), TTS 603ms. The spikes land on the turns that call our own
API. The call made 6 tool calls, and `save_lead` was invoked **four times in two
identical pairs** on the same lead row, each returning the same id with
`updated: true` — the model double-firing the same tool, each invocation costing
3-5 serial database round trips. `send_details` holds the call open on an email
send of up to 8s while the parent hears a filler phrase.

**"His message shown before she was speaking"** — a genuine bug, not a
perception. `onTranscript` wrote her words to the screen the moment Retell
streamed them from the model; her voice only starts when `onAgentStartTalking`
fires, measured ~603ms later, so the whole sentence sat on screen while she was
mid-sentence. The parent finished reading, then waited — which makes her read as
slower and more broken than she is. Fixed by holding an assistant turn until her
audio begins, releasing it immediately if text arrives while she is already
speaking, and judging the thinking indicator on what the parent can actually see
so it does not vanish early. Released turns stay visible.

**"I have to reload the dashboard"** — `/dashboard/leads` has polled every 10s
since it was built and `/dashboard/live` every 10s; the overview, the screen
with the Today / This week figures, was simply never given a refresh. One-line
fix, set to 30s rather than 10s because that page runs four aggregate queries
including the seven-day chart and shows counts, not a call in progress.

**A new cost finding:** the `llm_token_surcharge` that read $0.00 on the old
account is now being charged — $0.03 on this call, rate $0.06/min — because the
per-turn context has grown. Real cost is **$0.1846/min, $0.92 for five
minutes**, against the $0.84 estimated before measuring.

**Feature 013 specified** via `/sp.specify`, covering the work the owner
actually heard: the content retrieval every first answer waits on (measured
0.67-1.53s warm against a 5s provider timeout), `send_details` blocking the
call, the duplicated enquiry saves, the webhook overrunning Retell's 10s limit,
and storing Retell's own per-call latency and cost so the Health screen can
finally show the average response delay that
`specs/004-admin-dashboard/spec.md:111` has required since feature 004. Three
prioritised stories: the parent's experience first, then the figures staff can
read, then the content budget that caused the surcharge. Explicitly out of
scope: every Retell setting, the voice engine and the model — anything needing an
Urdu listening test is being tuned separately, one change at a time.

## Outcome

- ✅ Impact: two reported faults fixed and committed; the account move confirmed
  complete against the database; the cause of the "struggling" quantified rather
  than guessed; feature 013 specified with measurable targets and zero
  clarification markers.
- 🧪 Tests: build, type check, lint; the test call verified end to end in
  Supabase and in Retell; spec checklist 16/16. The two fixes have **not** been
  exercised in a live call.
- 📁 Files: commits 0415706 (transcript timing) and da3d449 (dashboard
  refresh); new spec and checklist on branch `013-call-speed-cost`.
- 🔁 Next prompts:
  - A live call to confirm her words and her voice now arrive together.
  - `/sp.plan` for 013, where the content-overflow default is the assumption
    most worth challenging.
  - Separately, the one-change-at-a-time Retell tuning: ElevenLabs v4 Turbo or
    v3 Conversational ($0.080/min against $0.100 and lower speech latency),
    boosted keywords off, silence timer 30s → 60s. Each is now a version bump,
    not an edit, because a published agent is frozen.
  - Rotate the API key that was pasted into the chat.
  - The owner still needs to fill the account email in `CLAUDE.local.md` and
    confirm the $20 budget, concurrency 3 and AI Quality Assurance off.
- 🧠 Reflection: the owner described a vague "struggling" and three concrete
  faults fell out of one call's data — including a duplicated tool call nobody
  would have found by reading code, and a UI bug that was making the assistant
  *look* a second slower than she was. Measuring first also stopped the obvious
  move: the model was the suspect and is not the problem.

## Evaluation notes (flywheel)

- Failure modes observed: a vague report ("it was struggling") mapped to three
  separate causes, two of them not where the complaint pointed — the transcript
  bug was a UI race, not agent slowness; the duplicated `save_lead` was the model
  double-firing, not our code looping. The dashboard gap existed because two of
  three screens were given polling and the third was forgotten, which no test
  covered. The spec input was written in implementation terms and had to be
  translated to outcomes to pass its own quality checklist.
- Graders run and results (PASS/FAIL): build PASS; tsc PASS; account move
  end-to-end verification PASS; spec quality checklist 16/16 PASS; live
  verification of the two fixes NOT RUN.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): one live call, judging only whether
  her words and her voice now arrive together — a single yes/no the owner can
  answer by listening, before any of 013 is built.
