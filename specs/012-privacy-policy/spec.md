# Feature Specification: Privacy Policy

**Feature Branch**: `012-privacy-policy`
**Created**: 2026-10-08
**Status**: Draft
**Input**: The pre-handover QA review (2026-10-08) found no privacy policy, nothing linking to one, and three parent-facing sentences that contradict each other. The microphone explainer says "Nothing is used for anything else". The recording notice says the call "is recorded so our team can review it and improve the assistant". The privacy line says answers are "used only to help with your admission enquiry". The owner asked for a bilingual privacy policy that describes only what the system really does, linked from the call flow, with the placeholder office phone kept for now.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A parent reads how their information is used (Priority: P1)

Before or after talking to the assistant, a parent opens the privacy policy and reads, in English or Urdu, what the school collects, why, who else handles it, how long it is kept, and how to ask the office to see, correct or delete it.

**Why this priority**: A parent is asked to allow the microphone, agree to a recorded call and type their name and mobile number. Without a policy they cannot make an informed choice, and the school cannot show a client or tester that it handles parents' data responsibly.

**Independent Test**: Open the privacy page directly on a phone, in English and then in Urdu. Every section in FR-003 is present and readable, the office phone is visible, and nothing needs a login.

**Acceptance Scenarios**:

1. **Given** a visitor on any device, **When** they open the privacy page, **Then** they see the policy in their chosen language, with the office phone and a "last updated" date.
2. **Given** the visitor has chosen Urdu, **When** the page opens, **Then** the whole policy reads right to left in the site's Urdu typeface, with no clipped or broken letters.
3. **Given** the visitor reads the page, **When** they reach "What we collect", **Then** it lists exactly the details the system stores, and nothing it does not.
4. **Given** the visitor wants their details removed, **When** they read "Your choices", **Then** they are told to call the office on the number shown, and that they can use the typed questions or call the office instead of the voice assistant.

---

### User Story 2 - The call flow tells one consistent story and points to the policy (Priority: P1)

A parent who is about to start a call sees short privacy wording that agrees with the full policy: the microphone explainer, the recording notice, the privacy line and the consent tick. Each one links to the policy.

**Why this priority**: Contradictory sentences on the page where consent is given undermine the consent itself. This is the QA report's finding.

**Independent Test**: Walk the call flow up to, but not including, starting a call: open the microphone explainer and the pre-call form. Read every privacy-related sentence and confirm they agree with each other and with the policy, and that each place offers a "Privacy policy" link.

**Acceptance Scenarios**:

1. **Given** the pre-call form is open, **When** the parent reads the consent tick, **Then** a "Privacy policy" link sits next to it.
2. **Given** a parent has typed their name and mobile number, **When** they open the privacy policy from the form, **Then** the policy opens without clearing what they typed.
3. **Given** a call is in progress, **When** the parent opens the privacy policy, **Then** the call is not interrupted.
4. **Given** any landing page, **When** the visitor scrolls to the footer, **Then** a "Privacy policy" link is there in the current language.
5. **Given** the microphone explainer, the recording notice and the privacy line, **When** they are read together, **Then** none claims something another denies. For example, none says data is used for nothing else while another says it is used to improve the assistant.

---

### User Story 3 - The school reviews and approves the draft (Priority: P2)

The owner and the school read the policy and see clearly that it is a draft awaiting their approval. They can check every statement against how the system works and change the wording later without touching layout code.

**Why this priority**: Legal wording must be approved by the school. Until then, visitors must not mistake a draft for an approved legal document.

**Independent Test**: Open the page. A "Draft — awaiting the school's approval. This is not legal advice." notice shows in both languages. The traceability list in the plan maps each statement to the code or setting it describes.

**Acceptance Scenarios**:

1. **Given** the policy is unapproved, **When** anyone opens it, **Then** a visible draft notice appears at the top in the current language.
2. **Given** the school wants a sentence changed, **When** the owner edits the policy wording, **Then** only the bilingual wording file changes, not the page layout.

---

### Edge Cases

- **School content cannot be loaded** (for example the database is unreachable): the policy still renders in full with the office phone. Policy text does not depend on the database. The school name falls back to "the school".
- **A visitor arrives from a search engine or a shared link**: the page works on its own, with the site header, footer, language toggle and sample-content ribbon.
- **Language switched on the policy page**: the policy re-renders in the other language and the choice is remembered the same way as on the rest of the site. No new cookie is added.
- **Very small phones (360 px wide)**: no sideways scrolling; long Urdu words and the phone number do not overflow.
- **Printing or saving the page**: it reads as a plain document; the floating talk card and call window are not printed.
- **The office phone is still the placeholder**: the page shows `021-000-000-000` (owner decision 2026-10-08). The value comes from the same single stored number as the rest of the site, so it updates everywhere at once when replaced.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a public privacy policy page at `/privacy`. It needs no login and is open to search engines.
- **FR-002**: The page MUST be available in English and Urdu, follow the visitor's existing language choice, offer the site's language toggle, and show Urdu right to left in the site's Urdu typeface.
- **FR-003**: The policy MUST contain these sections, in this order, in both languages:
  1. **Who we are and how to contact us**: the school's name, the office phone and the city.
  2. **What we collect before a call**: parent name, mobile number, optional email, and the consent tick.
  3. **What we collect during a call**: the voice conversation is recorded; a written transcript and a short summary are kept; the enquiry details the parent confirms (parent name, child's name, class wanted, age, phone, current class, previous school, new or transfer admission, language). A name the parent does not confirm is left empty. Questions the assistant cannot answer are kept as the question text and language only.
  4. **What we never collect**: CNIC or B-Form numbers. The assistant never asks for them, and if one is spoken it is hidden in the written transcript.
  5. **About the AI assistant**: the parent is talking to an AI assistant, not a person. It gives information only, never confirms an admission and never offers a discount. A person is always reachable on the office phone. School staff may listen to a call live or join it.
  6. **Why we use your information**: to answer the admission enquiry, to let staff follow up, to email the parent the information they asked for, and to improve the assistant's answers. This includes turning questions from calls into new answers with personal details removed.
  7. **Who else handles it**: the services that run the system, by role: the voice-call service (which also keeps the call recording and uses AI language and voice providers), the database service, the website host, and the email service with its backup. Some of these store data on servers outside Pakistan. The school does not sell information or use it for advertising.
  8. **Cookies**: a language-preference cookie, and an anonymous visitor cookie used only to limit how many calls one device can make per day. Staff login cookies are used only on staff pages. There are no analytics or advertising cookies.
  9. **How long we keep it and your choices**: the retention statement (see Assumptions). Parents can call the office to see, correct or delete their details. They can use the typed questions or call the office instead of the voice assistant. Email is optional.
  10. **Children's information**: details about a child are given by the parent or guardian.
  11. **Changes to this policy**: a "last updated" date.
- **FR-004**: Every statement in the policy MUST describe what the system does at the time of release. The plan MUST include a traceability list linking each statement to the code, setting or service it describes. A statement that cannot be traced MUST be removed or marked as an assumption for the school to confirm.
- **FR-005**: The office phone MUST appear near the top of the page and in the contact section, as a tappable call link. It uses the site's single stored office number.
- **FR-006**: While the policy is unapproved, the page MUST show a visible notice in the current language: "Draft — awaiting the school's approval. This is not legal advice." The site-wide sample-content ribbon MUST stay.
- **FR-007**: A "Privacy policy" link MUST appear in three places: the landing page footer, the pre-call form next to the consent tick, and the microphone explainer / recording notice in the call flow.
- **FR-008**: The microphone explainer, the recording notice and the privacy line MUST be rewritten in both languages so they agree with each other and with the policy.
- **FR-009**: Opening the policy from the pre-call form or during a call MUST NOT clear the parent's typed details or interrupt the call.
- **FR-010**: The page MUST have its own page title and description in the current language, distinct from the home page.
- **FR-011**: The page MUST be readable at 360 px width with no sideways scrolling, in both languages.
- **FR-012**: The page MUST render fully when school content cannot be loaded (see Edge Cases).
- **FR-013**: This feature MUST NOT add any new cookie, tracker, analytics or third-party request.
- **FR-014**: All policy wording, in both languages, MUST live in one bilingual wording source, separate from the page layout, so the school's corrections change wording only.

### Key Entities

- **Privacy policy text**: the bilingual wording for each section in FR-003, a "last updated" date, and a draft/approved flag that controls the FR-006 notice.
- **Personal data categories (reference only)**: pre-call details, confirmed enquiry details, call recording, transcript and summary, unanswered questions, and cookies. These are described, not changed, by this feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A parent can reach the privacy policy in one tap from the landing page footer and in one tap from the pre-call form.
- **SC-002**: A review of every policy statement against the traceability list finds 0 statements describing behaviour the system does not have, and 0 contradictions between the call-flow sentences and the policy.
- **SC-003**: In both English and Urdu, the page shows no sideways scrolling at 360 px width, and no Urdu text is clipped.
- **SC-004**: The office phone is visible on a phone screen without scrolling.
- **SC-005**: A parent can read the whole policy in under 5 minutes: no more than about 900 words per language.
- **SC-006**: Re-running the QA checklist moves item 1 ("Privacy policy") from MISSING to PASS. The school's legal approval is the only open point.
- **SC-007**: Details typed in the pre-call form are still there after the parent opens and closes the policy.

## Assumptions

- **Retention (to be confirmed by the school)**: records are kept for the current admission session. A parent can ask the office by phone to delete them sooner. Deletion is done by staff by hand; no automatic deletion is built in this feature.
- **Responsibility**: the school is the organisation responsible for parents' information. The policy names it from the school name already shown on the site (currently the demo "Al-Noor Public School").
- **Office phone**: it stays the placeholder `021-000-000-000` for now (owner decision 2026-10-08), sourced from the single stored number.
- **Email is optional**: in the current pre-call form, mobile and name are required and email is optional.
- **Call recording**: the voice-call service keeps the call recording on its side. The school's database stores the transcript and summary, not the audio.
- **Cookie banner not needed**: only functional cookies are set (language, the anonymous call limit, staff login). If analytics are added later, the policy and the banner decision must be revisited.
- **Translation**: English is the source text. The Urdu version is drafted alongside it and checked by the owner.
- **Legal status**: the text is a draft for the school's approval, not legal advice.

## Out of Scope

- A Terms & Conditions page.
- A cookie consent banner.
- Analytics.
- Automated data deletion or retention jobs.
- Changing the office phone number.
- Closing public sign-up in the authentication settings. That is an urgent owner action already raised in the QA report, not part of this page.
- Any change to what data is collected.

## Dependencies

- The existing landing page layout: header, footer, language toggle and sample-content ribbon.
- The single stored office number.
- The pre-call form and call window, where the link is added.
- The existing bilingual strings files, where the three call-flow sentences live.
