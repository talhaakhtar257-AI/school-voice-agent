---
description: "Task list for feature 003-content-system"
---

# Tasks: School Content System

**Input**: Design documents from `/specs/003-content-system/`
**Prerequisites**: `plan.md` ✓, `spec.md` ✓, `research.md` ✓, `data-model.md` ✓, `contracts/content-api.md` ✓, `quickstart.md` ✓

**Tests**: No automated tests. The specification requests none; verification is by
clicking, following `quickstart.md` (research D-009, consistent with feature 002).

**Assumptions**: All six in `plan.md` are confirmed (2026-09-10). The test tool is
keyword matching, not an LLM (option A).

**Prerequisite met**: Feature 002 (staff login) is implemented, merged into
`main`, and merged into this branch. `app/dashboard/layout.tsx`, `proxy.ts`, and
`lib/supabase/{client,server}.ts` exist.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel — different files, no dependency on unfinished work
- **[Story]**: which user story the task serves (US1–US4)

---

## Phase 1: Setup

- [x] T001 Add `zod` with `npm install zod` and confirm it appears in `package.json` (mandated by `.claude/rules/api.md`; assumption 3)
- [ ] T002 Confirm `RETELL_WEBHOOK_SECRET` is set in `.env.local`, add it to Vercel for Production and Preview if missing, and confirm it is listed in `.env.example`
- [x] T003 [P] Add a "Content" link to the dashboard nav in `app/dashboard/layout.tsx`, pointing at `/dashboard/content` (only visible change from feature 002's layout)

**Checkpoint**: `zod` installed, the secret exists, and the dashboard links to the content area.

---

## Phase 2: Foundational (blocking prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Write the migration file `supabase/migrations/<timestamp>_content_system.sql` per `data-model.md`: create `content` (id, channel with CHECK + UNIQUE, doc jsonb NOT NULL default '{}', created_at, updated_at) and `content_history` (id, published_at, published_by, published_by_email, doc_before, doc_after, change_summary, created_at, updated_at); an `updated_at` trigger for both; seed the two `content` rows (`draft`, `live`) with `'{}'::jsonb`; the `publish_content(actor_id uuid, actor_email text, summary jsonb)` SECURITY DEFINER function; enable RLS and add the policies from the `data-model.md` RLS matrix.
- [x] T005 Walk the maintainer through T004 in plain English — what tables and function are created, that no existing data is touched (the project has no tables yet), and that the two seed rows are empty. **Wait for explicit approval** (`.claude/rules/database.md`).
- [x] T006 Apply the approved migration to Supabase (via the Supabase MCP `apply_migration` or `supabase db push`), then confirm: `content` has exactly two rows, `content_history` is empty, RLS is on for both.
- [x] T007 [P] Define the content document in `lib/content/schema.ts`: the `zod` schema for `ContentDoc` (facts, policies, faqs, escalationTopics per `data-model.md`) and the `ContentDoc` type derived from it. Include a `Bilingual` schema. No React here.
- [x] T008 [P] Create `lib/supabase/admin.ts`: a service-role Supabase client built from `SUPABASE_SERVICE_ROLE_KEY`, for server-side use only. A comment states it must never be imported by a client component.
- [x] T009 Create `lib/content/queries.ts`: `readDraft()`, `readLive()` (both parse through the schema), `saveDraft(doc, expectedUpdatedAt)` (optimistic-concurrency check, throws a typed `DraftConflict` when the timestamp moved), and `listHistory(page)` — all using the server client from `lib/supabase/server.ts` (depends on T007).
- [x] T010 [P] Create `lib/strings/content-admin.ts`: the small set of bilingual UI strings this feature shows staff (section titles, Save, Publish, Cancel, "draft saved", the draft-conflict message, the simulation notice). English-primary chrome, but keep the pair per entry (assumption 5, research D-008).

**Checkpoint**: the database is ready, the document shape is defined once, and the read/write helpers exist.

---

## Phase 3: User Story 1 — The agent reads only approved content (Priority: P1) 🎯 MVP

**Goal**: `GET /api/content` returns the live version as JSON to a caller carrying the shared secret, and nothing to anyone else.

**Independent Test**: `curl` the endpoint with and without the secret (quickstart Part 5). With no publish yet, it returns `{ "published": false }`.

- [x] T011 [US1] Create `app/api/content/route.ts`: `GET` only; check `X-Agent-Secret` against `RETELL_WEBHOOK_SECRET` first and return `401 { error: "unauthorized" }` on miss; then read `live` via `lib/supabase/admin.ts`; return `{ published: false }` when the live doc is empty, otherwise `{ published: true, publishedAt, content }` with archived FAQs/escalation topics stripped. `export const dynamic = "force-dynamic"`. Never leak a DB error (`.claude/rules/api.md`). Put the `curl` examples from `contracts/content-api.md` in a comment at the top.
- [x] T012 [US1] Add a `405 { error: "method not allowed" }` handler for non-GET methods on the same route.
- [x] T013 [US1] Verify quickstart Part 5 against `npm run dev`: no secret → 401, wrong secret → 401, correct secret → 200 with `{ "published": false }` (nothing published yet).

**Checkpoint**: the agent-facing contract is real and testable, before any editing UI exists.

---

## Phase 4: User Story 2 — Staff can change what the school says (Priority: P2)

**Goal**: A logged-in staff member edits any field on `/dashboard/content` and saves; only the draft changes.

**Independent Test**: Change a value, save, reload — the change is there and marked draft; `GET /api/content` is unchanged (quickstart Parts 1 and 2).

- [x] T014 [P] [US2] Build `components/content/bilingual-field.tsx`: an English input and an Urdu input (`dir="rtl"` on the Urdu one) for one `Bilingual` value, showing a per-field "missing: Urdu/English" note when one side is empty (depends on T010).
- [x] T015 [P] [US2] Build `components/content/facts-editor.tsx`: edit `classes`, `feePerClass`, `ageCriteriaPerClass`, `admissionDates`, `officeHours`. Numeric fields reject non-digits; dates use date inputs; times use time inputs. Format checks per `data-model.md` (positive fees, `start <= end`, `opens < closes`).
- [x] T016 [P] [US2] Build `components/content/policies-editor.tsx`: two `bilingual-field`s — admission process, document requirements.
- [x] T017 [P] [US2] Build `components/content/faq-editor.tsx`: a list of FAQs, each with a question `bilingual-field` and an answer `bilingual-field`; Add FAQ; Remove (sets `archivedAt`, keeps the record — FR-025); archived items hidden.
- [x] T018 [P] [US2] Build `components/content/escalation-editor.tsx`: a list of escalation topics, each with a topic `bilingual-field` and a hand-off wording `bilingual-field`; Add; Remove is wired to the confirm dialog from T028 (FR-026), not a quiet delete.
- [x] T019 [US2] Build `app/dashboard/content/page.tsx`: load the draft with `readDraft()`, render the four editors from T015–T018, hold the working document in state, and a Save button. Loading, empty (designed, not blank), and error states for the initial load (FR-028). 360px-first (FR-029). (depends on T009, T014–T018)
- [x] T020 [US2] Wire Save in `app/dashboard/content/page.tsx` to a server action calling `saveDraft(doc, expectedUpdatedAt)`; on `DraftConflict` show the bilingual "draft changed since you opened it — reload" message (FR-027); on success show "draft saved" and refresh the timestamp.
- [x] T021 [US2] Verify quickstart Parts 1 and 2 on `npm run dev`: edit a fee, save, reload (persists, marked draft); `GET /api/content` still `{ published: false }`; add an FAQ with a missing Urdu answer and confirm the field shows it is incomplete.

**Checkpoint**: staff can edit and save a draft; live is untouched; Stories 1 and 2 both work.

---

## Phase 5: User Story 3 — Staff can try the draft before anyone hears it (Priority: P3)

**Goal**: Staff type a question and see what the draft content would answer, clearly labelled a simulation.

**Independent Test**: Edit a fee in the draft, ask the test tool about it, see the new figure while live is unchanged (quickstart Part 3).

- [x] T022 [P] [US3] Create `lib/content/simulate.ts`: given a question string and a `ContentDoc`, tokenise the question, score each non-archived FAQ (question + answer text) and each non-archived escalation topic against the tokens, and return `{ kind: "answer", text }` for the best FAQ, `{ kind: "handoff", text }` when an escalation topic wins (FR-019), or `{ kind: "none" }` below a threshold. Pure function, no I/O.
- [x] T023 [US3] Build `app/dashboard/content/test/page.tsx`: a question box; on submit, load the draft with `readDraft()` and call `simulate()`; render the result with a persistent notice that this is a simulation and the live agent may differ (FR-018, from `lib/strings/content-admin.ts`). Testing writes nothing (FR-020). 360px-first.
- [x] T024 [US3] Verify quickstart Part 3: draft fee edit is reflected in the test answer while live is not; a discount question shows the hand-off, not an answer; after testing, `GET /api/content` and the history are both unchanged.

**Checkpoint**: staff can rehearse against the draft safely.

---

## Phase 6: User Story 4 — Publishing is deliberate and recorded (Priority: P4)

**Goal**: Publish shows what will change, requires confirmation, and writes an un-editable history record.

**Independent Test**: Publish, then check live matches the former draft and the history shows who and when (quickstart Parts 4 and 6).

- [x] T025 [P] [US4] Create `lib/content/validate.ts`: `checkPublishReadiness(doc)` → a list of problems, each naming the path and (for bilingual gaps) the missing language: required facts present (FR-002, FR-012), every `Bilingual` in policies and non-archived faqs/escalation topics has both sides (FR-008), formats valid, and a soft warning if no escalation topic matches "discount"/"special case" (FR-005, research D-007).
- [x] T026 [P] [US4] Create `lib/content/diff.ts`: `summariseChanges(before, after)` → an ordered list of human-readable lines ("Class 6 fee: 4000 → 4500", "FAQ added: …", "Escalation topic removed: discounts"). Used by the confirm dialog and stored on the history row.
- [x] T027 [P] [US4] Build `components/content/publish-dialog.tsx`: shows the `diff.ts` lines and, if `validate.ts` returned problems, shows those instead and disables Confirm (FR-011, FR-012). Confirm and Cancel; Cancel publishes nothing (FR scenario 2).
- [x] T028 [P] [US4] Build `components/content/delete-escalation-dialog.tsx`: a confirmation with the same weight as publish, naming the topic and warning that removing it widens what the agent will answer (FR-026). Used by T018.
- [x] T029 [US4] Create the publish server action in `app/dashboard/content/page.tsx` (or `lib/content/queries.ts`): run `checkPublishReadiness`; if clean, compute the summary with `diff.ts` and call the `publish_content` function with the signed-in user's id and email; handle the `noop` result ("nothing to publish", no history row — FR edge case); on success show "published".
- [x] T030 [US4] Build `app/dashboard/content/history/page.tsx`: `listHistory(page)` most-recent-first (FR-023), each row showing when, which staff email, and the `change_summary` lines; paginated ~20 per page (FR "history grows large"). Loading, empty, error states.
- [x] T031 [US4] Build the single-record view (a route or an expandable row) showing `doc_before` in full so a value can be read and retyped into the draft (FR-024, SC-005). No edit or delete control anywhere on history (FR-022).
- [x] T032 [US4] Verify quickstart Parts 4, 6, 7: the diff dialog lists changes; Cancel publishes nothing; Confirm publishes and `GET /api/content` then matches; a second Publish with no changes says "nothing to publish" and adds no history row; history shows the publish with the right person and time; a history record shows the full prior content; removing an escalation topic requires the weighted confirm.

**Checkpoint**: all four user stories work. Content only reaches the agent through Publish + Confirm.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T033 Confirm every list on the admin screens (`content`, `test`, `history`) has a loading state, a designed empty state, and an error state (FR-028) — walk `quickstart.md` Parts 1, 3, 6.
- [x] T034 Confirm `GET /api/content` never returns the draft under any path, and never a partial document — read `app/api/content/route.ts` and confirm only `channel = 'live'` is selected (FR-013, FR-016, SC-002).
- [ ] T035 Confirm no content, staff email, or secret is written to a log line anywhere in this feature; API errors log only endpoint + message + timestamp (`.claude/rules/api.md`, FR).
- [x] T036 Check every file added in this feature is under ~200 lines; split any that is not (Constitution VIII).
- [ ] T037 Walk `quickstart.md` Part 8 at 360px: no sideways scroll, 44px targets on Save/Publish, Urdu fields right-to-left.
- [ ] T038 Walk the full `quickstart.md` on the deployed Vercel preview for this branch.
- [x] T039 Run `npm run build` and `npx tsc --noEmit`; both clean before this feature is called done (SC, Constitution IX/X).

---

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001..FR-005 content structure | T007, T015–T018 |
| FR-006 language-neutral values stored once | T007, T015 |
| FR-007 bilingual prose | T007, T014, T016–T018 |
| FR-008 refuse publish on bilingual gap, name field + language | T025, T027 |
| FR-009 draft and live independent | T004, T009 |
| FR-010 never publish as a side effect | T020, T023, T029, T034 |
| FR-011 explicit publish + confirmation showing changes | T026, T027, T029 |
| FR-012 refuse publish on missing required fact | T025, T027 |
| FR-013 whole version, never a mixture | T004 (single-row model), T011, T034 |
| FR-014 admin reachable only when authenticated | inherited from feature 002 proxy; T019 sits under `/dashboard` |
| FR-015 endpoint verifies the shared secret | T011 |
| FR-016 endpoint returns live only | T011, T034 |
| FR-017 test the draft without publishing | T022, T023 |
| FR-018 simulation notice | T023 |
| FR-019 escalation question shows a hand-off | T022, T024 |
| FR-020 testing changes nothing | T023, T024 |
| FR-021 every publish recorded with who/when/what | T004, T029, T030 |
| FR-022 history not editable or removable | T004 (no update/delete policy), T031 |
| FR-023 most recent first | T030 |
| FR-024 history holds enough to restore by editing | T004 (`doc_before`), T031 |
| FR-025 removal is soft | T017, T018 |
| FR-026 removing an escalation topic needs a deliberate confirm | T018, T028 |
| FR-027 concurrent-edit warning | T009, T020 |
| FR-028 loading / empty / error states | T019, T023, T030, T033 |
| FR-029 usable at 360px | T019, T023, T030, T037 |
| SC-001 non-developer publishes a fee change in <5 min | T038 |
| SC-002 100 requests across a publish, none mixed | T004 model, T034 |
| SC-003 nothing but Publish+Confirm reaches the agent | T034 |
| SC-004 every publish in history with correct person/time | T029, T032 |
| SC-005 identify prior content from history alone | T031 |
| SC-006 no secret → no content | T011, T013 |
| SC-007 bilingual gap caught, names field + language | T025, T027, T032 |
| SC-008 staff understand it is a simulation | T023 |

---

## Dependencies & Execution Order

- **Setup (Phase 1)** — T001–T003, independent
- **Foundational (Phase 2)** — needs Setup. **T005/T006 (the migration approval and apply) block everything below.** T007–T010 can run in parallel once T001 is done.
- **US1 (Phase 3)** — needs Foundational (T006, T007, T008)
- **US2 (Phase 4)** — needs Foundational (T006, T007, T009, T010)
- **US3 (Phase 5)** — needs US2 (a draft to test) + T022
- **US4 (Phase 6)** — needs US2 (a draft and a live to publish between); T025/T026 can be built alongside US3
- **Polish (Phase 7)** — needs the stories you intend to ship

### Within each story

- Components before the pages that render them
- `lib/content/*` pure functions before the server actions that call them
- Verification task last in each phase

### Parallel opportunities

- T007, T008, T010 (Foundational) — three different files
- T014–T018 (US2 editors) — five different component files
- T025, T026, T027, T028 (US4) — four different files, built before T029 wires them

---

## Implementation Strategy

**MVP = Phase 1 + Phase 2 + Phase 3 (US1).** The agent-facing endpoint, returning
`{ published: false }` until content exists, is the smallest demonstrable slice
and the P1 story.

Then **US2** (editing) makes the content real, **US4** (publish) makes it reach
the agent safely, and **US3** (test) makes publishing comfortable to do. US3 and
US4's pure-function tasks (T022, T025, T026) can overlap.

## Task Summary

| Phase | Tasks | Count |
|---|---|---|
| Setup | T001–T003 | 3 |
| Foundational | T004–T010 | 7 |
| US1 — Agent endpoint (P1) | T011–T013 | 3 |
| US2 — Editing (P2) | T014–T021 | 8 |
| US3 — Test tool (P3) | T022–T024 | 3 |
| US4 — Publish + history (P4) | T025–T032 | 8 |
| Polish | T033–T039 | 7 |
| **Total** | | **39** |
