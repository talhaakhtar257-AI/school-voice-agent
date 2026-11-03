# Contract change: `POST /api/send-details`

**Feature**: 013-call-speed-cost | Relates to FR-005, FR-006, FR-007, D-003

## What does not change

| | |
|---|---|
| Method and path | `POST /api/send-details` |
| Auth | `X-Agent-Secret` header, checked first; missing or wrong → `401` |
| Request body | unchanged — `topics`, optional `class_wanted`, optional `answers`, inside Retell's `{name, call, args}` wrapper |
| Response shape | unchanged — `{ ok, sent, say }`; `say` is the sentence the agent speaks |
| Retell tool settings | unchanged (`speak_during_execution` on). No agent edit needed |

## What changes

The response is sent **before** the email, not after it.

| | Before | After |
|---|---|---|
| Order | read call → read lead → read + parse whole content doc → render HTML → send email (8s timeout) → respond | respond immediately → do all of that in `after()` |
| Parent experience | the agent says "one moment" then goes silent for up to 8s | the conversation continues without a pause |
| Per-call limit | none | at most 3 sends per call (FR-007) |

## Behaviour requirements

1. **The reply does not wait on the email.** The response is produced from what
   is already known and returned at once.
2. **`say` must stay honest.** The agent speaks this sentence, so it must not
   claim the email has arrived — only that it is being sent. If the send later
   fails, the parent was not told a falsehood (Principle I).
3. **The email is still sent**, in `after()`, and a failure is recorded on the
   call row's existing `email_error` rather than lost (FR-006). Nothing is
   waiting to observe it, so it must be logged.
4. **The fourth request in one call sends nothing.** It returns `ok` with a
   `say` that explains the details have already been sent and offers the office
   number, in the parent's language. The count is per `call_id`, derived from
   what the call has already recorded — not held in memory, which would reset
   on a new function instance.
5. **A parent's phone number is never logged in plain text**, including from
   inside `after()`.
6. **Hanging up mid-send is safe.** `after()` runs even when the response did
   not complete, so the email either sends or records its failure.

## Verification

- Mid-call, ask for the details: the agent keeps talking, and the email arrives
  shortly after.
- Ask four times in one call: three emails, and the fourth time the agent offers
  the office number.
- With the email provider misconfigured: the conversation is unaffected and
  `email_error` is set on the call.
