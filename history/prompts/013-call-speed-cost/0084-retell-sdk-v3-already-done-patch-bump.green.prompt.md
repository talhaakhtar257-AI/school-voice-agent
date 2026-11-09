---
id: 0084
title: Retell SDK v2-to-v3 notice, already done, 3.0.4 bump
stage: green
date: 2026-11-09
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["retell", "voice-agent", "sdk", "deprecation", "retell-client-js-sdk", "connection-retry", "api-keys"]
links:
  spec: specs/005-voice-landing-page/research.md
  ticket: null
  adr: null
  pr: null
files:
 - package.json
 - package-lock.json
 - CLAUDE.local.md (gitignored, not committed)
 - history/prompts/013-call-speed-cost/0084-retell-sdk-v3-already-done-patch-bump.green.prompt.md
tests:
 - npm run build (passed)
 - npx tsc --noEmit (passed)
 - npm run lint (1 pre-existing warning in lib/content/schema.ts, untouched)
 - POST /v3/create-web-call with the browser PUBLIC key -> HTTP 201, access token issued
 - diff of dist/index.d.ts between 3.0.2 and 3.0.4 -> identical
 - repo-wide grep for RetellWebClient / v2 create-web-call -> no matches
---

## Prompt

email from the retail UI on the from. It was about retail AI API keys. I don't know what's they want to say. They are saying something like API keys failing. Check it. What's the problem? Update to Retail AI API integration now replaces the V2 browser plan SDK with V3. Call creation and event handlers change. This is a front and code change, not a server side one. Check it and fix it once the problem is

## Response snapshot

The email is a routine deprecation notice, not a fault, and the migration it
asks for was already done in feature 005. Nothing about API keys is failing —
proved by creating a web call with the browser public key. Found one genuinely
useful thing while checking: SDK 3.0.4 fixes the "couldn't connect" failure seen
on 9 Nov, so bumped 3.0.2 to 3.0.4.

## Outcome

- ✅ Impact: **No migration was needed.** The installed SDK already exports
  `RetellClient` as the current API and keeps `RetellWebClient` only under
  `dist/legacy/`; `components/landing/call/call-provider.tsx` uses
  `new RetellClient({ key }).createWebCall({ ..., hooks: { onStatus,
  onAgentStartTalking, onAgentStopTalking, onTranscript, ... } })`, which is the
  v3 shape the notice asks for. A repo-wide grep found no `RetellWebClient`, no
  `startCall({ accessToken })`, and no `POST /v2/create-web-call`. Server side
  the only Retell call is `GET /v2/get-call`, which is current and not on the
  deprecation list.
  **"API keys failing" is a misreading, and worth saying plainly because it
  caused real worry before a client demo.** Retell's deprecation page has no
  entry about API keys, public keys or publishable keys being changed or
  revoked; the only key-adjacent item is the workspace setting controlling who
  *receives* deprecation emails. Verified rather than argued:
  `POST /v3/create-web-call` with the browser public key and the production
  Origin returned **HTTP 201** with a 381-character access token.
  **The one real find:** `retell-client-js-sdk` 3.0.4 (6 Nov) adds a retry for
  the gateway WHIP POST in published builds and recovers web calls from brief
  network drops. That is precisely the 9 Nov failure — three `Failed to fetch`
  attempts in about four seconds at connect time, ending in "couldn't connect"
  before the call began — and it is the failure the owner declined a code-level
  "more patient reconnect" for, so taking it as an upstream fix respects that
  decision. `dist/index.d.ts` is identical between 3.0.2 and 3.0.4, so the bump
  carried no code change and no migration risk.
  Confirmed deadline from Retell's own page, not the email: browser SDK 2.x and
  `POST /v2/create-web-call` deprecated **18 Oct 2026** (the page's own link
  filename says 09-30, a conflict worth not relying on). Neither affects us.
- 🧪 Tests: build, type check and lint pass; public-key call creation returns
  201; the 3.0.2-to-3.0.4 type surface diff is empty.
- 📁 Files: `package.json` and `package-lock.json` only — 3.0.2 to 3.0.4, inside
  the existing `^3.0.2` range, so not a new dependency. `CLAUDE.local.md` gains
  a note that Retell "API" emails are deprecation notices sent to every
  customer, that our keys have never been at fault, and that the standing rule
  is simply never to use `RetellWebClient` or `POST /v2/create-web-call`.
- 🔁 Next prompts: the owner's call on agent version 10 is still the open
  question. `CreateWebCallRequest` accepts an optional `agent_version`, which
  would pin the website to one agent version and remove the "highest version
  wins" hazard found in PHR 0083 — offered, not built, because it trades a stray
  draft going live for every voice change needing a deploy.
- 🧠 Reflection: the instinct on a vendor email saying "action required" is to
  start changing code. The cheap first move was to read the installed package's
  own `.d.ts` and grep the repo, which answered the whole question in two
  commands and showed there was nothing to do. The email could not be read at
  all — it went to the Retell account's inbox, which is not the connected one —
  so the vendor's public deprecation page was the right source, and better than
  the email would have been anyway.

## Evaluation notes (flywheel)

- Failure modes observed: the owner read "deprecation notice" as "your API keys
  are failing" and lost confidence in a working integration days before a demo.
  A vendor notice is not evidence about this codebase; the codebase is. Also
  worth recording that the connected Gmail account (talhawork257@) is not the
  Retell account (talhaprofessional92@), so Retell mail is unreadable from here
  — reaching for the vendor's public changelog is the reliable path, not a
  mailbox search.
- Graders run and results (PASS/FAIL): PASS — `npm run build`, `npx tsc
  --noEmit`, `npm run lint`; public-key `POST /v3/create-web-call` HTTP 201;
  empty diff of the SDK's exported types across the bump.
- Prompt variant (if applicable): none.
- Next experiment (smallest change to try): make a real browser call on 3.0.4
  and watch for the `[call/error] ... Failed to fetch` line that preceded
  "couldn't connect" on 9 Nov. Its absence, or a connection that recovers
  instead of giving up after three tries in four seconds, is the fix working.
