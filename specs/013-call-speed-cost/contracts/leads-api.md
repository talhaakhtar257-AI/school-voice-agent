# Contract change: `POST /api/leads`

**Feature**: 013-call-speed-cost | Relates to FR-008, FR-010, D-004

## What does not change

| | |
|---|---|
| Method and path | `POST /api/leads` |
| Auth | `X-Agent-Secret` header, checked first; missing or wrong → `401` |
| Request body | unchanged — accepted flat or inside Retell's `{name, call, args}` wrapper |
| Response shape | unchanged — `{ ok, id, updated }` |
| Retell tool settings | unchanged. No agent edit needed |

## Why it changes

The 3 November test call invoked this tool **four times in two identical pairs**
on the same lead, each returning the same id with `updated: true`:

```
-> save_lead
-> save_lead
   result: {"ok":true,"id":"adf73a82…","updated":true}
   result: {"ok":true,"id":"adf73a82…","updated":true}
```

Two distinct states, four writes, each costing 3-5 serial database round trips
while the parent waited. The model fires the tool twice; the prompt cannot be
relied on to stop it, so the endpoint must make it harmless.

## What changes

| | Before | After |
|---|---|---|
| Repeat with identical fields | writes again | recognised as already stored; no write |
| Round trips per invocation | 3-5, serial | fewer, and none at all when nothing changed |
| Concurrent save from the parent's form and the agent | two writers racing one row | one row, no lost field |

## Behaviour requirements

1. **Repeat-safe.** The same meaningful fields submitted again for the same call
   leave exactly one lead, unchanged, and report success. `updated` tells the
   truth: `false` when nothing changed.
2. **Partial updates still merge.** A later request carrying only the child's
   age must not blank the class recorded earlier. Fields absent from a request
   are left alone; this is a merge, not a replacement.
3. **The product rules are untouched** (FR-010, Principle V). An unconfirmed
   name is still stored as empty, the lead still saves with whatever was
   confirmed, and every field except the timestamp may be empty. Idempotency
   decides *whether* a write happens, never *what* may be written.
4. **One lead per call** stays guaranteed by the existing partial unique index
   on `leads(retell_call_id)`. The existing retry on a unique-violation stays as
   the backstop for a genuine race.
5. **No CNIC or B-Form** value is stored or logged if one arrives; it is dropped
   and processing continues (Principle VI). Unchanged, and must stay true.
6. **A parent's phone number is never logged in plain text.** Unchanged, and
   must stay true of any new log line.

## Verification

- One call mentioning the class, then the child's age, then a transfer: one lead
  with all three recorded (SC-006).
- Send the same body twice: one lead, second response `updated: false`.
- Send a body with only `studentAge` after one with `classWanted`: both are
  present afterwards.
- Fill the pre-call form and let the agent save during the call: one lead, with
  the typed name and phone intact.
