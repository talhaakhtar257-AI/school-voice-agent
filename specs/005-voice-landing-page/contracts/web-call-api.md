# Contract: `POST /api/retell/web-call`

**Feature**: `005-voice-landing-page` | **Phase**: 1

Called by the landing page (same origin) when a parent taps Talk, to mint a
Retell web-call token. Keeps `RETELL_API_KEY` server-side and enforces "no call
without published content" (FR-007).

---

## Request

```
POST /api/retell/web-call
```

No body, no auth header — the page is public. (No rate limiting this phase; a
follow-up before the page is advertised.)

## Responses

All responses are **200**. The panel branches on the shape, so a "cannot start"
outcome renders a calm bilingual message, never a browser error (FR-028, FR-012,
FR-015).

### Start the call

```json
{ "accessToken": "eyJ…", "agentId": "agent_1234" }
```

The browser SDK connects with `accessToken`. Token is short-lived (Retell's
default).

### Cannot start — nothing published

```json
{ "reason": "no-content" }
```

`readLiveForApi()` returned nothing. The panel disables the button and shows
"the assistant has no information to share yet — please call the office", with
the phone number (FR-007, SC-010).

### Cannot start — not configured

```json
{ "reason": "not-configured" }
```

`RETELL_API_KEY` or `NEXT_PUBLIC_RETELL_AGENT_ID` is absent. Same fallback
display as `no-content`, wording "the assistant is not available right now".

### Cannot start — Retell refused

```json
{ "reason": "retell-error" }
```

Retell's API returned an error. Same fallback. Logged server-side as route +
status + timestamp; no key, no token.

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
2. Read `RETELL_API_KEY` and `NEXT_PUBLIC_RETELL_AGENT_ID` — if either absent →
   `{ reason: "not-configured" }`.
3. Read or set the `visitor_id` cookie (D-010).
4. **Limit check (`lib/voice/limits.ts`), in one request:**
   - `voice_usage_daily` for `(visitor_id, today)` — if `call_count >=
     VOICE_MAX_CALLS_PER_VISITOR_PER_DAY` → `{ reason: "capped" }`.
   - `voice_usage_monthly` for the current month — if `reserved_minutes +
     (VOICE_MAX_CALL_SECONDS / 60)` would exceed `VOICE_MONTHLY_CAP_MINUTES` →
     `{ reason: "capped" }`.
   - Otherwise, increment both (daily `call_count += 1`, monthly
     `reserved_minutes += VOICE_MAX_CALL_SECONDS / 60`) and continue.
5. `POST` to Retell's create-web-call endpoint with the API key and the agent id,
   and (if supported) the max-duration setting matching
   `VOICE_MAX_CALL_SECONDS`. Non-2xx → `{ reason: "retell-error" }`. The
   reservation from step 4 is **not** rolled back on this failure — accepted as
   simpler than a compensating transaction, and it only ever under-uses the
   monthly capacity, never exceeds it.
6. Return `{ accessToken, agentId }`.

`export const dynamic = "force-dynamic"`. Uses `lib/supabase/admin.ts` for the
content check and the limit tables.

## Test command

```bash
# nothing published -> { "reason": "no-content" }
curl -s -X POST http://localhost:3000/api/retell/web-call | jq

# with content published but no RETELL_API_KEY -> { "reason": "not-configured" }

# fully configured -> { "accessToken": "...", "agentId": "..." }
```
