# Implementation Plan: Client Feedback Round

**Branch**: `010-client-feedback` | **Date**: 2026-09-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-client-feedback/spec.md`

## Summary

Every Retell call becomes a `calls` row. Retell's webhook creates it and fills it in, and every event is confirmed by re-fetching the call from Retell's API. The row carries the full conversation and Retell's own summary.

The website then builds on that row:

- **Leads**:
  - They become one per call and can be updated during the call, so the agent saves right after the phone is confirmed.
  - They gain email, summary and call length.
  - Each lead has a details page.
  - The parent's call screen gets an email box tied to the call id the browser already holds.
- **Overview**: gains Today and This week figures and the last 10 leads.
- **Knowledge**: the Gap list becomes Knowledge, with a page per entry. PDF and website imports go into the draft content, and the agent receives them once published.
- **Live calls**: uses the Retell browser library we already have (`monitorCall`, `listen`, `takeOver`), so staff can watch, listen and **really take over** a call. This supersedes the earlier "not possible" (research R-004).
- **Emails**: go through Resend's HTTP API once a call is analysed.

**New package: `unpdf` only**, for stage 3, as approved.

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16.3 (App Router), React 19
**Primary Dependencies**: `@supabase/ssr`, `@supabase/supabase-js`, `zod`, `retell-client-js-sdk` 3.x (existing); `unpdf` (new, stage 3)
**Storage**: Supabase Postgres. There is a new `calls` table, new `leads` columns, `unanswered_questions.answered_at`, and a `knowledge` array in the content jsonb
**Testing**: `npx tsc --noEmit`, `npm run lint`, `npm run build`; curl checks per contract; click-through per quickstart. The project has no automated test runner, and none is added
**Target Platform**: Vercel (Node runtime), a browser on a phone (parents) and a laptop or phone (staff)
**Project Type**: a single Next.js web application
**Performance Goals**: the webhook answers in under 10 s (Retell's timeout); the live count appears within 15 s; the Overview loads in under 2 s
**Constraints**:
- no secrets in `NEXT_PUBLIC_`, except the existing call key;
- no phone, name or email in logs;
- 13-digit IDs masked before storage;
- 360 px width;
- EN and UR
**Scale/Scope**: one school, tens of calls a day; 6 new screens or routes and 3 new API routes

## Constitution Check

*Re-checked after Phase 1 design. All pass. Two API-rule deviations are justified in Complexity Tracking.*

- [x] **I. Honesty**: Knowledge documents reach the agent only through live content, after Publish. Unanswered questions are still recorded, and answering one writes a draft FAQ.
- [x] **II. No Authority**: The parent email template states that it is not an admission confirmation, and contains no discount wording. Taking over puts a *staff member* on the call, which is allowed.
- [x] **III. Disclosure**: No change to the agent's identity. After a takeover, a human is speaking.
- [x] **IV. Bilingual Prose**:
  - The email box, its errors, the parent email, and every new dashboard string exist in EN and UR.
  - Transcripts render with `dir="auto"` per line.
  - Imported knowledge keeps its source language: it is agent reference, not parent-facing screen prose (data-model note).
  - No value is duplicated per language.
- [x] **V. Confirm Before Saving**: Updating a lead never stores an unconfirmed name or phone, and never overwrites a confirmed one with an unconfirmed one. The email is typed by the parent, so it is self-confirmed.
- [x] **VI. No Sensitive Data**: 13-digit ID patterns are masked in the transcript and summary before any insert. Zod still strips unknown fields. Logs carry ids only.
- [x] **VII. Human Exit**: The office phone stays on the call screen. The email box is added below it and doesn't push it off screen at 360 px. Takeover adds a *second* human route.
- [x] **VIII. Simple Over Clever**:
  - There is one new package, agreed in advance.
  - Retell events are confirmed by a plain `fetch` re-read, not a crypto library.
  - Refreshing is `router.refresh()` on a timer, not realtime.
  - Files stay under about 200 lines.
- [x] **IX. Testable By A Non-Developer**: The quickstart gives a click path for each stage. Every new list has loading, empty and error states.
- [x] **X. Small Steps**: 4 independently shippable stages (2, 3, 4, 5), each ending with build, deploy and a click test.
- [x] **Feature sequencing**: Features 001–009 are merged and running on production. Stage 1 of this feature is live.

## Project Structure

### Documentation (this feature)

```text
specs/010-client-feedback/
├── spec.md
├── plan.md              # this file
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/api.md
├── checklists/requirements.md
└── tasks.md             # /sp.tasks
```

### Source Code (repository root)

```text
supabase/migrations/
├── 2026092110xxxx_calls_and_lead_fields.sql          # stage 2 (calls table also serves stage 4 and 5)
└── 2026092111xxxx_unanswered_answered_at.sql         # stage 3

app/api/
├── leads/route.ts                  # CHANGED: both body shapes, upsert by call id
├── leads/email/route.ts            # NEW: email box
└── retell/webhook/route.ts         # NEW: call events

lib/
├── calls/                          # NEW
│   ├── retell-api.ts               # getCall(callId) via RETELL_API_KEY
│   ├── mask.ts                     # 13-digit ID masking
│   ├── queries.ts                  # upsert call, link lead, live list, analytics counts
│   └── schema.ts                   # Zod for webhook body + email box
├── leads/queries.ts                # CHANGED: upsertLeadForCall, getLead(id)
├── leads/schema.ts                 # CHANGED: unwrap {name, call, args}
├── dashboard/overview.ts           # CHANGED: Today/Week figures (PKT), last 10
├── dashboard/pk-time.ts            # NEW: start of today / of 7-day window in UTC+5
├── content/schema.ts               # CHANGED: knowledge[] (+ parseDoc, forPublicApi, isEmptyDoc)
├── content/simulate-sources.ts     # CHANGED: search knowledge text
├── knowledge/                      # NEW (stage 3)
│   ├── pdf.ts                      # unpdf → text
│   ├── crawl.ts                    # same-host crawl, ≤10 pages, private-host guard
│   └── html-text.ts                # strip tags → readable text
├── email/                          # NEW (stage 5)
│   ├── resend.ts                   # send(to, subject, html, text)
│   └── templates.ts                # school + bilingual parent email
└── strings/                        # CHANGED/NEW: dashboard, knowledge, live-calls, call-email

components/
├── landing/call/email-box.tsx      # NEW: optional email field on the call screen
├── landing/call/call-provider.tsx  # CHANGED: expose session.callId
├── leads/leads-table.tsx           # CHANGED: Name, Contact, Email, Summary, Status, Date; row → details
├── leads/lead-summary.tsx          # NEW
├── leads/conversation.tsx          # NEW: transcript bubbles, dir="auto"
├── dashboard/stats-strip.tsx       # NEW: Today | This week
├── dashboard/sidebar.tsx           # CHANGED: Knowledge, Live calls + badge
├── knowledge/*                     # NEW: list, question page form, document editor, import forms
└── live/*                          # NEW: live list, monitor panel (watch/listen/take over), auto-refresh

app/dashboard/
├── page.tsx                        # CHANGED: stats strip + last 10 leads
├── leads/[id]/page.tsx             # NEW: lead details
├── knowledge/page.tsx              # NEW (moves unanswered/page.tsx)
├── knowledge/[id]/page.tsx         # NEW: question or document
├── knowledge/actions.ts            # NEW
├── unanswered/page.tsx             # CHANGED: redirect to /dashboard/knowledge
└── live/page.tsx                   # NEW
```

**Structure Decision**: This is the existing single Next.js app. New server logic lives in `lib/<area>/`, screens in `app/dashboard/<area>/`, and UI pieces in `components/<area>/`, matching features 003–009. The lead drawer (`components/dashboard/lead-drawer.tsx`) is replaced by the details page, and its field layout is reused.

## Delivery stages

| Stage | User stories | Ships | Maintainer does |
|---|---|---|---|
| 2 | US1, US2 | migration 1, webhook, lead upsert, email box, lead details, leads table, Overview strip | adds `RETELL_API_KEY`; sets the Retell webhook URL; turns args-only OFF on `save_lead`; pastes prompt v5 |
| 3 | US3 | migration 2, Knowledge screens, imports (`npm i unpdf`) | nothing |
| 4 | US4 | Live calls screen and badge, watch, listen, take over, call parent | creates the staff public key; adds `RETELL_STAFF_PUBLIC_KEY` |
| 5 | US5 | emails | Resend account; adds 3 settings |

## Risks

1. **Retell webhook shape or timing differs from the documentation.** Mitigation: the route logs the event name and call id only, and the quickstart's stage 2 check exposes any difference on the first call.
2. **Takeover needs Retell permissions we haven't tested.** Mitigation: stage 4 starts with a 10-minute spike: monitor one real call with the staff key before building the screen. If it is refused, the stage falls back to watch plus Call parent now.
3. **Vercel's server action body limit for 10 MB PDFs.** Mitigation: raise `serverActions.bodySizeLimit` in `next.config` to `11mb`. This is checked against `node_modules/next/dist/docs` before use.

## Complexity Tracking

| Deviation | Why needed | Simpler alternative rejected because |
|---|---|---|
| `.claude/rules/api.md` says "Never overwrite an existing lead. Each call creates a new row." Leads are now **updated** by call id. | The testers want name and phone saved first, which means a second save in the same call. Still exactly one row per call; other calls' leads are never touched; confirmed values are never replaced by unconfirmed or empty ones. The rule file is updated to say this. | Save only at the end: a call that drops loses the enquiry, the exact failure the early save prevents. |
| `/api/leads/email` has no agent secret, because it is called by the parent's browser. `/api/retell/webhook` uses the secret as a query parameter, because Retell webhooks can't carry our custom header. | A browser can't hold a secret. The same pattern is already used by `/api/retell/web-call`. The email route is protected by the visitor cookie and the unguessable call id. The webhook is protected by the query secret **and** by re-reading every call from Retell. | A secret in browser JavaScript would be public. `retell-sdk` signature checks would add a dependency for no extra safety. |
