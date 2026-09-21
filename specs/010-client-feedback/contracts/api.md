# API Contracts: 010 Client Feedback Round

All responses are JSON. Logs never contain a phone number, a name or an email. They contain only the route, the call or lead id, the outcome and the time.

---

## 1. `POST /api/leads` (changed)

**Caller**: the Retell `save_lead` tool. **Auth**: the `X-Agent-Secret` header, unchanged.

**Body**: either shape.

```jsonc
// A. args only ON (flat)
{ "parentName": "…", "parentNameConfirmed": true, "phone": "03001234567", "phoneConfirmed": true, "retellCallId": "call_…", … }

// B. args only OFF (wrapped, recommended)
{ "name": "save_lead", "call": { "call_id": "call_…", … }, "args": { "parentName": "…", … } }
```

For shape B, the route uses `args` and takes the call id from `call.call_id`. Every other field of `call` is ignored.

**Behaviour**:

| Condition | Result |
|---|---|
| No call id | Insert a new lead, as today |
| Call id seen for the first time | Insert a lead with `retell_call_id`, then link `calls.lead_id` and copy the call's `parent_email`, `summary` and `duration` |
| Call id already has a lead | **Update** that lead with each field that is present and confirmed |

- An update **never replaces a stored value with an empty one**. It also never replaces a confirmed name or phone with an unconfirmed one.
- `status` is never changed by the API.

**Responses**:
- `200 { ok: true, id, updated: boolean }`
- `400 { error }`
- `401`
- `500`

---

## 2. `POST /api/retell/webhook?secret=…` (new)

**Caller**: Retell's agent webhook. **Auth**: the `secret` query parameter equals `RETELL_WEBHOOK_SECRET`; otherwise 401.

**Body**: `{ "event": "call_started" | "call_ended" | "call_analyzed" | other, "call": { "call_id": "…", … } }`

**Behaviour**:

1. **Other events** → `200 { ok: true, ignored: true }`.
2. **Confirm the call with Retell**: `GET https://api.retellai.com/v2/get-call/{call_id}` with `Authorization: Bearer RETELL_API_KEY`.
   - Retell returns 404 → `200 { ok: true, ignored: true }`. We answer 200 so Retell doesn't retry a forgery.
   - The call's `agent_id` isn't ours → the same.
   - Retell returns 5xx or times out → `502`. Retell retries.
3. **`call_started`**: upsert the `calls` row with status `ongoing` and `started_at`.
4. **`call_ended`**: upsert with status `ended`, `ended_at`, `duration_seconds`, and the masked `transcript` if it is present.
5. **`call_analyzed`**: upsert the masked transcript and summary, and copy summary and duration to the linked lead.
   - Stage 5 then sends the emails, once per call. See section 5.
6. **Idempotent**: the same event twice gives the same row, and no second email.

**Responses**:
- `200 { ok: true }`
- `401`
- `502` (Retell unreachable)
- `500`

**Must finish in under 10 s.** That is Retell's timeout.

---

## 3. `POST /api/leads/email` (new)

**Caller**: the parent's browser, from the call screen. **Auth**: the visitor cookie. This is browser-called like `/api/retell/web-call`, so there is no agent secret (see the plan's Complexity Tracking).

**Body**: `{ "callId": "call_…", "email": "name@example.com" }`, validated with Zod:
- email ≤ 254 characters and a valid shape;
- `callId` ≤ 200 characters.

**Behaviour**:

1. The call row doesn't exist yet → create it (`status ongoing`, `visitor_id` set to the cookie).
2. `visitor_id` is null → set it to the cookie. It differs from the cookie → `403`.
3. Set `calls.parent_email`. If a lead is linked, set `leads.email` too.

**Responses**:
- `200 { ok: true }`
- `400 { error: "invalid email" }` (shown bilingually by the page)
- `403`
- `500`

---

## 4. Dashboard server actions (signed-in staff only)

| Action | Where | Effect |
|---|---|---|
| `answerQuestion(id, question{en,ur}, answer{en,ur})` | Knowledge question page | Appends a FAQ to the **draft** doc and sets `unanswered_questions.answered_at = now()` |
| `importPdf(formData{file})` | Knowledge → Add from PDF | Checks the file is ≤ 10 MB and of type `application/pdf`, extracts the text with `unpdf`, and appends a `knowledge` entry to the draft. If there is no text: error `no-text` |
| `importWebsite(url)` | Knowledge → Add from website | Same-host crawl, ≤ 10 pages, and refuses private hosts. Appends one `knowledge` entry that combines the pages, with a heading per page |
| `saveKnowledge(id, title, text)` / `archiveKnowledge(id)` | Knowledge document page | Edits or removes the entry in the draft |
| `markContacted(leadId)` | Live calls → Call parent now | Sets the lead's status to `contacted` |

- Each action checks the staff session first, the same pattern as `app/dashboard/content/actions.ts`.
- Nothing is written to live content. Publishing stays the existing Publish flow.

---

## 5. Email (stage 5, called inside the webhook)

`POST https://api.resend.com/emails`, with `Authorization: Bearer RESEND_API_KEY`:

```json
{ "from": "EMAIL_FROM", "to": ["SCHOOL_NOTIFY_EMAIL"], "subject": "New admission enquiry — <class>", "html": "…", "text": "…" }
```

- **Sent once**: `update calls set school_email_sent_at = now() where id = … and school_email_sent_at is null returning id`. The email is sent only if a row came back.
- **The parent email** is the same, with `parent_email_sent_at`, and only if `parent_email` is set.
- **On failure**: store `email_error` and still return 200 to Retell, since the transcript is already saved.
- **Missing settings**: `RESEND_API_KEY` / `EMAIL_FROM` / `SCHOOL_NOTIFY_EMAIL` unset → skip sending and record "email not configured".
