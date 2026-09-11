# Contract: `POST /api/retell/web-call`

**Feature**: `005-voice-landing-page` | **Phase**: 1
**Corrected 2026-09-11** — see research D-001. Retell's browser SDK
(`retell-client-js-sdk` v3) connects directly from the browser using a
publishable key; there is no server-minted access token in this design. This
route is a **pre-flight gate**, not a token mint: it checks published content
and the usage limits, and tells the browser whether it may proceed to call
Retell itself.

---

## Request

```
POST /api/retell/web-call
```

No body, no auth header — the page is public. (No bot protection beyond the
three usage limits this phase; a follow-up before the page is advertised.)

## Responses

All responses are **200**. The panel branches on the shape, so a "cannot start"
outcome renders a calm bilingual message, never a browser error (FR-041, FR-015,
FR-033).

### Proceed

```json
{ "ok": true }
```

On receiving this, `talk-panel.tsx` constructs
`new RetellClient({ key: NEXT_PUBLIC_RETELL_PUBLIC_KEY })` and calls
`client.createWebCall({ agent_id: NEXT_PUBLIC_RETELL_AGENT_ID, hooks })` itself
— that single call both creates the Retell call and connects the browser's
audio. `NEXT_PUBLIC_RETELL_PUBLIC_KEY` is a publishable key by design (like a
Stripe publishable key): safe to ship to the browser, not a secret this route
needs to protect.

### Cannot start — nothing published

```json
{ "reason": "no-content" }
```

`readLiveForApi()` returned nothing. The panel disables the button and shows
"the assistant has no information to share yet — please call the office", with
the phone number (FR-010, SC-010).

### Cannot start — not configured

```json
{ "reason": "not-configured" }
```

`NEXT_PUBLIC_RETELL_PUBLIC_KEY` or `NEXT_PUBLIC_RETELL_AGENT_ID` is absent. Same
fallback display, wording "the assistant is not available right now".

### Cannot start — a usage limit is in force

```json
{ "reason": "capped" }
```

Either the visitor's daily call count or the school's monthly minute reservation
is at its configured limit (FR-030–032). Same fallback display, wording "we've
reached today's limit for calls — please call the office" (daily) or a
month-agnostic version for the monthly cap; both point at the phone number, the
text chat, and the written FAQ (FR-033). The response does not say which of the
two limits was hit — a parent does not need to know, and it keeps the two
counters from being probeable from outside.

### 405 — wrong method

```json
{ "error": "method not allowed" }
```

## Behaviour

1. `readLiveForApi()` — if empty → `{ reason: "no-content" }`.
2. Read `NEXT_PUBLIC_RETELL_PUBLIC_KEY` and `NEXT_PUBLIC_RETELL_AGENT_ID` — if
   either absent → `{ reason: "not-configured" }`. (Both are `NEXT_PUBLIC_`
   because both are meant to reach the browser eventually; the route reads them
   from `process.env` server-side purely to fail fast with a clean message
   before the browser tries and gets a confusing SDK error.)
3. Read or set the `visitor_id` cookie (D-010).
4. **Limit check (`lib/voice/limits.ts`), in one request:**
   - `voice_usage_daily` for `(visitor_id, today)` — if `call_count >=
     VOICE_MAX_CALLS_PER_VISITOR_PER_DAY` → `{ reason: "capped" }`.
   - `voice_usage_monthly` for the current month — if `reserved_minutes +
     (VOICE_MAX_CALL_SECONDS / 60)` would exceed `VOICE_MONTHLY_CAP_MINUTES` →
     `{ reason: "capped" }`.
   - Otherwise, increment both (daily `call_count += 1`, monthly
     `reserved_minutes += VOICE_MAX_CALL_SECONDS / 60`) and continue.
5. Return `{ ok: true }`. The browser takes it from here.

`export const dynamic = "force-dynamic"`. Uses `lib/supabase/admin.ts` for the
content check and the limit tables (both are service-role only — no
`anon`/`authenticated` RLS grant, per `data-model.md`).

## Test command

```bash
# nothing published -> { "reason": "no-content" }
curl -s -X POST http://localhost:3000/api/retell/web-call | jq

# with content published but no NEXT_PUBLIC_RETELL_PUBLIC_KEY -> { "reason": "not-configured" }

# fully configured, within limits -> { "ok": true }
curl -s -X POST http://localhost:3000/api/retell/web-call | jq
```
