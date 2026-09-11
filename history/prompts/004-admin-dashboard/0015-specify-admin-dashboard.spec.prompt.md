---
id: 0015
title: Specify admin dashboard
stage: spec
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: 004-admin-dashboard
branch: 004-admin-dashboard
user: talhawork257@gmail.com
command: /sp.specify (admin dashboard); then "commit that spec onto the branch and push it"
labels: [spec, dashboard, leads, calls, charts, blocked]
links:
  spec: specs/004-admin-dashboard/spec.md
  ticket: none
  adr: none
  pr: none
files:
  - specs/004-admin-dashboard/spec.md
  - specs/004-admin-dashboard/checklists/requirements.md
tests:
  - none
---

## Prompt

Build the admin dashboard. Login required. Screens in this order.

1. LEADS. Table: parent name, student name, class, age, phone, current class,
   previous school, fresh or transfer, language, date, status. Status changes
   between new, contacted, applied, closed. Newest first. New leads appear
   without refreshing the page. Each row links to its transcript.

2. CALLS. Table: date, time, length, language, outcome. Clicking a row shows
   the full transcript, both sides. Urdu text must display correctly.

3. HEALTH. Agent online or offline, calls today, average response delay,
   percentage handled without transfer, minutes used this month.

4. CHARTS. Calls per day as a line chart. Leads by class as a bar chart. Top
   questions as a bar chart. Urdu versus English split. Plus a funnel: page
   visits, calls started, leads captured, leads contacted.

5. GAP LIST. Questions the agent could not answer, most frequent first, with a
   button to jump to the content editor.

6. SETTINGS. Agent on or off, working hours, transfer number, max call length.

Across every screen:
- A date range selector in the same position
- Designed empty states for day one with no data. A blank screen looks broken
- Readable on a phone

## Response snapshot

The dashboard is the fifth feature the maintainer has asked for while feature 001
(the application foundation) remains undeployed and features 002 and 003 are
specifications only. The sequencing concern was raised. The maintainer's answer
was to write the dashboard spec now with the build staying paused, which was
done.

`create-new-feature.ps1` created the `004-admin-dashboard` branch and an empty
`spec.md` from the template, then failed on a PowerShell argument-parsing error
before filling it; the branch and file were correct, so the spec was written into
that file directly rather than re-running the script.

The specification has six prioritised user stories, one per screen: Leads and
Calls at P1 (the operational core), Health at P2, Charts and the Gap List at P3,
Settings at P4. Twenty-seven functional requirements, seven success criteria,
seven edge cases, an eight-item out-of-scope list, and a six-item Assumptions
section.

A "Hard Dependency" section was placed above the user stories, at the maintainer's
explicit instruction, because this feature's dependency is stronger than an
ordering preference: it reads the `leads`, `calls` and `unanswered_questions`
tables that the voice agent API writes, requires the staff-login session from
feature 002, and links to the content editor from feature 003. None of those
exist. Without them the dashboard cannot function at all, not merely cannot be
built in the right order.

The session was interrupted before this spec was committed. On resume the
maintainer asked for a repository-wide status report (delivered, read-only), then
`git push --all origin` — which backed up feature 001's app and constitution
v1.1.0 to GitHub and created the `004-admin-dashboard` remote branch, but could
not carry the still-untracked `spec.md`. The maintainer then confirmed the spec
should be committed and pushed.

A quality checklist was written at
`specs/004-admin-dashboard/checklists/requirements.md`; all sixteen items pass.
The only spec edit during validation was softening one sentence that guessed a
task count before any tasks exist.

## Outcome

- ✅ Impact: Feature 004 has a complete, validated specification, committed and pushed. Its hard dependency on features 002, 003 and the unspecified agent API is documented prominently.
- 🧪 Tests: None — specification only.
- 📁 Files: Created `specs/004-admin-dashboard/spec.md` and `specs/004-admin-dashboard/checklists/requirements.md`.
- 🔁 Next prompts: Do not run `/sp.plan` for this feature yet. Finish feature 001 first — create the Supabase project, add `.env.local`, deploy to Vercel.
- 🧠 Reflection: Writing the spec now keeps the maintainer's requirements captured without pretending the feature can be built; the checklist's "open item for planning" states plainly that it cannot.

## Evaluation notes (flywheel)

- Failure modes observed: `create-new-feature.ps1` fails on argument parsing under Windows PowerShell 5.1 but creates the branch and template file as a side effect before failing.
- Graders run and results (PASS/FAIL): Specification quality checklist — 16/16 PASS.
- Prompt variant (if applicable): None.
- Next experiment (smallest change to try): Invoke `create-new-feature.ps1` with the feature description as a single quoted trailing argument and no interleaved switches, to avoid the positional-binding error.
