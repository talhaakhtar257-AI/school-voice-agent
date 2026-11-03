---
id: 0078
title: Implement 013 speed, cost and visibility
stage: green
date: 2026-11-03
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: 013-call-speed-cost
user: talhawork257
command: /sp.plan then /sp.tasks then implementation
labels: ["latency", "cost", "caching", "after", "idempotency", "health-screen", "migration-pending"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/013-call-speed-cost/{research,plan,data-model,quickstart,tasks}.md and contracts/*.md — Phase 0-2 artifacts
  - lib/content/brief-cache.ts (new) — the cached brief, tagged, 60s
  - lib/content/queries.ts — readLiveStrict, which tells a failed read from "nothing published"
  - app/api/content/route.ts — serves the cached brief
  - app/dashboard/content/actions.ts — updateTag after a successful publish
  - lib/email/send-details-flow.ts (new) — plan/deliver split for send_details
  - lib/email/send-summaries.ts — helpers exported, details flow moved out (was 208 lines)
  - app/api/send-details/route.ts — replies first, delivers in after(), 3-per-call cap
  - lib/leads/queries.ts — compare-before-write, repeat-safe save
  - app/api/leads/route.ts — reports inserted/updated/unchanged
  - lib/calls/retell-api.ts, lib/calls/queries.ts — carry and persist Retell's latency and cost
  - app/api/retell/webhook/route.ts — acknowledges Retell, then emails in after()
  - lib/dashboard/call-metrics.ts (new) — period figures for the Health screen
  - app/dashboard/health/page.tsx, lib/strings/dashboard-screens.ts — the two new figures
  - lib/content/brief-budget.ts (new), lib/content/validate.ts, components/content/content-editor.tsx, lib/strings/content-admin.ts — the content budget
  - supabase/migrations/20261103120000_details_sent_count.sql (NOT APPLIED)
  - supabase/migrations/20261103120100_call_latency_cost.sql (NOT APPLIED)
tests:
  - npm run build, npx tsc --noEmit and npm run lint clean after every slice; only the pre-existing _drop warning in lib/content/schema.ts remains
  - every touched file under the ~200 line limit (content-editor.tsx is 199)
  - read the bundled Next 16 docs before using after(), unstable_cache, revalidateTag and updateTag, per the CLAUDE.md instruction for this Next version
  - NOT TESTED AT RUNTIME — the two migrations are unapplied and nothing is deployed, so no slice has been exercised against a real call
---

## Prompt

Series of prompts:

- One thing I want to discuss with you about our agent. When I was talking to the agent, it was to hang up and it was hanging and just checking while speaking. And when I check the dashboard, so I have to reload it when it shows the data. After, before reloading, it is not showing me the data about the today call. So there is a problem in our agent. It was struggling while speaking, and his message shown before she was speaking. So that's the problem I faced while calling it.
- yes
- push them all
- has every thing done /
- what you have to do do it  and tell me when done i have to move from here

## Response snapshot

Ran `/sp.plan` and `/sp.tasks`, then implemented all five slices on the feature
branch. Nothing deployed, no schema applied.

**Phase 0 decisions (research.md, D-001..D-007).** The headline finding is that
the obvious suspect is innocent: the language model's median is 738ms, the
fastest part of a turn. The overrun is in its p90 and max — the turns that call
our own API. So this feature touches no Retell setting at all.

**`unstable_cache`, not `use cache`.** The Next 16 replacement needs
`cacheComponents: true` across the whole project, which changes caching
semantics for every route — far beyond this feature and a breach of Principle X.
Recorded in Complexity Tracking as a deliberate use of a deprecated API with the
migration as a known follow-up. The bundled
`caching-without-cache-components.md` documents this path for projects in our
position.

**Reading the bundled docs paid for itself three times.** `revalidateTag`
requires a second argument in this version and the build failed on it;
`updateTag` turned out to be the right call inside a Server Action because it
expires outright rather than serving the old fee once while refreshing — which
is exactly the staff-publishes-then-test-calls case. And `after()` is stable
here, not `unstable_after`.

**Slice A** caches the brief, tagged, 60s, cleared by `updateTag` on publish.
Two bounds on staleness, so a lost tag means a one-minute delay rather than a
wrong answer forever.

**A pre-existing fault surfaced while doing it.** `readLiveForApi` returns null
both when nothing is published and when the read fails, so the agent could be
told the school has no content merely because Supabase was unreachable — and
would then answer as though the school had no fees or classes. `readLiveStrict`
throws on a genuine failure instead, and failures are never cached.

**Slice B** moves the email off the reply with `after()`, and the agent is now
told "sending", never "sent" — it speaks that sentence and the email has not
left yet. Adds the three-per-call cap that feature 011 specified and nobody
built. A failed read returns "error", never "no-email", because the agent tells
the parent there is no address on record when it hears "no-email", and saying
that because a column was missing would be a false statement to a parent.
`send-summaries.ts` hit 208 lines, so the details flow moved to its own module.

**Slice C** compares the stored row before writing, so the model's duplicate
`save_lead` pairs cost nothing. Linking still runs on an unchanged save: the
first save can arrive before Retell has reported the call, and skipping it would
leave that lead unlinked for good.

**Slice D** stores Retell's end-to-end p50 **and p90** — the owner's complaint
was about the spikes, so a median-only figure would hide the fault being fixed —
plus the cost in cents, and shows them on the Health screen with the number of
calls behind them. Also answers Retell before the webhook's two emails, so it
stops overrunning the 10-second budget and being retried. This was in the plan
(D-003) and the spec (FR-009) but had no task; added as T040.

**Slice E** shows the content budget while staff edit and warns through the
`Problem` mechanism the publish dialog already renders, rather than new UI. A
warning, never a block: refusing to publish would stop the school recording true
facts about itself, which is worse than a slower call. Deviated from my own T032,
which filed overflow into `unanswered_questions` — that table is for questions
parents asked, and putting "content was truncated" there would muddy the Gaps
screen.

## Outcome

- ✅ Impact: all five slices written, 32 of 39 tasks done, build and type check
  clean throughout. One pre-existing correctness fault fixed as a side effect.
- 🧪 Tests: build, type check, lint, line-length and bundled-docs checks. **No
  runtime verification at all** — see below.
- 📁 Files: commits 7685319 (slice A), d371410 (B), 27f416a (C), 6bd2a90 (D),
  e653121 (E), plus 02b5ae0 and e0a2edd for the planning artifacts.
- 🔁 Next prompts:
  - **The maintainer approves the two migrations.** `.claude/rules/database.md`
    requires plain-English notice and an explicit go-ahead before any schema
    change, so neither was applied. Until they are, the details cap degrades to
    offering the office number and the Health figures read as unavailable.
  - Merge to main and deploy, then the seven clicking checks in quickstart.md.
  - Re-measure a five-minute call against SC-001 and SC-004 (T034).
  - Separately: the Retell tuning track — ElevenLabs v4 Turbo or v3
    Conversational at $0.080/min against $0.100, boosted keywords off, the
    silence timer 30s → 60s. Each needs a version bump and the owner's ears.
  - Rotate the API key that was pasted into the chat.
- 🧠 Reflection: measuring first changed what got built. The model looked like
  the problem and was the fastest part; the real second was our own content
  route, and a third of the perceived slowness was a UI race that made the
  assistant *look* slower than she was. Two of the faults fixed here could not
  have been found by reading code — the duplicated `save_lead` and the appearing
  token surcharge both came out of one call's data.

## Evaluation notes (flywheel)

- Failure modes observed: wrote `revalidateTag` from memory and the build caught
  a changed signature — then reading the doc showed `updateTag` was the correct
  API for a Server Action, so the first instinct was wrong twice over; put a
  bilingual string inline in a component and had to move it to `lib/strings`;
  named a shared helper `wholeMs` and then used it for cents; pushed
  `send-summaries.ts` to 208 lines before noticing the 200-line rule; wrote a
  task (T032) that would have polluted `unanswered_questions` and had to be
  overruled at implementation time; my own tasks.md omitted a task for FR-009
  entirely, which only surfaced because the plan mentioned it.
- Graders run and results (PASS/FAIL): build PASS; tsc PASS; lint PASS (one
  pre-existing warning); line limit PASS; runtime NOT RUN; migrations NOT
  APPLIED.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): apply the two migrations, deploy,
  and re-time `get_school_content` from Karachi — one number against the five
  recorded before the cache (1.53s, 1.11s, 1.07s, 1.14s, 0.67s) says whether
  slice A delivered.
