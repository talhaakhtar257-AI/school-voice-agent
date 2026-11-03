# Feature Specification: Faster answers, lower cost, and both made visible

**Feature Branch**: `013-call-speed-cost`
**Created**: 2026-11-03
**Status**: Draft
**Input**: User description: "Make the voice agent answer faster and cost less, and make its speed and cost visible on the Health screen. Driven by measurements from the 3 Nov 2026 test call: end-to-end reply delay p50 2279ms, p90 2913ms against a 1500ms target, and cost 0.1846 USD per minute."

## Context

On 3 November 2026 the owner held a five-minute conversation with the assistant
and reported that it "was struggling while speaking". The call was measured
afterwards, and the complaint is supported by numbers:

| What the parent waits for | Typical | Worst |
|---|---|---|
| The assistant to notice they stopped talking | 0.58s | 1.45s |
| The assistant to decide what to say | 0.74s | **2.21s** |
| The assistant to start speaking | 0.60s | 0.76s |
| **Total silence after the parent stops** | **2.28s** | **3.23s** |

The target recorded in feature 011 is **1.5s**. The deciding step is the one
that overruns, and it overruns on the turns where the assistant consults the
school's own systems. That same call consulted them six times, including the
identical enquiry save performed **four** times.

The call cost **$0.1846 per minute — $0.92 for five minutes** — and began
incurring a per-minute surcharge that earlier, shorter calls never triggered,
because the volume of school information carried through the conversation has
grown past a threshold.

Neither the speed nor the cost of a call is visible anywhere in the product
today. The Health screen has been required to show "average response delay"
since feature 004 (`specs/004-admin-dashboard/spec.md:111`) and has never shown
it, so every judgement about whether the assistant is fast enough has been a
guess. The figures above were obtained by querying the voice provider directly,
which the school's staff cannot do.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A parent is answered without an awkward silence (Priority: P1)

A parent asks about fees for Class 6. The assistant answers in the time it takes
a polite person to draw breath, not long enough for the parent to wonder whether
the line has dropped or to start repeating themselves. When the parent asks for
the details in writing, the assistant says it is sending them and carries
straight on with the conversation, rather than going quiet mid-sentence.

**Why this priority**: This is the reported fault and the one a prospective
parent experiences directly. A hesitant assistant reads as a broken assistant,
and this is the system the school will demonstrate to real parents. Every other
story in this feature is worth less if the conversation still stalls.

**Independent Test**: Hold a conversation covering a fees question, a class
question, a request for written details, and a question the assistant cannot
answer. Measure the silence after each parent turn. Delivers value on its own:
the conversation is noticeably smoother even if nothing else in this feature
ships.

**Acceptance Scenarios**:

1. **Given** a parent has just finished their first question of a call,
   **When** the assistant needs the school's information to answer it,
   **Then** the parent hears the answer begin within the target delay, and never
   waits past the point where the voice provider abandons the attempt.
2. **Given** the assistant is answering a question,
   **When** the school's information cannot be retrieved at all,
   **Then** the assistant still answers or routes the parent to a human, and
   never answers as though the school had no fees, classes or documents.
3. **Given** a parent asks for the details in writing,
   **When** the assistant confirms it is sending them,
   **Then** the conversation continues immediately, and the email still arrives.
4. **Given** a parent mentions the class they want and then their child's age,
   **When** the assistant records the enquiry as it goes,
   **Then** the enquiry is stored once per new piece of information, not
   repeatedly for the same information, and the parent hears no pause for it.
5. **Given** a parent asks for written details several times in one call,
   **When** they pass the agreed per-call limit,
   **Then** the assistant explains warmly that it has already sent them and
   offers the office number, and no further email is sent.

---

### User Story 2 - Staff can see how fast and how costly calls are (Priority: P2)

The owner opens the Health screen and sees, for a chosen period, the average
delay before the assistant replies and what the calls cost — per call and in
total. When the owner changes a setting with the voice provider, or when this
feature's speed work lands, the effect is visible on that screen rather than
inferred.

**Why this priority**: Without it, nobody can tell whether story 1 worked, or
notice a regression, or answer the client's question "what does this cost us?"
It earns P2 rather than P1 because the parent's experience comes first, but it
is what makes every future change measurable instead of guessed.

**Independent Test**: Complete one call, open the Health screen, and confirm the
delay and cost figures for that call appear and match what the voice provider
reports. Testable with no part of story 1 built.

**Acceptance Scenarios**:

1. **Given** a call has finished, **When** the owner opens the Health screen,
   **Then** that call's reply delay and cost are included in the figures shown.
2. **Given** no calls have happened in the selected period, **When** the owner
   opens the Health screen, **Then** a designed empty state explains that speed
   and cost figures appear here once calls have been answered.
3. **Given** the voice provider did not report delay or cost for a call,
   **When** the figures are shown, **Then** that call is excluded from the
   averages and the screen states how many calls the figures are based on, so a
   single measured call is never presented as a trend.
4. **Given** the owner is looking at the figures, **When** the average reply
   delay exceeds the target, **Then** the screen marks it as outside target
   using text, not colour alone.

---

### User Story 3 - Adding school content does not silently slow or cost more (Priority: P3)

A staff member adds ten more FAQs and a long admission policy. They are told,
while editing, how much of the assistant's working budget the content now uses,
and warned before they cross the point where every future call becomes slower
and dearer. The assistant keeps answering from the most important content rather
than quietly losing the newest entries.

**Why this priority**: This is the cause of the newly appearing surcharge and a
slow leak rather than a present fault: the school's content will keep growing
after handover, when nobody is measuring. It is P3 because today's content
already fits; the risk is future growth.

**Independent Test**: Add content until the budget is exceeded, and confirm the
warning appears and the assistant still answers correctly from what fits.

**Acceptance Scenarios**:

1. **Given** a staff member is editing content, **When** the content approaches
   the assistant's working budget, **Then** they are shown how full it is before
   they publish.
2. **Given** the content exceeds the budget, **When** a parent calls,
   **Then** the assistant answers from the retained content, the omission is
   recorded for staff, and no school information is dropped without a trace.

---

### Edge Cases

- The school's information cannot be retrieved mid-call: the assistant must
  degrade to routing the parent to a human, never to inventing or denying facts.
  No school data may ever be fabricated (constitution).
- Stale information: staff publish a fee change and immediately test a call. The
  assistant must answer with the new figure, not a remembered older one.
- The same enquiry is saved from two directions at once (the parent's typed form
  and the assistant's own recording). The result must be one enquiry, not two,
  and not a lost field.
- The after-call record arrives twice from the voice provider. Records, emails
  and reserved minutes must not be duplicated.
- The after-call record never arrives: the call's reserved minutes must not stay
  reserved for the rest of the month.
- A parent hangs up mid-answer, or while written details are being prepared.
- An email provider is down or out of quota: the conversation must not suffer for
  it, and the failure must be visible to staff rather than silent.
- Cost figures are shown for a period in which the per-minute rate changed.

## Requirements *(mandatory)*

### Functional Requirements

**Answering quickly**

- **FR-001**: The assistant MUST begin answering a parent's question within the
  target reply delay (see SC-001) measured from the moment the parent stops
  speaking, for the first question of a call as well as later ones.
- **FR-002**: Retrieving the school's information for a call MUST NOT be the
  cause of the assistant exceeding the target, and MUST NOT risk exceeding the
  voice provider's abandonment limit for that retrieval.
- **FR-003**: Published changes to school content MUST be reflected in what the
  assistant says within the freshness window (see SC-005), without staff taking
  any extra step beyond publishing.
- **FR-004**: When the school's information cannot be retrieved, the assistant
  MUST route the parent to a human and MUST NOT answer as though the school had
  no information. The failure MUST be recorded for staff.
- **FR-005**: Sending written details to a parent MUST NOT hold up the
  conversation. The parent MUST hear the conversation continue while the email is
  being sent.
- **FR-006**: Written details MUST still be delivered when the conversation has
  moved on, and a failure to deliver them MUST be recorded for staff rather than
  being lost silently.
- **FR-007**: The assistant MUST NOT send more than three sets of written
  details in one call (carried over from `specs/011-tester-feedback/plan.md`,
  specified and never built). Beyond the limit it MUST explain that the details
  have already been sent and offer the office number.
- **FR-008**: Recording an enquiry MUST be safe to repeat: the same information
  submitted more than once for the same call MUST leave exactly one enquiry, with
  no duplicated or lost fields, and MUST NOT pause the conversation.
- **FR-009**: Handling the end of a call MUST complete within the voice
  provider's limit, so that the provider does not retry it. Should it be retried
  anyway, the enquiry, the emails and the released minutes MUST NOT be
  duplicated.
- **FR-010**: Every change in this feature MUST preserve the existing product
  rules: an enquiry is saved only after the parent has confirmed their phone
  number, an incomplete enquiry is still saved, every conversation keeps a route
  to a human, and no CNIC or B-Form number is ever stored or logged.

**Seeing speed and cost**

- **FR-011**: The system MUST record, for each finished call, the reply delay
  the voice provider measured and what the call cost.
- **FR-012**: The Health screen MUST show, for the selected period, the average
  reply delay and the cost of calls — both per call and as a period total —
  satisfying the long-standing requirement at
  `specs/004-admin-dashboard/spec.md:111`.
- **FR-013**: The figures MUST state how many calls they are based on, and MUST
  exclude calls for which the voice provider reported no measurement, so that a
  single call is never presented as a trend.
- **FR-014**: The Health screen MUST mark an average reply delay that exceeds
  the target, using text and not colour alone.
- **FR-015**: Both figures MUST render a designed empty state when the period
  contains no calls, and an error state when they cannot be read.
- **FR-016**: Recording these figures MUST NOT introduce any new parent-facing
  delay, and MUST NOT store a parent's phone number in plain text anywhere new.

**Keeping the content budget honest**

- **FR-017**: The system MUST make the size of the assistant's working content
  visible to staff while they edit, as a proportion of the available budget.
- **FR-018**: Staff MUST be warned before publishing content that crosses the
  budget, and told plainly that calls past that point become slower and more
  expensive.
- **FR-019**: When content exceeds the budget, the assistant MUST keep answering
  from the retained content, and what was left out MUST be recorded for staff
  rather than dropped silently.

### Key Entities

- **Call record**: an existing record of one conversation. Gains the reply delay
  the voice provider measured and the cost of the call. Every field except the
  timestamp may be empty.
- **Enquiry (lead)**: unchanged in shape. Must end up as exactly one record per
  call however many times it is recorded during that call.
- **School content**: unchanged in shape. Gains a known size against a known
  budget, visible to the staff who edit it.
- **Period figures**: the averages and totals the Health screen shows for a
  chosen date range, including the number of calls behind them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After a parent stops speaking, the assistant begins replying
  within **1.5 seconds** on a typical turn (currently 2.28s) and within
  **2.5 seconds** on nine turns out of ten (currently 2.91s), measured across a
  conversation of at least ten turns.
- **SC-002**: The first answer of a call is no slower than later answers.
  Today it carries about a second of extra wait that no later answer does.
- **SC-003**: Asking for written details costs the conversation no measurable
  pause; the parent hears continuous speech where they previously heard the
  assistant go quiet for up to eight seconds.
- **SC-004**: A five-minute conversation of comparable content costs **less than
  it does today ($0.92)**, with no reduction in what the assistant can answer,
  and the per-minute surcharge is no longer incurred.
- **SC-005**: A fee changed and published by staff is spoken correctly by the
  assistant in a call started **within one minute** of publishing.
- **SC-006**: One conversation that mentions the class, the child's age and a
  transfer produces exactly **one** enquiry with all three recorded, and the
  enquiry is recorded no more times than there are new pieces of information.
- **SC-007**: The owner can read the average reply delay and the cost of calls
  for a chosen period from the Health screen, without help and without reading
  code, within **30 seconds** of opening it.
- **SC-008**: Handling the end of a call completes inside the voice provider's
  limit on **every** call in a ten-call sample, so no call is retried.
- **SC-009**: A call whose end-of-call record is delivered twice still produces
  one enquiry, one set of emails, and one release of reserved minutes.
- **SC-010**: A staff member adding content can tell how full the assistant's
  budget is, and is warned before crossing it, without asking anyone.

## Assumptions

- **The target comes from feature 011.** The 1.5s typical figure is the target
  already recorded in `specs/011-tester-feedback/plan.md:28`. The 2.5s
  nine-in-ten figure is new here, chosen because a target for the typical case
  alone can be met while the worst case stays unbearable.
- **Delay and cost come from the voice provider's own per-call measurements**,
  not from timings invented inside this system, so the figures on the Health
  screen match what the provider bills and reports. Calls the provider did not
  measure are excluded rather than estimated.
- **No backfill.** Only calls completed after this feature ships carry delay and
  cost figures. Earlier calls show as not measured; the provider does not retain
  the data indefinitely.
- **One minute is a fast enough freshness window** for published content. Staff
  publishing and immediately test-calling is the demanding case, and this covers
  it; anything stricter removes the benefit the change exists for.
- **Content is never dropped silently.** Where the budget forces a choice, staff
  are warned and the omission is recorded. The alternative — quietly losing the
  newest FAQ — would make the assistant wrong rather than merely slower.
- **Cost is reported in the currency the voice provider bills in (USD).**
  Converting to rupees would need an exchange rate this project has no source
  for, and two copies of a figure that disagree is exactly what the Urdu rules
  in `CLAUDE.md` warn against.
- **Three sets of written details per call** is carried over unchanged from
  feature 011 rather than re-decided here.

## Out of Scope

- Any setting changed with the voice provider: the voice engine, the speaking
  model, the language model, the silence timer, keyword boosting. Those are being
  tuned separately, one change at a time, each judged by listening to the Urdu.
- Anything requiring a judgement about how the Urdu sounds.
- Changing the assistant's prompt, its tone, or what it is allowed to say.
- The phone network, WhatsApp, payments, document upload, parent accounts and
  multiple campuses, all out of scope for the Phase 1 demo.
- Staff watching or taking over a live call, which is awaiting a separate key.
