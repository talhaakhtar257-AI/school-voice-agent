# Feature Specification: Application Foundation

**Feature Branch**: `001-app-foundation`
**Created**: 2026-09-09
**Status**: Draft
**Input**: User description: "Create the foundation for the application. A Next.js app with TypeScript, connected to Supabase, deployed on Vercel. One public page that shows the school name "Al-Noor Public School" and the line "Admissions Assistant". Nothing else on it yet. Set up the database connection and prove it works with a simple health check that confirms the app can reach Supabase. Set up environment variables properly so no keys are ever written in the code. This feature is complete when the site is live on a public https URL and the health check passes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The site is live and identifies the school (Priority: P1)

Someone opens the project's public web address on their phone and sees the school
named, with a line saying what the site is for. Nothing more is offered yet.

This is the whole delivery pipeline proved end to end: written, built, published,
and reachable from outside the building.

**Why this priority**: Until something is live at a real address, nothing else can
be demonstrated, reviewed, or trusted. Every later feature is an edit to a site
that already exists. Doing this first means the risky, unfamiliar part — publishing
— is settled while there is nothing to lose.

**Independent Test**: Open the address on a phone using mobile data, not office
wifi. The school name and the line both appear. Delivers the confidence that the
project is real and reachable.

**Acceptance Scenarios**:

1. **Given** the site has been published, **When** a person opens its address on a
   phone, **Then** they see "Al-Noor Public School" and "Admissions Assistant".
2. **Given** the site has been published, **When** a person opens its address,
   **Then** the connection is secure and the address begins with `https`.
3. **Given** a narrow phone screen 360 pixels wide, **When** the page is shown,
   **Then** both lines are readable without sideways scrolling.

---

### User Story 2 - Anyone can confirm the database is reachable (Priority: P2)

A member of the team opens a health check address and reads a plain answer to one
question: can the application reach its database right now? No terminal, no
command line, no reading code.

**Why this priority**: The database connection is the thing most likely to be
misconfigured and the hardest to diagnose by guessing. A check that anyone can run
turns an afternoon of confusion into a five-second answer. It ranks below the live
page because a live page with an unproven database is still progress; a proven
database with nothing published is not.

**Independent Test**: Open the health check address and read the result. Then
deliberately break the configuration and open it again — the answer changes and
says so plainly.

**Acceptance Scenarios**:

1. **Given** the database is reachable, **When** the health check is opened,
   **Then** it reports success in words a non-developer understands.
2. **Given** the database is unreachable or the configuration is wrong, **When**
   the health check is opened, **Then** it reports failure clearly and does not
   pretend to be healthy.
3. **Given** the health check fails, **When** its response is read, **Then** it
   contains no connection string, no key, no password, and no technical error dump.
4. **Given** the database is unreachable, **When** the public page is opened,
   **Then** the page still renders its two lines — the page does not go blank.

---

### User Story 3 - The project holds no secrets (Priority: P3)

The project's files can be shared, published, or handed to another developer
without leaking anything. Every key and address the application needs is supplied
by its environment, not written into a file that gets committed.

**Why this priority**: This is cheapest to get right at the start and expensive to
correct later — a key committed once must be treated as compromised forever, even
after it is deleted. It ranks third only because the first two prove the project
works; this one protects it.

**Independent Test**: Search every committed file for key material and find none.
Then change a key in the environment and watch it take effect without editing a
single file.

**Acceptance Scenarios**:

1. **Given** the project's committed files, **When** they are searched for keys,
   tokens, passwords or connection strings, **Then** none are found.
2. **Given** a key needs replacing, **When** it is changed in the environment,
   **Then** the application uses the new value with no change to any file.
3. **Given** a required setting is missing, **When** the application starts,
   **Then** it fails immediately with a message naming the missing setting.
4. **Given** the example configuration file, **When** a new developer reads it,
   **Then** they can see every setting the project needs, with no real values in it.

---

### Edge Cases

- **The database is unreachable while someone is viewing the site.** The public
  page must still render. A blank screen reads as broken, and this page does not
  depend on the database for anything it shows.
- **A required setting is missing when the site is published.** Publishing must
  fail loudly, naming what is absent. A site that publishes successfully and then
  fails silently for every visitor is worse than one that refuses to publish.
- **A stranger finds the health check address.** It is reachable by anyone who
  guesses it, so it must reveal only whether the system is healthy — never a
  connection string, a key, a hostname, or a technical error trace.
- **The database is reachable but empty.** This feature creates no tables. The
  health check must confirm it can *reach* the database, and must not report
  failure merely because nothing has been created there yet.
- **Someone opens the site before any content exists.** Expected. The page shows
  its two lines and nothing else; this is the finished state for this feature, not
  a half-built one.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST serve a publicly reachable page over a secure `https`
  connection.
- **FR-002**: That page MUST display the school name "Al-Noor Public School" and
  the line "Admissions Assistant".
- **FR-003**: That page MUST render correctly on a screen 360 pixels wide, with no
  horizontal scrolling.
- **FR-004**: That page MUST render its content whether or not the database is
  reachable.
- **FR-005**: **This page is NOT parent-facing and MUST NOT be presented to any
  parent in its current form.** Before its address is shared with a parent, the
  Urdu versions of both lines and the school office phone number MUST be added.
  This is a deferral of Principle IV (Bilingual) and Principle VII (Human Exit),
  accepted deliberately because no parent is given this address during this
  feature. It is a prerequisite of the first parent-facing feature, not optional.
- **FR-006**: The system MUST provide a health check, reachable in a browser, that
  reports whether the application can currently reach its database.
- **FR-007**: The health check MUST state its result in language a non-developer
  can act on, and MUST distinguish success from failure unambiguously.
- **FR-008**: The health check MUST NOT expose connection strings, keys,
  passwords, hostnames, or technical error traces in any response, including
  failures.
- **FR-009**: The health check MUST report success when the database is reachable
  but contains no tables. This feature creates no tables.
- **FR-010**: The system MUST read every key, address, and credential from its
  environment. No such value appears in any committed file.
- **FR-011**: The system MUST fail immediately and visibly when a required setting
  is missing, naming the setting that is absent.
- **FR-012**: The project MUST include an example configuration listing every
  required setting with empty values, so the full set is discoverable without
  access to real credentials.
- **FR-013**: A credential MUST be replaceable through the environment alone, with
  no change to any file.

### Non-Functional Requirements

- **NFR-001**: The published page MUST be reachable from outside the building's
  network, on a mobile connection.
- **NFR-002**: The health check MUST return an answer promptly enough to be used
  interactively — a person waiting on it should not wonder whether it has hung.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person handed only the web address, using a phone on mobile data,
  sees both lines and a secure connection, on the first attempt, without help.
- **SC-002**: A person who does not read code can determine whether the database is
  reachable in under one minute, unaided.
- **SC-003**: Searching every committed file for credential material returns zero
  results.
- **SC-004**: A credential is replaced and takes effect with zero files changed.
- **SC-005**: With the database deliberately made unreachable, the public page
  still shows both lines, and the health check correctly reports the failure —
  both verified by looking, not by reading logs.
- **SC-006**: A person who has never seen the project can list every setting it
  requires by reading the example configuration alone.

## Assumptions

- **The technology is already fixed and is not chosen by this specification.** The
  constitution's Technology and Scope Constraints settle the stack, hosting, and
  database. This document therefore describes outcomes rather than tools; the
  originating request named them, and that request is preserved verbatim in the
  Input line above.
- **The hosting account and the database project do not yet exist.** Creating them
  is part of delivering this feature and belongs in its task list, performed by the
  maintainer with step-by-step guidance. This is the reason the feature cannot be
  completed by writing code alone.
- **No database tables are created by this feature.** The database rules require
  agreement before any table is added, and none is needed to prove reachability.
- **The office phone number is not yet known to this project.** It is school data
  and must come from the maintainer; it is not invented here. See FR-005.
- **A single environment is assumed** for this feature — one published address.
  Separate preview and production environments are not in scope and are not
  excluded from later work.

## Out of Scope

Named explicitly so the boundary is unambiguous:

- Any voice or conversation capability
- Any admission content, fees, dates, or school information
- Lead capture, the leads table, or any data storage
- Staff login, the dashboard, or any authenticated screen
- Urdu translation of the two lines (deferred by FR-005)
- The office phone number on the page (deferred by FR-005)
- Analytics, error reporting, and monitoring
