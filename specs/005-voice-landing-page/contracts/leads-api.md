# Contract: `POST /api/leads`

**Feature**: `005-voice-landing-page` | **Phase**: 1

Called by the Retell voice agent when a conversation ends, to hand over the
enquiry. Server-to-server. Untrusted (`.claude/rules/api.md`).

---

## Request

```
POST /api/leads
X-Agent-Secret: <shared secret>
Content-Type: application/json

{
  "parentName": "Ahmed Khan",
  "parentNameConfirmed": true,
  "studentName": "Ali Ahmed",
  "studentNameConfirmed": true,
  "classWanted": "Class 6",
  "studentAge": 11,
  "phone": "03001234567",
  "phoneConfirmed": false,
  "currentClass": "Class 5",
  "previousSchool": "City School",
  "admissionType": "transfer",
  "language": "ur",
  "consent": true,
  "retellCallId": "call_abc123"
}
```

- `X-Agent-Secret` must equal `RETELL_WEBHOOK_SECRET` (D-007). Checked first.
- Every field is optional. Unknown fields are ignored.
- No CNIC, B-Form, or payment field is defined; if sent, it is dropped (FR-022).
- `*Confirmed` booleans decide whether `parentName` / `studentName` / `phone` are
  stored. Absent or `false` → that value is not stored (FR-018).

## Responses

### 200 — stored

```json
{ "ok": true, "id": "d5f1…" }
```

Returned even when every data field was empty — the row exists with `status:
"new"` and the timestamps (FR-017). In the example above, `phone` is **not**
stored because `phoneConfirmed` is `false`; `parent_name` and `student_name` are.

### 400 — the body did not validate

```json
{ "error": "studentAge must be a whole number" }
```

A plain message. Never a Zod dump or a DB error.

### 401 — missing or wrong secret

```json
{ "error": "unauthorized" }
```

Nothing stored, no hint why (FR-020, SC-006). Returned before any DB access.

### 405 — wrong method

```json
{ "error": "method not allowed" }
```

### 500 — unexpected

```json
{ "error": "internal error" }
```

Logged server-side as route + message + timestamp only. **No `parentName`,
`studentName`, or `phone` is ever logged** (FR-023, `.claude/rules/api.md`).

## Test command

In a comment at the top of `app/api/leads/route.ts`:

```bash
# no secret -> 401
curl -i -X POST https://<url>/api/leads

# full enquiry, phone unconfirmed -> 200, phone not stored
curl -s -X POST https://<url>/api/leads \
  -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" \
  -d '{"parentName":"Test","parentNameConfirmed":true,"phone":"03001234567","phoneConfirmed":false,"classWanted":"Class 6"}'

# empty enquiry -> 200, a bare row
curl -s -X POST https://<url>/api/leads \
  -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" -d '{}'
```

## Notes

- Each request inserts a new row (FR-021). No de-duplication.
- Uses the service-role client (`lib/supabase/admin.ts`), server-side only.
- `export const dynamic = "force-dynamic"`.
- Never rate-limited this phase (accepted); the secret is the only gate.
