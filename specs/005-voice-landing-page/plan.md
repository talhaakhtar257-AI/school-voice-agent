# Implementation Plan: Parent-Facing Voice Landing Page

**Branch**: `005-voice-landing-page` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-voice-landing-page/spec.md`

## Two things need your approval before the build reaches them

1. **A new dependency: `retell-client-js-sdk`** (v2, ~10k weekly downloads,
   published by Retell). It is the browser client that runs the voice call.
   `CLAUDE.md` forbids adding a dependency without your agreement. Nothing else
   new is added.
2. **A database migration for the `leads` table.** `.claude/rules/database.md`
   requires a plain-English description and your explicit yes before it runs.
   Described in `data-model.md`; a task walks you through it and waits.

## Summary

A public page — no login, ever — whose largest element is a Talk button. Tapping
it explains the microphone, then connects the parent to the admissions assistant
running on Retell. The page shows connecting / listening / speaking states and a
running transcript, with an End Call control visible throughout. A recording
notice, a privacy line, and the office phone number are on screen before anything
starts and stay visible at 360 px. Below the talk area, the school's published
FAQs are rendered as plain server HTML so they survive JavaScript failing or the
assistant being unreachable. When the conversation ends, Retell posts the
captured enquiry to a secret-gated endpoint that stores it as a `new` lead —
every field optional, phone and name only if the parent confirmed them.

## Technical Context

**Language/Version**: TypeScript; Next.js 16 App Router (fixed by feature 001)
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr`, `zod` (present); **`retell-client-js-sdk` — to add, needs approval**
**Storage**: Supabase Postgres — one new table, `leads`, via a reviewable SQL migration
**External services**: Retell (voice agent, configured outside this repo). Two touch points: a server call to Retell's create-web-call API to mint a per-session token; Retell calling our `POST /api/leads` at the end of a conversation.
**Testing**: Manual, by clicking and by `curl`, following `quickstart.md`. No test framework (project pattern).
**Target Platform**: Vercel; parents on low-end Android phones; Retell servers call the leads endpoint
**Performance Goals**: The page's first paint (talk button, notices, phone number, written FAQ) does not wait on Retell. FAQ content is read once per request.
**Constraints**: No `localStorage`. No auth on this page. `RETELL_API_KEY` server-side only. Everything parent-facing bilingual. Usable at 360 px. No CNIC/B-Form stored or logged; no parent PII in logs.
**Scale/Scope**: One public page, two API routes, one table. A handful of concurrent calls in a demo.

No unresolved NEEDS CLARIFICATION. The two spec assumptions the maintainer was
asked about (on-screen transcript: kept; no rate limiting: accepted for the demo)
stand.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answered against `.specify/memory/constitution.md` v1.1.0.

- [x] **I. Honesty** — The agent answers only from published content; that is Retell configuration, but this page enforces the boundary by refusing to start a call when nothing is published (FR-007), and the written FAQ shows only live content.
- [x] **II. No Authority** — Nothing here confirms an admission or offers a discount. Escalation topics (feature 003) route those to the office; this page adds no path around that.
- [x] **III. Disclosure** — The page names it an "AI assistant" in both languages before a call starts; the agent itself says so when asked (FR-008, agent config).
- [x] **IV. Bilingual Prose** — Every sentence on the page exists in Urdu and English (`lib/strings/landing.ts`); the transcript renders both with `dir="auto"`; the phone number and any fees/dates shown come from one stored value (FR-024–FR-026).
- [x] **V. Confirm Before Saving** — `POST /api/leads` stores a phone number or name only when the request marks it confirmed; an unconfirmed value is dropped and the lead still saves (FR-018).
- [x] **VI. No Sensitive Data** — The leads endpoint's Zod schema has no CNIC/B-Form/payment field; unknown fields are stripped; no parent name, child name, or phone is logged (FR-022, FR-023).
- [x] **VII. Human Exit** — The office phone number is visible without scrolling in every state (FR-003), and is the offered fallback when voice fails (FR-012, FR-015).
- [x] **VIII. Simple Over Clever** — One new dependency. A server route mints the Retell token so `RETELL_API_KEY` never reaches the browser and so the "is content published" check has one home. Every file under ~200 lines.
- [x] **IX. Testable By A Non-Developer** — The talk flow is checkable by tapping; the written fallback by turning JavaScript off; the leads endpoint by `curl`. `quickstart.md` covers each. Loading and error states are designed, never blank (FR-028).
- [x] **X. Small Steps** — Phased so each step builds and runs: the written page first, then the leads endpoint, then the token route, then the live call, then the transcript.
- [x] **Feature sequencing** — Feature 003 is implemented, merged into `main`, and this branch. `app/api/content/route.ts`, `lib/content/*`, and `components/office-phone.tsx` all exist and run.

**Result**: Passes. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/005-voice-landing-page/
├── spec.md              # written
├── plan.md              # this file
├── research.md          # Phase 0 — decisions
├── data-model.md        # Phase 1 — the leads table
├── quickstart.md        # Phase 1 — how to verify by clicking and curl
├── contracts/
│   ├── leads-api.md     # POST /api/leads
│   └── web-call-api.md   # POST /api/retell/web-call
└── tasks.md             # Phase 2 — /sp.tasks, not created here
```

### Source Code (repository root)

Files marked **(new)** are created by this feature.

```text
supabase/
└── migrations/
    └── <timestamp>_leads.sql            # (new) the leads table + RLS

app/
├── page.tsx                             # rewritten — the parent-facing voice page (server component)
└── api/
    ├── leads/route.ts                   # (new) POST — Retell posts a captured enquiry; secret-gated
    └── retell/
        └── web-call/route.ts            # (new) POST — mint a Retell web-call token; refuses when no content

components/
├── office-phone.tsx                     # reused unchanged (feature 002)
└── voice/
    ├── talk-panel.tsx                   # (new) "use client" — the button, the states, End Call, the transcript
    └── mic-explainer.tsx                # (new) the pre-permission explanation shown before startCall

lib/
├── strings/landing.ts                  # (new) every bilingual sentence on the page
├── leads/
│   ├── schema.ts                        # (new) the zod schema for an incoming enquiry
│   └── queries.ts                       # (new) insertLead(), via the service-role client
├── content/queries.ts                  # reused — readLiveForApi() for the FAQ and the published check
└── supabase/admin.ts                    # reused — service-role client for both new routes
```

**Structure Decision**: One Next.js App Router project. `app/page.tsx` becomes a
server component so the FAQ and the notices are real HTML (FR-014); the only
client island is `components/voice/talk-panel.tsx`. The two API routes are thin:
one mints a token after checking content exists, the other validates and stores a
lead.

## Key Decisions and Rationale

**The Retell token is minted server-side, not with a browser public key.**
`app/api/retell/web-call/route.ts` calls Retell's create-web-call API with
`RETELL_API_KEY` (a new server-only env var) and returns a short-lived
`access_token`. This keeps the API key off the client per the project's
data-safety rules, and gives FR-007 ("refuse to start when nothing is published")
exactly one place to live — the route checks `readLiveForApi()` first and returns
a plain "no content yet" refusal instead of a token.

**The written FAQ is server-rendered from live content.** `app/page.tsx` reads
the live document directly (same `readLiveForApi()` the API route uses) and
renders the FAQ list as HTML. No client fetch, so FR-014 (works with JavaScript
off) and FR-015 (works when the assistant is down) hold by construction. If the
content read fails, the page still renders the talk button, the notices, and the
phone number with a plain "answers are temporarily unavailable" line.

**`talk-panel.tsx` is the only client component.** It owns the call lifecycle:
show `mic-explainer`, `POST /api/retell/web-call`, start the SDK call, map the
SDK's status/talking events to the connecting/listening/speaking display, render
the transcript from the SDK's update events, and show End Call throughout.
Tapping the button while a call is live does nothing (FR edge case).

**`POST /api/leads` follows `.claude/rules/api.md` exactly.** Shared-secret
header checked first (401 on miss). Zod schema with every field optional and no
CNIC/B-Form/payment field defined, so those are stripped on parse. `phone` and
`name` and `studentName` each have a paired `*Confirmed` boolean; the stored
value is blanked when its confirmation is false (FR-018). Status is set to `new`
in code, never taken from the body. Each call inserts a new row (FR-021). The
error log carries the route and message only.

**No `calls` table, no transcript storage.** The transcript is shown live and
then gone. Storing conversations is a separate feature the dashboard also needs.

## Risks

- **The office phone number is a placeholder** (`021-000-000-000`). Showing this
  page to a parent before the school's real number replaces it would send them
  to nothing. Recorded in the spec; a task re-states it at the end.
- **The talk button is public and each call costs money.** No rate limiting this
  phase (accepted). Before the page is advertised, this needs a gate — a
  follow-up, not this feature.
- **`RETELL_API_KEY` and the agent must exist for the live call to work.** Until
  the maintainer sets them up on Retell and in the environment, the token route
  returns a configuration error and the page falls back to the written FAQ — the
  same path as "assistant unavailable", so nothing breaks.
- **Retell's SDK event names.** The plan assumes the v2 `retell-client-js-sdk`
  surface (a client object, `startCall`/`stopCall`, events for call start/end,
  agent talking/stopping, transcript updates, error). The exact names are
  confirmed against the installed package's types in the first client task, not
  guessed.

## Follow-ups

- Confirm `retell-client-js-sdk` is acceptable (or name a different Retell SDK).
- Approve the `leads` table migration.
- Decide the shared secret for `POST /api/leads`: reuse `RETELL_WEBHOOK_SECRET`
  (as `/api/content` does) or a separate one. Default: reuse it.
- Add `RETELL_API_KEY` to `.env.example` and, later, to Vercel and Retell.
- After the build: create the agent on Retell, point it at `GET /api/content`,
  set `NEXT_PUBLIC_RETELL_AGENT_ID`, and configure it to `POST /api/leads` at the
  end of a call with the secret.

## Complexity Tracking

*Empty — no constitution violations to justify.*
