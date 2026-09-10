# Implementation Plan: School Content System

**Branch**: `003-content-system` | **Date**: 2026-09-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-content-system/spec.md`

## Assumptions — confirmed by the maintainer 2026-09-10

All six were reviewed. #2 was chosen explicitly (keyword matching, option A);
the rest were accepted as-is. Kept here for the record:

1. **Content is stored as one JSON document per version** (`draft` and `live`),
   not as normalised per-item tables. Publish is then a single atomic row update.
2. **The test tool matches keywords against the draft content — it does not call
   an LLM.** It surfaces what the draft says about a topic so staff can catch a
   typo. No new AI dependency. If you want a real model simulating the agent,
   that is a dependency decision to make now.
3. **`zod` will be added** for API-endpoint validation. `.claude/rules/api.md`
   already mandates Zod for endpoints, so this is expected rather than a new
   choice — but it is not yet in `package.json`.
4. **The content endpoint reuses `RETELL_WEBHOOK_SECRET`** as its shared secret,
   sent in an `X-Agent-Secret` header. If the agent should use a separate secret,
   say so.
5. **The admin screens are English-primary.** The *content fields* are bilingual
   (that is the whole point); the surrounding UI labels are English, matching how
   staff-facing dashboard screens were left in feature 002.
6. **Any logged-in staff member can edit and publish.** No roles, no approval
   step — the spec puts that out of scope.

## Summary

School staff edit the knowledge the voice agent answers from — Facts, Policies,
FAQs, and Escalation Topics — on an admin screen behind the feature-002 login.
Edits change a **draft**. A **live** version sits untouched until a staff member
clicks **Publish** and confirms a shown diff. Every publish writes an
un-editable history record with who, when, and both the before and after content.
A single API endpoint returns the live version as JSON to the voice agent, and
only to a caller carrying the shared secret. A test tool lets staff try the draft
before publishing, clearly labelled as a simulation.

## Technical Context

**Language/Version**: TypeScript; Next.js 16 App Router (fixed by feature 001)
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr` (present); `zod` (**to add** — mandated by `.claude/rules/api.md`)
**Storage**: Supabase Postgres — two new tables, `content` and `content_history`, created by a reviewable SQL migration
**Testing**: Manual verification by clicking, following `quickstart.md`. No test framework (project pattern, research D-006 of feature 002).
**Target Platform**: Vercel; staff on office laptops and phones; the endpoint is called server-to-server by Retell
**Project Type**: Web application — single Next.js project at the repo root
**Performance Goals**: `GET /api/content` returns in under 200 ms; content payload is a few KB. No other budget.
**Constraints**: No `localStorage`. Service role key never reaches the browser. Admin usable at 360 px. All parent-facing content bilingual. Publishing never happens as a side effect.
**Scale/Scope**: Tens of FAQs, a handful of policies, a few editors, occasional edits (spec assumption). Four admin routes plus one API route.

No unresolved NEEDS CLARIFICATION — the open points are recorded as stated
assumptions above and in `research.md`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answered against `.specify/memory/constitution.md` v1.1.0.

- [x] **I. Honesty** — This feature *is* the approved source of truth. The agent endpoint returns only `live`; the draft is unreachable through it (FR-016). Recording unanswerable questions is a separate feature (`unanswered_questions` table) and is out of scope here.
- [x] **II. No Authority** — Escalation Topics exist precisely to stop the agent discussing discounts and special cases; both are required entries (FR-005). Nothing here lets the agent confirm a seat.
- [—] **III. Disclosure** — *Not applicable.* No agent conversation surface in this feature.
- [x] **IV. Bilingual Prose** — Policies, FAQ questions and answers, and escalation wording are stored in Urdu and English (FR-007). Fees, ages, class names, dates, office hours are stored once and formatted for display (FR-006). Publish is refused when a bilingual field has only one language, naming the field and the missing side (FR-008).
- [—] **V. Confirm Before Saving** — *Not applicable.* No parent phone number or name is handled.
- [x] **VI. No Sensitive Data** — No CNIC, B-Form, or payment data anywhere in this feature.
- [—] **VII. Human Exit** — *Not applicable.* The admin screens are staff-only, behind the login, not parent-facing. (Feature 002 put the office phone on `/login` because that screen is publicly reachable; `/dashboard/*` screens are not.)
- [x] **VIII. Simple Over Clever** — One JSON document per version; publish is one `UPDATE` plus one `INSERT` in a transaction. The test tool is keyword matching, not a model. `zod` is the only new dependency and the API rules already require it. Every planned file is under 200 lines; the content editor is split by section to keep it so.
- [x] **IX. Testable By A Non-Developer** — Every screen is reachable and checkable by clicking; `quickstart.md` lists each path including the publish confirmation, the bilingual-gap message, and the history view. All lists have loading, empty, and error states (FR-028). Works at 360 px (FR-029).
- [x] **X. Small Steps** — Phased so each step builds and runs: migration, then the read endpoint, then the editor, then test, then publish, then history.
- [x] **Feature sequencing** — Feature 002 (staff login) is implemented, merged into `main`, deployed to Vercel, and verified. `app/dashboard/layout.tsx`, `proxy.ts`, and `lib/supabase/*` exist and run.

**Result**: Passes. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/003-content-system/
├── spec.md              # written
├── plan.md              # this file
├── research.md          # Phase 0 — decisions and assumptions
├── data-model.md        # Phase 1 — the content document shape and the two tables
├── quickstart.md        # Phase 1 — how to verify by clicking
├── contracts/
│   └── content-api.md   # Phase 1 — GET /api/content request/response contract
└── tasks.md             # Phase 2 — /sp.tasks, not created here
```

### Source Code (repository root)

Files marked **(new)** are created by this feature. Everything else exists.

```text
supabase/
└── migrations/
    └── <timestamp>_content_system.sql   # (new) content + content_history tables, RLS

app/
├── api/
│   └── content/
│       └── route.ts                     # (new) GET — live content as JSON, shared-secret gated
└── dashboard/
    ├── layout.tsx                       # from feature 002 — a nav link to Content is added
    └── content/
        ├── page.tsx                     # (new) the editor: Facts, Policies, FAQs, Escalation
        ├── test/
        │   └── page.tsx                 # (new) the draft test tool
        └── history/
            └── page.tsx                 # (new) change history list

components/
└── content/
    ├── facts-editor.tsx                 # (new)
    ├── policies-editor.tsx              # (new)
    ├── faq-editor.tsx                   # (new)
    ├── escalation-editor.tsx            # (new)
    ├── publish-dialog.tsx               # (new) shows the diff, requires confirmation
    ├── bilingual-field.tsx              # (new) en + ur inputs with the missing-language message
    └── delete-escalation-dialog.tsx     # (new) same deliberate confirm as publishing (FR-026)

lib/
├── content/
│   ├── schema.ts                        # (new) the ContentDoc type + zod schema, shared
│   ├── validate.ts                      # (new) publish-readiness check: required facts, bilingual gaps
│   ├── queries.ts                       # (new) read draft / read live / save draft / publish
│   ├── diff.ts                          # (new) draft-vs-live summary for the confirm dialog and history
│   └── simulate.ts                      # (new) the keyword-match test tool
├── strings/
│   └── content-admin.ts                 # (new) the few bilingual UI strings this feature shows staff
└── supabase/
    └── admin.ts                         # (new) service-role client for the API route only, server-side
```

**Structure Decision**: One Next.js App Router project, matching `CLAUDE.md`.
The editor lives at `/dashboard/content` so the feature-002 proxy already
protects it — no new auth work. The API route is the only unauthenticated-session
surface and is gated by the shared secret instead. `lib/content/` holds all the
non-React logic (schema, validation, queries, diff, simulation) so each React
file stays small and the rules are testable by reading one file.

## Key Decisions and Rationale

**One JSON document per version.** `content` holds exactly two rows, `channel =
'draft'` and `channel = 'live'`, each with a `doc jsonb` column. Publishing copies
`draft.doc` into `live.doc` and inserts a history row, in one transaction. This
makes FR-013 ("entire version or the previous entire version, never a mixture")
true by construction — a reader sees one row or the other — and SC-002 (100
requests across a publish, none mixed) becomes trivial. Restore-by-editing
(FR-024) works because the history row carries the whole prior document. The spec
says content volume is small, so the loss of per-row queryability costs nothing.

**Publish is a Postgres function, called from a server action.** A
`SECURITY DEFINER` function `publish_content(actor)` does the copy-and-record
atomically and rejects a no-op publish (draft equals live) so pressing Publish
twice records nothing (edge case). The server action first runs the
publish-readiness check in `lib/content/validate.ts` and refuses with a field-level
message if a required fact is missing or a bilingual field is half-filled
(FR-008, FR-012).

**Optimistic concurrency on the draft.** The editor loads `draft.updated_at` and
sends it back on save; the save is rejected if it no longer matches, and the
staff member is told the draft changed underneath them (FR-027, and the
"two staff edit at once" edge case). No locking.

**The test tool simulates by lookup, not by model.** `lib/content/simulate.ts`
takes a typed question, lowercases and tokenises it, and scores each FAQ and each
escalation topic against it; the best match's draft answer (or the escalation
hand-off wording) is shown, always with the FR-018 simulation notice. A question
matching an escalation topic shows the hand-off, never an answer (FR-019). This
is enough to catch "the fee has a digit missing" without an LLM dependency or an
API key. If the school later wants a faithful simulation, that is its own
dependency decision.

**The API route uses the service-role key, server-side only.** `lib/supabase/admin.ts`
creates a service-role client that never ships to the browser. The route checks
`X-Agent-Secret` against `RETELL_WEBHOOK_SECRET` first, returns 401 on a
mismatch, and only then reads `live.doc`. When `live.doc` has never been
published it returns `{ published: false }` with a 200 so the agent gets an
unambiguous answer (FR-004), not an error.

## Risks

- **Escalation topic deleted by mistake** widens what the agent will answer
  (spec edge case). Mitigated by FR-026 — removing one needs the same confirm
  dialog as publishing — and by soft-delete (`archivedAt`), so the record
  survives (FR-025).
- **A publish that was wrong.** There is no one-click rollback (out of scope).
  The history row carries the full prior document so staff can copy values back
  into the draft and re-publish (FR-024, SC-005). The plan makes the history row
  show that prior content in full, not just a summary.
- **The migration runs against the real Supabase project.** There is no local
  Postgres. `.claude/rules/database.md` requires describing the change and the
  data at risk before running it — the first task does exactly that and waits.

## Follow-ups

- Confirm or correct the six assumptions at the top of this file.
- Approve adding `zod` (or confirm it counts as pre-approved by the API rules).
- Decide the shared-secret arrangement: reuse `RETELL_WEBHOOK_SECRET`, or a new
  `CONTENT_API_SECRET`.
- The `unanswered_questions` table is named in `.claude/rules/database.md` but
  belongs to a later feature; this plan does not touch it.

## Complexity Tracking

*Empty — no constitution violations to justify.*
