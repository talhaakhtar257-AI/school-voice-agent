# Implementation Plan: Faster answers, lower cost, and both made visible

**Branch**: `013-call-speed-cost` | **Date**: 2026-11-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-call-speed-cost/spec.md`

## Summary

A parent currently waits 2.28s on a typical turn and up to 3.23s at worst, and a
five-minute call costs $0.92. The language model is not the cause — its median is
738ms. The cause is the work our own API does while the parent sits in silence:
a content fetch of 0.67-1.53s before every call's first answer, an email send of
up to 8s in the middle of a conversation, and the same enquiry saved four times
in one call. None of it is visible anywhere in the product.

The approach is four changes to our own code and one piece of reporting, with no
Retell setting touched:

1. **Cache the school brief** (`unstable_cache`, tagged, 60s, invalidated on
   publish) so the first answer stops waiting on a database round trip.
2. **Move slow work off the reply** with `after()` — the written-details email
   and the webhook's two emails — so the parent hears continuous speech and
   Retell stops retrying the end-of-call handler.
3. **Make the enquiry save repeat-safe** and cheaper, so the model's duplicate
   tool calls cost nothing and the parent hears no pause for them.
4. **Record Retell's own latency and cost** on the call row and show them on the
   Health screen, which has carried a comment deferring exactly this since
   feature 004.
5. **Bound the content budget** and show staff how full it is, which is what
   started the per-minute token surcharge.

## Technical Context

**Language/Version**: TypeScript 5, React 19.2.8, Next.js 16.3.4 (App Router)
**Primary Dependencies**: `@supabase/supabase-js` and `@supabase/ssr`, `zod` 4,
`retell-client-js-sdk` 3.0.2. **No new dependency is introduced by this feature.**
**Storage**: Supabase Postgres (project `fcinppioqdwsgeybnfrl`), RLS on every
table, service key used only server-side
**Testing**: No test runner in this project. Verification is `npm run build`,
`npx tsc --noEmit`, and clicking — per Principle IX and the Definition of Done
**Target Platform**: Vercel serverless (functions in `iad1`, edge `bom1` for
Karachi traffic, confirmed from an `X-Vercel-Id` header), parents on low-end
Android at 360px
**Project Type**: Web — single Next.js app, no separate backend
**Performance Goals**: reply delay p50 under 1.5s and p90 under 2.5s (currently
2.28s / 2.91s); the `get_school_content` tool well inside Retell's 5s timeout;
the webhook inside Retell's 10s timeout on every call
**Constraints**: Retell is US-only, so roughly a quarter-second of Karachi-to-US
network latency is a floor no code change removes; Retell's per-minute LLM price
is flat, so trimming the prompt buys latency, not money — except past the token
surcharge threshold, where it buys both
**Scale/Scope**: a Phase 1 demo. 22 calls and 25 leads to date, concurrency
capped at 3, 500 minutes a month. Roughly 8 files changed and one migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answer each against `.specify/memory/constitution.md` v1.1.0.

- [x] **I. Honesty** — Caching changes how fast approved content arrives, never
      where it comes from: the live `content` table stays the only source, and
      D-007 keeps "retrieval failed" distinct from "the school has no answer".
      D-006 refuses to drop content silently for the same reason. Unanswered
      questions keep being recorded.
- [x] **II. No Authority** — Nothing here touches what the agent may say. The
      prompt is out of scope.
- [x] **III. Disclosure** — Untouched; `handbook_config.ai_disclosure` stays on
      and is a Retell setting this feature does not change.
- [x] **IV. Bilingual Prose** — New staff-facing strings (budget warning, the
      Health screen's two figures, their empty and error states) go in
      `lib/strings/` in both languages. Cost is stored once in cents and
      formatted for display, never duplicated per language — the same rule that
      governs fees.
- [x] **V. Confirm Before Saving** — Idempotency changes only *whether* a repeat
      write happens, never which fields may be stored. An unconfirmed name stays
      empty and the lead still saves.
- [x] **VI. No Sensitive Data** — Nothing new is collected. The stored latency
      and cost figures contain no personal data, and FR-016 forbids writing a
      phone number in plain text anywhere new. Retell's PII scrubbing setting is
      out of scope.
- [x] **VII. Human Exit** — D-007 strengthens this: a failed content fetch must
      route to the office. The office number on parent screens is untouched.
- [x] **VIII. Simple Over Clever** — No new dependency. `unstable_cache` and
      `after()` are both framework APIs documented in the bundled docs, chosen
      over a cache abstraction or a job queue. `cacheComponents: true` was
      rejected as too broad. Every touched file stays under ~200 lines; the
      brief-budget helper is split out rather than grown into `agent-brief.ts`.
- [x] **IX. Testable By A Non-Developer** — Each change is checkable by
      clicking: make a call and listen; open the Health screen; add content and
      watch the budget fill. Empty and error states are required by FR-015.
      Health figures must read at 360px.
- [x] **X. Small Steps** — Five independent slices, each building and shipping on
      its own, ordered so the parent-facing win lands first. No unrelated
      refactoring.
- [x] **Feature sequencing** — Judged by code, not specification. Feature 012
      (bilingual privacy policy) is merged and live. The two faults reported on
      3 Nov are already fixed and deployed (commits `0415706`, `da3d449`). No
      earlier feature has unimplemented code pending. Features 007-009 have
      branches but no spec directories and were superseded by 010.

## Project Structure

### Documentation (this feature)

```text
specs/013-call-speed-cost/
├── spec.md              # Phase -1 (/sp.specify)
├── plan.md              # This file
├── research.md          # Phase 0 — D-001..D-007
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 — how the maintainer checks it by clicking
├── contracts/           # Phase 1 — the three endpoint contracts that change
│   ├── content-api.md
│   ├── send-details-api.md
│   └── leads-api.md
├── checklists/
│   └── requirements.md  # spec quality, 16/16
└── tasks.md             # Phase 2 (/sp.tasks — not created here)
```

### Source Code (repository root)

Existing Next.js App Router layout. Files this feature touches:

```text
app/
├── api/
│   ├── content/route.ts          # serve the cached brief (D-002)
│   ├── send-details/route.ts     # reply first, email in after() (D-003)
│   ├── leads/route.ts            # idempotent save (D-004)
│   └── retell/webhook/route.ts   # acknowledge first, emails in after() (D-003)
├── dashboard/
│   ├── content/actions.ts        # revalidate the brief tag on publish (D-002)
│   └── health/page.tsx           # show reply delay and cost (D-005)
lib/
├── content/
│   ├── agent-brief.ts            # unchanged shape; budget measurement extracted
│   └── brief-cache.ts            # NEW — the cached brief and its tag
├── calls/
│   ├── queries.ts                # persist latency and cost
│   ├── retell-api.ts             # carry latency and cost through the mapper
│   └── schema.ts                 # parse them from the get-call response
├── leads/queries.ts              # fewer round trips, compare-before-write
├── dashboard/call-metrics.ts     # NEW — period averages for the Health screen
└── strings/                      # new bilingual staff strings
supabase/migrations/
└── <timestamp>_call_latency_cost.sql   # NEW — two columns on calls
components/content/                     # budget indicator in the editor (D-006)
```

**Structure Decision**: No structural change. This feature edits existing route
handlers and query modules in place and adds two small `lib/` modules plus one
migration, matching how features 003, 005 and 010 are organised. Two new files
rather than growing existing ones, to stay inside the ~200-line rule.

## Phase ordering

Each slice builds, deploys and is checkable on its own (Principle X), ordered by
what the parent feels first.

| Slice | What lands | Checkable by |
|---|---|---|
| A | Cached brief + publish invalidation + the fail-safe in D-007 | A call's first answer comes faster; publish a fee change and hear it within a minute |
| B | `send_details` replies first, emails in `after()`, 3-per-call cap | Ask for details mid-call and hear no pause; ask four times and hear the office number offered |
| C | Idempotent, cheaper enquiry save | A call mentioning class, age and transfer leaves one lead with all three |
| D | Latency and cost stored and shown on the Health screen | Finish a call, open Health, see the figures and the call count |
| E | Content budget visible, warned, and overflow recorded | Add content and watch the budget fill; cross it and get warned |

Slices A-C are the reported fault. D makes the result measurable — it is worth
landing before any Retell tuning, so the voice change can be judged against a
baseline rather than a memory. E is the slow leak.

## Complexity Tracking

No constitution violations. One deliberate deviation worth recording:

| Decision | Why | Alternative rejected because |
|---|---|---|
| `unstable_cache`, an API deprecated in Next 16 | Works without `cacheComponents: true`, persists across deployments, and is documented for projects in our position in the bundled `caching-without-cache-components.md` | `use cache` requires a project-wide config flag that changes caching semantics for every route — far beyond this feature, and a breach of Principle X. Recorded as a follow-up, not a surprise |

## Follow-ups this feature deliberately does not do

- Migrate to `use cache` / Cache Components (see Complexity Tracking).
- Any Retell setting: the ElevenLabs voice engine ($0.080/min against $0.100 and
  lower speech latency), the language model, keyword boosting, the 30s silence
  timer that `docs/retell-agent-prompt.md` records as decided at 60s and never
  applied. All on the separate one-change-at-a-time tuning track, each judged by
  listening to the Urdu.
- The `pii_scrubbing` line at $0.0100/min, which buys a scrubbed transcript copy
  nothing in the product reads while the raw transcript is also stored. A
  privacy decision for the maintainer, not a code change.
