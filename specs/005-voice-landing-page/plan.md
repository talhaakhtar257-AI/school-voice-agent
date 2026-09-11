# Implementation Plan: Parent-Facing Voice Landing Page

**Branch**: `005-voice-landing-page` | **Date**: 2026-09-11 | **Spec**: [spec.md](./spec.md)
**Revised**: 2026-09-11 after the fuller requirements list — rate limiting, text
chat, logo, decision line, how-it-works strip added.

## Three things need your approval before the build reaches them

1. **A new dependency: `retell-client-js-sdk`** (v3.0.1, published by Retell —
   the version that actually installed; its current, supported class is
   `RetellClient`, not the deprecated `RetellWebClient` the first draft of this
   plan assumed, corrected below). The browser client that runs the voice call
   and gives the page control over its own UI — confirmed as your intent (SDK
   over the fixed drop-in widget). `CLAUDE.md` forbids a dependency without your
   agreement.
2. **A database migration** adding three tables: `leads` (on the documented
   list), plus **`voice_usage_daily` and `voice_usage_monthly`** — **not** on
   `.claude/rules/database.md`'s table list. They exist only to make the three
   usage limits (FR-030–034) enforceable on Vercel, where nothing survives
   between requests without a database. No personal data in either — a random
   visitor id and counts. Say if you'd rather do this a different way; otherwise
   this is the plain request to add them to the list.
3. **A placeholder school logo** — a plain, obviously-a-placeholder graphic
   (like the placeholder phone number), until you provide the real one. Confirm
   that's fine to ship with.

## Summary

A public page — no login, ever — showing the school name and logo, a bilingual
headline, and a "Talk to Admission Office" button as the largest element above
the fold. Before the browser's microphone prompt, the page explains why it is
needed; a recording notice, a privacy line, a line naming that staff make the
final decision, and a three-step "how it works" strip are all visible first. The
call shows connecting / listening / speaking states and a live transcript, with
End Call visible throughout, and stops itself at a configured maximum length. A
parent who refuses the microphone gets a text box that answers from the same
published content, plus the written FAQ and the office number, all of which also
work with JavaScript off. Three usage limits — per-call length, calls per visitor
per day, and a monthly minute cap — sit in front of the actual voice connection
and fall back to the office number rather than an error when tripped. When a
conversation ends, Retell posts the captured enquiry to a secret-gated endpoint
that stores it as a `new` lead.

## Technical Context

**Language/Version**: TypeScript; Next.js 16 App Router (fixed by feature 001)
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr`, `zod` (present); **`retell-client-js-sdk` — to add, needs approval**
**Storage**: Supabase Postgres — `leads`, `voice_usage_daily`, `voice_usage_monthly` via one reviewable migration
**External services**: Retell (voice agent, configured outside this repo). The browser calls Retell's `createWebCall` directly with a publishable key; our server only gates (content + limits) before that and receives Retell's `POST /api/leads` at call end.
**Testing**: Manual, by clicking and `curl`, following `quickstart.md`.
**Target Platform**: Vercel; parents on Android Chrome and iPhone Safari, including slow mobile data
**Performance Goals**: First meaningful paint (name, logo, headline, button, notices, phone number, written FAQ) renders without waiting on Retell or on the usage check (FR-040).
**Constraints**: No `localStorage`/`sessionStorage` (a first-party cookie is used for the visitor id, which is allowed). No auth on this page. `NEXT_PUBLIC_RETELL_PUBLIC_KEY` is a publishable key by design — safe in the browser, not a secret to protect. Everything parent-facing bilingual. 360px, Android Chrome, iPhone Safari. No CNIC/B-Form; no parent PII in logs. The three limits are environment settings, not hardcoded (FR-034).
**Scale/Scope**: One public page, three API routes, three tables.

No unresolved NEEDS CLARIFICATION. Both spec assumptions the maintainer was asked
about are confirmed: SDK-driven custom UI; text chat answers from published
content rather than a second AI.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answered against `.specify/memory/constitution.md` v1.1.0.

- [x] **I. Honesty** — Voice and text both answer only from published content; both refuse/route rather than invent when content is absent or a topic is escalated (FR-010, FR-016, FR-017).
- [x] **II. No Authority** — FR-005 states plainly that staff make the final decision; escalation topics keep discounts and special cases off both the voice and text paths.
- [x] **III. Disclosure** — The assistant says it is an AI when asked (FR-011); the page names it as an AI assistant before any conversation starts.
- [x] **IV. Bilingual Prose** — Every parent-facing sentence, including the new decision line and how-it-works strip, exists in Urdu and English (FR-035); language-neutral values (phone, fees, dates) stored once (FR-037).
- [x] **V. Confirm Before Saving** — Phone and name stored only when confirmed (FR-024); unchanged from the prior plan.
- [x] **VI. No Sensitive Data** — No CNIC/B-Form field exists in the leads schema; the visitor-id and usage tables hold no personal data at all — a random id and a count.
- [x] **VII. Human Exit** — The office number is visible in every state, including every limit-refusal state (FR-004, FR-033).
- [x] **VIII. Simple Over Clever** — The monthly cap is enforced by reserving the worst case (the configured max call length) at call start, entirely server-side, with no dependency on hearing back from the client or on Retell webhooks — the simplest thing that makes the cap a hard ceiling. The per-call length limit is a client-side timer, acknowledged as a soft/UX limit rather than a security boundary, because enforcing it harder would need call-in-progress server control this feature does not otherwise require.
- [x] **IX. Testable By A Non-Developer** — Every path is checkable by clicking, by turning JavaScript off, or by `curl`, per `quickstart.md`. Loading and error states are designed (FR-041).
- [x] **X. Small Steps** — Phased: the static page and written FAQ first, then the leads endpoint, then the gate route with limits, then the live call.
- [x] **Feature sequencing** — Feature 003 is on `main` and this branch; its content endpoint and `simulate()` are reused directly.

**Result**: Passes, subject to the three approvals above. Complexity Tracking
records the two off-list tables.

## Project Structure

### Documentation (this feature)

```text
specs/005-voice-landing-page/
├── spec.md
├── plan.md               # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── leads-api.md
│   └── web-call-api.md
└── tasks.md               # /sp.tasks, not created here
```

### Source Code (repository root)

Files marked **(new)** are created by this feature.

```text
supabase/migrations/
└── <timestamp>_leads_and_voice_usage.sql   # (new) leads, voice_usage_daily, voice_usage_monthly

public/
└── school-logo.svg                          # (new) placeholder, obviously a placeholder

app/
├── page.tsx                                 # rewritten — server component: logo, headline, notices,
│                                             #   how-it-works, TalkPanel, TextChat, written FAQ, office phone
└── api/
    ├── leads/route.ts                       # (new) POST — unchanged from the earlier plan
    └── retell/
        └── web-call/route.ts                # (new) POST — pre-flight gate only: content check, visitor
                                              #   cookie, daily + monthly limit check. Returns { ok } or
                                              #   { reason }, never a token — the browser calls Retell itself.

components/
├── office-phone.tsx                         # reused unchanged (feature 002)
└── voice/
    ├── talk-panel.tsx                       # (new) "use client" — button, states, transcript, End Call, per-call timer
    ├── mic-explainer.tsx                    # (new) shown before startCall
    ├── text-chat.tsx                        # (new) "use client" — question box using lib/content/simulate.ts
    └── how-it-works.tsx                     # (new) the three-step strip, presentational

lib/
├── strings/landing.ts                       # (new) every bilingual sentence on the page
├── leads/
│   ├── schema.ts                            # (new) zod schema for an incoming enquiry
│   └── queries.ts                           # (new) insertLead()
├── voice/
│   └── limits.ts                            # (new) visitor cookie, daily count, monthly reservation — server-only
├── content/queries.ts                       # reused — readLiveForApi()
├── content/simulate.ts                      # reused unchanged — powers the text chat
└── supabase/admin.ts                        # reused — service-role client
```

**Structure Decision**: `app/page.tsx` stays a server component; `TalkPanel` and
`TextChat` are the only client islands, so the written page (name, logo,
headline, notices, how-it-works, FAQ, phone) is real HTML that needs neither
JavaScript nor Retell (FR-020, FR-021, FR-040). `lib/voice/limits.ts` is the one
place all three usage rules live, called only from the gate route.

## Key Decisions and Rationale

**Retell's browser SDK connects directly, with a publishable key — our route
only gates.** Corrected after installing the SDK and reading its types (see
research D-001): the supported class is `RetellClient({ key:
NEXT_PUBLIC_RETELL_PUBLIC_KEY })`, whose `createWebCall({ agent_id, hooks })`
creates the call and connects the audio in one client-side step; there is no
server-minted token to hand it. `POST /api/retell/web-call` therefore checks
published content (FR-010) and the two hard usage limits, and returns `{ ok:
true }` or a typed `{ reason }` — the panel only calls `createWebCall` after
`{ ok: true }`.

**The monthly cap reserves the worst case at call start, not the actual duration
at call end.** On `{ ok: true }`, the same request increments `voice_usage_monthly`
by the configured max-call-length, and refuses instead if that would exceed the
cap. This makes the monthly limit a hard ceiling enforced entirely server-side,
with no dependency on Retell telling us how a call actually went (which would
need webhooks and a `calls` table — explicitly out of scope). The cost: a short
call still "spends" the full reservation, so real capacity is somewhat
under-used near the cap. Accepted as the simple, safe choice (Constitution
VIII); reconciling actual duration is a named follow-up, not this feature.

**The per-call length limit is enforced by a client-side timer**, ending the SDK
call itself when reached. It is a UX pacing control, not a security boundary — a
technically determined visitor could bypass it in their own browser. The real
cost backstop is the monthly reservation above, which cannot be bypassed from the
client because the gate route checks and reserves it before the browser is ever
told it may call Retell.

**The daily per-visitor cap uses a first-party cookie**, set by the gate route
on first visit if absent. `voice_usage_daily` keys on `(visitor_id, day)`. This
is explicitly best-effort (spec assumption) — a cleared cookie resets it — which
is acceptable because the monthly cap does not depend on visitor identity at all.

**The text chat calls `lib/content/simulate.ts` directly**, the same pure
function the content editor's test tool (feature 003) already uses. `page.tsx`
passes the live document to the `TextChat` client component, exactly as it
already does for `TestTool` in the dashboard. No new matching logic, no new
endpoint for this path — it runs entirely in the browser, so it cannot write a
lead or log anything (FR-018).

**The written FAQ and the notices are what render first.** `readLiveForApi()` is
awaited before the talk button's state is known; a failed content read still
renders the button in its "not available" state plus the FAQ's "temporarily
unavailable" line, never a blank page (FR-021, FR-041).

## Risks

- **The office phone number and the school logo are both placeholders.** Neither
  can go in front of a parent until replaced with the real ones — a hard
  prerequisite, restated at the end of the task list.
- **The monthly reservation trades some capacity for a hard guarantee** (see
  above) — worth knowing if the cap seems to bind earlier than the raw minute
  math suggests.
- **`NEXT_PUBLIC_RETELL_PUBLIC_KEY` and a configured agent are required for live voice.**
  Without them the gate route returns `not-configured` and the page falls back
  to the text chat and FAQ — the same path as "assistant unavailable," so nothing
  breaks; it just means Parts 5–6 of `quickstart.md` wait until Retell is set up.
- **Two new tables outside the documented list** — flagged above for explicit
  approval, not assumed.

## Follow-ups

- Confirm `retell-client-js-sdk`, the two off-list tables, and the placeholder
  logo (the three approvals above).
- Decide the shared secret for `POST /api/leads`: reuse `RETELL_WEBHOOK_SECRET`
  (default) or a separate one.
- Add `NEXT_PUBLIC_RETELL_PUBLIC_KEY`, `VOICE_MAX_CALL_SECONDS`, `VOICE_MAX_CALLS_PER_VISITOR_PER_DAY`,
  `VOICE_MONTHLY_CAP_MINUTES` to `.env.example`.
- After the build: create the agent on Retell, set its own max-call-duration to
  match `VOICE_MAX_CALL_SECONDS` as a second line of defence, point it at
  `GET /api/content` and `POST /api/leads`, set `NEXT_PUBLIC_RETELL_AGENT_ID`.
- Later, if wanted: reconcile the monthly reservation against actual call
  duration via a Retell webhook — its own small feature, needs a `calls`-adjacent
  table already excluded from this one.
- Replace the placeholder logo and phone number with the school's real assets.

## Complexity Tracking

| Addition | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| `voice_usage_daily`, `voice_usage_monthly` tables (outside `.claude/rules/database.md`'s list) | FR-030–034 require limits that hold across requests and server instances on Vercel, which has no shared memory between them | In-memory counters do not survive Vercel's serverless model; an external cache/queue service would be a new dependency, a worse trade than two small tables with no personal data |
