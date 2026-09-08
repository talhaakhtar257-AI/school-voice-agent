# Contract: The health check

**Feature**: 001-app-foundation | **Route**: `/health` | **Date**: 2026-09-09

This feature exposes no API. The health check is a page a person opens, so its
contract is what it *says*, not a JSON schema. This document is what the page
promises — anyone changing `app/health/page.tsx` later must keep these promises.

## The one question it answers

> Can this application reach its database right now?

Nothing else. Not whether the database is fast, not whether it holds data, not
whether any table exists.

## The two answers it may give

### Reachable

Shown when the request to the database's REST root succeeds.

- States plainly that the database is reachable.
- Distinguishable from the failure state **without relying on colour alone** —
  `.claude/rules/frontend.md` requires colour to be paired with text or an icon.
- Shows the time the check ran, so a stale browser tab cannot be mistaken for a
  fresh result.

### Not reachable

Shown when the request fails, times out, or is rejected.

- States plainly that the database cannot be reached.
- Names **which setting to check** — `NEXT_PUBLIC_SUPABASE_URL` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` — because a setting *name* is already public in
  `.env.example` and is the one piece of information that makes the message
  actionable.
- Shows the time the check ran.

## What it must never reveal

This is the hard constraint, and it is where FR-007 and FR-008 pull against each
other: the most useful diagnostic message is usually the most revealing one.

The resolution is a line worth stating precisely — **name the setting, never the
value.** `NEXT_PUBLIC_SUPABASE_URL` is safe to print; what it contains is not.

The page MUST NOT display, in either state:

- the database URL, hostname, region, or project reference
- any key, token or password, whole or partial
- the underlying error message, error code, or stack trace
- HTTP status codes or any other detail of the failed request

A stranger who finds this address learns exactly one bit: the system is healthy, or
it is not. `.claude/rules/api.md` already forbids returning database errors or
stack traces to a caller; this page holds to the same standard even though it is
not an API route.

## Behaviour that must hold

| Condition | Required behaviour |
|---|---|
| Database reachable, no tables exist | Reports **reachable**. FR-009 — an empty database is a healthy one. |
| Database unreachable | Reports **not reachable**. Never falls back to a cached or assumed success. |
| A required setting is missing | Reports **not reachable** and names the missing setting. Does not crash the page. |
| The check is slow | Bounded by a timeout, so the page always answers rather than hanging. FR-007 and NFR-002. |
| The page is opened by a stranger | Same two answers, same withheld details. There is nothing to protect because nothing is revealed. |
| Viewed at 360px width | Fully readable, no sideways scrolling. FR-003 applies to every page. |

## How it is verified

By opening it. That is the point — Principle IX makes the browser the acceptance
surface, and this page exists so that checking the database needs no terminal.

1. With correct settings, open `/health` → it reports reachable.
2. Change `NEXT_PUBLIC_SUPABASE_URL` to a wrong value, restart, open `/health` →
   it reports not reachable, and names the settings to check.
3. Read the failure output closely → no URL, no key, no error code, no trace.
4. Open `/` while the database is unreachable → the public page still shows both
   its lines. FR-004: a blank screen looks broken.
