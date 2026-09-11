# Research: Parent-Facing Voice Landing Page

**Feature**: `005-voice-landing-page` | **Date**: 2026-09-11
**Phase**: 0 — Outline & Research

The stack is fixed by the constitution. What follows are the choices this feature
makes and why.

---

## D-001 — Retell web call: a server-side gate, then a browser-direct call with a public key

**Corrected 2026-09-11** after installing `retell-client-js-sdk` and reading its
types. The originally planned design (a server route minting a short-lived
`access_token` for the browser) assumed the SDK's `RetellWebClient` class —
which its own types mark `@deprecated … Removed in 4.0`. The current, supported
class is `RetellClient`, constructed in the **browser** with a **publishable
key** (`new RetellClient({ key: NEXT_PUBLIC_RETELL_PUBLIC_KEY })`), whose
`createWebCall({ agent_id, hooks })` both creates the call and connects the
audio transport in one client-side step. This key is designed to be public —
the same pattern as a Stripe publishable key — not a secret to keep server-side.

**Decision**: Keep `POST /api/retell/web-call` as a **pre-flight gate only**. It
checks published content (FR-010) and the three usage limits (FR-030–034) and
returns `{ ok: true }` or a typed `{ reason }` — no token, because there is
nothing left to mint. On `{ ok: true }`, `talk-panel.tsx` itself constructs
`RetellClient` with `NEXT_PUBLIC_RETELL_PUBLIC_KEY` and calls `createWebCall({
agent_id: NEXT_PUBLIC_RETELL_AGENT_ID, hooks })`.

**Rationale**:
- FR-007/FR-010 and FR-030–034 still need one place the browser cannot bypass —
  the gate route remains that place. What changed is what it returns, not
  whether it exists.
- The publishable key is meant for the browser; there is no longer a secret
  Retell credential in this feature to protect. `RETELL_API_KEY` is replaced by
  `NEXT_PUBLIC_RETELL_PUBLIC_KEY` throughout the plan and data model.
- Building against the class the SDK's own types mark for removal would create
  guaranteed rework; `RetellClient`/`createWebCall`/`WebCallSession` is the
  surface documented as current.

**Alternatives considered**:
- *The deprecated `RetellWebClient` + a server-minted `access_token`* — rejected;
  builds on a class slated for removal in the SDK's next major version.
- *No gate route at all, browser calls `createWebCall` directly* — rejected; it
  is the only way to enforce FR-010 and the usage limits before a call starts.

---

## D-002 — Dependency: `retell-client-js-sdk`

**Decision**: Add `retell-client-js-sdk` (v3.0.1, the version that installed).
Import `RetellClient` and its `createWebCall` in `components/voice/talk-panel.tsx`
only. Its `hooks` (`onStatus`, `onAgentStartTalking`/`onAgentStopTalking`,
`onTranscript`, `onEnd`, `onError`) drive D-001's state mapping and D-005's
transcript directly — no manual event wiring needed.

**Rationale**: It is Retell's own browser SDK for web calls — WebRTC setup,
microphone handling, and the event stream (call start/end, agent talking, live
transcript) are exactly what FR-004–FR-006 need, and hand-rolling WebRTC is the
kind of clever code Constitution VIII forbids. It is published by Retell and
widely used.

**Needs the maintainer's yes** — `CLAUDE.md` rule. The exact class and event
names are read from the installed package's `.d.ts` in the first client task, not
assumed here.

**Alternative considered**: *A raw `<script>` from Retell's CDN* — avoids a
`package.json` entry but is unversioned, unpinned, and harder to type. Rejected.

---

## D-003 — The `leads` table and `POST /api/leads`

**Decision**: One new table, `leads`, holding the fields feature 004's spec lists
for the dashboard, all nullable except `id`/`created_at`, `status` constrained to
`new | contacted | applied | closed` and always `new` on insert. One endpoint,
`POST /api/leads`, agent-facing: shared-secret header, Zod validation, unknown
fields stripped, `*Confirmed` booleans gate whether `phone`/`name`/`studentName`
are stored, a new row per request.

**Rationale**: `.claude/rules/database.md` names `leads` as an in-scope table for
this phase and fixes the status values and the "every column except id and
created_at is nullable" rule. `.claude/rules/api.md` fixes the endpoint shape
(secret first, Zod, 200 `{ ok: true, id }`, 400 plain message, 401 bad secret,
never leak a DB error, curl example in a comment). This feature implements the
minimum of that — the full leads/calls API is a later feature.

**Alternative considered**: *No storage; log the enquiry and move on* — rejected.
A demo that visibly forgets the parent (spec US3) is worse than one with no
capture; and feature 004 needs real rows to build against.

---

## D-004 — The written FAQ is server HTML, read from live content

**Decision**: `app/page.tsx` is a server component. It calls `readLiveForApi()`
(feature 003) and renders the published FAQ questions and answers as static HTML
below the talk area. No client-side fetch for the FAQ.

**Rationale**: FR-014 (works with JavaScript off) and FR-015 (works when the
assistant is down) are satisfied by construction if the FAQ never depends on
client JS. The talk panel is a separate client island that can fail without
taking the FAQ with it. A failed content read degrades to the button + notices +
phone number plus a plain "answers temporarily unavailable" line, never a blank
page.

---

## D-005 — On-screen transcript

**Decision**: The panel renders a running transcript from the SDK's transcript
update events, newest turn at the bottom, `dir="auto"` per line, the agent and
the parent visually distinguished.

**Rationale**: The maintainer kept this spec assumption. It helps a parent on a
cheap phone in a noisy room, helps someone switching between Urdu and English
follow along, and makes the demo legible to a client watching over a shoulder.
It is display-only — nothing is stored (no `calls` table this feature).

---

## D-006 — Bilingual strings in one file

**Decision**: `lib/strings/landing.ts` holds every sentence the page shows a
parent, English and Urdu per entry, same pattern as `lib/strings/staff-login.ts`
and `lib/strings/content-admin.ts`.

**Rationale**: Constitution IV. Keeping the pair adjacent makes a missing
translation visible in the file. No i18n library — two screens' worth of text.

---

## D-007 — Shared secret for `POST /api/leads`: reuse `RETELL_WEBHOOK_SECRET`

**Decision**: The leads endpoint checks `X-Agent-Secret` against
`RETELL_WEBHOOK_SECRET`, the same secret `GET /api/content` uses.

**Rationale**: Both endpoints are called by the same Retell agent. The spec and
`.claude/rules/api.md` both speak of "the shared secret" (singular). One secret
to manage. A separate `LEADS_API_SECRET` is a one-line change if the maintainer
wants per-endpoint isolation.

---

## D-008 — No test framework

**Decision**: Manual verification by clicking and `curl`, following
`quickstart.md`.

**Rationale**: Consistent with features 002 and 003 (their research notes) and
Constitution IX. A framework is an unapproved dependency and a workflow change.

---

## D-009 — The monthly voice cap reserves the worst case at call start

**Decision**: `POST /api/retell/web-call` reads `voice_usage_monthly` for the
current month, and if `reserved_minutes + VOICE_MAX_CALL_SECONDS/60` would exceed
`VOICE_MONTHLY_CAP_MINUTES`, refuses with `{ reason: "capped" }` before minting
anything. On success it increments `reserved_minutes` by the same amount, in the
same request.

**Rationale**: FR-032 requires the cap to actually hold, not just describe an
intention. Vercel functions do not share memory between invocations, so the
number has to live in the database, and it has to be checked and incremented in
one place before a call can start — otherwise two requests arriving together
could both pass the check. Reserving the *maximum* possible length rather than
waiting to learn the *actual* length avoids needing Retell to tell us how a call
went, which would mean webhooks and a call-tracking table — the `calls` table is
explicitly out of scope for this feature. The trade-off (a short call still
"spends" the full reservation) is named in `plan.md` as a risk, not hidden.

**Alternatives considered**:
- *Record actual duration via a Retell webhook, reconcile after the fact* — more
  accurate, but needs an authenticated webhook endpoint and a place to store
  per-call records, which pulls in the `calls` table this feature deliberately
  excludes. A good follow-up once that table exists for other reasons.
- *An in-memory or edge-cache counter* — does not survive across Vercel's
  serverless instances; would need a new external service (Redis, etc.), a
  bigger dependency than one column in Postgres.

---

## D-010 — The daily per-visitor cap uses a first-party cookie

**Decision**: `POST /api/retell/web-call` reads a `visitor_id` cookie; if absent,
generates a random one and sets it on the response regardless of outcome. Checks
and increments `voice_usage_daily` keyed on `(visitor_id, today's date)` against
`VOICE_MAX_CALLS_PER_VISITOR_PER_DAY`.

**Rationale**: FR-031 needs *some* notion of "the same visitor" without a login,
which this page will never have (FR-001). A first-party cookie is allowed —
`CLAUDE.md` only forbids `localStorage`/`sessionStorage`; feature 002 already
uses cookies for the (unrelated) staff session. The identifier is random and
holds no personal data.

**Accepted limitation**: clearing cookies resets the count (spec edge case). The
monthly cap (D-009), which does not depend on visitor identity, is the real
backstop against runaway cost; the daily cap is aimed at accidental repeat use
and casual scripting, not a determined bypass.

---

## D-011 — The text chat reuses `lib/content/simulate.ts` directly

**Decision**: `components/voice/text-chat.tsx` is a client component that
receives the live `ContentDoc` as a prop from `app/page.tsx` (the same document
the written FAQ renders from) and calls `simulate()` — the pure keyword-matching
function feature 003 built for its draft-content test tool — to answer a typed
question. No new endpoint, no new matching logic.

**Rationale**: The maintainer confirmed the text chat should answer from
published content rather than run a second AI (spec assumption, confirmed). The
matching behaviour needed — score FAQs and escalation topics, hand off on an
escalation match, say so when nothing matches — is exactly what `simulate()`
already does; only the surrounding strings change ("from our published
information" rather than "this is a simulation of the draft"). Reusing it is
also the plainest way to guarantee FR-017 (escalation topics route to the office
in text too): both paths call the same function.

---

## D-012 — Logo, decision line, and how-it-works strip: content, not logic

**Decision**: The school logo is a placeholder SVG in `public/`, the decision
line ("final decisions are made by school staff") and the three how-it-works
steps are entries in `lib/strings/landing.ts`, rendered by small presentational
components (`how-it-works.tsx`) or inline in `page.tsx`.

**Rationale**: None of these need any logic — they are static bilingual content,
same treatment as every other string in this project. The logo follows the same
"obviously fake until replaced" rule as the office phone number placeholder
(project pattern, first used in feature 002): a plain graphic that cannot be
mistaken for the school's real branding.
