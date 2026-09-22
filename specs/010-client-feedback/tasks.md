# Tasks: Client Feedback Round

**Input**: Design documents from `/specs/010-client-feedback/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: There are no automated test tasks. The project has no test runner, and the spec does not ask for one. Each phase ends with type check, lint, build, curl checks from `contracts/api.md`, and the click path in `quickstart.md`.

**Format**: `[ID] [P?] [Story] Description`. `[P]` means the task can run in parallel, because it touches different files and has no unfinished dependency.

---

## Phase 1: Setup

- [x] T001 Add `RETELL_API_KEY`, `RETELL_STAFF_PUBLIC_KEY`, `RESEND_API_KEY`, `EMAIL_FROM` and `SCHOOL_NOTIFY_EMAIL` (empty) to `.env.example`, each with a one-line comment on where it comes from
- [x] T002 Update `.claude/rules/api.md`, section "Saving leads":
  - replace "Never overwrite an existing lead. Each call creates a new row." with: one lead per call; a later save in the **same** call updates it; never replace a stored value with an empty one, or a confirmed name or phone with an unconfirmed one;
  - add a note that `/api/leads/email` and `/api/retell/web-call` are browser-called and are protected by the visitor cookie instead of the agent secret;
  - add a note that `/api/retell/webhook` takes the secret in the query string.

---

## Phase 2: Foundational (blocks US1, US2, US4, US5)

- [x] T003 Write migration `supabase/migrations/20260921100000_calls_and_lead_fields.sql` per data-model.md Migration 1:
  - the `calls` table, its check constraints, indexes, the `updated_at` trigger (reuse the `leads` trigger function), RLS on with a select policy for `authenticated`;
  - on `leads`: `email` (with a shape check), `summary`, `call_duration_seconds`;
  - de-duplicate `retell_call_id`, then add a partial unique index where it is not null.

  Apply it with the Supabase MCP `apply_migration`, and verify with `list_tables`.
- [x] T004 [P] Create `lib/calls/mask.ts`:
  - `maskIdNumbers(text)` replaces `\d{5}-?\d{7}-?\d` with asterisks of the same length;
  - `maskTranscript(turns)` applies it to every `content`.
- [x] T005 [P] Create `lib/calls/retell-api.ts`:
  - `getRetellCall(callId)` does a `fetch` to `https://api.retellai.com/v2/get-call/{id}` with `Authorization: Bearer ${process.env.RETELL_API_KEY}` and an 8 s timeout (`AbortSignal.timeout`);
  - it returns a Zod-parsed subset: `call_id`, `agent_id`, `call_status`, `start_timestamp`, `end_timestamp`, `duration_ms`, `transcript_object` (role and content only), `call_analysis.call_summary`;
  - a 404 returns `null`; any other failure throws.
- [x] T006 [P] Create `lib/calls/schema.ts` with Zod schemas:
  - the webhook body `{ event, call: { call_id } }`;
  - the email box body `{ callId, email }`.
- [x] T007 Create `lib/calls/queries.ts` (service-role client for writes, user session for reads):
  - `upsertCallFromRetell(retellCall, event)`: the state rules from data-model.md, and it masks before writing;
  - `linkLeadToCall(callId, leadId)`: copies `parent_email`, `summary` and `duration` to the lead;
  - `copyCallSummaryToLead(callId)`.

**Checkpoint**: the migration is applied; `npx tsc --noEmit` passes.

---

## Phase 3: User Story 1 — Every call leaves a complete record (P1) 🎯 MVP

**Goal**: one lead per call, saved early and updated later, carrying email, summary, call length and the full conversation, with a details page.
**Independent test**: quickstart.md, stage 2, steps 1–4.

- [x] T008 [US1] Update `lib/leads/schema.ts`: add `parseAgentBody(body)`, which returns `{ enquiry, callId }` from either the flat shape or the `{ name, call, args }` shape (contracts/api.md §1).
- [x] T009 [US1] Update `lib/leads/queries.ts`: add `upsertLeadForCall(enquiry, callId)`.
  - insert when the call id is new, otherwise update;
  - the merge rules: never an empty value over a stored one, never unconfirmed over confirmed;
  - `status` is untouched;
  - it returns `{ id, updated }` and then calls `linkLeadToCall`.
  - `insertLead` stays for enquiries with no call id.
- [x] T010 [US1] Update `app/api/leads/route.ts` to use `parseAgentBody` and `upsertLeadForCall`. Update the curl examples in its header comment to show both shapes.
- [x] T011 [US1] Create `app/api/retell/webhook/route.ts` per contracts/api.md §2:
  - check the query secret (reuse the comparison in `lib/api/secret.ts`, adding a `hasValidQuerySecret` helper there);
  - ignore unknown events;
  - `getRetellCall`, then check the agent id against `NEXT_PUBLIC_RETELL_AGENT_ID`;
  - `upsertCallFromRetell`; on `call_analyzed`, `copyCallSummaryToLead`;
  - status codes 200 / 401 / 502 / 500;
  - logs carry the event, the call id and the outcome only.
- [x] T012 [US1] Create `app/api/leads/email/route.ts` per contracts/api.md §3:
  - read the visitor cookie with the existing helper in `lib/voice/`;
  - create or claim the call row, 403 on a different visitor;
  - save `calls.parent_email` and the linked `leads.email`.
- [x] T013 [US1] Update `components/landing/call/call-provider.tsx`: keep `session.callId` in state and expose `callId` in the context value.
- [x] T014 [P] [US1] Add strings to `lib/strings/landing-call.ts`: `emailLabel`, `emailPlaceholder`, `emailSend`, `emailSaved`, `emailInvalid`, `emailFailed`, in EN and UR.
- [x] T015 [US1] Create `components/landing/call/email-box.tsx`:
  - an optional email input and a Send button, 44 px touch targets, `type="email"`, `dir="ltr"`;
  - posts to `/api/leads/email`;
  - shows the saved, invalid and failed states bilingually.

  Render it in `components/landing/call/call-overlay.tsx` during a live call, and once more on the ended screen, below the transcript and above the office line. Style it in `components/landing/call/call.module.css`, and check the office phone stays visible at 360 px.
- [x] T016 [US1] Update `lib/leads/rows.ts` (`LEAD_COLUMNS` and `LeadRow`) to include `email`, `summary` and `call_duration_seconds`. Add `getLeadWithCall(id)` in `lib/leads/queries.ts`: the lead, plus its call's transcript and summary, through the staff session.
- [x] T017 [P] [US1] Create `components/leads/conversation.tsx`:
  - transcript bubbles, one `<p dir="auto">` per turn, labelled Parent or Assistant in the dashboard language;
  - the empty states "still being processed" (a call exists but has no transcript) and "No conversation saved for this lead" (no call).
- [x] T018 [P] [US1] Create `components/leads/lead-summary.tsx`: a summary card for the top of the details page, with an empty state.
- [x] T019 [US1] Create `app/dashboard/leads/[id]/page.tsx`:
  - summary on top, then the details grid (reuse the field layout from `components/dashboard/lead-drawer.tsx`) with the status control (reuse `app/dashboard/leads/actions.ts`), then the conversation;
  - `notFound()` for an unknown id, an error state on a read failure, and a back link.
- [x] T020 [US1] Update `components/leads/leads-table.tsx`:
  - columns Name, Contact, Email, Summary (first line, CSS clamp, no fixed character cut), Status, Date;
  - a row opens `/dashboard/leads/[id]` instead of the drawer;
  - keep the empty and error states.

  Delete `components/dashboard/lead-drawer.tsx` once nothing imports it.
- [x] T021 [P] [US1] Add the new dashboard strings (column names, details-page headings, conversation labels, empty states) to `lib/strings/dashboard-screens.ts` in EN and UR. Split into a new `lib/strings/lead-details.ts` if the file passes about 200 lines.
- [x] T022 [US1] Update `docs/retell-agent-prompt.md` to **prompt v5**:
  - step 3 calls `save_lead` straight after the phone is confirmed, and step 12 calls it again with everything;
  - add the email-box sentence;
  - the tools section: args-only **OFF** for `save_lead`, plus the webhook URL and events.

**Checkpoint**:
- tsc, lint and build pass;
- curl: the webhook without the secret gives 401; a fake call id gives 200 ignored; the email route with a bad email gives 400;
- after deploy and the maintainer's Retell changes, one test call passes quickstart stage 2, steps 1–4.

---

## Phase 4: User Story 2 — Overview Today / This week (P1)

**Goal**: an analytics strip and the last 10 leads on the Overview.
**Independent test**: quickstart.md, stage 2, step 5.

- [x] T023 [P] [US2] Create `lib/dashboard/pk-time.ts`: `startOfTodayPk()` and `startOfWeekPk()` (6 days before today's 00:00 at UTC+5), returned as UTC `Date`s.
- [x] T024 [US2] Update `lib/dashboard/overview.ts`: `getPeriodStats()` returns, for today and the week, calls (from `calls.started_at`), leads, average `duration_seconds` of ended calls, and new unanswered questions (`created_at`); and `getRecentLeads(10)`.
- [x] T025 [P] [US2] Create `components/dashboard/stats-strip.tsx`: two columns, Today and This week, with 4 figures each. Average length is shown as m:ss, or "—" when there is none. It fits 360 px.
- [x] T026 [US2] Update `app/dashboard/page.tsx`: the stats strip at the top; the recent-leads table limited to 10, each row linking to the details page, plus a "See all leads" link; keep the existing chart and gaps panels below. Add the strings to `lib/strings/dashboard.ts`.

**Checkpoint**: the Overview figures match a manual count; the empty database shows zeros and the empty state.

---

## Phase 5: User Story 3 — Knowledge (P2)

**Goal**: the Gap list becomes Knowledge, with a page per entry and PDF and website import into the draft.
**Independent test**: quickstart.md, stage 3.

- [x] T027 [US3] Write and apply migration `supabase/migrations/20260921110000_unanswered_answered_at.sql`, adding `answered_at timestamptz null`. Update `lib/unanswered/schema.ts` and `lib/unanswered/queries.ts` to read it, plus `getQuestion(id)` and `markAnswered(id)`.
- [x] T028 [US3] Update `lib/content/schema.ts`: add `knowledgeDoc`, and `knowledge` in `contentDoc` (default `[]`), `emptyDoc`, `parseDoc`, `isEmptyDoc` and `forPublicApi` (active only).
- [x] T029 [US3] `npm install unpdf`, then create `lib/knowledge/pdf.ts`: `pdfToText(buffer)`, which refuses more than 10 MB and returns the trimmed text or `null`.
- [x] T030 [P] [US3] Create `lib/knowledge/html-text.ts`: `htmlToText(html)` drops script, style, nav, footer and header, strips tags, decodes common entities and collapses whitespace; and `extractLinks(html, baseUrl)`.
- [x] T031 [US3] Create `lib/knowledge/crawl.ts`: `crawlSite(url)`.
  - http(s) only, and refuses localhost and private or link-local addresses;
  - breadth-first on the same host, at most 10 pages, each with an 8 s timeout, a 2 MB cap, and `text/html` only;
  - returns `[{ url, title, text }]`, and skips failing pages.
- [x] T032 [US3] Create `app/dashboard/knowledge/actions.ts` with `answerQuestion`, `importPdf`, `importWebsite`, `saveKnowledge` and `archiveKnowledge` (contracts/api.md §4). Each checks the staff session, writes the **draft** doc only, and revalidates `/dashboard/knowledge`. If needed, set `experimental.serverActions.bodySizeLimit` / `serverActions.bodySizeLimit` in `next.config.ts` to `11mb`, after checking the Next 16 docs in `node_modules/next/dist/docs`.
- [x] T033 [P] [US3] Create `lib/strings/knowledge.ts` with every Knowledge screen string in EN and UR: titles, tabs, import forms, errors, empty states.
- [x] T034 [US3] Create `app/dashboard/knowledge/page.tsx`:
  - two sections: "Asked by parents" (unanswered first, with an "Answered" filter) and "Documents";
  - "Add from PDF" and "Add from website" forms (`components/knowledge/import-forms.tsx`);
  - every row links to its own page;
  - empty and error states.
- [x] T035 [US3] Create `app/dashboard/knowledge/[id]/page.tsx`:
  - a question id shows the question and times asked, plus `components/knowledge/answer-form.tsx` (EN and UR question and answer), which calls `answerQuestion`;
  - a knowledge id shows `components/knowledge/document-editor.tsx` (title EN and UR, text, source, Save, Remove, and a "draft — publish to use" note);
  - otherwise `notFound()`.
- [x] T036 [US3] Replace `app/dashboard/unanswered/page.tsx` with a `redirect("/dashboard/knowledge")`. Rename the nav item in `components/dashboard/sidebar.tsx` and the `navGaps` and `seeAllGaps` strings in `lib/strings/dashboard.ts` to Knowledge / معلومات. Update the Overview's gaps panel link.
- [x] T037 [US3] Update `lib/content/simulate-sources.ts` to add knowledge text as prose candidates, reusing `prose()` with the title as keywords.

**Checkpoint**: build passes; quickstart stage 3 click path; `/api/content` with the secret includes `knowledge` only after Publish.

---

## Phase 6: User Story 4 — Live calls: watch, listen, take over (P3)

**Goal**: a live count, and monitor and takeover from the dashboard.
**Independent test**: quickstart.md, stage 4.

- [ ] T038 [US4] **Spike (10 min)**, once the maintainer has created the staff public key: on a scratch page not committed, `new RetellClient({ key }).monitorCall({ call_id })` on a real live call; confirm the transcript streams, and `listen()` and `takeOver()` work. Record the result in research.md R-004. If refused, drop T041's listen and takeover buttons and keep watch plus call.
- [ ] T039 [US4] Add `listLiveCalls()` and `countLiveCalls()` to `lib/calls/queries.ts`: `ongoing`, started less than 15 minutes ago, joined to the lead for the confirmed name and phone.
- [ ] T040 [P] [US4] Create `components/live/auto-refresh.tsx`: a client component that calls `router.refresh()` every 10 s while the tab is visible.
- [ ] T041 [US4] Create `components/live/monitor-panel.tsx` (a client component):
  - receives `callId` and `staffKey` as props;
  - buttons Watch, Listen and Take over, the last behind a confirm dialog with the "cannot be undone" wording and in-page, never `window.confirm`;
  - live transcript bubbles with `dir="auto"`;
  - status text; disconnects when unmounted.
- [ ] T042 [US4] Create `app/dashboard/live/page.tsx`:
  - staff only; reads `RETELL_STAFF_PUBLIC_KEY` on the server and passes it to the panel only;
  - lists live calls with duration, language, name and phone;
  - a "Call parent now" `tel:` link plus the `markContacted` action (add it to `app/dashboard/leads/actions.ts`);
  - the time-limit note;
  - the empty state "No one is talking to the assistant right now";
  - if the key isn't set, a "not configured" note.
- [ ] T043 [US4] Update `components/dashboard/sidebar.tsx`: a "Live calls" nav item with a count badge (from `countLiveCalls()` in the dashboard layout), text plus colour, refreshed by `auto-refresh.tsx` on the dashboard layout. Add the strings to `lib/strings/live-calls.ts` in EN and UR.

**Checkpoint**: quickstart stage 4.

---

## Phase 7: User Story 5 — Summary emails (P3)

**Goal**: one email to the school, and one to the parent if they gave an email, per analysed call.
**Independent test**: quickstart.md, stage 5.

- [ ] T044 [P] [US5] Create `lib/email/resend.ts`: `sendEmail({ to, subject, html, text })` with `fetch` to `https://api.resend.com/emails` and a 8 s timeout. It returns `{ ok }` or `{ error }`; it doesn't throw for API errors. It skips with "not configured" if any setting is missing.
- [ ] T045 [P] [US5] Create `lib/email/templates.ts`:
  - `schoolEnquiryEmail(lead, summary, link)` in English;
  - `parentSummaryEmail(summary, lang)` in both languages, with the Urdu section `dir="rtl"`; it has the office phone and hours from `lib/office.ts` and the content, the "this is not an admission confirmation" line, and no discount wording.

  Both are HTML plus plain text, and escape all interpolated values.
- [ ] T046 [US5] Add `claimEmailSend(callId, "school" | "parent")` to `lib/calls/queries.ts`: a conditional update that sets `*_email_sent_at` where it is null, returning whether this caller won. Add `recordEmailError`.
- [ ] T047 [US5] Update `app/api/retell/webhook/route.ts`: on `call_analyzed`, once the lead is linked, claim and send the school email, then claim and send the parent email if `parent_email` is set. Errors are recorded, and the response is still 200.
- [ ] T048 [US5] Show "Email sent" or the email error on `app/dashboard/leads/[id]/page.tsx`, with the strings in `lib/strings/lead-details.ts`.

**Checkpoint**: quickstart stage 5.

---

## Phase 8: Polish

- [ ] T049 Update the handbook sections and `docs/agent-test-scenarios.md` where the call flow changed. Record the new env vars in `specs/010-client-feedback/quickstart.md`, and confirm it matches what was built.
- [ ] T050 Run `npx tsc --noEmit`, `npm run lint` and `npm run build`. Check every new screen at 360 px in EN and UR. Run the Supabase `get_advisors` security check for the new table.

---

## Dependencies

- Setup → Foundational → US1 → US2. US2 needs `calls` and the lead fields for its figures.
- US3 depends only on Foundational being finished, not on US1. It could run in parallel with US1/US2, but it's scheduled after them per the user's order.
- US4 needs US1: the `calls` rows come from the webhook.
- US5 needs US1: the webhook, the call and lead link, and `parent_email`.

## Parallel examples

- Foundational: T004, T005 and T006 together, then T007.
- US1: T014, T017, T018 and T021 alongside T008–T012.
- US3: T030 and T033 alongside T028–T029.
- US5: T044 and T045 together.

## Implementation strategy

1. **MVP, delivered as stage 2** = Phases 1–4 (US1 and US2). Deploy; the maintainer makes the Retell changes and tests a call.
2. **Stage 3** = Phase 5.
3. **Stage 4** = Phase 6, starting with the T038 spike.
4. **Stage 5** = Phase 7.
5. Phase 8 comes after each stage, for the stage's own screens, and fully at the end.

Each stage is committed on `010-client-feedback`, merged into `main` locally, and pushed to deploy.
