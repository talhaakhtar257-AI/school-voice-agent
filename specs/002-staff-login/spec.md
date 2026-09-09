# Feature Specification: Staff Login

**Feature Branch**: `002-staff-login`
**Created**: 2026-09-09
**Status**: Draft — assumptions pending maintainer confirmation
**Input**: User description: "staff login"

## Assumptions Made *(read this first)*

The maintainer asked for this feature by name without further detail. Rather than
block, the specification below was drafted using the defaults listed here. Each
one is a real decision. **Correct any that are wrong before the plan is written.**

- **A-001 — One kind of staff user, no roles.** Every account can see and do the
  same things. No admin tier, no read-only receptionist tier. Roles can be added
  later as their own feature if the school asks. *(Constitution VIII, Simple Over
  Clever.)*
- **A-002 — Email and password, not a magic link.** Staff type an email address
  and a password. A magic link was considered and rejected for this phase: it
  depends on email delivery working reliably during a live client demo, and it
  makes every login wait on an inbox.
- **A-003 — No public sign-up.** There is no "create account" screen anywhere.
  Accounts are created by the maintainer in the Supabase dashboard and handed to
  staff. A stranger who finds the login page cannot give themselves an account.
- **A-004 — No self-service password reset in Phase 1.** A member of staff who
  forgets a password contacts the maintainer, who resets it in the Supabase
  dashboard. The login screen states this so nobody is stranded.
- **A-005 — Login lands on the dashboard home at `/dashboard`.** For this feature
  that screen only needs to prove the user is signed in and offer sign-out. What
  it eventually shows — leads, charts, content — belongs to other features.
- **A-006 — The login screen carries the office phone number.** It is a
  staff-facing screen, not a parent-facing one, but it is publicly reachable and a
  parent may land on it by mistake. They should not hit a dead end.
- **A-007 — Sessions last until sign-out or expiry, on the same device.** No
  "remember me" checkbox, no forced re-login after a fixed period.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — A staff member signs in and reaches the dashboard (Priority: P1)

A member of the school office opens the dashboard address on their phone or on
the office computer. They are shown a sign-in screen in Urdu and English. They
enter the email address and password the maintainer gave them, and arrive at the
dashboard. On their next visit that day, the site remembers them and goes
straight in.

**Why this priority**: Nothing else in the dashboard can be built or demonstrated
until someone can get into it. Every other staff screen sits behind this.

**Independent Test**: Create one account in Supabase, sign in with it in a
browser, and land on `/dashboard`. Delivers the entire value of the feature on
its own.

**Acceptance Scenarios**:

1. **Given** a staff account exists and nobody is signed in, **When** the correct
   email and password are submitted, **Then** the browser arrives at `/dashboard`
   and the signed-in person's email address is visible on screen.
2. **Given** a staff member signed in earlier and did not sign out, **When** they
   reopen the dashboard address in the same browser, **Then** they reach
   `/dashboard` without typing anything.
3. **Given** the sign-in form is submitted, **When** the answer from the server has
   not arrived yet, **Then** the button shows a loading state and cannot be
   submitted a second time.

---

### User Story 2 — The dashboard is closed to everyone else (Priority: P1)

Somebody who is not signed in tries to open a dashboard address directly, either
by typing it or by following an old link. They are sent to the sign-in screen
instead. The public landing page is unaffected and stays open to everyone.

**Why this priority**: A login screen that can be walked around is not a login
screen. This carries the same priority as signing in because the two are only
useful together.

**Independent Test**: With no session, type `/dashboard` into the address bar and
confirm the sign-in screen appears instead. Then open `/` and confirm the landing
page still loads normally.

**Acceptance Scenarios**:

1. **Given** nobody is signed in, **When** `/dashboard` is opened directly, **Then**
   the sign-in screen is shown and no dashboard data is visible at any point.
2. **Given** nobody is signed in, **When** the public landing page `/` is opened,
   **Then** it loads normally with no sign-in prompt.
3. **Given** a staff member is signed in, **When** they open the sign-in screen
   again, **Then** they are sent on to `/dashboard` rather than shown the form.

---

### User Story 3 — A wrong password is refused clearly (Priority: P2)

A member of staff mistypes their password, or types an email address that has no
account. They are told plainly, in Urdu and English, that the details were not
recognised, and they can try again. They are never told which of the two was
wrong.

**Why this priority**: The feature is usable without polished errors, but a
non-developer verifying this work will type a wrong password to see what happens,
and a blank screen or a raw technical message reads as broken.

**Independent Test**: Submit a deliberately wrong password and confirm a readable
bilingual message appears above the form.

**Acceptance Scenarios**:

1. **Given** an account exists, **When** the right email and a wrong password are
   submitted, **Then** a bilingual "email or password not recognised" message
   appears and the email field keeps what was typed.
2. **Given** an email with no account, **When** it is submitted with any password,
   **Then** the same message appears, worded identically to the wrong-password
   case.
3. **Given** the network request fails outright, **When** the form is submitted,
   **Then** a bilingual "could not reach the server, please try again" message
   appears, distinct from the credentials message.

---

### User Story 4 — A staff member signs out (Priority: P3)

A member of staff finishes on a shared office computer and signs out. The session
ends, and the back button does not bring the dashboard back.

**Why this priority**: Real value on a shared machine, but the feature can be
demonstrated without it.

**Independent Test**: Sign in, sign out, then press the browser back button and
confirm the sign-in screen appears rather than the dashboard.

**Acceptance Scenarios**:

1. **Given** a signed-in staff member, **When** they choose sign out, **Then** they
   arrive at the sign-in screen and the session is ended.
2. **Given** a staff member has just signed out, **When** they press the browser
   back button, **Then** they see the sign-in screen and no dashboard content.

---

### Edge Cases

- **The email field is empty, or the password is empty.** The form does not
  submit; the empty field is marked in both languages.
- **The email address has no `@` or is otherwise malformed.** Caught before the
  request is sent, with a bilingual message.
- **The form is submitted twice quickly, or the button is double-tapped.** Only
  one sign-in attempt is made.
- **A session expires while a dashboard screen is open.** The next action sends
  the person to the sign-in screen rather than showing an error or empty data.
- **An account is deleted in Supabase while that person is signed in.** Their next
  action sends them to the sign-in screen.
- **The screen is 360px wide.** The form, the messages and the office phone number
  all remain usable without horizontal scrolling.
- **The browser has cookies blocked.** A bilingual message explains that cookies
  are required, rather than the sign-in silently failing in a loop.
- **Urdu text renders right-to-left** on every message including the error states,
  and mixed Urdu-English lines render correctly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a sign-in screen that accepts an email
  address and a password.
- **FR-002**: The system MUST show every word on the sign-in screen in both Urdu
  and English, including all error and loading messages. *(Constitution IV.)*
- **FR-003**: The system MUST send a person with a valid session to `/dashboard`
  and keep everyone else out of every screen under `/dashboard`.
- **FR-004**: The system MUST leave the public landing page `/` open to everyone,
  with no sign-in requirement and no redirect. *(CLAUDE.md: the landing page stays
  public.)*
- **FR-005**: The system MUST NOT offer any way to create an account. Accounts are
  created by the maintainer in Supabase.
- **FR-006**: The system MUST use the same wording when the email is unknown and
  when the password is wrong, so the screen never reveals which email addresses
  have accounts.
- **FR-007**: Staff MUST be able to sign out from any dashboard screen, and the
  session MUST be ended when they do.
- **FR-008**: The system MUST keep a session across page reloads and across
  browser tabs on the same device, without a "remember me" control.
- **FR-009**: The system MUST store the session in cookies. Browser `localStorage`
  and `sessionStorage` MUST NOT be used. *(CLAUDE.md: no browser storage.)*
- **FR-010**: The system MUST show a loading state while a sign-in attempt is in
  flight, and MUST prevent a second attempt until the first finishes.
- **FR-011**: The system MUST distinguish a credentials failure from a network or
  server failure in what it shows the user.
- **FR-012**: The system MUST NOT write a password, a session token, or a parent's
  phone number into any log line. *(Constitution VI and the data-handling rules.)*
- **FR-013**: The system MUST display the school office phone number on the
  sign-in screen, reachable without scrolling at 360px width. *(Constitution VII;
  see assumption A-006.)*
- **FR-014**: Every screen in this feature MUST be usable at 360px width.
  *(Constitution IX.)*
- **FR-015**: The dashboard home MUST render a designed empty state — not a blank
  screen — since it holds no data of its own in this feature. *(CLAUDE.md: empty
  states are a requirement.)*
- **FR-016**: The system MUST tell a staff member on the sign-in screen who to
  contact about a forgotten password, since no self-service reset exists.
  *(Assumption A-004.)*
- **FR-017**: Row level security MUST be enabled on any table this feature reads
  or writes, and the Supabase service key MUST NOT reach the browser.
  *(Constitution, data handling.)*

### Key Entities

- **Staff user**: A member of the school office who may open the dashboard. Held
  by Supabase Auth, not by a table in this codebase. Attributes used here: email
  address, password, and the unique identifier Supabase assigns. No name, no
  phone number, no role is stored by this feature.
- **Session**: Proof that a particular staff user signed in on a particular
  device. Lives in cookies, created at sign-in, destroyed at sign-out, and
  expiring on its own after a period Supabase controls.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member of staff who has been given an email and password can sign
  in and reach the dashboard in under 30 seconds, on a phone, without being shown
  anything they need a developer to explain.
- **SC-002**: With no session, every address beginning `/dashboard` shows the
  sign-in screen, and none of them displays dashboard content even momentarily.
  Verified by trying each dashboard address directly in the address bar.
- **SC-003**: The public landing page loads for a signed-out visitor with no
  redirect and no sign-in prompt.
- **SC-004**: Every state of the sign-in screen — empty, loading, wrong
  credentials, network failure — is reachable by clicking, and each renders
  correctly in Urdu and English at 360px width. The maintainer can confirm all
  four without reading code. *(Constitution IX.)*
- **SC-005**: After signing out, pressing the browser back button does not reveal
  any dashboard content.
- **SC-006**: `npm run build` passes and `npx tsc --noEmit` reports no errors.

## Out of Scope

Named here so they are not built by accident:

- Roles and permissions of any kind
- Self-service password reset or "forgot password" email
- Account creation, invitations, or a staff management screen
- Two-factor authentication
- Social or Google sign-in
- Session timeout warnings or a "remember me" control
- Anything the dashboard eventually displays — leads, transcripts, content,
  charts — which belong to their own features
- Everything the constitution places out of phase: payments, parent portal, file
  upload, phone and WhatsApp integration, multiple campuses
