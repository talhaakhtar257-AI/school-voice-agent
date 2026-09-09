# Feature Specification: School Content System

**Feature Branch**: `003-content-system`
**Created**: 2026-09-09
**Status**: Draft
**Input**: User description: "Build the school content system. This is the knowledge the voice agent uses to answer parents. The content has four levels: 1. Facts: fees per class, age criteria per class, class list, admission dates, office hours 2. Policies: admission process, document requirements 3. FAQs: common parent questions with answers 4. Escalation topics: subjects the agent must never answer and must pass to a human, such as discounts and special cases. Requirements: A database table storing this content, with a draft version and a live version; An admin screen where staff can edit every field; A Test button that lets staff try the draft version before it goes live; A Publish button that makes the draft become live; A change history recording what changed, when, and by whom; An API endpoint that returns the current LIVE content as JSON, for the voice agent to read. Staff must never be able to publish by accident. Publishing is always a deliberate click."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The agent can only say what the school approved (Priority: P1)

The voice agent asks the system for the school's knowledge and receives exactly
what staff have published — never a draft, never something half-edited, never
something invented.

**Why this priority**: This is the entire point of the feature. Principle I
(Honesty) says the agent answers only from approved content; without a published
source of truth to read, the agent has nothing to be honest *from*. Every other
story here exists to keep this one correct.

**Independent Test**: Request the content and compare it against what the admin
screen shows as live. They match exactly. Edit a draft, request again — the answer
is unchanged, because the draft was never published.

**Acceptance Scenarios**:

1. **Given** content has been published, **When** the agent requests it, **Then**
   it receives the live version in full.
2. **Given** a member of staff has edited the draft but not published it, **When**
   the agent requests content, **Then** it receives the previous live version, with
   no trace of the draft.
3. **Given** a request arrives without the agreed shared secret, **When** it asks
   for content, **Then** it is refused and no content is returned.
4. **Given** nothing has ever been published, **When** the agent requests content,
   **Then** it receives an unambiguous "no content published" answer rather than an
   empty or broken one.

---

### User Story 2 - Staff can change what the school says (Priority: P2)

A member of the office staff opens the admin screen, changes the fee for Class 6,
adds a new FAQ, and saves. Nothing they saved is live yet.

**Why this priority**: Without editing, the content can only be changed by a
developer, which puts a technical person between the school and its own
information. It ranks below Story 1 because content loaded once by any means is
still usable; content that cannot be trusted is not.

**Independent Test**: Change a value, save, reopen the screen. The change is there
and marked as draft. Ask for the live content — it has not changed.

**Acceptance Scenarios**:

1. **Given** a logged-in member of staff, **When** they edit any field and save,
   **Then** the change is stored in the draft and the live version is untouched.
2. **Given** a member of staff who is not logged in, **When** they open the admin
   screen, **Then** they cannot see or change anything.
3. **Given** a field that must exist in both Urdu and English, **When** one of the
   two is left empty and they try to save, **Then** they are told which language is
   missing and which field it belongs to.
4. **Given** an FAQ that is no longer wanted, **When** staff remove it, **Then** it
   stops appearing in content but its record is retained rather than destroyed.

---

### User Story 3 - Staff can try the draft before anyone hears it (Priority: P3)

Before publishing, a member of staff types a question a parent might ask and sees
the answer the draft content would produce. They notice the fee they typed has a
digit missing, fix it, and try again.

**Why this priority**: This is what makes publishing safe to do. It ranks below
editing because editing without testing still works — carefully — whereas testing
without editing has nothing to test.

**Independent Test**: Change a fee in the draft, ask the test tool about that fee,
and see the new figure in the answer while the live content still shows the old one.

**Acceptance Scenarios**:

1. **Given** a draft with an edited fee, **When** staff ask the test tool about
   that fee, **Then** the answer reflects the draft, not the live version.
2. **Given** any test result, **When** it is shown, **Then** it carries a visible
   notice that this is a simulation and the live agent may answer differently.
3. **Given** a question about an escalation topic, **When** staff test it, **Then**
   the result shows the question being handed to a human rather than answered.
4. **Given** the test tool is used, **When** anything is asked, **Then** nothing is
   published and the live content is unaffected.

---

### User Story 4 - Publishing is deliberate, and reversible in principle (Priority: P4)

A member of staff finishes checking the draft, presses Publish, is shown exactly
what will change, and confirms. The change is recorded with their name and the
time.

**Why this priority**: It is the smallest piece of work here and depends on all
three stories above existing. Its risk, however, is the highest — this is the
moment content reaches parents.

**Independent Test**: Publish, then check that the live content matches what the
draft was, and that the history shows who did it and when.

**Acceptance Scenarios**:

1. **Given** a draft differing from live, **When** staff press Publish, **Then**
   they are shown what will change and must confirm before anything happens.
2. **Given** the confirmation step, **When** staff cancel it, **Then** nothing is
   published and the live version is unchanged.
3. **Given** a successful publish, **When** the history is opened, **Then** it
   shows what changed, when, and which member of staff did it.
4. **Given** any save, edit, or test, **When** it happens, **Then** nothing is
   published — publishing occurs only through the Publish button and its
   confirmation.
5. **Given** a published change that was wrong, **When** staff look at the history,
   **Then** they can see the previous version's content well enough to restore it
   by editing.

---

### Edge Cases

- **Two staff members edit the draft at once.** The second to save must not
  silently erase the first's work. They are told the draft changed underneath them.
- **Someone presses Publish twice.** The second press publishes nothing new and
  does not create a duplicate history record.
- **The draft is empty or a required fact is blank.** Publishing is refused, naming
  what is missing. Empty content reaching the agent is worse than stale content.
- **An escalation topic is deleted by mistake.** The agent would begin answering a
  question it must never answer. Removing an escalation topic requires the same
  deliberate confirmation as publishing.
- **The content request arrives while a publish is in progress.** The agent
  receives either the old version or the new one in full, never a mixture.
- **A fee or date is typed in the wrong format.** Caught at save time, not
  discovered by a parent hearing something wrong.
- **The history grows large.** The screen remains usable — it does not attempt to
  show every record at once.

## Requirements *(mandatory)*

### Functional Requirements

**Content structure**

- **FR-001**: The system MUST store school content in four groups: Facts, Policies,
  FAQs, and Escalation Topics.
- **FR-002**: Facts MUST cover fees per class, age criteria per class, the list of
  classes, admission dates, and office hours.
- **FR-003**: Policies MUST cover the admission process and document requirements.
- **FR-004**: FAQs MUST be a list of parent questions each paired with an answer.
- **FR-005**: Escalation Topics MUST be a list of subjects the agent must never
  answer, each with the wording used to hand the parent to a human. Discounts and
  special cases MUST be present among them.

**Language**

- **FR-006**: Fields whose value is a number, an amount, a date, a time, or a class
  name MUST be stored once and are not translated. This covers fees, age criteria,
  the class list, admission dates, and office hours.
- **FR-007**: Fields whose value is a sentence the agent will say to a parent MUST
  exist in both Urdu and English. This covers policies, FAQ questions and answers,
  and escalation wording.
- **FR-008**: The system MUST refuse to publish when a field requiring both
  languages has only one, and MUST name the field and the missing language.

**Draft and live**

- **FR-009**: The system MUST hold a draft version and a live version
  independently. Editing changes only the draft.
- **FR-010**: The system MUST never publish as a side effect of saving, editing,
  testing, or any other action.
- **FR-011**: Publishing MUST require an explicit action followed by a confirmation
  that shows what will change.
- **FR-012**: Publishing MUST be refused when a required fact is missing or a
  bilingual field is incomplete.
- **FR-013**: A content request MUST return the live version in its entirety or the
  previous live version in its entirety, never a partially published mixture.

**Access**

- **FR-014**: The admin screen MUST be reachable only by an authenticated member of
  staff.
- **FR-015**: The content request endpoint MUST verify the agreed shared secret
  before returning anything, and MUST refuse a request that does not carry it.
- **FR-016**: The content request endpoint MUST return only the live version. The
  draft MUST NOT be reachable through it under any circumstances.

**Testing the draft**

- **FR-017**: Staff MUST be able to type a question and see the answer the draft
  content would produce, without publishing.
- **FR-018**: Every test result MUST carry a visible notice that it is a simulation
  and that the live agent may answer differently.
- **FR-019**: A test of a question on an escalation topic MUST show the question
  being handed to a human, not answered.
- **FR-020**: Testing MUST have no effect on the draft, the live version, or the
  history.

**History**

- **FR-021**: Every publish MUST create a history record naming what changed, when
  it happened, and which member of staff did it.
- **FR-022**: History records MUST NOT be editable or removable.
- **FR-023**: The history MUST show the most recent change first.
- **FR-024**: A history record MUST contain enough of the previous content that
  staff can restore it by editing.

**Data safety**

- **FR-025**: Content MUST NOT be destroyed. Removing an item marks it as no longer
  in use while retaining its record.
- **FR-026**: Removing an escalation topic MUST require the same deliberate
  confirmation as publishing, because its absence causes the agent to answer
  something it must not.
- **FR-027**: A staff member saving over a draft changed by someone else since they
  opened it MUST be told, rather than silently overwriting their colleague's work.

**Presentation**

- **FR-028**: Every list on the admin screen MUST show a loading state, a designed
  empty state, and an error state.
- **FR-029**: The admin screen MUST be usable on a phone at 360 pixels wide.

### Key Entities

- **Content**: The school's knowledge in its four groups. Exists in two versions —
  the draft that staff edit, and the live version the agent reads. Only publishing
  moves one to the other.
- **Content change record**: One entry per publish. Holds what changed, the time,
  the member of staff responsible, and enough of the superseded content to restore
  it. Never edited, never removed.
- **Escalation topic**: A subject the agent must refuse, paired with the wording it
  uses to pass the parent to a human. Part of Content, called out separately
  because deleting one silently widens what the agent will answer.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member of the office staff who has not used the system before can
  change a fee and publish it, unaided, in under five minutes.
- **SC-002**: Across a hundred content requests spanning a publish, every response
  is a complete version — no response mixes old and new content.
- **SC-003**: No sequence of actions other than Publish followed by its confirmation
  results in content reaching the agent. Verified by attempting to publish through
  saving, editing, testing, and navigating away.
- **SC-004**: Every publish appears in the history with the correct person and time,
  in 100% of cases.
- **SC-005**: A staff member can identify what the previous content said, from the
  history alone, without a developer's help.
- **SC-006**: A request without the shared secret returns no content, in 100% of
  attempts.
- **SC-007**: An incomplete bilingual field is caught before publishing in 100% of
  attempts, and the message names the field and the missing language.
- **SC-008**: Staff correctly describe, when asked, that the test result is a
  simulation rather than the live agent — confirming FR-018's notice does its job.

## Assumptions

- **An authenticated staff session already exists.** Staff login is a separate
  feature, built before this one. This specification assumes a logged-in member of
  staff whose identity can be recorded, and does not define how they log in.
- **The application foundation exists.** Feature 001 provides the deployed
  application and the database connection this feature builds on.
- **"Public content endpoint" means the endpoint serving published content**, not
  an unauthenticated one. `.claude/rules/database.md` describes it as public in the
  sense of live-versus-draft; `.claude/rules/api.md` requires a shared secret on
  every endpoint the voice agent calls. Both are satisfied by returning only live
  content, only to a caller carrying the secret. Recorded here because the two
  phrasings can be read as conflicting.
- **The test tool simulates the agent rather than reproducing it.** The live agent
  runs on a service configured outside this codebase with its own instructions, so
  an answer produced here may differ from the answer a parent hears. FR-018 exists
  because a simulation staff mistake for the real thing is worse than no simulation.
- **The escalation list is not exhaustive on delivery.** Discounts and special cases
  are required; the school will add more as parents ask unexpected things. The
  system does not assume the list is complete.
- **Content volume is small.** Tens of FAQs and a handful of policies, edited
  occasionally by a few people — not thousands of records under constant change.

## Out of Scope

- Staff login and account management — a separate feature, built first
- The voice agent itself, and its connection to this content
- Recording questions the agent could not answer — a separate concern with its own
  table
- Approval workflows: any logged-in staff member may publish, and no second person
  signs it off
- Scheduled or automatic publishing at a future time
- Restoring a previous version by pressing a button; FR-024 requires only that
  staff can see the old content well enough to retype it
- Translating between Urdu and English automatically; both are entered by staff
- Rich text, images, or attachments in content
