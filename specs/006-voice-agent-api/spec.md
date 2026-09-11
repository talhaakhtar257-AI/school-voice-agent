# Feature Specification: Voice Agent API (Calls & Unanswered Questions)

**Feature Branch**: `006-voice-agent-api`
**Created**: 2026-09-11
**Status**: Draft
**Input**: User description: "Build the voice-agent API that the admin dashboard's Calls, Health, Charts, and Gap List screens all depend on. This is server-side only — no screens, no UI. It gives the Retell agent a place to report what happened after a conversation ends, and gives the dashboard real data to read instead of permanent empty states. Two new tables: calls (transcript, language, duration, started_at, outcome, correlated to a lead via retell_call_id, not a hard foreign key) and unanswered_questions (question text, when asked, which call if known — logged per-instance, not pre-aggregated). One endpoint for Retell to call at conversation end, accepting outcome/transcript/language/duration/unanswered questions together, guarded by the same shared-secret header as POST /api/leads. Every field optional except id and timestamps, same rule as leads. Out of scope: the six dashboard screens, agent settings, page-visit/funnel tracking, and any change to the leads table or endpoint."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A completed conversation is kept, not lost (Priority: P1)

A parent finishes talking to the admissions assistant. What was said, in which
language, how long it took, and how the call ended is saved permanently, so a
member of staff can look it up later — even though the screen that will show it
to them does not exist yet.

**Why this priority**: Without this, every conversation the voice agent has
ever had simply evaporates the moment the call ends. This is the foundation
the whole rest of the admin dashboard's Calls, Health, and three of its four
Charts screens are built on — nothing else in this feature matters if a
finished call isn't durably recorded.

**Independent Test**: Send a completed-call report to the endpoint with the
shared secret and confirm a row appears with the transcript, language,
duration, and outcome intact; send one with fields missing and confirm it is
still stored with those fields empty.

**Acceptance Scenarios**:

1. **Given** a conversation has just ended, **When** its report reaches the
   endpoint, **Then** a call record is stored holding the transcript, the
   language mostly spoken, how long the call lasted, when it started, and one
   of the four defined outcomes.
2. **Given** a transcript containing Urdu script, **When** it is stored,
   **Then** the Urdu text is preserved exactly as sent, not corrupted or
   replaced with broken characters.
3. **Given** a call report is missing some fields (for example, no outcome was
   determined), **When** it is stored, **Then** the missing fields are left
   empty and the call is still saved.
4. **Given** a request without the agreed shared secret, **When** it tries to
   report a call, **Then** it is refused and nothing is stored.
5. **Given** a stored call whose `retell_call_id` matches an existing lead's
   `retell_call_id`, **When** either is read back, **Then** the match can be
   found — but neither record depends on the other existing, and one arriving
   without a match is not an error.

---

### User Story 2 - The school learns what it doesn't know how to answer (Priority: P1)

During a conversation, a parent asks something the agent has no published
content for. That question is recorded exactly as asked, every time it
happens, so the school can eventually see its most common gaps and go fill
them in.

**Why this priority**: This is the entire input to the future Gap List
screen and, more importantly, to actually improving the content over time.
Ranks alongside Story 1 because both are pure data-capture with no
downstream screen yet, and both are equally foundational to different parts
of the dashboard.

**Independent Test**: Send a call-end report containing one or more
unanswered questions and confirm one row is stored per question, each linked
to the call it happened in.

**Acceptance Scenarios**:

1. **Given** a call in which the agent could not answer two different
   questions, **When** the call ends, **Then** two separate unanswered-question
   records are stored, each with its own question text and timestamp.
2. **Given** a call in which every question was answered, **When** it ends,
   **Then** no unanswered-question records are created for that call.
3. **Given** an unanswered question was logged during a call, **When** it is
   read back, **Then** it can be traced to the call it happened in, when that
   call was also reported.
4. **Given** the same question is asked in two different calls, **When** both
   are logged, **Then** two separate records exist — this feature does not
   merge or count them; a future dashboard screen ranks them by frequency.

---

### User Story 3 - A partial or malformed report from the agent doesn't disappear or break anything (Priority: P2)

The voice agent's own report of what happened is not always going to be
perfectly formed — a call might end abruptly, a field might come through
empty, or an unexpected value might arrive. None of that should mean the call
is silently dropped or that the endpoint crashes.

**Why this priority**: A voice call ending badly (dropped connection, parent
hanging up mid-sentence) is exactly when a record of what happened matters
most. This behaviour underpins Stories 1 and 2 rather than standing alone, so
it is P2 — real, but not independently valuable without them.

**Independent Test**: Send a report with only the required minimum (no
transcript, no outcome, no unanswered questions) and confirm it is still
stored as a call record, not rejected.

**Acceptance Scenarios**:

1. **Given** a call-end report with every optional field empty, **When** it
   is sent, **Then** a call record is still created, timestamped, and
   retrievable.
2. **Given** a call-end report with an outcome value outside the four defined
   values, **When** it is sent, **Then** the request is refused with a clear
   error rather than silently storing an invalid value.
3. **Given** the database is briefly unreachable, **When** a report arrives,
   **Then** the endpoint fails with a plain error and never exposes internal
   database details to the caller.

---

### Edge Cases

- **The same call is reported twice** (a retried webhook). This specification
  does not require detecting or merging duplicates — each accepted report
  simply creates its own record. Deduplication, if ever needed, is a later
  decision once real duplicate-rate data exists.
- **A call is reported with a `retell_call_id` that already exists** in the
  `calls` table. Treated as a separate acceptance scenario question, not
  resolved here: the simplest behaviour (a new row each time) is assumed;
  see Assumptions.
- **An unanswered question longer than a normal sentence** (a parent rambling)
  is stored as-is; no length limit is enforced beyond a generous maximum to
  prevent abuse.
- **A call report with unanswered questions but no outcome recorded.** Both
  parts are saved; they are independent facts about the same call.

## Requirements *(mandatory)*

### Functional Requirements

**Call records**

- **FR-001**: The system MUST store one call record per completed
  conversation, holding: the transcript, the language mostly spoken, the call
  duration, when the call started, and an outcome of exactly `answered`,
  `transferred`, `lead_captured`, or `dropped`.
- **FR-002**: Every field on a call record MUST be optional except its
  identifier and timestamps — an incomplete report is still stored, never
  rejected for missing data alone.
- **FR-003**: An outcome value outside the four defined values MUST be
  rejected with a clear error, distinct from a missing outcome (which is
  allowed).
- **FR-004**: A call record MAY carry a `retell_call_id` matching a lead's
  `retell_call_id`, but neither record's existence depends on the other —
  a call with no matching lead, and a lead with no matching call, are both
  valid states.
- **FR-005**: Transcript text containing Urdu script MUST be stored and
  retrievable exactly as sent, without corruption.

**Unanswered questions**

- **FR-006**: The system MUST store one record per question the agent could
  not answer, each holding the question text, when it was asked, and which
  call it happened during, when known.
- **FR-007**: Unanswered questions from the same call MUST be stored as
  separate records, one per question, not merged or pre-counted.
- **FR-008**: A call with no unanswered questions MUST create zero
  unanswered-question records, not an empty placeholder.

**The endpoint**

- **FR-009**: One endpoint MUST accept a single report per completed call,
  containing the outcome, transcript, language, duration, and any unanswered
  questions from that call, and MUST store the call record and every
  unanswered-question record from the same report together.
- **FR-010**: The endpoint MUST reject any request missing the agreed shared
  secret header, storing nothing, using the same header and comparison
  approach as the existing `POST /api/leads` endpoint.
- **FR-011**: The endpoint MUST NOT expose internal database error details to
  the caller under any failure.
- **FR-012**: Neither table's data may be modified or deleted through this
  endpoint once stored — it accepts new reports only, matching the project's
  own "never delete a row" rule.

### Key Entities

- **Call**: One completed conversation between a parent and the voice agent.
  Holds a transcript, a language, a duration, a start time, and an outcome.
  Not created by any other feature. Loosely associated with a **Lead**
  (feature 005) by a shared `retell_call_id`, without either depending on the
  other's existence.
- **Unanswered question**: One question the agent could not answer during one
  call. Holds the question text and when it was asked, and is associated with
  the **Call** it happened during, when that call is also known. Logged as
  individual events; aggregation into a ranked list is explicitly a later
  feature's job (the dashboard's Gap List), not this one's.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every completed conversation reported by the voice agent results
  in exactly one retrievable call record, with no data loss for the fields
  the agent provided.
- **SC-002**: A report missing some fields is still accepted and stored,
  100% of the time — no partial report is ever rejected for incompleteness
  alone.
- **SC-003**: A request without the correct shared secret is refused 100% of
  the time, with nothing stored.
- **SC-004**: An unanswered question logged during a call can be traced back
  to that specific call whenever the call itself was also reported.
- **SC-005**: A report containing Urdu-script transcript text is stored and
  read back with the script intact, verified by direct inspection of a stored
  record.

## Assumptions

- **A `retell_call_id` that already exists on a new report creates a new,
  separate call row** rather than updating the existing one. This
  specification does not build de-duplication or update-in-place logic;
  if Retell is later found to send genuine retries, that becomes its own
  follow-up once real duplicate-rate data exists.
- **"Duration" is measured in whole seconds**, stored as a number, matching
  how `VOICE_MAX_CALL_SECONDS` already measures call length elsewhere in this
  project (feature 005).
- **The transcript is stored as structured data (a sequence of turns, each
  attributed to the parent or the agent)**, not a single flattened string —
  matching how the on-screen transcript already works in feature 005's
  `talk-panel.tsx`, and what the future Calls screen's transcript viewer
  (FR-009/FR-010 of the 004 spec) will need to render both sides distinctly.
- **This feature does not define who calls the endpoint beyond "the voice
  agent"** — exactly how Retell is configured to call it (webhook, function,
  or otherwise) is a Retell dashboard configuration matter, external to this
  codebase, same as the rest of the voice agent's configuration.

## Out of Scope

- The six dashboard screens themselves, including the Calls transcript viewer,
  the Health screen's figures, the Charts screen's four charts and funnel, and
  the Gap List's ranked view — feature 004 owns all of that; this feature only
  makes the data exist for it to read.
- Aggregating or ranking unanswered questions by frequency — stored as
  individual events here; grouping and ranking is the Gap List's job.
- Agent on/off state, working hours, transfer number, and maximum call length
  — all owned by feature 004's Settings screen.
- Page-visit and funnel-source tracking on the public landing page — a gap
  flagged by feature 004's own spec, not fixed here.
- Any change to the `leads` table, `POST /api/leads`, or any other part of
  feature 005 — both already exist and are untouched by this feature.
- Detecting or merging duplicate call reports — see Assumptions.
- Real-time or push delivery of new call/unanswered-question data to any
  screen — feature 004's Leads screen already established a polling pattern
  for "appears live"; whether Calls/Health/Charts need the same is a decision
  for feature 004, not this one.
