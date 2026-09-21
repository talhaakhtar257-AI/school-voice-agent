---
paths:
  - "app/api/**/*.ts"
  - "app/api/**/*.tsx"
---

# API rules

These endpoints are called by the Retell voice agent, not by a browser. Treat
every request as untrusted.

## Security

- Every endpoint checks a shared secret header before doing anything else.
  Reject with 401 if it is missing or wrong.
- Exceptions, because the caller cannot send our header:
  - `/api/retell/web-call` and `/api/leads/email` are called by the parent's
    browser, which cannot hold a secret. They are protected by the visitor
    cookie instead.
  - `/api/retell/webhook` is called by Retell's webhook, which sends no custom
    headers. The secret goes in the `secret` query parameter, and every call is
    read back from Retell's own API before anything is stored.
- Validate every field with Zod before touching the database.
- Never trust a field's type or length because the agent "should" send it right.

## Saving leads

- All lead fields except the timestamp are optional. A parent may refuse to
  answer. Save what you have.
- A phone number or a name is stored only if the parent confirmed it after the
  agent read it back. An unconfirmed value is left empty — save the lead anyway,
  without that field. Never store a value the parent did not confirm.
- Save the consent flag with every lead. If consent is false, still save the
  lead but leave the phone number empty.
- Set status to `new` on creation. Never set any other status from the API.
- One lead per call. A later save in the **same** call (same Retell call id)
  updates that call's lead. Never touch another call's lead.
- An update never replaces a stored value with an empty one, and never replaces
  a confirmed name or phone with an unconfirmed one.
- A save with no call id creates a new row, as before.

## Logging

- Never log a phone number, a parent name, or a student name in plain text.
- Log the lead id and the outcome, nothing else identifying.
- On error, log enough to debug: endpoint, error message, timestamp.

## Responses

- Return 200 with `{ ok: true, id }` on success.
- Return 400 with a plain message on validation failure.
- Return 401 on a bad secret.
- Never return database errors or stack traces to the caller.

## Testing

Every endpoint needs a documented way to test it with fake data using curl,
before the voice agent is connected. Put the example command in a comment at the
top of the route file.
