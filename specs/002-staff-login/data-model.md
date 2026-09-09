# Data Model: Staff Login

**Feature**: `002-staff-login` | **Date**: 2026-09-09
**Phase**: 1 — Design

## This feature creates no tables

Nothing here adds a table to the Supabase database, and nothing here adds a
migration. Accounts are held by **Supabase Auth**, which manages its own storage
in the `auth` schema. This document describes what exists so later features know
what they can rely on — not something to be built.

---

## Staff user

A member of the school office who may open the dashboard. Held by Supabase Auth
in `auth.users`.

| Field | Meaning | Used by this feature |
|---|---|---|
| `id` | The unique identifier Supabase assigns. A UUID. | Yes — identifies who is signed in. Later features will use it to record who actioned a lead. |
| `email` | The address the staff member signs in with. | Yes — typed at sign-in, shown on the dashboard so a person can see which account they are in. |
| `encrypted_password` | Managed entirely by Supabase. | Never read, never written, never logged by our code. |
| `created_at` | When the maintainer created the account. | No. |

**Rules**:

- Accounts are created by the maintainer in the Supabase dashboard. No code in
  this repository creates, edits or deletes an account (FR-005, assumption A-003).
- No name, phone number, role or any other profile field is stored. If a later
  feature needs staff names, that is a new table and a new decision.
- Email addresses are staff addresses, not parent data. They still never appear
  in a log line.

**Deliberately absent**: there is no `staff` or `profiles` table in the public
schema. Assumption A-001 says every account can do the same things, so there is
no role to store, and a table holding only a foreign key to `auth.users` would
carry no information.

---

## Session

Proof that a particular staff user signed in on a particular device. Created at
sign-in, destroyed at sign-out, and expiring on its own after a period Supabase
controls.

| Property | Detail |
|---|---|
| Where it lives | HTTP cookies on the staff member's device (FR-009). Never `localStorage` or `sessionStorage`. |
| Who writes it | The `@supabase/ssr` client, through the helpers in `lib/supabase/`. |
| Who reads it | `middleware.ts` on every request under `/dashboard`, and Server Components that need to know who is signed in. |
| Lifetime | Until sign-out, or until Supabase expires it. No "remember me" control (assumption A-007). |
| Scope | One device and browser. Signing in on a phone does not sign anyone in on the office laptop. |

**Rules**:

- The session token is never written to a log line and never rendered on screen.
- An expired or deleted session is treated exactly like no session: the person is
  sent to `/login`.

---

## Row Level Security

This feature reads and writes no table of ours, so there is no policy to add
here. FR-017 still applies to every table that later features introduce: RLS
enabled, and the Supabase **service key** used only in server-side code, never
shipped to the browser.

The two keys, so the distinction is on record:

- **Anon key** — safe in the browser. Used by the sign-in screen. Subject to RLS.
- **Service key** — bypasses RLS entirely. Server-side only. Never in a component
  that runs in the browser, never in a `NEXT_PUBLIC_` environment variable.
