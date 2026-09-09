---
description: "Task list for feature 002-staff-login"
---

# Tasks: Staff Login

**Input**: Design documents from `/specs/002-staff-login/`
**Prerequisites**: `plan.md` ✓, `spec.md` ✓, `research.md` ✓, `data-model.md` ✓, `quickstart.md` ✓

**Tests**: No automated tests. The specification requests none, and decision
D-006 in `research.md` records why. Verification is by clicking, following
`quickstart.md`.

**Organization**: Tasks are grouped by user story so each story can be built and
checked on its own.

## ⚠️ Two things must happen before T001

1. **Feature `001-app-foundation` must be built and merged.** There is no
   `package.json`, no `app/` folder and no `lib/` folder in this repository yet.
   Every task below edits files inside a Next.js application that does not exist.
2. **The maintainer must approve two dependencies**: `@supabase/supabase-js` and
   `@supabase/ssr`. See the Dependency Decision section of `plan.md`.

Nothing here can start until both are settled.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependency on unfinished work
- **[Story]**: Which user story the task serves (US1, US2, US3, US4)

---

## Phase 1: Setup

**Purpose**: Get the pieces in place that everything else needs.

- [ ] T001 Install `@supabase/supabase-js` and `@supabase/ssr` with `npm install`, once the maintainer has approved both, and confirm they appear in `package.json`
- [ ] T002 Create one staff account by hand in the Supabase dashboard under Authentication → Users, with **Auto Confirm User** switched on, following Part 1.1 of `specs/002-staff-login/quickstart.md`
- [ ] T003 Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`, and add the same two names with empty values to `.env.example`. Confirm the service role key is **not** present in either file.

**Checkpoint**: The app runs, the packages are installed, and one account exists to test with.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: The Supabase wiring and the bilingual text that every user story below depends on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Create the browser Supabase client in `lib/supabase/client.ts` using `createBrowserClient` from `@supabase/ssr`, reading the two `NEXT_PUBLIC_` environment variables. No `localStorage`.
- [ ] T005 [P] Create the server Supabase client in `lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr`, wired to the Next.js cookie store, for use in Server Components.
- [ ] T006 [P] Create every Urdu and English string for this feature in `lib/strings/staff-login.ts`, as one exported object with both languages side by side. Cover: screen title, email label, password label, sign-in button, loading text, wrong-credentials message, network-failure message, empty-field messages, malformed-email message, cookies-blocked message, forgotten-password note, sign-out button, and the dashboard empty state.
- [ ] T007 Create the session refresh helper in `lib/supabase/middleware.ts` that reads and rewrites the session cookies on each request (depends on T005)
- [ ] T008 [P] Create the office phone number component in `components/office-phone.tsx`, showing the number in both languages as a tappable `tel:` link with a touch target of at least 44px

**Checkpoint**: Supabase is wired up through cookies and all bilingual text exists in one file. User stories can now begin.

---

## Phase 3: User Story 1 — A staff member signs in and reaches the dashboard (Priority: P1) 🎯 MVP

**Goal**: A member of staff enters their email and password and arrives at the dashboard, and stays signed in across reloads.

**Independent Test**: Sign in with the account from T002 and land on `/dashboard`. Follow Part 2 of `quickstart.md`.

- [ ] T009 [P] [US1] Build the sign-in form in `components/login-form.tsx`: email and password fields, a submit button, all text drawn from `lib/strings/staff-login.ts`, `dir="auto"` on text containers, and a loading state that blocks a second submission (depends on T004, T006)
- [ ] T010 [US1] Build the sign-in screen in `app/login/page.tsx`, rendering the form from T009 and the office phone component from T008, laid out for a 360px screen first
- [ ] T011 [P] [US1] Build the dashboard shell in `app/dashboard/layout.tsx`, reading the signed-in user with the server client and showing their email address (depends on T005)
- [ ] T012 [US1] Build the dashboard home in `app/dashboard/page.tsx` with a designed empty state that explains in Urdu and English what will appear here later — never a blank screen (depends on T006, T011)
- [ ] T013 [US1] Verify Part 2 of `quickstart.md` end to end on `localhost`: sign in, land on the dashboard, reload and stay signed in, open a second tab and stay signed in

**Checkpoint**: User Story 1 works on its own. This is the demonstrable MVP.

---

## Phase 4: User Story 2 — The dashboard is closed to everyone else (Priority: P1)

**Goal**: Nobody without a session can reach any dashboard screen, and the public landing page stays open to everyone.

**Independent Test**: With no session, type `/dashboard` in the address bar and get the sign-in screen with no flash of dashboard content. Follow Part 3 of `quickstart.md`.

- [ ] T014 [US2] Create `middleware.ts` at the repository root: redirect a request to anything under `/dashboard` without a valid session to `/login`, refresh the session using the helper from T007, and set the `matcher` so it runs on `/dashboard/:path*` and `/login` only (depends on T007)
- [ ] T015 [US2] In the same `middleware.ts`, send a request to `/login` that already has a valid session on to `/dashboard`
- [ ] T016 [US2] Confirm the public landing page `/` is untouched by the matcher: open it signed out and check there is no redirect and no sign-in prompt
- [ ] T017 [US2] Verify Part 3 of `quickstart.md`, watching specifically for any flash of dashboard content before the redirect

**Checkpoint**: Stories 1 and 2 both work. The dashboard is genuinely closed.

---

## Phase 5: User Story 3 — A wrong password is refused clearly (Priority: P2)

**Goal**: Every way of getting sign-in wrong produces a readable bilingual message rather than a blank screen or a technical error.

**Independent Test**: Submit a wrong password and see a bilingual message. Follow Part 4 of `quickstart.md`.

- [ ] T018 [US3] In `components/login-form.tsx`, catch a failed sign-in and show the wrong-credentials message from `lib/strings/staff-login.ts`, keeping what was typed in the email field. Use identical wording for an unknown email and a wrong password, per FR-006.
- [ ] T019 [US3] In `components/login-form.tsx`, block submission when either field is empty and mark the empty field in both languages
- [ ] T020 [US3] In `components/login-form.tsx`, check the email address is well formed before sending anything to the server, and show the bilingual malformed-email message if not
- [ ] T021 [US3] In `components/login-form.tsx`, distinguish a network or server failure from a credentials failure and show the separate bilingual message for it
- [ ] T022 [US3] In `components/login-form.tsx`, detect that cookies are unavailable and show the bilingual cookies-blocked message, rather than failing silently in a redirect loop
- [ ] T023 [US3] Add the forgotten-password note to `app/login/page.tsx`, telling staff who to contact, since there is no self-service reset (FR-016)
- [ ] T024 [US3] Verify all six steps of Part 4 of `quickstart.md`, confirming the unknown-email and wrong-password messages are word-for-word identical

**Checkpoint**: Every error state is reachable by clicking and readable in both languages.

---

## Phase 6: User Story 4 — A staff member signs out (Priority: P3)

**Goal**: Signing out ends the session, and the back button does not bring the dashboard back.

**Independent Test**: Sign out, press back, and see the sign-in screen. Follow Part 5 of `quickstart.md`.

- [ ] T025 [P] [US4] Build the sign-out button in `components/sign-out-button.tsx`, calling Supabase sign-out and sending the person to `/login` (depends on T004, T006)
- [ ] T026 [US4] Add the sign-out button from T025 to `app/dashboard/layout.tsx` so it appears on every dashboard screen
- [ ] T027 [US4] Verify Part 5 of `quickstart.md`, confirming the back button after signing out shows no dashboard content

**Checkpoint**: All four user stories work independently.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T028 Check every file created in this feature is under 200 lines and split any that is not, per Constitution VIII
- [ ] T029 Confirm no password, session token or email address is written to a log line anywhere in this feature (FR-012)
- [ ] T030 Walk through Part 6 of `quickstart.md` at 360px width: no horizontal scrolling, 44px touch targets, office number visible without scrolling, Urdu rendering right to left
- [ ] T031 Walk through Part 7 of `quickstart.md` on the deployed Vercel preview, since cookies behave differently there than on `localhost`
- [ ] T032 Run `npm run build` and `npx tsc --noEmit`; both must be clean before this feature is called done

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)** — blocked by feature 001 and the dependency approval, not by anything in this feature
- **Foundational (Phase 2)** — needs Setup. Blocks every user story.
- **User Story 1 (Phase 3)** — needs Foundational
- **User Story 2 (Phase 4)** — needs Foundational and T007. Best done after US1, so there is a working sign-in to be redirected to.
- **User Story 3 (Phase 5)** — needs US1, because it adds states to the form US1 creates
- **User Story 4 (Phase 6)** — needs US1
- **Polish (Phase 7)** — needs every story you intend to ship

### Within each story

- Components before the pages that render them
- The form before its error states
- Verification task last in each phase

### Parallel opportunities

- T004, T005, T006 and T008 are four different files with no dependency on each other
- T009 and T011 touch different files once Foundational is done
- T025 can be built while Story 3 is in progress

```bash
# Foundational, all at once:
Task: "Create browser Supabase client in lib/supabase/client.ts"
Task: "Create server Supabase client in lib/supabase/server.ts"
Task: "Create bilingual strings in lib/strings/staff-login.ts"
Task: "Create office phone component in components/office-phone.tsx"
```

---

## Implementation Strategy

### MVP first

1. Phase 1: Setup
2. Phase 2: Foundational
3. Phase 3: User Story 1
4. **Stop and check** against Part 2 of `quickstart.md`
5. Add Phase 4 immediately — a sign-in that can be walked around is not finished

### Incremental delivery

Stories 1 and 2 together are the smallest thing worth showing the client.
Story 3 makes it survive being poked at, which is what a demo actually involves.
Story 4 matters on a shared office computer.

---

## Task Summary

| Phase | Tasks | Count |
|---|---|---|
| Setup | T001–T003 | 3 |
| Foundational | T004–T008 | 5 |
| US1 — Sign in (P1) | T009–T013 | 5 |
| US2 — Keep others out (P1) | T014–T017 | 4 |
| US3 — Clear errors (P2) | T018–T024 | 7 |
| US4 — Sign out (P3) | T025–T027 | 3 |
| Polish | T028–T032 | 5 |
| **Total** | | **32** |
