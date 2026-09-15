---
id: 0039
title: Port staff dashboard design into Next.js
stage: general
date: 2026-09-15
surface: agent
model: claude-opus-5
feature: none
branch: 008-dashboard-redesign
user: talhaakhtar257-AI
command: none
labels: ["dashboard", "design", "svg-chart", "rls", "i18n", "rtl"]
links:
  spec: specs/004-admin-dashboard/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - supabase/migrations/20260915120000_usage_read_for_staff.sql
 - lib/fonts.ts
 - lib/strings/dashboard.ts
 - lib/strings/dashboard-screens.ts
 - lib/dashboard/format.ts
 - lib/dashboard/usage.ts
 - lib/dashboard/overview.ts
 - lib/dashboard/health.ts
 - lib/dashboard/settings.ts
 - components/dashboard/shell.module.css
 - components/dashboard/ui.module.css
 - components/dashboard/panels.module.css
 - components/dashboard/nav-links.tsx
 - components/dashboard/sidebar.tsx
 - components/dashboard/topbar.tsx
 - components/dashboard/content-tabs.tsx
 - components/dashboard/stat-tile.tsx
 - components/dashboard/bar-rows.tsx
 - components/dashboard/empty-state.tsx
 - components/dashboard/status-tag.tsx
 - components/dashboard/leads-chart.tsx
 - components/dashboard/lead-drawer.tsx
 - components/leads/leads-table.tsx
 - components/content/content-editor.tsx
 - app/dashboard/layout.tsx
 - app/dashboard/page.tsx
 - app/dashboard/leads/page.tsx
 - app/dashboard/unanswered/page.tsx
 - app/dashboard/health/page.tsx
 - app/dashboard/settings/page.tsx
 - app/dashboard/content/layout.tsx
 - app/dashboard/content/page.tsx
 - app/dashboard/content/test/page.tsx
 - app/dashboard/content/history/page.tsx
 - app/dashboard/content/history/[id]/page.tsx
tests:
 - npx tsc --noEmit (pass)
 - npm run lint (pass, 2 pre-existing warnings in lib/content/schema.ts)
 - npm run build (pass)
 - pg_policies shows voice_usage_daily/monthly SELECT policies for authenticated
 - Signed-out GET of 6 dashboard routes returns 307 to login
 - NOT YET RUN: signed-in click-through (needs the user to sign in)
---

## Prompt

c:\Users\scs\Downloads\dashboard.htmlPort the uploaded dashboard design into our Next.js app.

Keep: overview, leads, settings, health. Keep its hand-built SVG charts —
do not add a chart library.

CUT the Calls page entirely. We have no calls table and transcripts are
phase 2.

ADD two screens in the same visual style: the content editor and the gap
list. These are our two most important screens and the design is missing
both.

Critical: the design reads Supabase directly from the browser with the
anon key. Do NOT do that. Use our existing server routes.

Our dashboard requires login. The design has none. Keep our auth.

Show me the plan before changing any file.

## Response snapshot

Planned in plan mode. The user chose:
- Settings as a read-only view.
- A migration that gives staff read access to the voice usage tables.
- Reuse of the landing page's cookie language toggle.

Plan approved. Steps taken:
- Merged 007 into main, then branched 008.
- Applied the migration and verified both policies.

What was built:
- **Shell:** sidebar, top bar with Ready/Needs-attention pill and language toggle; the login guard is unchanged.
- **Overview:** real tiles, a hand-built SVG stacked bar chart of leads per day by language (tooltip, data table, axis labels), top gaps, recent leads.
- **Leads:** styled table with a side drawer for details, call back and status.
- **Gap list:** "Add answer" links to /dashboard/content#faqs.
- **Content editor:** restyled into cards with tabs and a sticky action bar; save/publish logic untouched.
- **Health:** usage tiles and yes/no checks.
- **Settings:** read-only rows.

All reads are server-side with the staff session. Invented design data was dropped: call KPIs, uptime, sibling discount, admitted/lost statuses.

## Outcome

- ✅ Impact: The staff dashboard has the new design on real data. The Calls page is gone and Content plus Gap list are added. There is no browser Supabase access besides sign-out, and login is kept.
- 🧪 Tests: tsc, lint and build pass; the migration is verified; signed-out redirects are verified. The signed-in visual check is pending user sign-in.
- 📁 Files: 23 new, 12 modified, 1 migration.
- 🔁 Next prompts:
  - The user signs in and clicks through; then merge 008 into main.
  - Update spec 004 via /sp.specify.
  - Date range selector (FR-025) is still missing.
  - Editable settings (US6) need a plan.
- 🧠 Reflection: Most of the design's numbers had no data behind them. Replacing them with honest equivalents (calls started, minutes reserved) kept the look without misleading staff.

## Evaluation notes (flywheel)

- Failure modes observed: the first draft of the history-record page conflated "not found" with "load failed"; fixed before build.
- Graders run and results (PASS/FAIL): build PASS, tsc PASS, lint PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): add the date range selector to Overview and Leads.
