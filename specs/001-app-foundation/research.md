# Phase 0 Research: Application Foundation

**Feature**: 001-app-foundation | **Date**: 2026-09-09

The specification left no `[NEEDS CLARIFICATION]` markers — the three ambiguities
were settled with the maintainer before it was written. What remained were four
design questions the specification deliberately did not answer, because it
describes outcomes rather than tools.

---

## Decision 1 — The health check is a page, not an API endpoint

**Decision**: Build the health check as `app/health/page.tsx`, a server-rendered
page. Do not put it under `app/api/`.

**Rationale**: `.claude/rules/api.md` applies to `app/api/**` and opens with:
"Every endpoint checks a shared secret header before doing anything else. Reject
with 401 if it is missing or wrong." That rule exists because those endpoints are
called by the Retell voice agent and must be treated as untrusted.

A health check placed under `app/api/` would inherit that rule and become
impossible to open in a browser without setting a header — which no browser address
bar can do. That directly breaks Principle IX (Testable By A Non-Developer) and
FR-006, which requires the check be "reachable in a browser".

Making it a page sidesteps the conflict honestly rather than carving out an
exception to a security rule. The rule stays absolute for the endpoints it was
written for.

**Alternatives considered**:

- *An API route exempted from the shared-secret rule.* Rejected. Exceptions to a
  security rule are how security rules die. The first exemption is always
  reasonable; the fifth is a hole.
- *An API route returning JSON, plus a page that fetches it.* Rejected as clever
  over simple, which Principle VIII forbids. It doubles the surface to prove one
  fact, and the page would still need the header problem solved.
- *A page that also returns JSON when asked.* Rejected for the same reason. Nothing
  in this feature consumes JSON; no monitoring exists yet. When something does need
  a machine-readable check, that is a feature with its own specification.

---

## Decision 2 — Use the anonymous key, never the service role key

**Decision**: The health check authenticates with `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
`SUPABASE_SERVICE_ROLE_KEY` is not read anywhere in this feature.

**Rationale**: Proving that a database is reachable requires no privilege at all.
The anonymous key is designed to be public and is constrained by row level
security; the service role key bypasses row level security entirely and can read
and write every table. Using the more dangerous key for the least sensitive task
inverts least privilege.

The constitution permits the service key "only in server-side routes" — permission,
not encouragement. Nothing here needs it, so nothing here reads it.

There is a second benefit: because the anonymous key is already exposed to the
browser by design, a health page that uses it cannot leak anything a visitor could
not already obtain.

**Alternatives considered**:

- *The service role key, for a more thorough check.* Rejected. It would let the
  check verify things this feature does not need verified, at the cost of putting
  the most powerful credential in the most publicly reachable route.
- *A dedicated restricted database role.* Rejected as premature. It is the right
  answer for a system with real tables and real traffic, and it is worth
  revisiting; today there are no tables to restrict access to.

---

## Decision 3 — Probe the database's REST root, not a table

**Decision**: Check reachability with a plain HTTPS request to the Supabase REST
root, sending the anonymous key as the `apikey` header, and treat a successful
response as proof. Do not query a table.

**Rationale**: FR-009 is explicit — the check must report success when the database
is reachable but contains no tables. This feature creates none, and
`.claude/rules/database.md` forbids adding any without asking first.

The REST root responds without reference to any table, so the check is correct on
an empty database and stays correct after tables are added. It also gives an
unambiguous signal: a success means the request reached Supabase, was authenticated
by the key, and got an answer. Nothing else produces that combination.

**Alternatives considered**:

- *Query a table that does not exist and treat "relation does not exist" as proof
  of reachability.* This does work — reaching that error means the connection and
  authentication both succeeded. Rejected under Principle VIII: reading a specific
  PostgreSQL error code as a success signal is exactly the kind of cleverness a
  learning maintainer would not be able to modify safely.
- *Create a small table purely to check.* Rejected. `database.md` requires
  agreement before any table is created, the table would exist only to be checked,
  and every future migration would have to carry it.
- *Rely on the Supabase client constructing without error.* Rejected as worthless —
  the client constructs happily from a wrong URL and a wrong key. It proves the
  strings are non-empty, not that anything is reachable.

---

## Decision 4 — Require two settings, keep the other three optional

**Decision**: `lib/env.ts` requires `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, and fails loudly naming whichever is absent. The
three other entries already listed in `.env.example` —
`SUPABASE_SERVICE_ROLE_KEY`, `RETELL_WEBHOOK_SECRET` and
`NEXT_PUBLIC_RETELL_AGENT_ID` — remain documented but are not required.

**Rationale**: FR-011 requires failing loudly on a missing *required* setting. If
all five were required, deployment would fail because a Retell value is missing —
a value nothing in this feature reads, from a service not yet connected. The
maintainer would be blocked by an error about a component that does not exist yet,
which is precisely the kind of confusion Principle VIII exists to prevent.

`.env.example` keeps all five, because FR-012 asks it to document the full set. It
describes what the project will need; `env.ts` enforces what it needs today.

**Alternatives considered**:

- *Require all five.* Rejected for the reason above.
- *Trim `.env.example` down to two.* Rejected. FR-012 wants the complete picture
  discoverable, and the file is already committed and correct.
- *Warn on the missing three instead of ignoring them.* Rejected as noise. A
  warning that fires on every single run until the Retell feature ships teaches the
  maintainer to ignore warnings.

---

## Tooling

**The agent context script was not run.** Step 3 of Phase 1 calls for
`.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude`. Reading
it first showed this would be counterproductive here:

- It targets the repository's root `CLAUDE.md`.
- Its merge logic inserts only beneath headings named `## Active Technologies` and
  `## Recent Changes`. This project's `CLAUDE.md` is hand-written and has neither,
  so every line would pass through unchanged and no technology entry would be
  added — the content result is a no-op.
- It rewrites the file with `Set-Content -Encoding utf8`, which on Windows
  PowerShell 5.1 adds a UTF-8 byte order mark and normalises line endings.

The net effect would be a byte-order mark and line-ending churn on a carefully
curated file, in exchange for nothing. `CLAUDE.md` already documents the stack
under its own `## Stack` heading, so the information the script exists to add is
present and current.

Should the maintainer want the script to work, the fix is to add the two headings
it looks for. That is a change to a file the maintainer curates, so it is offered
rather than made.

**A second script bug, already met.** `create-new-feature.ps1` line 267 calls
`Join-Path` with three path arguments, a form that exists only in PowerShell 6 and
later. On Windows PowerShell 5.1 it throws, after the branch and spec directory
are created but before `history/prompts/<branch>/`. That directory was created by
hand during `/sp.specify`. It will fail the same way on every future feature until
the call is nested.
