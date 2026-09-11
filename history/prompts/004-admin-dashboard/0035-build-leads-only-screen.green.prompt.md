---
id: 0035
title: Build leads-only screen
stage: green
date: 2026-09-11
surface: agent
model: claude-sonnet-5
feature: 004-admin-dashboard
branch: 004-admin-dashboard
user: talhaakhtar257-AI
command: none
labels: [dashboard, leads, feature-004]
links:
  spec: specs/004-admin-dashboard/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - lib/strings/leads-admin.ts (new)
  - lib/leads/rows.ts (new)
  - lib/leads/queries.ts (edited — added listLeads())
  - app/dashboard/leads/actions.ts (new)
  - app/dashboard/leads/page.tsx (new)
  - components/leads/leads-table.tsx (new)
  - app/dashboard/layout.tsx (edited — added Leads nav link)
tests:
  - npm run build + npx tsc --noEmit + npm run lint — all clean
  - Manual: empty state verified in browser (screenshot)
  - Manual: 3 test leads inserted via SQL — all 10 fields render, newest first, NULL fields show "—"
  - Manual: status change via dropdown verified to persist (browser reload + direct DB read)
  - Manual: 4th test lead inserted while screen open — appeared within 10s via poll, no reload (FR-006, SC-002)
  - Test rows deleted afterward; empty state confirmed to still work
---

## Prompt

Read specs/004-admin-dashboard/spec.md.

Build ONLY the leads screen from it. Skip charts, health numbers,
call transcripts, the gap list and settings entirely.

The leads table and /api/leads already exist on main — read them first
and match what is there.

The screen needs: parent name, student name, class, age, phone,
previous school, fresh or transfer, language, date, status.
Newest first. Status editable between new, contacted, applied, closed.
New leads appear without refreshing the page.
Include a designed empty state for when there are no leads.

Small steps, show me each change before making it.

## Response snapshot

Read the 004 spec, the existing `leads` migration, and `lib/leads/queries.ts`
before writing anything. Built in three approved steps: (1) shared strings and
types (`lib/strings/leads-admin.ts`, `lib/leads/rows.ts`, `listLeads()` added
to the existing `lib/leads/queries.ts`); (2) the screen itself — a Server
Action (`app/dashboard/leads/actions.ts`) matching the existing content-editor
pattern rather than a new raw-Supabase-in-the-browser approach, a client
table component that polls every 10 seconds (user chose polling over Supabase
Realtime, to avoid a database change), and the page + empty/error states; (3)
verified end-to-end with real test data inserted and deleted via SQL.

Caught and fixed one real TypeScript issue along the way: `.select()` called
with a string variable (not a literal) loses Supabase's row-shape inference —
same problem `lib/content/queries.ts` had already hit and fixed with
`as unknown as X`; matched that existing pattern rather than inventing a new
one.

Deliberately out: charts, health numbers, calls/transcripts, gap list,
settings, the date-range selector, and the "click row → transcript" link —
none of their backing tables or screens exist yet, per the user's instruction
and the spec's own Hard Dependency note.

## Outcome

- ✅ Impact: Staff can now see every parent enquiry at `/dashboard/leads`, newest first, with all ten fields, change status, and watch new leads arrive live — the first of the 004 spec's six screens has real working code.
- 🧪 Tests: build + tsc + lint all clean; full manual verification against real Supabase data (see tests above).
- 📁 Files: 3 new lib files, 3 new app/component files, 2 existing files edited (see files above).
- 🔁 Next prompts: the remaining five 004 screens (Calls, Health, Charts, Gap List, Settings) still need the `calls` and `unanswered_questions` tables, which don't exist yet — a separate feature, not this one. Also still open: the Retell agent has no system prompt / content connection yet.
- 🧠 Reflection: n/a

## Evaluation notes (flywheel)

- Failure modes observed: none — the TypeScript select-typing issue was caught by `tsc` before it ever reached the user.
- Graders run and results (PASS/FAIL): build PASS, tsc PASS, lint PASS, manual verification PASS (all 5 checks).
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
