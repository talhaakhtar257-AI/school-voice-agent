# Feature Specification: Parent-Facing Voice Landing Page

**Feature Branch**: `005-voice-landing-page`
**Created**: 2026-09-11
**Status**: Draft
**Input**: User description: "Build the parent-facing voice landing page. This is the public page a parent opens to talk to the admissions assistant — no login, no authentication ever on this page. A Talk button that starts a voice conversation, largest element above the fold. Explain why the microphone is needed before the browser permission box appears. A recording notice and privacy line before any conversation starts. Visibly distinct connecting, listening and speaking states. An End Call button visible for the entire conversation. The school office phone number always visible without scrolling. A written FAQ that still works when JavaScript fails and when the assistant is unavailable, reading the published content from GET /api/content. Everything a parent reads exists in Urdu and English. Usable on a cheap Android phone at 360 pixels wide. Include a minimal endpoint to save the enquiry as a lead so a demo does not lose it: every field except the timestamp optional, phone and name stored only if the parent confirmed them, status always new, shared secret required. Out of scope: transcripts and the calls table, unanswered-question logging, page-visit or funnel tracking, the admin dashboard, and the project's phase exclusion list. Assume the voice agent is configured on Retell outside this codebase and the page connects with Retell's browser SDK."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A parent asks a question out loud and gets an answer (Priority: P1)

A parent opens the school's page on their phone. The first thing they see is a
large button inviting them to talk. They tap it, are told why the microphone is
needed, allow it, and ask — in Urdu or English — what the fee for Class 6 is. The
assistant answers from what the school has published.

**Why this priority**: This is the product. Everything else on the page exists to
support, explain, or recover from this one interaction.

**Independent Test**: With content published, open the page, tap the talk button,
ask a question the content answers, and hear the correct answer. Delivers the
entire value of the feature on its own.

**Acceptance Scenarios**:

1. **Given** content has been published, **When** a parent taps the talk button
   and allows the microphone, **Then** a conversation begins and the assistant
   answers from the published content.
2. **Given** the conversation is running, **When** the parent speaks and the
   assistant replies, **Then** the screen shows clearly which of the two is
   happening at any moment.
3. **Given** a parent asks in Urdu, **When** the assistant replies, **Then** it
   replies in the language the parent used.
4. **Given** a parent asks about something on the escalation list, such as a
   discount, **When** the assistant responds, **Then** it hands the parent to the
   office rather than answering.
5. **Given** nothing has been published yet, **When** a parent opens the page,
   **Then** the talk button is unavailable with a plain explanation and the
   office phone number is offered instead — never a broken conversation.

---

### User Story 2 - A parent who cannot talk still gets answers and reaches a person (Priority: P1)

A parent is on a bus, or has no working microphone, or the assistant is down.
They can still read the school's answers on the page, and the office phone number
is in front of them without scrolling.

**Why this priority**: The constitution requires every conversation to have a
route to a human, and the project rules require the written answers to survive
JavaScript failing and the assistant being unavailable. A demo that dead-ends
when a microphone is refused is worse than one with no voice at all. It ranks
alongside Story 1 because it is the floor beneath it.

**Independent Test**: Disable JavaScript in the browser, open the page, and
confirm the written answers and the office phone number are both readable and the
number is tappable.

**Acceptance Scenarios**:

1. **Given** JavaScript is disabled, **When** the page is opened, **Then** the
   written answers and the office phone number are both present and readable.
2. **Given** the assistant cannot be reached, **When** a parent taps the talk
   button, **Then** they are told plainly and pointed at the written answers and
   the phone number, with no technical error shown.
3. **Given** a parent refuses the microphone permission, **When** the browser
   prompt is dismissed, **Then** the page explains what happened and offers the
   written answers and the phone number.
4. **Given** any state of the page, **When** a parent looks at it on a 360-pixel
   screen, **Then** the office phone number is visible without scrolling.
5. **Given** published content contains FAQs, **When** the written answers are
   shown, **Then** they match what is live, in both languages.

---

### User Story 3 - The school receives the enquiry (Priority: P2)

A parent finishes a conversation in which they gave their name, their child's
name, the class they want, and their phone number. Those details reach the school
so somebody can call them back.

**Why this priority**: A conversation nobody follows up on is a conversation
wasted. It ranks below Stories 1 and 2 because the page is demonstrable without
it, but a demo that visibly forgets the parent is a poor one.

**Independent Test**: Send a completed enquiry to the capture endpoint with the
shared secret and confirm it is stored, then send one with fields missing and
confirm it is still stored with those fields empty.

**Acceptance Scenarios**:

1. **Given** a conversation captured a parent's details, **When** it ends,
   **Then** an enquiry is stored containing what was captured.
2. **Given** a parent refused to give some details, **When** the enquiry is
   stored, **Then** the missing fields are empty and the enquiry is still saved.
3. **Given** a phone number the parent did not confirm when it was read back,
   **When** the enquiry is stored, **Then** the phone number is left empty and
   the enquiry is still saved.
4. **Given** a request without the agreed shared secret, **When** it tries to
   store an enquiry, **Then** it is refused and nothing is stored.
5. **Given** an enquiry has just been stored, **When** it is inspected, **Then**
   its status is "new" and no other status can be set from outside.

---

### User Story 4 - A parent knows what is happening and can stop at any time (Priority: P2)

Before anything starts, a parent is told the conversation is recorded and what
happens to what they say. Once it is running, they can end it with one tap at any
moment.

**Why this priority**: Consent and control are the difference between a helpful
assistant and one that feels like surveillance. It ranks below Stories 1 and 2
because those are about getting an answer at all, but ahead of nothing — a parent
who feels trapped will not come back.

**Independent Test**: Open the page and confirm the recording notice and privacy
line are visible before any conversation can start; start a conversation and
confirm the end-call control is present throughout and works on first tap.

**Acceptance Scenarios**:

1. **Given** a parent has not yet started, **When** they look at the page,
   **Then** the recording notice and privacy line are already visible.
2. **Given** a parent taps the talk button, **When** the browser's microphone
   prompt is about to appear, **Then** the page has already explained in plain
   language why the microphone is needed.
3. **Given** a conversation is running, **When** the parent looks at the screen,
   **Then** an end-call control is visible at every moment.
4. **Given** a conversation is running, **When** the parent taps end call,
   **Then** it stops and the page returns to its starting state.
5. **Given** the assistant is asked whether it is a person, **When** it answers,
   **Then** it says plainly that it is an AI.

### Edge Cases

- **The microphone is refused or unavailable.** The page explains and falls back
  to the written answers and the phone number, rather than showing a dead button.
- **The parent's connection drops mid-conversation.** The page returns to a
  usable state and says what happened; it does not freeze in "speaking".
- **Nothing has been published yet.** The talk button is unavailable with an
  explanation, because an assistant with no approved content has nothing honest
  to say.
- **The parent taps the talk button repeatedly.** Only one conversation starts.
- **The parent closes the tab mid-conversation.** The conversation ends; anything
  captured up to that point is still worth saving.
- **JavaScript fails entirely.** The written answers and the phone number remain.
- **The published content is very large.** The written answers stay readable and
  the page still loads on a slow phone connection.
- **The same enquiry arrives twice.** Two separate enquiries are recorded rather
  than one being overwritten; deciding they are duplicates is the office's job.

## Requirements *(mandatory)*

### Functional Requirements

**The page**

- **FR-001**: The page MUST be reachable by anyone with no sign-in of any kind,
  now or later.
- **FR-002**: The talk button MUST be the largest element on the screen and MUST
  be visible without scrolling.
- **FR-003**: The school office phone number MUST be visible without scrolling in
  every state of the page, and MUST be tappable to call on a phone.

**The conversation**

- **FR-004**: A parent MUST be able to start a voice conversation with the
  admissions assistant from the page.
- **FR-005**: The page MUST show clearly distinct states for connecting, the
  assistant listening, and the assistant speaking.
- **FR-006**: An end-call control MUST be visible for the entire duration of a
  conversation and MUST end it on the first activation.
- **FR-007**: The assistant MUST answer only from published content. When no
  content has been published, starting a conversation MUST be refused with a
  plain explanation.
- **FR-008**: The assistant MUST state that it is an AI when asked.
- **FR-009**: A question on an escalation topic MUST be handed to the office
  rather than answered.

**Consent and control**

- **FR-010**: The page MUST explain why the microphone is needed before the
  browser's permission prompt appears.
- **FR-011**: A recording notice and a privacy line MUST be visible before any
  conversation can start.
- **FR-012**: Refusing the microphone MUST leave the parent with the written
  answers and the phone number, and a plain explanation of what happened.

**The written fallback**

- **FR-013**: The page MUST show the school's published questions and answers as
  readable text.
- **FR-014**: The written answers and the phone number MUST remain present and
  readable when JavaScript does not run.
- **FR-015**: The written answers MUST remain available when the assistant cannot
  be reached, and the page MUST say so plainly rather than showing a technical
  error.

**Capturing the enquiry**

- **FR-016**: The system MUST accept a completed enquiry from the assistant and
  store it for staff to follow up.
- **FR-017**: Every enquiry field except the time it was received MUST be
  optional. An enquiry with missing fields MUST still be stored.
- **FR-018**: A parent's phone number or name MUST be stored only when the parent
  confirmed it after the assistant read it back. An unconfirmed value MUST be
  left empty and the enquiry stored anyway.
- **FR-019**: A stored enquiry MUST have status "new", and no other status may be
  set by the assistant.
- **FR-020**: A request to store an enquiry MUST carry the agreed shared secret.
  A request without it MUST be refused and store nothing.
- **FR-021**: Storing an enquiry MUST NOT overwrite an existing one; each
  completed conversation records its own.
- **FR-022**: The system MUST NOT store or log a CNIC number, a B-Form number, or
  any payment detail. Such a field arriving in a request MUST be dropped and the
  rest of the enquiry saved.
- **FR-023**: A parent's phone number, name, or child's name MUST NOT be written
  to any log.

**Language**

- **FR-024**: Every sentence a parent reads on the page MUST exist in both Urdu
  and English.
- **FR-025**: Urdu text MUST render correctly and read right to left.
- **FR-026**: Values that are not language-specific — the phone number, fees,
  dates, ages, class names — MUST be shown from a single stored value, not
  duplicated per language.

**Presentation**

- **FR-027**: The page MUST be usable on a screen 360 pixels wide with no
  sideways scrolling.
- **FR-028**: The page MUST show a loading state, and an error state that names
  what a parent can do instead — never a blank screen.

### Key Entities *(include if feature involves data)*

- **Enquiry (lead)**: One parent's interest, captured from one conversation.
  Holds whatever the assistant confirmed — the parent's name, the child's name,
  the class wanted, the child's age, a phone number, the child's current class,
  the previous school, whether this is a fresh admission or a transfer, the
  language the conversation happened in — plus the time it arrived and a status
  that always begins as "new". Every field except the time may be empty. Never
  overwritten, never deleted.
- **Published content**: The school's approved answers, already owned by feature
  003. This feature only reads it — both for the assistant to answer from and for
  the written fallback.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A parent who has never seen the page before can start a
  conversation within 15 seconds of opening it, without being told how.
- **SC-002**: On a 360-pixel screen, the talk button, the recording notice, and
  the office phone number are all visible without scrolling, in 100% of page
  states.
- **SC-003**: With JavaScript disabled, the school's published answers and the
  office phone number are both readable, in 100% of attempts.
- **SC-004**: Every enquiry sent by the assistant is stored, including those with
  missing fields, in 100% of attempts.
- **SC-005**: An unconfirmed phone number or name is never stored, in 100% of
  attempts.
- **SC-006**: A request without the shared secret stores nothing, in 100% of
  attempts.
- **SC-007**: A parent can end a conversation on the first tap, at any point,
  in 100% of attempts.
- **SC-008**: No CNIC, B-Form, or payment value appears anywhere in stored data
  or logs, verified by inspection.
- **SC-009**: Asked afterwards, a parent correctly says the conversation was
  recorded and that they were talking to an AI — confirming FR-008 and FR-011
  actually landed.
- **SC-010**: When nothing has been published, a parent is never left with a
  button that appears to work but does not.

## Assumptions

- **The voice agent lives outside this codebase.** It is configured on the voice
  service with its own instructions, voice, and language settings. This feature
  builds the page that connects to it and the endpoint that receives what it
  captures. The agent's own wording and behaviour are configured there, not here.
- **Published content already exists.** Feature 003 provides the editor and the
  endpoint. This feature only reads what has been published, and refuses to start
  a conversation when nothing has been.
- **The office phone number is still a placeholder.** It stays an obviously fake
  value until the school provides the real one. That replacement is a
  prerequisite for showing this page to any parent, and is recorded as a risk
  rather than a task here.
- **The enquiry's fields follow the admin dashboard's list.** Feature 004 already
  specifies what staff expect to see for a lead; this feature stores exactly
  those fields so the dashboard has them when it is built.
- **The parent sees the conversation as text on screen as well as hearing it.**
  A parent on a cheap phone in a noisy room, or switching between Urdu and
  English, benefits from reading along, and it makes the page legible to anyone
  watching over their shoulder. Strike this if it is unwanted — it is an
  assumption, not a stated requirement.
- **No limit is placed on who may start a conversation.** The page is public and
  each conversation has a cost. For a demo this is accepted; it is recorded under
  Out of Scope and will need revisiting before the page is advertised widely.
- **One enquiry per conversation.** The assistant sends what it captured once, at
  the end.

## Out of Scope

- Call transcripts and the record of completed calls — a separate feature that
  the admin dashboard also depends on
- Logging the questions the assistant could not answer — the same separate
  feature
- Counting page visits, or any funnel or source tracking
- The admin dashboard that displays enquiries — feature 004
- The content editor — feature 003
- Editing or deleting an enquiry from this page; it only creates them
- Rate limiting, bot protection, or any cost control on starting a conversation
- Notifying anyone when an enquiry arrives
- Phone number integration, WhatsApp, payments, document upload, parent accounts,
  and multiple campuses — excluded for this whole phase by the project rules
