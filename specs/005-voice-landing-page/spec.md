# Feature Specification: Parent-Facing Voice Landing Page

**Feature Branch**: `005-voice-landing-page`
**Created**: 2026-09-11
**Status**: Draft (revised 2026-09-11 with the fuller requirements list)
**Input**: User description: "Build the public landing page where parents talk to the agent. School name and logo, headline in Urdu and English. A large 'Talk to Admission Office' button using the Retell web widget. Explain why the microphone is needed BEFORE the browser asks. A connecting state, then a clear listening or speaking state. An always-visible End Call button. Recording notice and privacy line before any conversation starts. A visible line stating final admission decisions are made by school staff. The office phone number, always visible. A text chat fallback for parents who refuse the microphone. A written FAQ below that works even if the AI is unavailable. A three-step 'how it works' strip. Protection: maximum call length per visitor, maximum calls per visitor per day, a monthly minutes cap — when reached, show the office number instead of failing. Must work on Android Chrome and iPhone Safari, on slow mobile data. (Earlier input also specified: no login ever on this page; the microphone explanation and recording/privacy notices; the assistant answers only from published content and says it is an AI; a minimal endpoint to store the enquiry as a lead — every field optional, phone and name only if the parent confirmed them, status always new, shared secret required; out of scope: transcripts and the calls table, unanswered-question logging, page-visit or funnel tracking, the admin dashboard, and the project's phase exclusion list.)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A parent asks a question out loud and gets an answer (Priority: P1)

A parent opens the school's page on their phone. They see the school name and
logo, a headline in their language, and a large button labelled "Talk to
Admission Office". They tap it, are told why the microphone is needed, allow it,
and ask — in Urdu or English — what the fee for Class 6 is. The assistant answers
from what the school has published.

**Why this priority**: This is the product. Everything else on the page supports,
explains, or recovers from this one interaction.

**Independent Test**: With content published, open the page, tap the button, ask
a question the content answers, and hear the correct answer.

**Acceptance Scenarios**:

1. **Given** content has been published, **When** a parent taps the button and
   allows the microphone, **Then** a conversation begins and the assistant
   answers from the published content.
2. **Given** the conversation is running, **When** the parent speaks and the
   assistant replies, **Then** the screen shows clearly which of the two is
   happening at any moment.
3. **Given** a parent asks in Urdu, **When** the assistant replies, **Then** it
   replies in Urdu.
4. **Given** a parent asks about an escalation topic such as a discount, **When**
   the assistant responds, **Then** it hands the parent to the office rather than
   answering.
5. **Given** nothing has been published yet, **When** a parent opens the page,
   **Then** the button is unavailable with a plain explanation and the office
   phone number is offered instead.
6. **Given** the page, **When** a parent reads it, **Then** a visible line states
   that final admission decisions are made by school staff, not the assistant.

---

### User Story 2 - A parent who cannot or will not talk still gets answers and reaches a person (Priority: P1)

A parent is in a noisy place, or has no working microphone, or does not want to
speak aloud, or the assistant is down. They can type their question into a text
chat and get an answer from the school's published information; they can read the
written FAQ; and the office phone number is in front of them without scrolling.

**Why this priority**: The constitution requires every conversation to have a
route to a human, and the project rules require the written answers to survive
JavaScript failing and the assistant being unavailable. A page that dead-ends
when a microphone is refused is worse than one with no voice at all.

**Independent Test**: Refuse the microphone; confirm a text chat and the written
FAQ and the phone number are all offered. Separately, disable JavaScript and
confirm the written FAQ and the phone number are still readable.

**Acceptance Scenarios**:

1. **Given** a parent refuses the microphone permission, **When** the prompt is
   dismissed, **Then** the page explains what happened and offers a text chat, the
   written FAQ, and the phone number.
2. **Given** the text chat, **When** a parent types a question the published
   content answers, **Then** they get that answer, labelled as coming from the
   school's published information.
3. **Given** the text chat, **When** a parent types a question about an
   escalation topic, **Then** it points them to the office rather than answering.
4. **Given** JavaScript is disabled, **When** the page is opened, **Then** the
   written FAQ and the office phone number are both present and readable.
5. **Given** the assistant cannot be reached, **When** a parent taps the button,
   **Then** they are told plainly and offered the text chat, the FAQ, and the
   phone number — no technical error.
6. **Given** any state of the page on a 360-pixel screen, **When** a parent looks
   at it, **Then** the office phone number is visible without scrolling.
7. **Given** published content contains FAQs, **When** the written answers are
   shown, **Then** they match what is live, in both languages.

---

### User Story 3 - The school receives the enquiry (Priority: P2)

A parent finishes a conversation in which they gave their name, their child's
name, the class they want, and their phone number. Those details reach the school
so somebody can call them back.

**Why this priority**: A conversation nobody follows up on is wasted. The page is
demonstrable without it, but a demo that visibly forgets the parent is a poor
one.

**Independent Test**: Send a completed enquiry to the capture endpoint with the
shared secret and confirm it is stored; send one with fields missing and confirm
it is still stored with those fields empty.

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
moment. A three-step "how it works" strip sets expectations before they begin.

**Independent Test**: Open the page; confirm the recording notice, the privacy
line, and the how-it-works strip are visible before a conversation can start;
start a conversation and confirm the end-call control is present throughout and
works on first tap.

**Acceptance Scenarios**:

1. **Given** a parent has not yet started, **When** they look at the page,
   **Then** the recording notice, the privacy line, and a three-step
   "how it works" strip are already visible.
2. **Given** a parent taps the button, **When** the browser's microphone prompt
   is about to appear, **Then** the page has already explained in plain language
   why the microphone is needed.
3. **Given** a conversation is running, **When** the parent looks at the screen,
   **Then** an end-call control is visible at every moment.
4. **Given** a conversation is running, **When** the parent taps end call,
   **Then** it stops and the page returns to its starting state.
5. **Given** the assistant is asked whether it is a person, **When** it answers,
   **Then** it says plainly that it is an AI.

---

### User Story 5 - The school's voice bill cannot run away (Priority: P2)

The page is public and every conversation costs money. A single visitor cannot
tie up the line or rack up cost, and the school's total monthly voice usage
stays under a cap it sets. When a limit is hit, a parent is shown the office
phone number rather than a failure.

**Why this priority**: A demo that a curious visitor — or a script — can turn
into a large bill is not shippable. It ranks with the other P2 stories because
the page can be shown without it but not left running without it.

**Independent Test**: Set low limits; start a call and confirm it ends on its own
at the per-call limit; start calls until the per-day limit and confirm the next
is refused with the phone number; set the monthly cap below current usage and
confirm every new call is refused with the phone number.

**Acceptance Scenarios**:

1. **Given** a per-call time limit, **When** a conversation reaches it, **Then**
   it ends automatically and the page says the call time is up and shows the
   phone number.
2. **Given** a per-visitor daily call limit, **When** a visitor has reached it,
   **Then** the next attempt is refused with a plain message and the phone
   number, not an error.
3. **Given** a monthly total-minutes cap, **When** the school's usage for the
   month has reached it, **Then** every new call is refused with the phone
   number until the month rolls over.
4. **Given** any limit is in force, **When** a parent is refused, **Then** the
   written FAQ and the text chat are still offered alongside the phone number.
5. **Given** the limits, **When** a normal parent has one ordinary conversation,
   **Then** they never encounter a limit.

### Edge Cases

- **The microphone is refused or unavailable.** The page offers the text chat,
  the written FAQ, and the phone number — never a dead button.
- **The parent's connection drops mid-conversation.** The page returns to a
  usable state and says what happened; it does not freeze in "speaking".
- **Nothing has been published yet.** The button is unavailable with an
  explanation.
- **The parent taps the button repeatedly.** Only one conversation starts.
- **The parent closes the tab mid-conversation.** The conversation ends; anything
  captured up to that point is still worth saving; the elapsed minutes still
  count toward the caps.
- **JavaScript fails entirely.** The written FAQ and the phone number remain.
- **The published content is very large, or the connection is slow mobile data.**
  The written FAQ stays readable and the page's first view still loads.
- **The same enquiry arrives twice.** Two separate enquiries are recorded.
- **A visitor clears their cookies to reset their daily count.** Best-effort
  per-visitor limits may be bypassed this way; the monthly cap is the backstop
  and is not per-visitor.
- **iPhone Safari's stricter autoplay and microphone rules.** The assistant's
  first audio plays only after the parent's tap, and the page does not assume the
  microphone is granted before the browser confirms it.
- **The monthly cap is reached mid-conversation.** The in-progress call is
  allowed to finish; new calls are refused.

## Requirements *(mandatory)*

### Functional Requirements

**The page**

- **FR-001**: The page MUST be reachable by anyone with no sign-in of any kind,
  now or later.
- **FR-002**: The page MUST show the school name and logo and a headline in Urdu
  and English.
- **FR-003**: The "Talk to Admission Office" button MUST be the largest element
  on the screen and MUST be visible without scrolling.
- **FR-004**: The school office phone number MUST be visible without scrolling in
  every state of the page, and MUST be tappable to call on a phone.
- **FR-005**: A visible line MUST state that final admission decisions are made by
  school staff, not by the assistant.
- **FR-006**: A three-step "how it works" strip MUST be visible before a
  conversation starts.

**The conversation**

- **FR-007**: A parent MUST be able to start a voice conversation with the
  admissions assistant from the page.
- **FR-008**: The page MUST show clearly distinct states for connecting, the
  assistant listening, and the assistant speaking.
- **FR-009**: An end-call control MUST be visible for the entire duration of a
  conversation and MUST end it on the first activation.
- **FR-010**: The assistant MUST answer only from published content. When no
  content has been published, starting a conversation MUST be refused with a
  plain explanation.
- **FR-011**: The assistant MUST state that it is an AI when asked.
- **FR-012**: A question on an escalation topic MUST be handed to the office
  rather than answered, in both the voice conversation and the text chat.

**Consent and control**

- **FR-013**: The page MUST explain why the microphone is needed before the
  browser's permission prompt appears.
- **FR-014**: A recording notice and a privacy line MUST be visible before any
  conversation can start.
- **FR-015**: Refusing the microphone MUST leave the parent with the text chat,
  the written FAQ, and the phone number, and a plain explanation.

**The text chat fallback**

- **FR-016**: The page MUST offer a text chat where a parent types a question and
  receives an answer drawn from the school's published content, clearly labelled
  as coming from the school's published information.
- **FR-017**: The text chat MUST route an escalation-topic question to the office
  rather than answering it (FR-012).
- **FR-018**: The text chat MUST NOT store a conversation or write any lead; it
  is a reading aid, not a second capture path.

**The written FAQ**

- **FR-019**: The page MUST show the school's published questions and answers as
  readable text below the talk area.
- **FR-020**: The written FAQ and the phone number MUST remain present and
  readable when JavaScript does not run.
- **FR-021**: The written FAQ MUST remain available when the assistant cannot be
  reached, and the page MUST say so plainly rather than showing a technical
  error.

**Capturing the enquiry**

- **FR-022**: The system MUST accept a completed enquiry from the assistant and
  store it for staff to follow up.
- **FR-023**: Every enquiry field except the time it was received MUST be
  optional. An enquiry with missing fields MUST still be stored.
- **FR-024**: A parent's phone number or name MUST be stored only when the parent
  confirmed it after the assistant read it back. An unconfirmed value MUST be
  left empty and the enquiry stored anyway.
- **FR-025**: A stored enquiry MUST have status "new", and no other status may be
  set by the assistant.
- **FR-026**: A request to store an enquiry MUST carry the agreed shared secret.
  A request without it MUST be refused and store nothing.
- **FR-027**: Storing an enquiry MUST NOT overwrite an existing one.
- **FR-028**: The system MUST NOT store or log a CNIC number, a B-Form number, or
  any payment detail. Such a field arriving in a request MUST be dropped and the
  rest saved.
- **FR-029**: A parent's phone number, name, or child's name MUST NOT be written
  to any log.

**Protecting the voice bill**

- **FR-030**: A single voice conversation MUST end automatically when it reaches
  a configured maximum length, after which the page shows the office phone number.
- **FR-031**: A visitor who has started a configured maximum number of
  conversations in one day MUST be refused further conversations that day, with a
  plain message and the office phone number.
- **FR-032**: When the school's total voice minutes for the current calendar
  month reach a configured cap, every new conversation MUST be refused with the
  office phone number until the month rolls over. A conversation already in
  progress MUST be allowed to finish.
- **FR-033**: Every refusal under FR-030–FR-032 MUST also keep the text chat and
  the written FAQ available.
- **FR-034**: The three limits (per-call length, per-visitor per-day count,
  monthly minutes) MUST be values an operator can change without a code change.

**Language**

- **FR-035**: Every sentence a parent reads on the page MUST exist in both Urdu
  and English.
- **FR-036**: Urdu text MUST render correctly and read right to left.
- **FR-037**: Values that are not language-specific — the phone number, fees,
  dates, ages, class names — MUST be shown from a single stored value, not
  duplicated per language.

**Presentation and reach**

- **FR-038**: The page MUST be usable on a screen 360 pixels wide with no
  sideways scrolling.
- **FR-039**: The page MUST function on current Android Chrome and current iPhone
  Safari.
- **FR-040**: The page's first meaningful view — name, logo, headline, button,
  notices, phone number — MUST render on a slow mobile connection without waiting
  on the voice service.
- **FR-041**: The page MUST show a loading state, and an error state that names
  what a parent can do instead — never a blank screen.

### Key Entities *(include if feature involves data)*

- **Enquiry (lead)**: One parent's interest, captured from one conversation.
  Holds whatever the assistant confirmed — parent name, child name, class wanted,
  child age, phone, current class, previous school, fresh-or-transfer, the
  language of the conversation — plus the time it arrived and a status that
  always begins as "new". Every field except the time may be empty. Never
  overwritten, never deleted.
- **Visitor**: An anonymous identity for one browser, used only to count
  conversations per day for FR-031. Not a login, not linked to a lead, holds no
  personal data — a random identifier and a per-day count. Best-effort.
- **Monthly usage**: The school's running total of voice minutes for the current
  calendar month, checked against the cap in FR-032. One number per month, no
  personal data.
- **Published content**: The school's approved answers, owned by feature 003.
  This feature only reads it — for the voice assistant, for the text chat, and
  for the written FAQ.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A parent who has never seen the page before can start a
  conversation within 15 seconds of opening it, without being told how.
- **SC-002**: On a 360-pixel screen, on both Android Chrome and iPhone Safari,
  the button, the recording notice, and the office phone number are all visible
  without scrolling, in 100% of page states.
- **SC-003**: With JavaScript disabled, the school's published answers and the
  office phone number are both readable, in 100% of attempts.
- **SC-004**: A parent who refuses the microphone can still get an answer to a
  published question through the text chat, in 100% of attempts.
- **SC-005**: Every enquiry sent by the assistant is stored, including those with
  missing fields, in 100% of attempts.
- **SC-006**: An unconfirmed phone number or name is never stored, in 100% of
  attempts.
- **SC-007**: A request without the shared secret stores nothing, in 100% of
  attempts.
- **SC-008**: No CNIC, B-Form, or payment value appears anywhere in stored data
  or logs, verified by inspection.
- **SC-009**: A parent can end a conversation on the first tap, at any point, in
  100% of attempts.
- **SC-010**: A conversation ends on its own within a few seconds of the
  configured per-call limit, in 100% of attempts.
- **SC-011**: Once the daily per-visitor limit or the monthly cap is reached, no
  further voice conversation starts, and the office phone number is shown, in
  100% of attempts.
- **SC-012**: A normal parent having one ordinary conversation never sees a limit
  message.
- **SC-013**: Asked afterwards, a parent correctly says the conversation was
  recorded, that they were talking to an AI, and that staff make the final
  decision — confirming FR-005, FR-011, and FR-014 landed.

## Assumptions

- **The voice agent lives outside this codebase.** It is configured on the voice
  service (Retell) with its own instructions, voice, and language settings. This
  feature builds the page that connects to it and the endpoint that receives what
  it captures. The per-call length limit (FR-030) is set both on the agent and
  enforced by the page, so it holds even if one side is misconfigured.
- **The "Retell web widget" means Retell's web-call capability, driven by its
  browser SDK.** The custom requirements here — a microphone explanation before
  the permission prompt, custom connecting/listening/speaking states, a custom
  always-visible End Call button — are not possible with Retell's drop-in widget
  script, which renders its own fixed UI. The SDK is used so the page owns the
  UI. Say if you specifically want the drop-in widget instead and will accept its
  built-in appearance.
- **The text chat answers from published content, it is not a second AI.** A
  parent types a question; the page matches it against the published FAQs and
  facts (the same matching feature 003's draft test tool already uses) and shows
  the best answer, or routes to the office. A full conversational AI in text
  would be a separate service, a separate cost, and a separate thing to keep
  honest. Strike this if you want a real Retell chat agent instead — that is its
  own Retell configuration and a larger build.
- **A visitor is identified by a first-party cookie**, not a login and not a
  device fingerprint. Cookies are permitted (feature 002 uses them); only browser
  local and session storage are forbidden. A visitor who clears cookies resets
  their daily count — accepted, because the monthly cap (FR-032), which is not
  per-visitor, is the real cost backstop.
- **The three limits are stored as environment settings**, readable and
  changeable by an operator without editing code (FR-034). A settings screen for
  them belongs to a later feature (feature 004 lists a Settings screen).
- **Published content already exists.** Feature 003 provides the editor and the
  endpoint. This feature only reads what has been published and refuses voice
  when nothing has been.
- **The office phone number and the school logo are placeholders** until the
  school provides the real ones. Both replacements are prerequisites for showing
  this page to a parent, recorded here as a risk.
- **The enquiry's fields follow the admin dashboard's list** (feature 004) so the
  dashboard has them when it is built.
- **The parent may see the live transcript on screen** while talking, to follow
  along in a noisy room or across languages. Display only, nothing stored.
- **One enquiry per conversation**, sent by the assistant once at the end.

## Out of Scope

- Call transcripts and the record of completed calls — a separate feature the
  admin dashboard also depends on
- Logging the questions the assistant could not answer — the same separate
  feature
- Counting page visits, or any funnel or source tracking
- The admin dashboard that displays enquiries and would host a settings screen
  for the limits — feature 004
- The content editor — feature 003
- A settings screen for the three limits; they are environment settings this
  phase
- Editing or deleting an enquiry from this page
- Bot protection beyond the three usage limits — no CAPTCHA, no IP blocking
- Per-visitor limits that survive a cookie wipe — the monthly cap is the backstop
- A full conversational AI for the text chat
- Notifying anyone when an enquiry arrives
- Phone number integration, WhatsApp, payments, document upload, parent accounts,
  and multiple campuses — excluded for this whole phase by the project rules
