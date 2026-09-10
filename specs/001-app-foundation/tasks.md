---
description: "Task list for feature 001-app-foundation"
---

# Tasks: Application Foundation

**Input**: Design documents from `/specs/001-app-foundation/`
**Prerequisites**: `plan.md` ✓, `spec.md` ✓, `research.md` ✓, `data-model.md` ✓, `quickstart.md` ✓, `contracts/health-check.md` ✓

**Tests**: No automated tests. The specification requires none, Principle IX makes
the browser the acceptance surface, and a test framework would be an unapproved
dependency. Verification is by opening pages in a browser, following
`quickstart.md`.

**Organization**: Grouped by user story so each can be built and checked alone.

## Dependencies approved

The maintainer approved `next`, `react`, `typescript` and
`@supabase/supabase-js` on 2026-09-09, satisfying Constitution VIII.

## Two tasks only the maintainer can do

T012 (create the Supabase project) and T016 (publish to Vercel) require signing
into accounts. They are written as step-by-step instructions in `quickstart.md`
rather than as code. Everything else can be completed at the keyboard.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel — different files, no dependency on unfinished work
- **[Story]**: Which user story the task serves (US1, US2, US3)

---

## Phase 1: Setup

- [X] T001 Scaffold the Next.js application at the repository root with TypeScript and the App Router, no `src/` directory, producing `package.json`, `tsconfig.json`, `next.config.ts` and the `app/` folder
- [X] T002 Install `@supabase/supabase-js` and confirm it appears in `package.json`
- [X] T003 Confirm `.gitignore` already covers `node_modules`, `.next`, `.env.local` and `.env*.local`, and add anything missing

**Checkpoint**: `npm run dev` starts and serves the default page.

---

## Phase 2: Foundational (blocking prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create `lib/env.ts` that reads `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and throws immediately naming any setting that is absent (FR-011). Only these two are required; the other three in `.env.example` are not read by this feature.
- [X] T005 Create `lib/supabase.ts` that builds the Supabase client from `lib/env.ts` using the **anonymous** key only, and exposes one function reporting whether the database's REST root answered. It returns a plain true or false and never returns or throws the underlying error text (FR-008).

**Checkpoint**: Both files compile. Nothing renders them yet.

---

## Phase 3: User Story 1 — The site is live and identifies the school (Priority: P1) 🎯 MVP

**Goal**: A public page naming the school, reachable over `https`, readable on a phone.

**Independent Test**: Open the published address on a phone using mobile data and see both lines.

- [X] T006 Create `app/layout.tsx` as the root layout, setting `lang="en"` and the viewport so a 360px screen renders at its true width (FR-003)
- [X] T007 Create `app/page.tsx` showing "Al-Noor Public School" and "Admissions Assistant", with no data fetching of any kind, so the page renders whether or not the database is reachable (FR-002, FR-004)
- [ ] T008 [US1] Verify `app/page.tsx` at 360px width in the browser: both lines readable, no horizontal scrolling (FR-003)

**Checkpoint**: The public page works locally. This is the MVP once deployed.

---

## Phase 4: User Story 2 — Anyone can confirm the database is reachable (Priority: P2)

**Goal**: A health page anyone can open that says in plain words whether the database is reachable.

**Independent Test**: Open `/health` and read the answer. Break the configuration and confirm the answer changes.

- [X] T009 [US2] Create `app/health/page.tsx` as a Server Component that calls the reachability function from `lib/supabase.ts` and states the result in a sentence a non-developer can act on (FR-006, FR-007). It must be a page, not an API route, so it opens in a browser without a secret header.
- [X] T010 [US2] Confirm the failure path reveals nothing: with a deliberately wrong Supabase URL, `/health` reports failure and shows no key, no URL, no hostname and no error trace (FR-008)
- [ ] T011 [US2] Confirm `/health` reports **success** against a database with no tables, since this feature creates none (FR-009)

**Checkpoint**: The health check answers correctly in both directions.

---

## Phase 5: User Story 3 — The project holds no secrets (Priority: P3)

**Goal**: Every credential comes from the environment; nothing sensitive is committed.

**Independent Test**: Search every committed file for key material and find none.

- [ ] T012 Create the Supabase project and copy its URL and anonymous key, following Part 1 of `specs/001-app-foundation/quickstart.md` — **maintainer task, requires signing in**
- [ ] T013 Create `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from T012, and confirm `.env.local` is not tracked by git (FR-010)
- [X] T014 [P] [US3] Confirm `.env.example` lists every setting the project needs with empty values, so the full set is discoverable without real credentials (FR-012, SC-006)
- [X] T015 [US3] Search every committed file for credential material and confirm zero results (FR-010, SC-003)

**Checkpoint**: The repository can be shared without leaking anything.

---

## Phase 6: Publish

- [ ] T016 Publish to Vercel and set the two environment variables there, following Part 3 of `specs/001-app-foundation/quickstart.md` — **maintainer task, requires signing in**
- [ ] T017 Confirm the published address serves over `https` and shows both lines (FR-001, SC-001)
- [ ] T018 Open the published `/health` and confirm it reports success (SC-002)
- [ ] T019 Open the published page on a phone using mobile data rather than office wifi (NFR-001, SC-001)

**Checkpoint**: The site is live and the database connection is proved.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T020 Confirm the public page still renders both lines with the database deliberately unreachable (FR-004, SC-005)
- [ ] T021 Replace a credential in the environment alone and confirm it takes effect with zero files changed (FR-013, SC-004)
- [X] T022 Confirm every file created in this feature is under 200 lines, per Constitution VIII
- [X] T023 Run `npm run build` and `npx tsc --noEmit`; both must be clean

---

## Outstanding constitutional debt

`plan.md` records two deliberate, justified violations, both carried by **FR-005**:
the two lines exist in English only (Principle IV), and the office phone number is
absent (Principle VII). Both are discharged by the same act — adding the Urdu
strings and the real office number — **before this address is shown to any
parent**. This is not optional and it is not this feature's task; it is a
prerequisite of the first parent-facing feature.

---

## Requirement Coverage

| Requirement | Tasks |
|---|---|
| FR-001 public page over https | T016, T017 |
| FR-002 school name and line | T007 |
| FR-003 renders at 360px | T006, T008 |
| FR-004 renders without the database | T007, T020 |
| FR-005 not parent-facing until Urdu and phone added | Outstanding debt above — deliberately not discharged here |
| FR-006 health check in a browser | T009 |
| FR-007 plain-language result | T009 |
| FR-008 no secrets in any response | T005, T010 |
| FR-009 success on an empty database | T011 |
| FR-010 everything from the environment | T013, T015 |
| FR-011 fails loudly naming the missing setting | T004 |
| FR-012 example configuration | T014 |
| FR-013 credential replaceable via environment | T021 |
| NFR-001 reachable on mobile data | T019 |
| NFR-002 health check answers promptly | T018 |
| SC-001 first attempt on a phone | T017, T019 |
| SC-002 non-developer answers in under a minute | T018 |
| SC-003 zero credentials in committed files | T015 |
| SC-004 credential replaced, zero files changed | T021 |
| SC-005 database down: page renders, health fails | T010, T020 |
| SC-006 every setting discoverable from the example | T014 |

---

## Dependencies & Execution Order

- **Setup (Phase 1)** → **Foundational (Phase 2)** → user stories
- **US1 (Phase 3)** needs Foundational only for the layout; `app/page.tsx` reads nothing
- **US2 (Phase 4)** needs T004 and T005
- **US3 (Phase 5)** T012 gates T013, which gates any real verification of US2
- **Publish (Phase 6)** needs US1, US2 and US3
- **Polish (Phase 7)** last

### Parallel opportunities

- T004 and T005 are different files, but T005 imports T004, so T005 follows T004
- T006 and T007 are different files and can be written together
- T014 is independent of everything else

---

## Task Summary

| Phase | Tasks | Count |
|---|---|---|
| Setup | T001–T003 | 3 |
| Foundational | T004–T005 | 2 |
| US1 — Live page (P1) | T006–T008 | 3 |
| US2 — Health check (P2) | T009–T011 | 3 |
| US3 — No secrets (P3) | T012–T015 | 4 |
| Publish | T016–T019 | 4 |
| Polish | T020–T023 | 4 |
| **Total** | | **23** |
