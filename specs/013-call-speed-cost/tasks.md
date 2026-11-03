# Tasks: Faster answers, lower cost, and both made visible

**Input**: Design documents from `/specs/013-call-speed-cost/`
**Prerequisites**: spec.md, plan.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks. This project has no test runner; the constitution
(Principle IX) and the Definition of Done require verification by `npm run
build`, `npx tsc --noEmit`, and clicking. Each phase below ends with the clicking
check from [quickstart.md](./quickstart.md).

**Organization**: Grouped by user story. User Story 1 contains slices A, B and C
from plan.md; each slice ships and is checkable on its own, so US1 can be
released in three steps rather than one.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel — different files, no dependency on unfinished work
- **[US1/US2/US3]**: the user story the task serves

## Path Conventions

Single Next.js app at the repository root. `app/` for routes and screens, `lib/`
for logic and strings, `components/` for UI, `supabase/migrations/` for schema.

---

## Phase 1: Setup

**Purpose**: Record the baseline so the result can be compared, not remembered.

- [ ] T001 Confirm the working tree builds before any change: `npm run build` and `npx tsc --noEmit` both clean
- [ ] T002 Record the "before" figures in `specs/013-call-speed-cost/quickstart.md` if they have drifted from the 3 Nov call (p50 2,279ms, p90 2,913ms, $0.1846/min, $0.92 for five minutes)

---

## Phase 2: Foundational

**Purpose**: None. The three user stories touch different files and have no
shared prerequisite, so there is deliberately no blocking phase — this keeps
Principle X (small steps) honest rather than inventing a foundation.

**Checkpoint**: Any story below may start immediately.

---

## Phase 3: User Story 1 — A parent is answered without an awkward silence (Priority: P1) 🎯 MVP

**Goal**: Remove the three places where the parent waits on our own code: the
content fetch before every first answer, the email send mid-conversation, and the
repeated enquiry save.

**Independent Test**: Hold a call covering a fees question, a request for written
details, and the class/age/transfer facts. The first answer arrives as fast as
later ones, the conversation does not pause when details are requested, and one
complete enquiry appears in the dashboard.

### Slice A — the first answer stops waiting (FR-002, FR-003, FR-004, D-002, D-007)

- [ ] T003 [US1] Create `lib/content/brief-cache.ts` exporting the cache tag constant and a cached brief reader built with `unstable_cache` from `next/cache`, `revalidate: 60`, tagged `agent-brief`. Named exports only; keep under ~200 lines
- [ ] T004 [US1] In `lib/content/brief-cache.ts`, keep the three outcomes of `contracts/content-api.md` distinct: brief, genuinely-empty published content, and retrieval failure. A failed read MUST NOT be cached and MUST be logged
- [ ] T005 [US1] Rewrite `app/api/content/route.ts` to check `X-Agent-Secret` first, then serve from the cached reader. Remove `dynamic = "force-dynamic"`. The response body must be byte-identical to today's so the Retell agent needs no edit
- [ ] T006 [US1] In `app/dashboard/content/actions.ts`, call `revalidateTag` with the `agent-brief` tag after a **successful** publish only, inside the existing error handling
- [ ] T007 [US1] Verify slice A by clicking, per quickstart "Slice A": first answer no slower than later ones, and a published fee change spoken within a minute

### Slice B — asking for details no longer freezes the call (FR-005, FR-006, FR-007, D-003)

- [ ] T008 [US1] In `app/api/send-details/route.ts`, compute and return the agent's `say` sentence immediately, then move the database reads, content render and email send into `after()` from `next/server`. Keep the response shape `{ ok, sent, say }` unchanged
- [ ] T009 [US1] Ensure `say` never claims the email has arrived, only that it is being sent, so a later failure did not make the agent lie (Principle I)
- [ ] T010 [US1] In `lib/email/send-summaries.ts`, record a failure from inside `after()` on the call row's existing `email_error`, and log it — nothing is waiting to observe it. Never log a parent's phone number in plain text
- [ ] T011 [US1] Enforce at most three sends per call in `app/api/send-details/route.ts`, counted from what the call has already recorded rather than from memory, which would reset on a new function instance
- [ ] T012 [P] [US1] Add the bilingual "already sent, here is the office number" sentence to `lib/strings/` alongside the existing agent-facing strings
- [ ] T013 [US1] Verify slice B by clicking, per quickstart "Slice B": no pause mid-call, email still arrives, fourth request offers the office number

### Slice C — one enquiry, not four (FR-008, FR-010, D-004)

- [ ] T014 [US1] In `lib/leads/queries.ts`, compare the incoming fields against what is already stored for that call and skip the write when nothing meaningful changed; return `updated: false` truthfully
- [ ] T015 [US1] In `lib/leads/queries.ts`, merge rather than replace: a request carrying only the child's age must not blank a class recorded earlier
- [ ] T016 [US1] Reduce the serial round trips in the `POST /api/leads` path across `lib/leads/queries.ts` and `lib/calls/queries.ts`, keeping the existing unique-violation retry as the backstop for a genuine race
- [ ] T017 [US1] Confirm the product rules still hold in `app/api/leads/route.ts`: an unconfirmed name stays empty, an incomplete lead still saves, a CNIC or B-Form value arriving is dropped and processing continues (Principles V and VI)
- [ ] T018 [US1] Verify slice C by clicking, per quickstart "Slice C": one lead holding class, age and transfer, with the pre-call form's name and phone intact

**Checkpoint**: User Story 1 complete. The reported fault is fixed and the parent
experience is measurably better, with nothing from US2 or US3 built.

---

## Phase 4: User Story 2 — Staff can see how fast and how costly calls are (Priority: P2)

**Goal**: Store the voice provider's own per-call delay and cost, and show them
on the Health screen — the requirement at `specs/004-admin-dashboard/spec.md:111`
that the screen's own comment has deferred since feature 004.

**Independent Test**: Finish a call, open the Health screen, and see the delay
and cost figures with the number of calls behind them. Buildable with none of
US1 done.

- [ ] T019 [US2] Add `supabase/migrations/<timestamp>_call_latency_cost.sql` adding nullable `reply_delay_ms`, `reply_delay_p90_ms` and `cost_cents` integers to `calls`, each `check (… >= 0)`, per data-model.md
- [ ] T020 [P] [US2] Extend the get-call parsing in `lib/calls/schema.ts` to read `latency.e2e.p50`, `latency.e2e.p90` and `call_cost.combined_cost`, all optional — Retell omits them for very short calls
- [ ] T021 [US2] Carry the three values through the mapper in `lib/calls/retell-api.ts` without storing the per-turn `values` array
- [ ] T022 [US2] Persist them in `lib/calls/queries.ts` when the final webhook event is handled, idempotently so a repeated delivery writes the same values (FR-009)
- [ ] T023 [P] [US2] Create `lib/dashboard/call-metrics.ts` returning the derived period figures in data-model.md: `measuredCalls`, `totalCalls`, `averageReplyDelayMs`, `worstReplyDelayMs`, `totalCostCents`, `averageCostCents`, `overTarget`. Every field nullable so the empty state is a real state, not a zero
- [ ] T024 [P] [US2] Add the bilingual labels, empty state and error state strings for both figures to `lib/strings/dashboard-screens.ts`
- [ ] T025 [US2] Show the two figures on `app/dashboard/health/page.tsx` using the existing `StatTile`, with the call count beside them, and replace the comment that defers this work
- [ ] T026 [US2] Mark an average above 1,500ms as outside target in words, not colour alone (FR-014, Principle IX)
- [ ] T027 [US2] Verify empty and error states and 360px width, per quickstart "Slice D"

**Checkpoint**: Speed and cost are visible. Land this before any Retell voice
tuning, so the voice change can be judged against a baseline rather than a memory.

---

## Phase 5: User Story 3 — Adding school content does not silently slow or cost more (Priority: P3)

**Goal**: Bound the per-turn content that started the $0.06/min token surcharge,
and tell staff before they cross it instead of after.

**Independent Test**: Add content until the budget is exceeded; the indicator
fills, the warning appears before publishing, and the agent still answers
correctly from what fits.

- [ ] T028 [US3] Extract a brief-size measurement from `lib/content/agent-brief.ts` that reports the rendered size against `KNOWLEDGE_BUDGET`, without changing the brief's output. Split it into its own module rather than growing the file past ~200 lines (Principle VIII)
- [ ] T029 [P] [US3] Add the bilingual budget-indicator and over-budget warning strings to `lib/strings/`
- [ ] T030 [US3] Show how full the budget is in `components/content/content-editor.tsx`, visible while editing
- [ ] T031 [US3] Warn in `components/content/publish-dialog.tsx` before publishing content that crosses the budget, stating plainly that calls past that point become slower and more expensive (FR-018)
- [ ] T032 [US3] When content overflows, record what was left out via `upsertUnansweredQuestion` in `lib/unanswered/queries.ts`, so the omission is visible to staff and nothing is dropped without a trace (FR-019, Principle I)
- [ ] T033 [US3] Verify by clicking, per quickstart "Slice E": the indicator fills, the warning appears, and the agent still answers from the retained content

**Checkpoint**: The slow leak is bounded and visible.

---

## Phase 6: Polish & Cross-Cutting

- [ ] T034 Re-measure a five-minute call against SC-001 and SC-004 and record the result beside the baseline, using the same read-only method as the 3 Nov measurement
- [ ] T035 [P] Check every touched file is under ~200 lines and uses named exports (Principle VIII)
- [ ] T036 [P] Confirm no new log line contains a parent's phone number in plain text, and no CNIC or B-Form value is stored anywhere (Principles VI, and the Data safety rules in CLAUDE.md)
- [ ] T037 Run the whole-feature check in quickstart.md: one five-minute call in both languages, then the seven-row pass table
- [ ] T038 `npm run build` and `npx tsc --noEmit` clean; update `docs/retell-agent-prompt.md` only if a tool's behaviour changed in a way the agent's description should mention
- [ ] T039 Write the PHR for the implementation work and mark these tasks complete

---

## Dependencies

```text
Phase 1 (Setup)
   │
   ├─ US1 ── Slice A (T003-T007) ─┐
   │         Slice B (T008-T013) ─┤  independent of each other; ship in any order
   │         Slice C (T014-T018) ─┘
   │
   ├─ US2 (T019-T027)   T019 blocks T022; T020/T023/T024 parallel
   │
   └─ US3 (T028-T033)   T028 blocks T030/T031/T032
                                   │
                            Phase 6 (Polish)
```

The three user stories are independent: US1 touches the call path, US2 the call
record and Health screen, US3 the content editor. Only Phase 6 needs them all.

## Parallel opportunities

- Across stories: US1, US2 and US3 may proceed at once — no shared file.
- Within US1: slices A, B and C touch different routes. T012 is parallel to the
  rest of slice B.
- Within US2: T020, T023 and T024 are parallel once T019 has landed.
- Within US3: T029 is parallel to everything else.

## Implementation strategy

**MVP is User Story 1 — in fact, slice A alone.** Slice A removes about a second
from the first answer of every call and closes the way the demo can fail in front
of the client (the content tool timing out and the agent answering with no school
content). It is four small tasks and one clicking check.

Then slice B, which removes the most noticeable pause in a conversation, then
slice C. Then US2, which should land before any Retell voice tuning so the voice
change has a baseline to be judged against. US3 last: it is a leak, not a fault.

Each slice builds, deploys and is checkable on its own. Nothing here requires the
Retell agent to be edited — it is frozen once published, and changing it means a
version bump (see `docs/retell-agent-prompt.md`).
