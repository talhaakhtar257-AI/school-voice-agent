---
id: 0083
title: Drafts go live by themselves, plus the cost correction
stage: green
date: 2026-11-09
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["retell", "voice-agent", "cost", "unit-price", "agent-versions", "openai-coral", "ab-test", "version-binding"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - docs/retell-agent-prompt.md
 - CLAUDE.local.md (gitignored, not committed)
 - history/prompts/013-call-speed-cost/0082-agent-silent-noise-sentence-gaps-preloaded-brief.red.prompt.md
 - history/prompts/013-call-speed-cost/0083-cheap-voice-ab-version-9-cost-correction.green.prompt.md
tests:
 - POST /v3/create-web-call + GET /v2/get-call — which version a real call binds to
 - npm run build
 - npx tsc --noEmit
 - npm run lint
 - GET /get-agent (live) and ?version=8,9 — config read back from Retell
 - GET /get-retell-llm?version=8,9 — prompt equality confirmed
---

## Prompt

do all then i test it

## Response snapshot

Finished the outstanding cheap-voice comparison properly and corrected a cost
error of my own. Created agent version 9 as an exact clone of the live version 8
with only the voice swapped to OpenAI Coral, so the A/B changes one variable.
Discovered that `unit_price` in `call_cost.product_costs` is cents per second,
which means the "1.667× markup" reported in PHR 0082 does not exist.

## Outcome

- ✅ Impact: **Agent version 9 created as the fair cheap-voice A/B.** Draft 7,
  the earlier attempt, branched from version 6 and therefore carried the old
  prompt that fetches the brief mid-call — publishing it would have changed the
  voice *and* silently undone the speed fix, so any verdict from it would have
  been worthless. Version 9 is built from `base_version: 8`, confirmed
  byte-identical in prompt (11,614 chars, `{{school_brief}}` present, same five
  tools, same begin message) and in model, interruption and noise settings;
  only `voice_id` / `voice_model` differ. Both drafts retitled in Retell, and
  version 8's title corrected from "DRAFT" to "LIVE".
  **Cost correction, which contradicts PHR 0082:** `unit_price` is cents per
  *second*, not dollars per minute — `cost = unit_price × billed_seconds`, and a
  per-minute rate is `unit_price × 0.6`. ElevenLabs v4 Turbo's `0.1333333` is
  $0.08/min, exactly Retell's list price, not $0.1333/min. **There is no 1.667×
  markup on this account.** The live rate is **$0.157/min** (confirmed against
  `total_duration_unit_price: 0.2619393 × 0.6`), not the $0.263 I reported. Two
  consequences: the 9 Nov move to v3 Conversational *did* save money, and the
  $0.18/min in CLAUDE.local.md was right for the ElevenLabs v3 setup it was
  written against. The cheap voice takes a call to **~$0.092/min, a 41% cut** —
  worth less than the doubled saving I claimed, but still the only line worth
  arguing about, since the voice is 51% of the bill and the LLM only 8%.
  Trial credit restated from real data: $1.74 spent over 9.9 minutes, ~$8.26
  left, about 52 minutes live or 89 on the cheap voice.
- 🧪 Tests: build, type check and lint pass; no application code changed this
  turn. Retell state verified by reading versions 8 and 9 and both LLM versions
  back from the API.
- 📁 Files: `docs/retell-agent-prompt.md` — cost section rewritten around the
  unit-price rule with measured-rate and per-line tables, version table gains 9
  and demotes 7 to obsolete, and the version-listing notes now record that
  `get-agent-versions` is a hard 400, that `list-agent-versions` omits voice and
  LLM fields, that `is_published` is sticky on every previously published
  version, and that `version_title` is the one field a published version will
  still accept. `CLAUDE.local.md` — published version, voice, interruption,
  noise filter, PII, greeting rule and billing all brought up to date, with the
  reversed noise-filter advice explained rather than silently replaced. PHR 0082
  annotated at the wrong claim instead of being rewritten.
  **Then the serious find.** With 8 published and draft 9 above it,
  `POST /v3/create-web-call` bound the call to `agent_version: 9` — a web call
  takes the **highest** version, not the published one, and republishing 8 did
  not reclaim it. The draft had put an untested voice on air by itself, which
  would have reached the client demo. Fixed by cloning 8 up to version 10 and
  publishing that, confirmed by reading `agent_version: 10` back off a fresh
  web call. This reverses the standing note "web calls always use the published
  version" and makes rollback a clone-upward operation, never a publish of a
  lower number.
- 🔁 Next prompts: the owner makes one call on version 8 and judges the Urdu;
  then publish 9 and call again to judge the cheap voice; publish the winner.
  Boosted keywords remain an untested latency candidate.
- 🧠 Reflection: both errors this session were unit errors read from an API I
  had not checked the units of — first a grep pattern that matched a relative
  path and declared a live deploy dead, then a per-second price read as
  per-minute and turned into a markup that does not exist. The arithmetic was
  self-consistent each time, which is exactly why neither looked wrong. The
  cheap-voice draft shows the same shape of mistake in experiment design: v7
  differed from the baseline in two ways at once, so it could not have answered
  the question it existed to answer.

## Evaluation notes (flywheel)

- Failure modes observed: a fabricated price multiplier survived being written
  into three places (docs, a PHR, and a message to the owner) because it was
  never checked against an independent figure. `total_duration_unit_price` was
  sitting in the same object the whole time and would have falsified it in one
  step. Separately, `POST /create-agent-version` returns an **empty body with no
  status code shown** when `base_version` is missing; only re-running with
  `-w '%{http_code}'` revealed `400 request/body must have required property
  'base_version'`. An empty response was twice read as "transient, retry".
  Worst of all, the draft created earlier in this same turn went live on its own
  and was found only because a last "confirm nothing moved" read showed
  `get-agent` returning version 9. Creating a draft on this account is a
  **publishing act** unless something higher is already published.
- Graders run and results (PASS/FAIL): PASS — `npm run build`, `npx tsc
  --noEmit`, `npm run lint`; Retell read-back confirms version 9 differs from
  version 8 in exactly two fields.
- Prompt variant (if applicable): none — the prompt is unchanged between agent
  versions 8 and 9 by design, which is what makes the voice comparison valid.
- Next experiment (smallest change to try): one call on each of versions 8 and 9
  with the same three questions, comparing Urdu intelligibility by ear and
  `call_cost.combined_cost` per minute from the API.
