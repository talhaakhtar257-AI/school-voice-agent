# Research: Staff Login

**Feature**: `002-staff-login` | **Date**: 2026-09-09
**Phase**: 0 — Outline & Research

The Technical Context in `plan.md` contains no unresolved NEEDS CLARIFICATION
items. The stack is fixed by the constitution, and the seven open product
decisions are recorded as stated assumptions in `spec.md`. What follows are the
technical choices this feature makes and why.

---

## D-001 — Session storage: cookies, via `@supabase/ssr`

**Decision**: Store the Supabase session in cookies using the `@supabase/ssr`
package, with three thin wrappers in `lib/supabase/`.

**Rationale**: `CLAUDE.md` forbids `localStorage` and `sessionStorage`. The
default `@supabase/supabase-js` browser client stores the session in
`localStorage`, so using it alone would break a project rule on the first line of
code.

Cookies are also the only option that works with the rest of the design. Next.js
middleware and Server Components run before or outside the browser and can read a
cookie; neither can read `localStorage`. Route protection therefore has to be
cookie-based to happen before a dashboard screen renders.

**Alternatives considered**:

- *`@supabase/supabase-js` alone with `localStorage`* — rejected. Breaks the
  project rule, and makes middleware protection impossible.
- *A hand-rolled cookie session* — rejected. Writing token refresh and expiry by
  hand is exactly the kind of clever code Constitution VIII forbids, and getting
  it subtly wrong is a security bug rather than a visible one.
- *NextAuth / Auth.js* — rejected. A third authentication system layered over
  Supabase Auth, which the constitution already fixes as the auth provider. More
  dependency, more concepts, no benefit here.

---

## D-002 — Route protection in the proxy, not per page

> Naming: Next.js 16 renamed the Middleware file convention to **Proxy**. This
> decision was written as "middleware"; the file is `proxy.ts` and the export is
> `proxy`. The reasoning below is unchanged — "middleware" and "proxy" refer to
> the same mechanism.

**Decision**: A single `proxy.ts` at the repository root decides who may
open anything under `/dashboard`, and refreshes the session on each request.

**Rationale**: SC-002 requires that no dashboard content appears even briefly for
a signed-out visitor. Middleware runs before rendering, so the redirect happens
before any dashboard component executes. It also means a dashboard screen added
by a later feature is protected because it sits under `/dashboard`, not because
its author remembered to add a check.

**Alternatives considered**:

- *A session check at the top of every dashboard page* — rejected. Protection
  becomes something each new page must remember, and the first forgotten check is
  a silent hole.
- *A client-side redirect after the page loads* — rejected. Dashboard content
  renders first and is briefly visible, which fails SC-002 outright.

---

## D-003 — The sign-in screen lives at `/login`, not `/dashboard/login`

**Decision**: The sign-in screen is at `/login`.

**Rationale**: It keeps the protection rule absolute — *everything* under
`/dashboard` needs a session, with no exception. A login screen nested inside the
protected area would need a carve-out in middleware, and a carve-out is where a
mistake hides.

**Alternatives considered**:

- *`/dashboard/login` with a middleware exception* — rejected for the reason
  above.

---

## D-004 — Identical wording for an unknown email and a wrong password

**Decision**: Both failures produce the same bilingual message.

**Rationale**: FR-006. If the two differed, anyone who can reach the login page
could test email addresses one at a time and learn which belong to school staff.
That is a list worth having for a phishing attempt, and it costs nothing to
prevent.

**Alternatives considered**:

- *"No account with that email"* — rejected. More helpful to a staff member,
  and more helpful to everyone else.

---

## D-005 — Bilingual strings in one file per feature

**Decision**: `lib/strings/staff-login.ts` holds every Urdu and English string
for this feature, side by side.

**Rationale**: Constitution IV requires both languages everywhere. Keeping the
pair adjacent in one file means a missing Urdu translation is visible while
reading the file, rather than discovered on screen by the client. It also avoids
adding an internationalisation library, which would be a dependency and a set of
concepts this phase does not need.

**Alternatives considered**:

- *`next-intl` or a similar library* — rejected for this phase. A dependency and
  a new mental model for two screens' worth of text.
- *Strings inline in each component* — rejected. Nothing then shows you that a
  translation is missing.

---

## D-006 — Manual verification, no test framework

**Decision**: No automated tests in this feature.

**Rationale**: The specification requests none, and Constitution IX defines done
as *checkable by clicking* by a non-developer. `quickstart.md` lists the exact
click-through, including how to reach each error state deliberately. Adding a test
framework would also be an unapproved dependency.

**Alternatives considered**:

- *Playwright end-to-end tests* — reasonable later, but it is a dependency
  decision and a workflow change that belongs to its own conversation, not
  smuggled in with the login screen.
