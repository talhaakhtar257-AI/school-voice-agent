# Research: 010 Client Feedback Round

Each decision below was checked against Retell's documentation or the installed
`retell-client-js-sdk` 3.x source, `node_modules/retell-client-js-sdk`, on
2026-09-21.

## R-001: How the lead save learns its call id

- **Decision**: `POST /api/leads` accepts **both** body shapes Retell can send.
  - **Flat args**, the shape sent when "Payload: args only" is ON. The call id comes from an optional `retellCallId` argument.
  - **Wrapped** `{ name, call, args }`, sent when args-only is OFF. The call id is read from `call.call_id`, which Retell fills in itself.
  - We recommend turning args-only **OFF** for `save_lead`, so the call id is always the real one.
- **Rationale**: Earlier, with args-only off, the route only understood the flat shape. That is what caused the 400 errors and the empty leads. Accepting both means the Retell toggle can no longer break saving.
  - The model cannot invent a reliable call id.
  - `{{call_id}}` is documented under phone-call variables, not web calls.
- **Alternatives considered**:
  - `{{call_id}}` in the tool URL: not documented for web calls.
  - Matching a lead to its call by time: ambiguous when two calls overlap.

## R-002: Call events: trust

- **Decision**: New route `POST /api/retell/webhook`, set as the agent's webhook URL, with our secret in the query string: `?secret=…`.
  - The route **never stores the payload**. It takes `call_id` only and calls `GET https://api.retellai.com/v2/get-call/{call_id}` with `Authorization: Bearer RETELL_API_KEY`.
  - It stores what Retell returns, and only if `agent_id` equals our agent.
- **Rationale**: Retell signs webhooks (`x-retell-signature`), but its documentation only offers verification through its server SDK, `retell-sdk`, which would be a new dependency.
  - Re-fetching is equally strong, because a forged event cannot make Retell's own API return a call.
  - It also always gives us the freshest transcript.
  - The query-string secret cheaply rejects random traffic before any API call.
- **Retell behaviour relied on**:
  - Events are `call_started`, `call_ended` and `call_analyzed`. `call_analyzed` carries `call_analysis.call_summary`.
  - The timeout is 10 s, with up to 3 retries. So handlers must be idempotent and quick.
- **Alternatives considered**:
  - The `retell-sdk` package for `verify()`: a new dependency, with no gain over re-fetching.
  - Allowlisting Retell's IP (100.20.5.228): the IP could change, and it can't be seen reliably behind Vercel's proxy.

## R-003: The call id in the parent's browser (email box)

- **Decision**: Use `session.callId`, which `CallSession` declares in `dist/session/base-session.d.ts` and fills from `CreateWebCallResponse.call_id`.
  - The browser posts `{ callId, email }` to `POST /api/leads/email`, along with the visitor cookie the gate already sets.
  - The first time an email arrives for a call, the route records that visitor on the call row.
  - A different visitor sending for the same call gets 403.
  - Retell call ids are long and random, so they can't be guessed.
  - The email is stored on the **call** row, created if `call_started` hasn't arrived yet. It is copied to the lead when one exists or is created later.
- **Rationale**: Only the browser that started a call can attach an email to it, with no extra round trip at call start.
- **Alternative considered**: Asking for the email by voice. Rejected, because spelling an email aloud is error-prone and the testers asked for an input box.

## R-004: Live takeover is possible (supersedes the earlier "not possible")

- **Finding**: `retell-client-js-sdk` 3.x, **already installed**, has `client.monitorCall({ call_id })`. It returns a `MonitorSession` with:
  - `listen()`: receive-only audio;
  - `takeOver()`: silences the AI so a person talks to the parent. It asks for the microphone first; if that is refused, the AI is untouched. It is irreversible.
  - `end()`
  - `onTranscript`: the live transcript.

  The README lists the statuses: connecting → monitoring → listening → taken_over → ended.
- **Decision**: The Live calls screen offers:
  - **Watch**: live transcript;
  - **Listen**;
  - **Take over**, after a confirmation dialog;
  - **Call parent now**, the phone fallback.
- **Key handling**: monitoring needs a public key allowed to do more than start web calls. The README says `transcript: true` needs `Call.Write`.
  - The user creates a **second Retell public key** for staff, allowed only on our domain. It is stored as `RETELL_STAFF_PUBLIC_KEY`, **not** `NEXT_PUBLIC_`, so it never ships in public JavaScript.
  - The auth-protected Live calls page reads it on the server and passes it only to signed-in staff.
- **Known limit**:
  - The parent's browser still ends the call at the configured maximum length (5 minutes). A taken-over call ends at the same point.
  - The screen shows the time left before a staff member takes over.
  - Raising the limit is a setting (`VOICE_MAX_CALL_SECONDS`), not code.
- **Alternatives considered**:
  - A separate audio service: not needed.
  - Callback only: kept, but as a fallback.

## R-005: Live count without extra infrastructure

- **Decision**: The `calls` table row is created by `call_started` and closed by `call_ended`.
  - "Live" means: status `ongoing`, and started less than 15 minutes ago.
  - The screen and the menu badge re-read the data every 10 s with a small client timer calling `router.refresh()`. No realtime subscription and no package.
- **Alternative considered**: Supabase Realtime. It needs RLS publication setup, a websocket in the dashboard, and more to learn, for a 10-second gain.

## R-006: Transcript storage and masking

- **Decision**: Store Retell's `transcript_object` as JSON (`[{ role, content }]`) and `call_summary` as text.
  - Before storing, replace any run of 13 digits, with or without dashes (the CNIC and B-Form shape `\d{5}-?\d{7}-?\d`), with asterisks, in both the transcript and the summary.
- **Rationale**: Constitution VI says such numbers MUST NOT be stored anywhere. Phone numbers are 11 digits, so they are not affected.

## R-007: "Today" and "This week"

- **Decision**: Compute on the server with a fixed offset of UTC+5. Pakistan has no daylight saving.
  - Today starts at 00:00 PKT.
  - This week is the last 7 days including today, starting at 00:00 PKT six days ago.
  - The call count comes from `calls` rows. Before this feature it came from `voice_usage_daily`; the old counter stays for the limits.

## R-008: PDF text

- **Decision**: `unpdf`, a small maintained wrapper around pdf.js that works in Vercel's Node runtime. The user approved it.
  - The limit is 10 MB.
  - Empty extracted text gives the message "No text could be read from this PDF".
  - It runs in a server action with a raised body-size limit.
- **Alternative considered**: `pdf-parse`. Unmaintained, and it has a known test-file loading bug in serverless builds.

## R-009: Website import

- **Decision**: Plain `fetch`, no package.
  - Start at the URL and follow same-host `<a href>` links breadth-first, up to 10 pages.
  - Each page has an 8 s timeout and a 2 MB cap, and only `text/html` is read.
  - Remove `script`, `style`, `nav`, `footer` and tags, then decode common entities and collapse whitespace.
  - Refuse private or local addresses (localhost, 10.*, 192.168.*, 169.254.*, 127.*), so the server can't be pointed at internal machines.
- **Rationale**: School sites are small and simple. A parser library is not worth a dependency.

## R-010: Email

- **Decision**: `POST https://api.resend.com/emails` with `Authorization: Bearer RESEND_API_KEY`, sent from the webhook when `call_analyzed` is processed. There is no package.
  - To send once, the handler first sets `school_email_sent_at` / `parent_email_sent_at` with a conditional update, `where … is null`, and sends only if that update changed a row.
  - Failures are stored in `email_error`.
- **Resend and Vercel**: Resend is a plain HTTPS API. It works from Vercel functions, and Vercel lists it as an integration. The user's worry that it won't work on Vercel does not apply.
- **For the demo**: until the school's domain is verified, Resend's `onboarding@resend.dev` sender can only deliver to the Resend account owner's own address. This is fine for the demo; a verified domain is needed for launch.
