# Feature Specification: Admin Dashboard

**Feature Branch**: `004-admin-dashboard`
**Created**: 2026-09-09
**Status**: Draft
**Input**: User description: "Build the admin dashboard. Login required. Screens in this order: Leads, Calls, Health, Charts, Gap List, Settings. Across every screen: a date range selector in the same position, designed empty states, readable on a phone."

## ⚠️ Hard Dependency — not a sequencing note

This feature cannot function without three other features already built, not
merely "built first" as a matter of order:

- **Staff login** (`002-staff-login`, specified, not implemented) — every screen
  here requires an authenticated session. There is no dashboard to show a
  signed-out visitor.
- **The school content system** (`003-content-system`, specified, not
  implemented) — the Gap List's "jump to content editor" button has no screen to
  jump to without it.
- **The voice agent API** (specified as part of a future feature, not yet
  written) — the Leads screen, Calls screen, Health screen and three of the four
  Charts read directly from the `leads` and `calls` tables that API writes to.
  Without it those tables stay empty forever, not merely empty on day one.

This document specifies the dashboard completely so no work is lost, but none of
its implementation tasks (once written) can begin until all three exist. This is
recorded as an assumption rather than a functional requirement, because it is a
fact about the codebase, not a rule the dashboard enforces.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Staff see new enquiries as they arrive (Priority: P1)

A member of office staff opens the Leads screen and sees every parent enquiry,
newest first, with enough detail to start following up without opening anything
else. While they are looking at the screen, a new enquiry comes in and appears
without them refreshing the page.

**Why this priority**: Leads are the entire point of running the voice agent —
enquiries convert to admissions only if someone follows up. Every other screen in
this feature supports or explains this one.

**Independent Test**: Open the Leads screen with test data already in the table
and confirm every field displays, newest first. Insert a row directly in the
database and confirm it appears without a manual refresh.

**Acceptance Scenarios**:

1. **Given** leads exist, **When** the Leads screen is opened, **Then** a table
   shows parent name, student name, class wanted, age, phone, current class,
   previous school, fresh-or-transfer, language, date and status, ordered newest
   first.
2. **Given** the Leads screen is open, **When** a new lead is captured by the
   voice agent, **Then** it appears in the table without the page being reloaded.
3. **Given** a lead's status is "new", **When** staff change it, **Then** they can
   choose only from new, contacted, applied, or closed.
4. **Given** a lead has an associated call, **When** staff click its row, **Then**
   they are taken to that call's transcript.
5. **Given** no leads have ever been captured, **When** the screen is opened,
   **Then** a designed empty state explains that leads will appear here once
   parents start enquiring — not a blank table.

---

### User Story 2 - Staff can read what actually happened on a call (Priority: P1)

A member of staff opens the Calls screen, sees every completed conversation in a
table, and clicks one to read the full transcript exactly as it happened,
including the Urdu portions.

**Why this priority**: A lead's fields are a summary; the transcript is the
ground truth when something needs checking; it ranks alongside Leads because
staff routinely need both.

**Independent Test**: Open the Calls screen with test data, click a row, and
confirm the transcript renders both sides of the conversation with Urdu text
displaying correctly.

**Acceptance Scenarios**:

1. **Given** calls exist, **When** the Calls screen is opened, **Then** a table
   shows date, time, length, language and outcome for each.
2. **Given** a call row, **When** it is clicked, **Then** the full transcript
   opens showing both the parent's and the agent's turns.
3. **Given** a transcript containing Urdu script, **When** it is displayed,
   **Then** the Urdu text renders correctly and reads right to left, not as
   broken characters or a left-to-right block.
4. **Given** no calls have ever completed, **When** the screen is opened,
   **Then** a designed empty state appears rather than a blank table.

---

### User Story 3 - Staff can tell at a glance whether the agent is working (Priority: P2)

A member of staff opens the Health screen first thing in the morning and can tell,
without interpreting anything, whether the agent is currently online, how busy it
has been, and how well it is coping.

**Why this priority**: This is the fastest way to notice the agent has stopped
working before a parent complains about it. It ranks below Leads and Calls
because it summarizes data those two already expose in detail.

**Independent Test**: Open the Health screen with test data and confirm all five
figures display in plain language.

**Acceptance Scenarios**:

1. **Given** the agent is configured as on, **When** the Health screen is opened,
   **Then** it clearly states the agent is online, distinct in wording and colour
   from an offline state.
2. **Given** calls have happened today, **When** the Health screen is opened,
   **Then** it shows the count of calls today, the average response delay, the
   percentage handled without a transfer, and minutes used this month.
3. **Given** no calls have happened yet today, **When** the screen is opened,
   **Then** the figures read as zero or "no calls yet today" rather than blank or
   an error.

---

### User Story 4 - Staff can see patterns across many calls and leads (Priority: P3)

A member of staff opens the Charts screen and sees, at a glance, how volume is
trending, where interest is concentrated, what parents ask about most, which
language is more common, and where people drop off between visiting the page and
becoming a contacted lead.

**Why this priority**: Useful for planning and reporting, but the school
functions day to day without it — Leads and Calls carry the operational weight.

**Independent Test**: Open the Charts screen with a range of test data and
confirm all five charts render with correct titles and axis labels.

**Acceptance Scenarios**:

1. **Given** calls exist across several days, **When** the Charts screen is
   opened, **Then** a line chart shows calls per day for the selected date range.
2. **Given** leads exist across several classes, **When** the screen is opened,
   **Then** a bar chart shows lead count per class.
3. **Given** the agent has logged unanswered questions, **When** the screen is
   opened, **Then** a bar chart shows the most frequently asked questions it
   could not answer.
4. **Given** calls in both languages, **When** the screen is opened, **Then** a
   chart shows the Urdu-versus-English split.
5. **Given** page visits, calls, and leads all being tracked, **When** the screen
   is opened, **Then** a funnel shows the count at each of: page visits, calls
   started, leads captured, leads contacted.
6. **Given** no data exists for the selected range, **When** the screen is
   opened, **Then** each chart shows a designed empty state naming what will
   appear there, not a blank canvas.

---

### User Story 5 - Staff can see what the agent doesn't know, and go fix it (Priority: P3)

A member of staff opens the Gap List, sees the questions the agent could not
answer ranked by how often they came up, and clicks through to the content editor
to add the missing answer.

**Why this priority**: This is how the content system actually improves over
time, but it depends entirely on the content editor existing, which this feature
does not build.

**Independent Test**: Open the Gap List with test data and confirm questions are
ranked by frequency, most common first, and that the jump-to-editor button is
present on each.

**Acceptance Scenarios**:

1. **Given** unanswered questions have been logged, **When** the Gap List is
   opened, **Then** they are ranked most frequent first.
2. **Given** a question in the list, **When** staff click its "add to content"
   button, **Then** they are taken to the content editor's screen for the
   relevant type of content.
3. **Given** no unanswered questions exist, **When** the screen is opened,
   **Then** a designed empty state explains this positively — the agent has
   answered everything asked so far — rather than looking broken.

---

### User Story 6 - Staff can change how the agent behaves without a developer (Priority: P4)

A member of staff opens Settings and turns the agent on or off, sets its working
hours, sets the transfer number a parent is sent to, and sets the maximum length
of a call.

**Why this priority**: Important control, but it is the screen used least often
— set once, revisited occasionally — so it is built last.

**Independent Test**: Open Settings, change each of the four values, save, and
confirm they persist on reopening the screen.

**Acceptance Scenarios**:

1. **Given** the Settings screen, **When** staff turn the agent off, **Then** the
   change takes effect and the Health screen reflects "offline" the next time it
   is opened.
2. **Given** working hours are set, **When** they are saved, **Then** they
   persist and display correctly on reopening.
3. **Given** a transfer number is entered, **When** it is saved, **Then** it is
   validated as a phone number before being accepted.
4. **Given** a maximum call length is set, **When** it is saved, **Then** it
   accepts only a positive number of minutes.

---

### Edge Cases

- **A screen has no data at all on day one.** Every list and chart shows a
  designed empty state explaining what will eventually appear — never a blank
  screen, per the project's own empty-state requirement.
- **The date range selector is changed.** Every screen honouring it — Leads,
  Calls, Charts — updates consistently rather than some screens reflecting the
  old range.
- **A transcript contains a very long call.** It remains readable without the
  page becoming unresponsive.
- **Two staff members view the Leads screen at the same time and one changes a
  status.** The other sees the updated status without manually refreshing,
  consistent with the "new leads appear live" requirement.
- **The signed-in session expires while a screen is open.** The next action sends
  the person to the sign-in screen, per feature 002's rules, not to a broken
  dashboard screen.
- **A phone screen 360 pixels wide.** Every screen, including the data tables and
  charts, remains usable without horizontal scrolling on the page itself; a wide
  table may scroll within its own container.
- **The Settings screen's transfer number is left blank.** Saving is refused with
  a clear message, since a parent transferred to nothing is worse than the
  setting staying unset.

## Requirements *(mandatory)*

### Functional Requirements

**Access**

- **FR-001**: Every screen in this feature MUST be reachable only by an
  authenticated member of staff, consistent with feature 002.
- **FR-002**: A visitor without a valid session MUST be redirected to sign-in
  before any dashboard content renders.

**Leads**

- **FR-003**: The Leads screen MUST display parent name, student name, class
  wanted, age, phone, current class, previous school, fresh-or-transfer,
  language, date, and status for every lead.
- **FR-004**: Leads MUST be ordered newest first.
- **FR-005**: A lead's status MUST be changeable between exactly: new,
  contacted, applied, closed.
- **FR-006**: A newly captured lead MUST appear on an open Leads screen without
  the page being manually reloaded.
- **FR-007**: Each lead row MUST link to its associated call's transcript, when
  one exists.

**Calls**

- **FR-008**: The Calls screen MUST display date, time, length, language, and
  outcome for every call.
- **FR-009**: Clicking a call row MUST open its full transcript, showing both the
  parent's and the agent's turns.
- **FR-010**: Transcript text containing Urdu script MUST render correctly,
  right to left, using a font and layout that does not break on that text.

**Health**

- **FR-011**: The Health screen MUST state whether the agent is currently online
  or offline, distinguishable by wording and not by colour alone.
- **FR-012**: The Health screen MUST show: calls today, average response delay,
  percentage of calls handled without a transfer, and minutes used this month.

**Charts**

- **FR-013**: The Charts screen MUST show calls per day as a line chart.
- **FR-014**: The Charts screen MUST show leads by class as a bar chart.
- **FR-015**: The Charts screen MUST show the most frequently unanswered
  questions as a bar chart.
- **FR-016**: The Charts screen MUST show the Urdu-versus-English split of
  calls.
- **FR-017**: The Charts screen MUST show a funnel of: page visits, calls
  started, leads captured, leads contacted.
- **FR-018**: Every chart MUST have a title and labelled axes.

**Gap List**

- **FR-019**: The Gap List MUST show unanswered questions ordered most
  frequent first.
- **FR-020**: Each entry MUST link to the content editor screen relevant to
  adding that answer.

**Settings**

- **FR-021**: Settings MUST let staff turn the agent on or off.
- **FR-022**: Settings MUST let staff set the agent's working hours.
- **FR-023**: Settings MUST let staff set the transfer number a parent is sent
  to, validated as a phone number before saving.
- **FR-024**: Settings MUST let staff set the maximum length of a call, as a
  positive number of minutes.

**Across every screen**

- **FR-025**: A date range selector MUST appear in the same position on every
  screen it applies to (Leads, Calls, Charts).
- **FR-026**: Every list and chart MUST show a designed empty state when there
  is no data for the current range, distinct from a loading state and an error
  state.
- **FR-027**: Every screen MUST be usable on a phone at 360 pixels wide, with
  wide tables scrolling within their own container rather than the page
  scrolling sideways.

### Key Entities

- **Lead**: One parent enquiry, as captured by the voice agent. Fields listed in
  FR-003. Not created by this feature — read and updated only.
- **Call**: One completed conversation, including its transcript. Not created by
  this feature — read only, except that opening a transcript is read-only.
- **Unanswered question**: One question the agent could not answer, aggregated
  by frequency for the Gap List. Not created by this feature.
- **Agent settings**: The on/off state, working hours, transfer number, and
  maximum call length. Created and owned by this feature; nothing else in the
  system writes to it, though the voice agent reads it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member of staff can find a specific parent's lead and its status
  within 30 seconds of opening the Leads screen.
- **SC-002**: A new lead appears on an already-open Leads screen within 10
  seconds of being captured, with no manual refresh.
- **SC-003**: A member of staff can determine whether the agent is currently
  online within 5 seconds of opening the Health screen, without interpreting any
  number.
- **SC-004**: Every screen in this feature renders a designed empty state, not a
  blank screen, when opened with no data — verified by clicking through all six
  screens against an empty database.
- **SC-005**: Every screen remains fully usable — no horizontal scroll on the
  page itself, no unreadable text — at 360 pixels width.
- **SC-006**: Changing the date range on the Leads, Calls, or Charts screen
  updates its content within 3 seconds.
- **SC-007**: A member of staff can change an agent setting and confirm it took
  effect (reflected elsewhere, e.g. Health showing offline) without asking a
  developer.

## Assumptions

- **Feature 002 (staff login) exists and this feature builds directly on its
  session.** This specification does not redefine how staff sign in.
- **Feature 003 (content system) exists and owns the content editor** the Gap
  List links to. This specification does not define what that editor looks like.
- **A voice agent API exists and owns the `leads`, `calls`, `unanswered_questions`
  tables and the page-visit tracking the funnel needs.** This specification reads
  from that data; it does not define how it is written.
- **"Online" and "offline" are read from the Settings on/off value**, not from
  pinging Retell directly, since Retell is configured outside this codebase.
- **The funnel's "page visits" and "calls started" figures require basic
  analytics tracking on the public landing page** that is not otherwise specified
  in any existing feature. This is flagged as a gap for whichever feature owns
  the public landing page, not invented here.
- **"This month" for minutes used resets on the calendar month**, not on a
  billing cycle, since no billing cycle has been specified.

## Out of Scope

- Creating, editing, or deleting leads, calls, or unanswered questions directly
  — this dashboard reads and updates status only, per FR-005
  and FR-007
- The content editor itself — feature 003
- Staff login itself — feature 002
- The voice agent API that populates the data this dashboard reads
- Page-visit and funnel-source tracking on the public landing page — flagged
  above as a gap, not built here
- Exporting data, printing, or any report generation beyond the four charts
  specified
- Notifications (email, SMS, push) when a new lead arrives — the "appears live"
  requirement (FR-006) is about the open screen updating, not an alert reaching
  someone who isn't looking at it
- Multiple staff roles or permissions — out of scope for the whole project this
  phase, per the constitution
