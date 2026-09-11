---
description: "Task list for feature 005-voice-landing-page"
---

# Tasks: Parent-Facing Voice Landing Page

**Input**: Design documents from `/specs/005-voice-landing-page/`
**Prerequisites**: `plan.md` ✓, `spec.md` ✓, `research.md` ✓, `data-model.md` ✓, `contracts/leads-api.md` ✓, `contracts/web-call-api.md` ✓, `quickstart.md` ✓

**Tests**: No automated tests. The specification requests none; verification is
by clicking, `curl`, and turning JavaScript off, following `quickstart.md`
(research D-008, consistent with features 002 and 003).

**Approvals confirmed (2026-09-11)**: `retell-client-js-sdk` dependency; the two
usage-tracking tables outside `.claude/rules/database.md`'s documented list;
shipping with a placeholder logo. SDK over the drop-in widget, and the text chat
as a content lookup rather than a second AI, were both confirmed earlier.

**Prerequisite met**: Feature 003 (content system) is implemented, merged into
`main`, and merged into this branch. `app/api/content/route.ts`,
`lib/content/queries.ts`, `lib/content/simulate.ts`, and
`components/office-phone.tsx` all exist and run.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel — different files, no dependency on unfinished work
- **[Story]**: which user story the task serves (US1–US5)

---

## Phase 1: Setup

- [ ] T001 Install `retell-client-js-sdk` with `npm install`, confirm it appears in `package.json` (approved dependency)
- [ ] T002 Add `RETELL_API_KEY`, `VOICE_MAX_CALL_SECONDS`, `VOICE_MAX_CALLS_PER_VISITOR_PER_DAY`, `VOICE_MONTHLY_CAP_MINUTES` to `.env.example` with empty/example values; set working dev values in `.env.local`. Confirm `RETELL_API_KEY` never gets a `NEXT_PUBLIC_` prefix.
- [ ] T003 [P] Add a placeholder school logo at `public/school-logo.svg` — plain, obviously a placeholder, not resembling any real school's branding

**Checkpoint**: dependency installed, env vars exist, a logo file exists to reference.

---

## Phase 2: Foundational (blocking prerequisites)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 Write the migration file `supabase/migrations/<timestamp>_leads_and_voice_usage.sql` per `data-model.md`: `leads` (id, created_at, updated_at, status with CHECK + default 'new', and the nullable enquiry columns); `voice_usage_daily` (visitor_id, usage_date, call_count, updated_at; primary key (visitor_id, usage_date)); `voice_usage_monthly` (usage_month text primary key, reserved_minutes, updated_at); reuse the existing `set_updated_at()` trigger function for all three; enable RLS on all three — `leads` gets `authenticated` SELECT + UPDATE (no INSERT/DELETE) per the RLS matrix, the two usage tables get no `anon`/`authenticated` access at all (service-role only).
- [ ] T005 Walk the maintainer through T004 in plain English — what three tables are created, that no existing data is touched, that the two usage tables hold no personal data. **Wait for explicit approval** (`.claude/rules/database.md`) even though the tables themselves were pre-approved in the plan.
- [ ] T006 Apply the approved migration to Supabase, then confirm: `leads` exists and is empty; `voice_usage_daily` and `voice_usage_monthly` exist and are empty; RLS is on for all three; run the Supabase security advisor and resolve anything the migration introduces.
- [ ] T007 [P] Create `lib/leads/schema.ts`: the `zod` schema for an incoming enquiry per `contracts/leads-api.md` — every field optional, no CNIC/B-Form/payment field, `parentNameConfirmed`/`studentNameConfirmed`/`phoneConfirmed` booleans alongside the values they gate.
- [ ] T008 [P] Create `lib/leads/queries.ts`: `insertLead(enquiry)` — maps the validated input to the `leads` row, blanking `parent_name`/`student_name`/`phone` when their `*Confirmed` flag is not `true`, sets `status: 'new'` in code, inserts via `lib/supabase/admin.ts`, returns the new id.
- [ ] T009 [P] Create `lib/voice/limits.ts`: `getOrSetVisitorId(request, response)` (reads the `visitor_id` cookie, generates and sets one if absent); `checkAndReserve()` — in one pass, reads `voice_usage_daily` for `(visitor_id, today)` and `voice_usage_monthly` for the current month, returns `{ allowed: false }` if either is at its configured limit, otherwise increments both (daily `call_count += 1`, monthly `reserved_minutes += VOICE_MAX_CALL_SECONDS / 60`) and returns `{ allowed: true }`. Uses `lib/supabase/admin.ts` (service role — RLS blocks everyone else per T004).
- [ ] T010 [P] Create `lib/strings/landing.ts`: every bilingual sentence the page shows a parent — headline, the "Talk to Admission Office" button, the mic explanation, the recording notice, the privacy line, the staff-decide-final line, the three how-it-works steps, the connecting/listening/speaking labels, the text-chat labels and its "from published information" note, the "no content published," "assistant unavailable," and "today's limit reached" fallback messages, the call-time-up message.

**Checkpoint**: the database is ready, the leads path and the limits logic exist, every string is defined once.

---

## Phase 3: User Story 2 — A parent who cannot or will not talk still gets answers (Priority: P1)

**Goal**: The school name, logo, headline, notices, how-it-works strip, written
FAQ, and office phone number all render as real HTML, independent of JavaScript,
Retell, or the talk button's state.

**Independent Test**: Disable JavaScript, open `/`, confirm the FAQ and the phone
number are readable. With JavaScript on and nothing published, confirm the
button is disabled with an explanation and the FAQ shows its own "not yet"
state.

- [ ] T011 [US2] Rewrite `app/page.tsx` as a server component: read the live content with `readLiveForApi()` (feature 003); render the school name, the placeholder logo, the bilingual headline, the recording notice, the privacy line, the staff-decide-final line, the how-it-works strip, the written FAQ (from the live document, both languages, skipping archived items — already excluded by `forPublicApi`), and `<OfficePhone />`. A failed or empty content read still renders everything except a working talk button, plus a plain "answers are temporarily unavailable" / "nothing published yet" line (FR-021, FR-041). 360px-first (FR-038).
- [ ] T012 [US2] Verify quickstart Parts 1 and 2: the page with JavaScript disabled still shows the FAQ and the phone number; with nothing published, the button area explains why instead of pretending to work.

**Checkpoint**: the page is a real, readable page on its own, before any Retell code exists.

---

## Phase 4: User Story 2 (continued) — The text chat (Priority: P1)

**Goal**: A parent who refuses the microphone can still get an answer to a
published question, and escalation topics still route to the office.

**Independent Test**: Type a published question into the text chat and get the
matching answer; type a discount question and get routed to the office; confirm
nothing is stored or sent anywhere.

- [ ] T013 [P] [US2] Create `components/voice/text-chat.tsx`: `"use client"`, receives the live `ContentDoc` as a prop, a question box and a submit, calls `simulate()` (feature 003, `lib/content/simulate.ts`) on submit, renders the answer, the hand-off wording on an escalation match, or a "couldn't find an answer" message — always with a "from our published information" note (FR-016–FR-018). No network call of its own; runs entirely client-side.
- [ ] T014 [US2] Wire `TextChat` into `app/page.tsx`, passing the same live document the FAQ renders from, positioned near the talk area and reachable after a refused microphone (depends on T011, T013).
- [ ] T015 [US2] Verify quickstart Part 1b: a published question is answered correctly; a discount question routes to the office; an unrelated question gets the "couldn't find" message; nothing appears in `leads` or in the network tab afterward.

**Checkpoint**: a parent who never grants the microphone still has a working path to an answer.

---

## Phase 5: User Story 1 — A parent asks a question out loud and gets an answer (Priority: P1) 🎯 MVP voice path

**Goal**: Tapping the button explains the microphone, connects to Retell, shows
distinct connecting/listening/speaking states with a live transcript, and can be
ended with one tap at any time. This phase's token route does **not** yet enforce
the usage limits — that is Phase 7, so each phase stays small and testable.

**Independent Test**: With content published and Retell configured, tap the
button, allow the microphone, ask a published question, hear the right answer,
end the call.

- [ ] T016 [P] [US1] Create `components/voice/mic-explainer.tsx`: the plain-language explanation of why the microphone is needed, shown before `startCall` — a step in the flow, not a passive notice, so it renders and is dismissed/confirmed strictly before the SDK requests the microphone (FR-013).
- [ ] T017 [US1] Create `app/api/retell/web-call/route.ts` (minimal, pre-limits version): `POST`; `readLiveForApi()` — empty → `{ reason: "no-content" }`; missing `RETELL_API_KEY` or `NEXT_PUBLIC_RETELL_AGENT_ID` → `{ reason: "not-configured" }`; otherwise call Retell's create-web-call API and return `{ accessToken, agentId }`, or `{ reason: "retell-error" }` on failure. `export const dynamic = "force-dynamic"`. `405` on non-POST. curl examples in a header comment (depends on T009 for the file location convention, not yet calling it).
- [ ] T018 [US1] Create `components/voice/talk-panel.tsx`: `"use client"`. On tap: show `MicExplainer`; on confirm, `POST /api/retell/web-call`; on a `reason` response, show the matching fallback message (no-content / not-configured / retell-error) pointing at the text chat and the phone number; on success, start the SDK call with the returned token, map its connection/talking events to connecting/listening/speaking, render a live transcript (`dir="auto"` per line), and show an End Call button for the whole duration that calls the SDK's end method on the first tap and returns the panel to its start state (FR-007–FR-009, FR-039 Android Chrome/iPhone Safari event handling).
- [ ] T019 [US1] Wire `TalkPanel` into `app/page.tsx` as the client island inside the server page (depends on T011, T018).
- [ ] T020 [US1] Verify quickstart Part 5 (needs `RETELL_API_KEY` and a configured agent): the mic explanation appears before the browser prompt; connecting → listening → speaking are visually distinct; a published question gets the right answer in the language asked; "are you a person" gets an AI disclosure; a discount question routes to the office; End Call stops it on the first tap; tapping Talk again during a call does nothing.

**Checkpoint**: the full voice path works end to end (pending Retell setup), independent of the usage limits.

---

## Phase 6: User Story 3 — The school receives the enquiry (Priority: P2)

**Goal**: `POST /api/leads` stores whatever Retell hands over at the end of a
call, exactly as `contracts/leads-api.md` specifies.

**Independent Test**: `curl` the endpoint with a full body, a partial body, an
unconfirmed phone, and a CNIC field; check `leads` after each.

- [ ] T021 [US3] Create `app/api/leads/route.ts`: `POST` only; `X-Agent-Secret` vs `RETELL_WEBHOOK_SECRET` checked first (401 on miss, nothing else runs); parse the body with `lib/leads/schema.ts` (400 with a plain message on failure); call `insertLead()` (`lib/leads/queries.ts`); `200 { ok: true, id }` on success; `405` on non-POST; on an unexpected error log only route + message + timestamp and return `500 { error: "internal error" }` — never the DB error, never a name or phone (FR-022–FR-029). curl examples in a header comment.
- [ ] T022 [US3] Verify quickstart Part 4: no secret → 401; a full enquiry with `phoneConfirmed: false` → stored with `phone` NULL; an empty body → stored with just id/timestamps/status; a `cnic` field → ignored, rest stored; each call adds a new row, none overwritten.

**Checkpoint**: an enquiry from a real conversation has somewhere real to land.

---

## Phase 7: User Story 5 — The school's voice bill cannot run away (Priority: P2)

**Goal**: The three usage limits actually hold: a call ends itself at its
configured length; a visitor is refused after their daily count; the school is
refused after the monthly reservation is exhausted; every refusal still offers
the phone number, text chat, and FAQ.

**Independent Test**: quickstart Part 4b with deliberately low limits.

- [ ] T023 [US5] In `app/api/retell/web-call/route.ts`, after the content and configuration checks and before calling Retell, call `getOrSetVisitorId` and `checkAndReserve` (`lib/voice/limits.ts`, T009); on `{ allowed: false }` return `{ reason: "capped" }` without contacting Retell; set the `visitor_id` cookie on the response in every case, including refusals (depends on T009, T017).
- [ ] T024 [US5] In `components/voice/talk-panel.tsx`, handle the `capped` reason with its own bilingual message (today's limit reached — call the office), and start a client-side timer at call start that ends the call automatically at `VOICE_MAX_CALL_SECONDS` and shows the "call time is up" message (FR-030 — a UX pacing control, not the security boundary; that is the server-side monthly reservation) (depends on T018).
- [ ] T025 [US5] Verify quickstart Part 4b with low limits: a call ends itself at the configured length; the third call in a day is refused with the phone number, text chat, and FAQ all still offered; `curl`ing the token route after the daily cap returns `{ "reason": "capped" }`; with a very low monthly cap, a second call (from a different visitor cookie) is refused once the reservation would exceed it. Restore realistic limit values afterward.

**Checkpoint**: all five user stories work; the page cannot be turned into an open-ended bill.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T026 Confirm no parent name, child name, or phone number is written to any log line in this feature — read `app/api/leads/route.ts` and `app/api/retell/web-call/route.ts` (FR-029).
- [ ] T027 Confirm the `leads` schema and table have no CNIC, B-Form, or payment field, and that one arriving in a request is silently dropped rather than stored (FR-028).
- [ ] T028 Check every file added in this feature is under ~200 lines; split any that is not (Constitution VIII).
- [ ] T029 Walk `quickstart.md` Part 7 on a real Android phone (Chrome) and a real iPhone (Safari) if available, otherwise device mode at 360px: no sideways scroll, logo/button/notices/phone number all visible without scrolling, the mic prompt only appears after a tap on iOS.
- [ ] T030 Walk quickstart Part 7's throttled "Slow 3G" check: the school name, logo, headline, button, and notices render without waiting on Retell or the content/limits check (FR-040).
- [ ] T031 Walk the full `quickstart.md` on the deployed Vercel preview for this branch, with `RETELL_API_KEY`, `NEXT_PUBLIC_RETELL_AGENT_ID`, and the three limit env vars all set there.
- [ ] T032 Run `npm run build` and `npx tsc --noEmit`; both clean before this feature is called done.
- [ ] T033 Restate to the maintainer: the office phone number and the school logo are both placeholders. Neither may reach a real parent until replaced with the school's actual number and logo.

---

## Requirement coverage

| Requirement | Tasks |
|---|---|
| FR-001 no login | inherited — page has no auth code at all |
| FR-002 name/logo/headline | T003, T011 |
| FR-003 button biggest, above fold | T011, T018 |
| FR-004 phone visible every state | T011 (reused `OfficePhone`) |
| FR-005 staff-decide line | T010, T011 |
| FR-006 how-it-works strip | T010, T011 |
| FR-007 voice conversation | T017, T018, T019 |
| FR-008 connecting/listening/speaking | T018 |
| FR-009 End Call visible + works | T018 |
| FR-010 answer only from published content; refuse when none | T017 |
| FR-011 AI disclosure | Retell agent config (outside this repo); page names it an AI |
| FR-012 escalation -> office (voice) | Retell agent config; T013/simulate.ts for text |
| FR-013 mic explained before prompt | T016, T018 |
| FR-014 recording/privacy notices | T010, T011 |
| FR-015 refusal -> text chat/FAQ/phone | T014, T018 |
| FR-016–018 text chat | T013, T014, T015 |
| FR-019–021 written FAQ | T011, T012 |
| FR-022–027 leads capture | T007, T008, T021, T022 |
| FR-028 no CNIC/B-Form | T007, T027 |
| FR-029 no PII logged | T021, T026 |
| FR-030 per-call length cap | T024 |
| FR-031 per-visitor daily cap | T009, T023 |
| FR-032 monthly cap | T009, T023 |
| FR-033 refusals keep fallbacks | T018, T023, T024 |
| FR-034 limits are env settings | T002, T009 |
| FR-035–037 bilingual, RTL, single-stored values | T010, T011, throughout |
| FR-038 360px | T011, T029 |
| FR-039 Android Chrome + iPhone Safari | T029 |
| FR-040 first paint independent of Retell | T011, T030 |
| FR-041 loading/error states | T011, T017, T018 |
| SC-001..SC-013 | covered by the verification tasks in each phase (T012, T015, T020, T022, T025, T029–T031) |

---

## Dependencies & Execution Order

- **Setup (Phase 1)** — independent
- **Foundational (Phase 2)** — needs Setup. **T005/T006 (migration approval and apply) block Phases 6 and 7**; T007–T010 can run in parallel once T001–T002 land.
- **US2 written page (Phase 3)** — needs T010, T011's own content read. No Retell needed — buildable and testable first.
- **US2 text chat (Phase 4)** — needs Phase 3 (T011) and T013.
- **US1 voice (Phase 5)** — needs Phase 2 (T009's file exists but Phase 5 does not call it yet) and Phase 3 (T011). Needs `RETELL_API_KEY` and an agent to verify live, but T016–T019 build and type-check without them.
- **US3 leads (Phase 6)** — needs T006, T007, T008. Independent of Phases 3–5.
- **US5 limits (Phase 7)** — needs Phase 5 (T017, T018 exist) and T009. Deliberately layered on top of the working voice path rather than built into it from the start.
- **Polish (Phase 8)** — needs every phase you intend to ship.

### Parallel opportunities

- T007, T008, T009, T010 (Foundational) — four different files
- T013 alongside T016–T017 (different files, both depend only on Phase 2/3)

## Implementation Strategy

**Smallest demonstrable slice**: Phase 1 + Phase 2 + Phase 3. A real, bilingual,
JavaScript-independent page with the school's content on it — before any Retell
code exists.

**Then**: Phase 4 (text chat) makes it interactive without needing Retell at all.
Phase 5 makes the actual voice conversation work. Phase 6 (leads) can happen any
time after Phase 2 — it does not depend on Phase 5. Phase 7 (limits) is
deliberately last among the functional phases: it wraps the already-working
voice path rather than complicating its first version.

## Task Summary

| Phase | Tasks | Count |
|---|---|---|
| Setup | T001–T003 | 3 |
| Foundational | T004–T010 | 7 |
| US2 — written page (P1) | T011–T012 | 2 |
| US2 — text chat (P1) | T013–T015 | 3 |
| US1 — voice conversation (P1) | T016–T020 | 5 |
| US3 — leads (P2) | T021–T022 | 2 |
| US5 — usage limits (P2) | T023–T025 | 3 |
| Polish | T026–T033 | 8 |
| **Total** | | **33** |
