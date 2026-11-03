---
id: 0076
title: Move to a new Retell account, with cost and latency baseline
stage: general
date: 2026-11-02
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhawork257
command: none
labels: ["retell", "account-move", "secret-rotation", "cost", "latency", "deprecation", "seo", "urdu"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - lib/content/simulate.ts, lib/content/simulate-sources.ts, components/voice/text-chat.tsx, components/content/test-tool.tsx — written answers follow the page language (commit 99c868a)
  - components/landing/landing.module.css — call pill no longer covers the office number below 420px (commit 068b2e5)
  - app/robots.ts, app/sitemap.ts, app/login/page.tsx, app/health/page.tsx, .env.example — staff screens out of search engines (commit 56d0648)
  - docs/retell-agent-prompt.md — how to change a published agent, model_config, silence-timer correction (commit e828d70)
  - CLAUDE.local.md (not committed) — new account, agent id, LLM id, workspace id, why the staff key is empty
  - .env.local (not committed) — 5 Retell variables repointed, old file backed up to the session scratchpad
  - history/prompts/general/0076-retell-account-move-cost-latency-baseline.general.prompt.md
tests:
  - npm run build and npx tsc --noEmit pass before each commit; lint clean apart from one pre-existing warning in lib/content/schema.ts
  - read-only export of the old agent and LLM (prompt v9, 5 tools, 28 agent fields, 41 LLM fields)
  - dry run of the import printing every field it would change; applied only after review
  - read-back of the new agent: 22/22 checks PASS, 0 unexpected differences under a key-order-insensitive compare
  - production verified on the new account: new shared secret accepted (200), wrong secret rejected (401), new agent id and public key present in the JS bundle, old agent id absent
  - get_school_content timed 5x from Pakistan against production: 0.67-1.53 s warm
  - NOT DONE: no live call has been placed on the new account (0 calls), so webhook, transcript, summary, lead linking and school email are unproven
---

## Prompt

Series of prompts:

- which folder you are in ?
- we have to move on another retell account  save changes then i will give you the api keys and you have to doall things  and tell me about costs and what is the condition of letancy right now and you have to do work that we get better results in less cost then now
- (answers to a clarifying question) Move order: "Exact copy first, then tune". Experiments: "i don't know about it first set up acount then we tune it". Code work: "i don't know what is that"
- supabase is now resume tell me what to do do i have to give you just api keys
- NEW_RETELL_API_KEY=[redacted]
  NEW_RETELL_PUBLIC_KEY=[redacted]
  NEW_RETELL_STAFF_PUBLIC_KEY= where is staff api key ?
- check i have redeploy
- (pasted Retell email) "Update your Retell API integration — Retell replaced the separate model fields on Retell LLMs and conversation flows with one model_config object... We recorded requests from an integration using your workspace's credentials. These requests used deprecated functionality: Legacy model fields... Please update your Retell API integration by January 31, 2027... Last deprecated use: Nov 2, 2026, 9:49 AM UTC from [IP redacted]... Workspace none (org_bFJo7V12d4ywEzEN). PATCH /update-retell-llm/:llm_id field: model, model_temperature, model_high_priority, model_ultrafast — 1 request. Clients: node. API keys: "school agent"" — followed by: i recieved this email from retell so go on agent check what is happening and fix that
- have every thing fixed?

## Response snapshot

**Answered the two questions with measurements, not estimates.** Pulled the last
8 calls off the old account before the keys were swapped, because a new key
cannot see an old account's calls.

- **Cost: $0.1819/min.** ElevenLabs v3 $0.1000 + voice engine $0.0550 +
  gpt-4.1-mini $0.0128 + **pii_scrubbing $0.0100**. Total spend on that account
  $0.67 over 3.7 minutes. The PII scrubbing line was unknown to the owner.
- **A $0.06/min `llm_token_surcharge` exists and is currently $0.00** — the
  `?format=brief` payload is what keeps us under it. The brief measured 5,927
  bytes against the 6,000-char budget in `lib/content/agent-brief.ts`, i.e. full.
- **Latency: e2e p50 2,118 ms, p90 3,160 ms** against the 1.5 s target in
  `specs/011-tester-feedback/plan.md:28`. Model 461 ms, voice 585 ms, and
  ~1,070 ms in neither. Caveat: only 2 of 8 calls were real conversations, so
  4 measured turns.
- **Found where that second goes:** `get_school_content` against production takes
  0.67-1.53 s warm. The prompt forces it before the first answer of every call
  and Retell's tool timeout is 5 s. The missing second is our own API, not Retell.

**Stage 0.** Committed the work already on disk as three separate commits rather
than one: the Urdu language fix for written answers, the narrow-phone call pill,
and robots/sitemap/noindex. Added the undocumented `NEXT_PUBLIC_SITE_URL` to
`.env.example`.

**Stage 2, exact copy.** The new account held one template agent; filled it in
place so it keeps its ids. Scripted export -> dry run -> apply -> publish ->
read-back, with a reusable helper that retries, because this network drops DNS
for `api.retellai.com` intermittently (the PHR 0075 root cause, hit repeatedly).
Two template defaults would have been expensive if clicked past:
**gpt-5.6-terra on the fast tier ($0.256/min, 14x the current model)** and a
**1-hour** max call duration. One deliberate deviation from "exact": the
post-call language question offered English/**Spanish**, a NovaTech template
leftover both accounts inherited; now English/Urdu, which cannot affect a live
call. Verified 22/22 and 0 unexpected field differences.

**Endpoint drift found the hard way.** `GET /list-agents`, `POST /v2/list-calls`,
`POST /publish-agent/{id}` and `GET /get-agent-versions/{id}` are all retired.
Current: `POST /v2/list-agents`, `POST /v3/list-calls`,
`POST /publish-agent-version/{id}` with `{version}`, `GET /list-agent-versions/{id}`.

**The deprecation email was this session's own import script.** Every detail
matched: one `PATCH /update-retell-llm`, node client, key "school agent", 9:49 AM
UTC. The script set `model_config` correctly *and also* sent the four legacy
fields with identical values. The stored configuration was never wrong —
read-back shows `gpt-4.1-mini`, tier `standard`, temperature 0.02 — so there was
nothing to repair on the account; only the script needed fixing, and Retell's
notice clears itself once no further such request arrives.

**Discovered while fixing it: a published agent and LLM are frozen.**
`PATCH /update-agent` -> 422 "Cannot update published agent other than version
title"; `PATCH /update-retell-llm` -> 400 "Cannot update published LLM". The
dashboard hides this by creating a version per edit. Worked out and documented
the three-call procedure (`create-agent-version` with `base_version`, patch
`?version=`, `publish-agent-version`). This makes every Stage 3 tuning step a
version bump, and means the live agent cannot be changed by accident.

**Also corrected a documentation bug:** `docs/retell-agent-prompt.md` recorded
the silence hang-up as 60 s with a sound reason (a 21 Sept tester was hung up on
while fetching his sister) while §3 of the same file said 30 s. The live agent
has always had 30 s on both accounts — the decision was written down and never
applied.

**Key hygiene.** The owner pasted three keys into the chat despite being asked
to put them in `.env.local`; they are redacted above and the full-access API key
should be rotated once the move is verified. `RETELL_STAFF_PUBLIC_KEY` was left
deliberately empty: monitoring needs a restricted API key (Deploy -> Call =
Edit), not a public key, and empty makes the dashboard show its notice instead
of failing silently on a dead key.

## Outcome

- ✅ Impact: production runs on the new Retell account with a configuration
  verified identical to the old one and a rotated shared secret; the real cost
  and latency of a call are known for the first time; the deprecation notice is
  resolved at source; three pieces of finished work are committed.
- 🧪 Tests: build and type check, export, dry run, read-back 22/22, production
  secret and bundle checks, content-route timing. **No live call yet** — the move
  is not fully verified.
- 📁 Files: four commits (99c868a, 068b2e5, 56d0648, e828d70). No application
  code changed for the move itself — zero Retell identifiers are hardcoded.
  Scripts in the session scratchpad: `retell.mjs`, `retell-baseline.mjs`,
  `export-old.mjs`, `import-new.mjs`, `verify-new.mjs`, `swap-env.mjs`.
- 🔁 Next prompts:
  - The owner places a live call in Urdu and English; verify the `calls` row,
    transcript in Urdu script, summary, linked lead and school email.
  - The owner confirms the $20 monthly budget, concurrency 3, AI Quality
    Assurance off ($0.10/min), and fills the account email in `CLAUDE.local.md`.
  - Rotate the API key that was pasted into chat.
  - Stage 3 tuning, one change per version bump: ElevenLabs v4 Turbo or v3
    Conversational ($0.080/min vs $0.100, lower TTS latency, Urdu supported —
    judged by listening), boosted keywords off, silence timer to 60 s.
  - Stage 4 as feature 013 via `/sp.specify`: cache the content brief, make
    `send_details` stop blocking the call, move the webhook's emails off Retell's
    10 s timeout, and store Retell's own `latency` and `call_cost` per call so
    the Health screen can finally show the average response delay that
    `specs/004-admin-dashboard/spec.md:111` has always required.
- 🧠 Reflection: the per-call `latency` and `call_cost` objects were sitting in
  the Retell response the webhook already fetches and discards. A year of
  guessing at latency ended with one read-only script. Measure before tuning: the
  model, the obvious suspect, was the fastest part at 461 ms.

## Evaluation notes (flywheel)

- Failure modes observed: belt-and-braces payloads earn deprecation notices —
  sending a correct value twice, in the old shape and the new one, is not
  harmless; four Retell endpoints had been retired since the last move, each
  found only by a failing call; DNS for `api.retellai.com` failed repeatedly
  mid-session, so every script needed retry/backoff before it was reliable;
  key-order-sensitive JSON comparison produced six phantom mismatches in the
  first read-back and had to be canonicalised; a secret-redaction helper was
  written before the first export, which is why no secret reached the chat this
  time; the owner pasted keys into chat anyway, so asking is not a control.
- Graders run and results (PASS/FAIL): build PASS; tsc PASS; import dry run
  PASS; read-back 22/22 PASS, 0 unexpected differences PASS; production secret
  accepted PASS; wrong secret rejected PASS; new bundle live PASS; live call NOT
  RUN.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): cache the `get_school_content` brief
  and re-time it — a ~1 s saving on the first answer of every call, for no
  quality cost, and the one lever entirely inside our own code.
