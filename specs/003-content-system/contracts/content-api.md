# Contract: `GET /api/content`

**Feature**: `003-content-system` | **Phase**: 1

The one endpoint the Retell voice agent calls to read the school's approved
knowledge. Server-to-server. Treated as untrusted (`.claude/rules/api.md`).

---

## Request

```
GET /api/content
X-Agent-Secret: <shared secret>
```

- No body, no query parameters.
- `X-Agent-Secret` must equal `process.env.RETELL_WEBHOOK_SECRET` (D-006).
- Method is `GET` only. `POST`/`PUT`/`DELETE` → `405`.

## Responses

### 200 — content published

```json
{
  "published": true,
  "publishedAt": "2026-09-12T09:30:00.000Z",
  "content": {
    "facts": {
      "classes": ["Nursery", "Class 1"],
      "feePerClass": { "Nursery": 4000, "Class 1": 4500 },
      "ageCriteriaPerClass": { "Nursery": { "minYears": 3, "maxYears": 4 } },
      "admissionDates": [
        { "label": "Session 2027 intake", "startDate": "2026-11-01", "endDate": "2026-12-15" }
      ],
      "officeHours": [{ "days": "Mon-Fri", "opens": "08:00", "closes": "14:00" }]
    },
    "policies": {
      "admissionProcess": { "en": "...", "ur": "..." },
      "documentRequirements": { "en": "...", "ur": "..." }
    },
    "faqs": [
      { "id": "f1", "question": { "en": "...", "ur": "..." }, "answer": { "en": "...", "ur": "..." } }
    ],
    "escalationTopics": [
      { "id": "e1", "topic": { "en": "discounts", "ur": "..." }, "handoffWording": { "en": "...", "ur": "..." } }
    ]
  }
}
```

- `content` is the **live** document (FR-016). The draft is never reachable here.
- Archived FAQs and escalation topics are omitted (`archivedAt` stripped along
  with the items).
- The whole live document is returned or the whole previous one — a publish in
  progress never yields a mixture (FR-013, guaranteed by the single-row model).

### 200 — nothing published yet

```json
{ "published": false }
```

An unambiguous answer, not an error and not an empty object with keys (FR-004,
scenario 4).

### 401 — missing or wrong secret

```json
{ "error": "unauthorized" }
```

No content, no hint about why (FR-015, SC-006). Returned before any database
access.

### 405 — wrong method

```json
{ "error": "method not allowed" }
```

### 500 — unexpected

```json
{ "error": "internal error" }
```

Never a database message or stack trace (`.claude/rules/api.md`). The real error
is logged server-side with endpoint, message, timestamp — never any content.

## Test command

A runnable `curl` example lives in a comment at the top of `app/api/content/route.ts`
(`.claude/rules/api.md`):

```bash
# no secret -> 401
curl -i https://<preview-url>/api/content

# with secret -> 200
curl -s https://<preview-url>/api/content -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" | jq
```

## Notes

- The route uses the service-role Supabase client (`lib/supabase/admin.ts`),
  server-side only — never the browser, never the staff session.
- No caching: the agent must see a publish immediately. `export const dynamic =
  "force-dynamic"`.
- This endpoint is not rate-limited in this phase (out of scope); the secret is
  the only gate.
