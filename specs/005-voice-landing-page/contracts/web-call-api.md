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

### 405 — wrong method

```json
{ "error": "method not allowed" }
```

## Behaviour

1. `readLiveForApi()` — if empty → `{ reason: "no-content" }`.
2. Read `RETELL_API_KEY` and `NEXT_PUBLIC_RETELL_AGENT_ID` — if either absent →
   `{ reason: "not-configured" }`.
3. `POST` to Retell's create-web-call endpoint with the API key and the agent id.
   Non-2xx → `{ reason: "retell-error" }`.
4. Return `{ accessToken, agentId }`.

`export const dynamic = "force-dynamic"`. Uses `lib/supabase/admin.ts` for the
content check.

## Test command

```bash
# nothing published -> { "reason": "no-content" }
curl -s -X POST http://localhost:3000/api/retell/web-call | jq

# with content published but no RETELL_API_KEY -> { "reason": "not-configured" }

# fully configured -> { "accessToken": "...", "agentId": "..." }
```
