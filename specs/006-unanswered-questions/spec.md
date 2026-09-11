# Feature Specification: Unanswered Questions Capture

**Feature Branch**: `006-unanswered-questions`
**Created**: 2026-09-11
**Status**: Draft
**Input**: User description: "New small feature: capture questions the voice agent could not answer. A migration creating an unanswered_questions table (id, created_at, question_text, language, times_asked). POST /api/unanswered — receives a question from the voice agent, protected by the same shared secret pattern as /api/leads. If the same question arrives again, increment times_asked instead of creating a duplicate row. A dashboard screen listing them, most frequent first, with a designed empty state. Do not build a calls table or transcripts."

**Revision note (2026-09-11)**: This replaces an earlier, broader draft of
`006-voice-agent-api` that bundled this with a `calls` table and per-instance
(non-deduplicated) logging correlated to individual calls. The maintainer
explicitly scrapped that design in favour of this smaller one: a single
aggregated table with a `times_asked` counter, a standalone endpoint, and no
`calls` table at all. That earlier design is not preserved here — this
document is the real spec going forward.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The school learns what it doesn't know how to answer (Priority: P1)

During a conversation, a parent asks something the agent has no published
content for. That question is recorded, so the school can see what it's
being asked most and go add the missing answer.

**Why this priority**: This is the entire point of the feature — without it,
gaps in the published content are invisible and never get fixed.

**Independent Test**: Send a question to the endpoint with the shared secret
and confirm a row is created with `times_asked` at 1; send the same question
again and confirm the existing row's `times_asked` becomes 2, with no second
row created.

**Acceptance Scenarios**:

1. **Given** a question the agent could not answer, **When** it is reported
   for the first time, **Then** a new row is created with `times_asked` set
   to 1.
2. **Given** a question that already has a row, **When** the same question is
   reported again, **Then** the existing row's `times_asked` increases by 1
   and no new row is created.
3. **Given** a request without the agreed shared secret, **When** it tries to
   report a question, **Then** it is refused and nothing is stored or
   incremented.
4. **Given** two different questions, **When** both are reported, **Then**
   two separate rows exist, each tracked independently.

---

### User Story 2 - Staff see the most common gaps first (Priority: P1)

A member of staff opens a screen listing every unanswered question, ordered
so the ones asked most often are at the top — the clearest signal of what to
fix first.

**Why this priority**: A list nobody looks at is as good as no list. This is
what turns the captured data into something staff actually act on, so it
ranks alongside Story 1 rather than following it.

**Independent Test**: Open the screen with test data at different
`times_asked` values and confirm the highest count sorts first; open it with
an empty table and confirm a designed empty state appears, not a blank list.

**Acceptance Scenarios**:

1. **Given** unanswered questions with different `times_asked` counts,
   **When** the screen is opened, **Then** they are ordered most-asked
   first.
2. **Given** no unanswered questions have ever been logged, **When** the
   screen is opened, **Then** a designed empty state explains this
   positively — the agent has answered everything asked so far — rather than
   looking broken.
3. **Given** the screen, **When** it is reachable, **Then** it requires a
   signed-in staff session, consistent with every other dashboard screen.

---

### Edge Cases

- **Two identical questions arrive at nearly the same moment** (two parents
  asking the same thing within seconds of each other). The increment must
  not lose one of them — see Assumptions for how this is made safe.
- **A question differs only in punctuation, capitalisation, or extra
  whitespace** from an existing row (for example "what are the fees?" vs
  "What are the fees"). Whether this counts as "the same question" is
  resolved in Assumptions, since the raw text the agent sends will not
  always match byte-for-byte even when a human would call it the same
  question.
- **`question_text` arrives empty or missing.** Rejected — unlike a lead,
  a question record with no question is not a meaningful row to keep.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST store one row per distinct unanswered
  question, holding the question text, the language it was asked in, when it
  was first seen, and how many times it has been asked.
- **FR-002**: When a reported question matches an existing row (per the
  matching rule in Assumptions), the system MUST increment that row's
  `times_asked` rather than create a new row.
- **FR-003**: When a reported question does not match any existing row, the
  system MUST create a new row with `times_asked` set to 1.
- **FR-004**: `question_text` MUST be required — a request with it empty or
  missing MUST be rejected, distinct from a lead's fields, which are all
  optional.
- **FR-005**: The endpoint MUST reject any request missing the agreed shared
  secret header, storing or incrementing nothing, using the same header and
  comparison approach as `POST /api/leads`.
- **FR-006**: The endpoint MUST NOT expose internal database error details
  to the caller under any failure.
- **FR-007**: The dashboard screen MUST list every unanswered question,
  ordered by `times_asked` descending.
- **FR-008**: The dashboard screen MUST show a designed empty state when no
  unanswered questions exist, distinct from a loading state and an error
  state.
- **FR-009**: The dashboard screen MUST be reachable only by an
  authenticated member of staff, consistent with every other dashboard
  screen.
- **FR-010**: No `calls` table or call transcript is created, read, or
  referenced by this feature.

### Key Entities

- **Unanswered question**: One distinct question the agent could not answer,
  aggregated by how many times it has been asked. Not linked to any specific
  call or lead — this feature does not know which conversation a question
  came from, only that it was asked and how often.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The same question reported twice results in one row with
  `times_asked` = 2, never two rows.
- **SC-002**: A request without the correct shared secret is refused 100% of
  the time, with nothing stored or incremented.
- **SC-003**: A member of staff can identify the single most-asked
  unanswered question within 5 seconds of opening the screen (it is always
  first).
- **SC-004**: The screen renders a designed empty state, not a blank list,
  when opened against an empty table.

## Assumptions

- **Matching for "the same question" is a normalised text comparison**:
  trimmed of leading/trailing whitespace, internal whitespace collapsed to a
  single space, and compared case-insensitively — not an exact byte-for-byte
  match, and not fuzzy/semantic matching (which would need a new dependency
  and is a heavier feature than this one). "What are the fees?" and "what
  are the fees?" count as the same question; "What are the fees?" and "What
  is the fee?" do not. This is a deliberate middle ground the maintainer can
  revisit if it proves too strict or too loose in practice.
- **The increment-or-insert is done as a single atomic database operation**
  (an upsert keyed on the normalised text), not a read-then-write from
  application code, so two identical questions arriving at nearly the same
  moment both count correctly rather than racing each other.
- **`language` is optional** — the agent may not always be able to attribute
  a single language to a question with mixed Urdu/English phrasing; a NULL
  value is valid.
- **This feature does not define which content-editor screen a question
  should jump to** — feature 004's Gap List (already specced, FR-020) adds a
  link from each question to the content editor once that screen is built;
  this feature only makes the data exist and gives staff a plain list of it
  in the meantime.

## Out of Scope

- The `calls` table, call transcripts, or anything correlating a question to
  a specific conversation — explicitly excluded per the maintainer's
  instruction, a change from the earlier `006-voice-agent-api` draft.
- The "jump to content editor" link on each question — that belongs to
  feature 004's fuller Gap List screen; this feature's screen is a plain
  ranked list only.
- Deleting or editing a question record once stored, beyond the automatic
  `times_asked` increment.
- Fuzzy or semantic matching of near-duplicate questions — see Assumptions
  for the normalisation rule actually used.
- Any change to the `leads` table or `POST /api/leads` — untouched.
