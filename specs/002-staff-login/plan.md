# Implementation Plan: Staff Login

**Branch**: `002-staff-login` | **Date**: 2026-09-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-staff-login/spec.md`

## ⚠️ Blocking Prerequisite — read before starting

**There is no application in this repository yet.** No `package.json`, no `app/`
directory, no `lib/`, no `components/`. The repository holds project
documentation only: the constitution, rules, templates, specifications and prompt
history.

Feature `001-app-foundation` is the feature that creates the Next.js application.
It has a specification and a plan on the `001-app-foundation` branch, but **no
`tasks.md` and no code**, and none of it has been merged into `main` or into this
branch.

Every task in this feature assumes a running Next.js application with Supabase
configured. **Feature 001 must be implemented and merged before task T001 here
can begin.** This plan is written now so it is ready, not because work can start.

## Summary

School office staff sign in with an email address and a password and reach a
dashboard nobody else can open. Sessions live in cookies rather than browser
storage, because the project rules forbid `localStorage`. Route protection runs in
Next.js middleware so no dashboard screen renders even briefly for a signed-out
visitor. The public landing page is explicitly excluded and stays open. Every
string on the sign-in screen, including errors, exists in Urdu and English.

The approach is deliberately the plainest one Supabase supports: no roles, no
sign-up, no password reset. See the seven assumptions in `spec.md`.

## Technical Context

**Language/Version**: TypeScript; Next.js App Router (exact version fixed by feature 001)
**Primary Dependencies**: `@supabase/supabase-js`, `@supabase/ssr` — **both need maintainer approval, see below**
**Storage**: Supabase Auth owns the account. No table in this codebase. Session in cookies.
**Testing**: Manual verification by clicking. The specification requests no test framework.
**Target Platform**: Vercel; browsers on low-end Android phones and office laptops
**Project Type**: Web application — single Next.js project
**Performance Goals**: Sign-in completes in under 30 seconds on a phone (SC-001). No latency budget set.
**Constraints**: No `localStorage` or `sessionStorage`. Service key never reaches the browser. Usable at 360px width. All text bilingual.
**Scale/Scope**: Under twenty staff accounts. Two screens plus their loading, empty and error states.

No unresolved NEEDS CLARIFICATION items. The seven open decisions are recorded as
stated assumptions in `spec.md` rather than as unknowns, and are listed under
Follow-ups below.

## Dependency Decision — needs maintainer approval

Constitution VIII and `CLAUDE.md` both say no dependency is added without the
maintainer's agreement. This feature needs two.

| Package | Why it is needed | Can it be avoided? |
|---|---|---|
| `@supabase/supabase-js` | The official Supabase client. Reaching Supabase Auth without it means hand-writing HTTP calls and token refresh. | Not realistically. The constitution fixes the stack to Supabase. |
| `@supabase/ssr` | Keeps the session in **cookies** instead of `localStorage`, and refreshes it in middleware and Server Components. | No. `@supabase/supabase-js` alone defaults to `localStorage`, which the project rules forbid. |

Both are published by Supabase and are the documented path for Next.js. Feature
001's plan may already introduce `@supabase/supabase-js`; if so, only
`@supabase/ssr` is new here.

**Implementation cannot begin until the maintainer approves both.**

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answered against `.specify/memory/constitution.md` v1.0.0. Four principles govern
the voice agent's conversation with parents and have no surface in a staff
sign-in screen. They are marked not applicable with a reason rather than ticked
falsely.

- [—] **I. Honesty** — *Not applicable.* This feature states no facts about the school and reads no `content` table. It shows a form.
- [—] **II. No Authority** — *Not applicable.* Nothing here confirms an admission, offers a discount or promises a seat.
- [—] **III. Disclosure** — *Not applicable.* No agent speaks to anyone in this feature.
- [x] **IV. Bilingual** — Every string exists in Urdu and English, including loading, wrong-credentials, network-failure and cookies-blocked messages. All strings live in one file so a missing translation is visible there. `dir="auto"` on text containers.
- [—] **V. Confirm Before Saving** — *Not applicable.* No parent phone number or name is captured; the only input is a staff member's own email and password.
- [x] **VI. No Sensitive Data** — No CNIC or B-Form is touched. Passwords and session tokens are never written to a log line.
- [x] **VII. Human Exit** — The office phone number appears on the sign-in screen, reachable without scrolling at 360px. Assumption A-006: the screen is staff-facing but publicly reachable, so a parent arriving by mistake still gets a way out.
- [x] **VIII. Simple Over Clever** — No custom auth, no session abstraction, no role system. Two official Supabase packages, both pending approval. Every planned file is under 200 lines; the largest is the sign-in form at roughly 120.
- [x] **IX. Testable By A Non-Developer** — All four states of the sign-in screen are reachable by clicking: empty, loading, wrong password, network failure. The dashboard home renders a designed empty state. Everything works at 360px.
- [x] **X. Small Steps** — Thirty-six tasks, each leaving the project building and runnable. Nothing outside this feature is refactored.

**Result**: Passes, subject to dependency approval. Complexity Tracking is empty.

**Post-design re-check**: Passes unchanged. The design added no abstraction, no
dependency beyond the two declared, and no file over 200 lines.

## Project Structure

### Documentation (this feature)

```text
specs/002-staff-login/
├── spec.md              # written
├── plan.md              # this file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output — how to verify by clicking
└── tasks.md             # Phase 2 output (/sp.tasks)
```

No `contracts/` directory. This feature exposes no endpoint that the voice agent
or any other system calls; sign-in is handled by Supabase Auth over its own
client library. There is no contract of ours to document.

### Source Code (repository root)

```text
middleware.ts                      # route protection; refreshes the session

app/
├── login/
│   └── page.tsx                   # the sign-in screen
└── dashboard/
    ├── layout.tsx                 # shared shell; holds the sign-out button
    └── page.tsx                   # dashboard home, empty state for now

components/
├── login-form.tsx                 # email + password form, all four states
├── sign-out-button.tsx
└── office-phone.tsx               # office number, reusable by later screens

lib/
├── supabase/
│   ├── client.ts                  # browser client, cookie-based
│   ├── server.ts                  # server client for Server Components
│   └── middleware.ts              # session refresh helper used by middleware.ts
└── strings/
    └── staff-login.ts             # every Urdu and English string for this feature
```

**Structure Decision**: A single Next.js App Router project at the repository
root, matching the structure already written into `CLAUDE.md`. The sign-in screen
sits at `/login` rather than inside `/dashboard`, so "everything under
`/dashboard` requires a session" stays a rule with no exception carved into it —
easier to verify and harder to get wrong.

## Key Decisions and Rationale

**Route protection in middleware, not in each page.** One file decides who may
enter, so a dashboard screen added later is protected by default rather than by
its author remembering. A signed-out visitor is redirected before any dashboard
component renders, which is what SC-002 requires.

**Cookies, not `localStorage`.** Forced by the project rules, and also the better
choice: middleware and Server Components can read a cookie and cannot read
`localStorage`, so protection happens before rendering rather than after.

**One strings file per feature.** `lib/strings/staff-login.ts` holds both
languages side by side, so a missing Urdu translation is visible in the file
rather than discovered on screen.

**Identical message for unknown email and wrong password.** FR-006. Different
messages would let anyone with the login page discover which email addresses have
staff accounts.

## Risks

- **Feature 001 does not exist yet.** The largest risk, and not a technical one.
  Nothing here can be built until the application does. Flagged at the top.
- **Cookie behaviour differs between local development and Vercel.** Sign-in can
  work on `localhost` and fail on a deployed preview. The verification steps check
  the deployed preview specifically rather than assuming local success carries over.
- **Supabase Auth may not be enabled, with no account created.** The first task
  creates an account by hand before any code is written, so credentials exist to
  test with.

## Follow-ups

- Confirm or correct the seven assumptions in `spec.md`.
- Approve `@supabase/supabase-js` and `@supabase/ssr`.
- Decide whether feature 001 is implemented first, or this feature pauses.
