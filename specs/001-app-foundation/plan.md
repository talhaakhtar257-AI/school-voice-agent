# Implementation Plan: Application Foundation

**Branch**: `001-app-foundation` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-app-foundation/spec.md`

## Summary

Publish a Next.js site with two routes — a public page naming the school, and a
`/health` page that says in plain words whether the application can reach its
Supabase database. Every credential comes from the environment. The work is done
when the site answers on a public `https` address and the health page reports
success.

The technical approach is deliberately small: no database tables, no
authentication, no state, six source files. The risk in this feature is not the
code, it is the four accounts and the wiring between them. The plan therefore puts
most of its weight on [quickstart.md](./quickstart.md), which walks the deployment
in plain English.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 24 (this machine runs v24.16.0, npm 12.0.2)
**Primary Dependencies**: Next.js App Router; `@supabase/supabase-js`
**Storage**: Supabase (PostgreSQL). **This feature creates no tables.**
**Testing**: Manual verification in a browser. No test framework is added — the
specification requires none, Principle IX makes the browser the acceptance surface,
and a test dependency needs the maintainer's agreement first.
**Target Platform**: Vercel; current Chrome, Firefox, Safari and Edge; 360px minimum width
**Project Type**: Web — one Next.js application, no separate backend
**Performance Goals**: The health page returns an answer fast enough to feel
interactive; a person waiting on it should never wonder whether it has hung.
**Constraints**: No credential in any committed file. The health page reveals
nothing about the infrastructure when it fails. The public page renders whether or
not the database is reachable.
**Scale/Scope**: 2 routes, 6 source files, 2 required environment variables.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answered against `.specify/memory/constitution.md` v1.0.0.

- [x] **I. Honesty** — No agent answers anything here. The health page reports only
  what it actually observed and never claims success it did not verify.
- [x] **II. No Authority** — No admission logic exists in this feature.
- [x] **III. Disclosure** — Nothing in this feature presents itself as a person.
- [ ] **IV. Bilingual** — **Justified violation.** See Complexity Tracking.
- [x] **V. Confirm Before Saving** — Nothing is collected or stored.
- [x] **VI. No Sensitive Data** — Nothing is collected. No table exists to store
  anything in.
- [ ] **VII. Human Exit** — **Justified violation.** See Complexity Tracking.
- [x] **VIII. Simple Over Clever** — Flat structure, six files, no abstraction
  layer, no state management, no wrapper around the Supabase client beyond reading
  configuration. Every file is under 60 lines.
- [x] **IX. Testable By A Non-Developer** — Both routes are verified by opening
  them in a browser. The health page exists precisely so this check needs no
  terminal.
- [x] **X. Small Steps** — Three slices that each build, run and deploy on their
  own: the page, the health check, the configuration handling.

**Post-design re-check**: unchanged. The Phase 1 design introduced no new
dependency, no new route, and no new stored data. The two violations are the same
two, deferred on the same terms.

## Project Structure

### Documentation (this feature)

```text
specs/001-app-foundation/
├── plan.md              # This file
├── spec.md              # The specification
├── research.md          # Phase 0 — the four decisions and why
├── data-model.md        # Phase 1 — records that this feature stores nothing
├── quickstart.md        # Phase 1 — the deployment walkthrough, in plain English
├── contracts/
│   └── health-check.md  # Phase 1 — what /health promises to say
├── checklists/
│   └── requirements.md  # Specification quality checklist (all 16 pass)
└── tasks.md             # Created by /sp.tasks, not by this command
```

### Source Code (repository root)

Flat and obvious, as requested. No `src/`, no nested feature folders, no barrel
files. Someone opening this repository for the first time can see the whole
application at once.

```text
app/
├── layout.tsx           # Root layout, sets language and viewport
├── page.tsx             # The public page — the school name and one line
└── health/
    └── page.tsx         # The health check, readable by a human

lib/
├── env.ts               # Reads required settings; fails loudly when one is absent
└── supabase.ts          # Creates the client; checks the database is reachable

.env.example             # Already committed — every setting, no values
next.config.ts
tsconfig.json
package.json
```

**Structure Decision**: One Next.js application, App Router, no `src/` directory.
Two directories hold everything: `app/` for what a visitor sees, `lib/` for what
supports it. This matches the structure already documented in `CLAUDE.md`, and
leaves `app/api/` and `app/dashboard/` free for later features to add without
rearranging anything.

Note that `.claude/rules/frontend.md` and `.claude/rules/database.md` will begin
loading automatically once `app/` and `lib/supabase/` exist, and
`.claude/rules/api.md` once `app/api/` does.

## Complexity Tracking

> Two constitutional gates do not pass. Both are the same deferral, accepted
> deliberately by the maintainer during `/sp.specify` and recorded in the
> specification as FR-005 rather than left as an understanding.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Principle IV (Bilingual)** — the two lines on the public page exist in English only | The purpose of this feature is to prove the delivery pipeline works. The page's content is a placeholder; no parent is given its address. Translating placeholder text would be discarded when the real landing page is built. | Adding Urdu now was considered and rejected: the strings themselves are provisional, so the translation would be thrown away. FR-005 makes the debt a requirement with a hard trigger — the address is not shared with any parent until Urdu is present. |
| **Principle VII (Human Exit)** — the office phone number does not appear on the page | The office phone number is school data. `CLAUDE.md` and the constitution both forbid inventing it, and it has not been supplied. | Using a placeholder number was rejected outright — a wrong phone number on a school's site is worse than none. Delaying the whole feature until the number arrives was rejected because nothing else in it depends on that number. FR-005 carries the same hard trigger. |

Both are discharged by the same act: adding Urdu strings and the real office phone
number before the address reaches a parent. `/sp.analyze` will flag any later
feature that shares the URL without doing so.

## Architectural decisions

Four decisions were made in Phase 0. Full reasoning and rejected alternatives are
in [research.md](./research.md); summarised here because they shape every file
above.

1. **The health check is a page, not an API route.** Anything under `app/api/`
   inherits `.claude/rules/api.md`, which requires a shared secret header on every
   endpoint — that would make the health check impossible to open in a browser and
   break Principle IX.
2. **It uses the anonymous key, never the service role key.** Reachability needs no
   privilege, and the service key bypasses row level security.
3. **It probes the database's REST root, not a table.** This feature creates no
   tables, and FR-009 requires success on an empty database.
4. **Only two settings are required.** `.env.example` documents five; requiring the
   three not yet used would make deployment fail for a missing Retell value that
   nothing reads.

## Phase status

- **Phase 0 (Research)**: complete → [research.md](./research.md)
- **Phase 1 (Design & Contracts)**: complete → [data-model.md](./data-model.md),
  [contracts/health-check.md](./contracts/health-check.md),
  [quickstart.md](./quickstart.md)
- **Agent context update**: deliberately not run — see the note in research.md
  under "Tooling".
- **Phase 2 (Tasks)**: not started. `/sp.tasks` produces `tasks.md`.
