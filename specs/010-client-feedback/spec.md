# Feature Specification: Client Feedback Round

**Feature Branch**: `010-client-feedback`
**Created**: 2026-09-21
**Status**: Draft
**Input**: User description: "Changes the client's testing team asked for after testing the demo: leads with email, summary and full conversation; Today / This week analytics; lead details page; Gap list renamed Knowledge with one page per entry and import from PDF and website; live calls monitor with call-back instead of voice takeover; summary email to the school and the parent."

## Context

The client's testing team tested the Phase 1 demo and listed problems and missing
features. The agent-behaviour problems (reply language, name and phone first,
gender, screen sleeping during a call) were fixed in stage 1 through the agent
prompt and a screen wake lock. That work is already live and is not part of this spec.

This spec covers everything that remains. It is built in the order of the user
stories below, and each story can be shown to the client on its own.

**Decisions already made by the user:**

- **No voice takeover.** Staff can see live calls and phone the parent, but cannot join the voice of a website call. The voice provider does not allow it.
- **Imports go to the draft.** Knowledge imported from a PDF or a website goes into the draft content. Staff review it before it can reach parents.
- **Build order:** agent fixes first, then these stories in order.
- **Email:** sent through Resend.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Every call leaves a complete record staff can read (Priority: P1)

A parent talks to the assistant. As soon as they confirm their phone number, an
enquiry exists, even if the call drops a minute later. When the call ends, the
record also holds the full conversation, a short summary, and how long the call
lasted. If the parent typed an email address into the box on the call screen,
that is attached too.

A staff member opens the Leads screen. They see one row per enquiry with Name,
Contact, Email, Summary, Status and Date. They open a lead and see the summary at
the top, then the details and status, then the whole conversation.

**Why this priority**: The testers' biggest complaint was that staff cannot see
what was said. Without the conversation and summary, every other admin feature
has little to show.

**Independent Test**: Make one test call, give a name, phone and email, and hang
up. Within a few minutes the lead shows the email, a summary and the full
conversation on its details page, and there is exactly one lead for that call.

**Acceptance Scenarios**:

1. **Given** a call in progress, **When** the parent confirms their phone number, **Then** a lead exists with the confirmed name and phone before the call ends.
2. **Given** that lead, **When** the assistant saves more details later in the same call, **Then** the same lead is updated and no second lead is created.
3. **Given** a finished call, **When** the voice provider reports the call analysed, **Then** the lead shows the summary, the call length and the full conversation.
4. **Given** a parent on the call screen, **When** they type a valid email address and send it, **Then** it appears on that call's lead. An invalid address shows a bilingual error and nothing is saved.
5. **Given** a lead with an Urdu conversation, **When** staff open the details page, **Then** Urdu lines display right to left and English lines left to right.
6. **Given** a lead whose conversation has not arrived yet, **When** staff open it, **Then** they see "The conversation is still being processed" instead of an empty space.

---

### User Story 2 - Overview shows today and this week at a glance (Priority: P1)

A staff member opens the dashboard. At the top, a small strip shows **Today** and
**This week** side by side: calls, leads, average call length, and new questions
the assistant could not answer. Below it are the 10 most recent leads. Each opens
its details page.

**Why this priority**: The testers asked for it, and it is the first screen the
client sees in a demo.

**Independent Test**: With some calls and leads recorded, open the Overview. The
numbers match the rows in the Leads screen for today and for the last 7 days, and
exactly the 10 newest leads are listed.

**Acceptance Scenarios**:

1. **Given** 3 leads today and 8 this week, **When** staff open the Overview, **Then** the strip shows 3 under Today and 8 under This week.
2. **Given** no calls at all, **When** staff open the Overview, **Then** every number shows 0 and the recent-leads list shows its designed empty state.
3. **Given** 15 leads, **When** staff open the Overview, **Then** only the newest 10 are listed, newest first, with a link to all leads.

---

### User Story 3 - Knowledge: one page per entry, and import from PDF and website (Priority: P2)

"Gap list" is renamed **Knowledge**. It holds two kinds of entry:

- **Questions asked by parents** that the assistant could not answer.
- **Documents** imported from a PDF or a website.

Each entry has its own page. On a question's page, staff write the answer. It is
added to the draft FAQs and the question is marked answered. On a document's page,
staff read and correct the imported text, or remove it.

To import, staff either choose a PDF, or paste a website address. The system reads
that page and up to 9 more pages on the same site. The text becomes a Knowledge
document in the **draft**. Nothing reaches parents until staff publish. Once
published, the assistant can answer from it.

**Why this priority**: It lets the school grow what the assistant knows without
retyping brochures. It depends on nothing in P1 but matters less for the demo.

**Independent Test**: Import a one-page PDF and one website page. Each appears as
its own Knowledge entry. Publish, then ask the assistant a question only those
documents answer, and it answers from them.

**Acceptance Scenarios**:

1. **Given** the old Gap list address, **When** staff open it, **Then** they are taken to Knowledge.
2. **Given** a question entry, **When** staff save an answer in English and Urdu, **Then** a draft FAQ exists with that question and answer, and the entry shows as answered.
3. **Given** a PDF with readable text, **When** staff import it, **Then** a draft Knowledge document holds its text, titled with the file name.
4. **Given** a scanned PDF with no readable text, **When** staff import it, **Then** they see "No text could be read from this PDF" and nothing is saved.
5. **Given** a website address, **When** staff import it, **Then** at most 10 pages from that same site are read, and pages on other sites are ignored.
6. **Given** an imported document still in the draft, **When** a parent calls, **Then** the assistant does not use it.

---

### User Story 4 - Live calls: see who is talking now and call them (Priority: P3)

The dashboard menu shows a badge with the number of calls happening right now,
such as "2 live". The Live calls screen lists each one: how long it has run, its
language, and the parent's name and phone if already confirmed. A **Call parent
now** button starts a phone call to that parent, and marks the lead Contacted.
The screen updates by itself about every 10 seconds. It says plainly that staff
cannot join the voice of a website call.

**Why this priority**: The testers asked for takeover. This is the part that can
be delivered with web calls. It depends on story 1's call records.

**Independent Test**: Start a call from the website. Within about 10 seconds the
dashboard shows "1 live" with that call. After hanging up, it returns to 0.

**Acceptance Scenarios**:

1. **Given** no calls in progress, **When** staff open Live calls, **Then** they see the designed empty state "No one is talking to the assistant right now".
2. **Given** a live call with a confirmed phone, **When** staff press Call parent now, **Then** their device starts a call to that number and the lead becomes Contacted.
3. **Given** a call whose end was never reported, **When** 15 minutes have passed since it started, **Then** it no longer counts as live.

---

### User Story 5 - Summary email to the school and the parent (Priority: P3)

When a call's summary is ready, the school's admissions email receives a message
with:

- the parent's name, phone and class wanted;
- the summary;
- a link to the lead.

If the parent gave an email address, they also receive a polite message in
English and Urdu with:

- a thank-you;
- the summary of what was discussed;
- the next steps;
- the office phone number and hours;
- a clear line that this is not an admission confirmation.

**Why this priority**: Useful for the office, but the dashboard already shows the
same information.

**Independent Test**: Make a call with an email typed in. After it ends, both
inboxes receive one message each. Repeat without an email. Only the school
receives one.

**Acceptance Scenarios**:

1. **Given** an analysed call with a lead, **When** the summary arrives, **Then** exactly one email goes to the school, even if the provider reports the call twice.
2. **Given** the parent gave an email, **When** the summary arrives, **Then** exactly one email goes to the parent, and it never says the admission is confirmed.
3. **Given** the email service fails, **When** sending is attempted, **Then** the lead and conversation are still saved and the failure is recorded for staff to see.

---

### Edge Cases

- **The call drops before the phone number is confirmed.** No lead is created. The call record still exists with its conversation.
- **The parent sends an email before a lead exists.** It is kept on the call record and attached when the lead is created.
- **The provider reports call events out of order, or twice.** The record ends up the same, and no duplicate lead or email is produced.
- **Someone other than the voice provider calls the call-events address.** Nothing is saved unless the provider confirms the call really exists.
- **The conversation contains a CNIC or B-Form number.** The prompt forbids collecting them. As a safeguard, 13-digit ID patterns in stored transcripts and summaries are masked.
- **A website import hits a page that is very large, slow or not text.** That page is skipped, and the rest are still imported.
- **A PDF is larger than 10 MB.** It is refused with a clear message.
- **Two staff import the same address twice.** They get two documents, and either can be removed.

## Requirements *(mandatory)*

### Functional Requirements

**Call records and leads (Story 1)**

- **FR-001**: The system MUST keep one call record per voice call, with:
  - start time and end time;
  - status (live, ended);
  - language;
  - the full conversation;
  - the summary;
  - the call length;
  - the lead it belongs to, if any.
- **FR-002**: The system MUST accept call events (started, ended, analysed) from the voice provider. Before saving anything, it MUST confirm each call with the provider directly.
- **FR-003**: A lead MUST be tied to at most one call. Saving a lead again during the same call MUST update the existing lead, never create a second.
- **FR-004**: Leads MUST gain an optional email address, a summary and a call length.
- **FR-005**: The parent's call screen MUST offer an optional email field in English and Urdu. It is validated before saving, and it can attach only to the call started in that same browser.
- **FR-006**: Stored conversations and summaries MUST have 13-digit identity-number patterns masked before saving.
- **FR-007**: A parent's phone number MUST never be written to logs in full.

**Dashboard (Stories 1–2)**

- **FR-008**: The Leads table MUST show Name, Contact, Email, Summary (first line), Status and Date, newest first, with its empty and error states.
- **FR-009**: Each lead MUST have its own details page. It shows, in this order: summary, details and status (editable as today), then the full conversation with each line's direction set by its script.
- **FR-010**: The Overview MUST show Today and This week figures (calls, leads, average call length, new unanswered questions), and the 10 newest leads.
- **FR-011**: "Today" and "This week" MUST use Pakistan time (UTC+5). "This week" means the last 7 days including today.

**Knowledge (Story 3)**

- **FR-012**: "Gap list" MUST be renamed "Knowledge" everywhere staff see it, in English and Urdu. The old address MUST redirect to the new one.
- **FR-013**: Each Knowledge entry (question or document) MUST have its own page.
- **FR-014**: Answering a question MUST add a bilingual FAQ to the draft content and mark the question answered.
- **FR-015**: Staff MUST be able to import a PDF of up to 10 MB. Its readable text becomes a draft Knowledge document.
- **FR-016**: Staff MUST be able to import from a website address, reading at most 10 pages on the same site. Their readable text becomes a draft Knowledge document.
- **FR-017**: Knowledge documents MUST reach the assistant only after staff publish, the same as all other content.
- **FR-018**: The draft test tool MUST also search Knowledge documents.

**Live calls (Story 4)**

- **FR-019**: The dashboard MUST show the number of live calls in the menu and on a Live calls screen. Both update about every 10 seconds.
- **FR-020**: A call with no reported end MUST stop counting as live 15 minutes after it started.
- **FR-021**: "Call parent now" MUST start a phone call to the confirmed number and mark the lead Contacted. It MUST be shown only when a confirmed phone exists.

**Emails (Story 5)**

- **FR-022**: When a call's summary is ready, the system MUST email the school's admissions address exactly once per call.
- **FR-023**: If the parent gave an email, the system MUST also email the parent exactly once per call. The message is in English and Urdu, includes the office phone, and never confirms an admission or mentions a discount.
- **FR-024**: A failed email MUST be recorded against the call and MUST NOT affect saving the lead or the conversation.

### Key Entities

- **Call**: one voice conversation. It holds the provider's call id, when it started and ended, its status, language, full conversation, summary, length, an email the parent typed (if any), whether the school and parent emails were sent, and the lead it produced.
- **Lead** (existing): gains an email, a summary and a call length. It belongs to at most one Call.
- **Unanswered question** (existing, now a "question" Knowledge entry): gains an answered marker.
- **Knowledge document**: text imported from a PDF or website. It holds a title, the source (file name or address), the text, and when it was imported. It lives inside the draft/published content like FAQs do.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For 10 test calls where the phone was confirmed, 10 leads exist, with no duplicates.
- **SC-002**: At least 9 of those 10 leads show a summary and a full conversation within 5 minutes of the call ending.
- **SC-003**: Staff can find what a parent asked, from the Overview, in 2 clicks or fewer.
- **SC-004**: The Overview's Today and This week numbers match a manual count of the Leads screen.
- **SC-005**: A live call appears on the Live calls screen within 15 seconds of starting, and disappears within 15 seconds of ending.
- **SC-006**: An imported PDF or website page can be reviewed, published and answered from by the assistant in under 10 minutes of staff time.
- **SC-007**: Every analysed call with a lead produces exactly one school email. Every one with a parent email produces exactly one parent email.
- **SC-008**: Every new screen works at 360 px width in English and Urdu, and shows designed empty and error states.

## Assumptions

- **The voice provider (Retell)** reports call start, end and analysis events. It provides a call summary and the full conversation, so no separate AI service is needed. It can be asked directly whether a call exists.
- **The agent's save tool** can send the call's own id, so a second save updates the same lead.
- **The browser** learns the call's id when the call starts, so the email box can attach to the right call. If it cannot, the email attaches to the most recent call started by that browser.
- **A new API key** from Retell and email settings (sender, school address, email service key) are added in Vercel by the user.
- **Unchanged:** staff sign-in and roles. Everyone who can see leads today can see the new pages.
- **Scope:** the "document upload" out-of-scope item in Phase 1 refers to parents uploading documents. Staff importing school information is in scope, as the user confirmed.
- **Old leads** created before this feature have no call record. Their details page shows "No conversation saved for this lead".

## Out of Scope

- Joining or taking over the voice of a live call.
- Parent accounts, WhatsApp, phone-number calling, payments, and parent document upload.
- Emails with the full conversation. The summary only.
- Reading scanned PDFs (text recognition).
- Crawling more than 10 pages, or other sites linked from the school's site.
