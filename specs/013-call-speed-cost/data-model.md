# Data Model: Faster answers, lower cost, and both made visible

**Feature**: 013-call-speed-cost | **Date**: 2026-11-03

Only one table changes, by two nullable columns. No table is created, no column
is dropped or renamed, and no existing row needs rewriting.

## `calls` — two new columns

Existing columns (unchanged): `id`, `created_at`, `updated_at`,
`retell_call_id`, `status`, `outcome`, `started_at`, `ended_at`,
`duration_seconds`, `language`, `transcript`, `summary`, `visitor_id`,
`parent_email`, `lead_id`, `school_email_sent_at`, `parent_email_sent_at`,
`email_error`, `usage_released_at`.

| New column | Type | Null | Meaning |
|---|---|---|---|
| `reply_delay_ms` | `integer` | yes | Retell's end-to-end p50 for this call, in milliseconds: how long the parent typically waited after they stopped speaking |
| `reply_delay_p90_ms` | `integer` | yes | Retell's end-to-end p90, so the worst-case target in SC-001 can be reported, not just the typical one |
| `cost_cents` | `integer` | yes | `call_cost.combined_cost` — the whole call's cost in US cents, as Retell bills it |

Three columns, not two — the p90 is what the owner's complaint was actually
about, so reporting only the median would hide the fault being fixed.

**Validation**: all three `check (… >= 0)`, matching how `duration_seconds` and
`call_duration_seconds` are already constrained.

**Why nullable**: Retell reports no `latency` object for a call with no measured
turns — four of the old account's eight calls were too short — and `call_cost`
can be absent. Null means *not measured*, which FR-013 requires be excluded from
averages rather than counted as zero. This also honours the product rule that
every field except the timestamp may be empty.

**Why no backfill**: the old account's calls are unreachable from the new API
key, and Retell expires call data per the account's storage settings. Calls
before this ships read as not measured. Stated in spec Assumptions.

**Why not the full `values` array**: Retell's `latency.e2e.values` holds one
entry per turn. Storing it would put a growing array on every row to answer a
question nobody asked; the percentiles Retell already computes are what the
Health screen shows.

**Units**: milliseconds and cents, stored once as integers and formatted for
display. This is the same rule Principle IV applies to fees — a figure is
language-neutral, lives in one field, and is never duplicated per language or
pre-formatted into a string.

**No personal data**: these three figures describe timing and money. FR-016
forbids this feature writing a phone number anywhere new.

## Derived, not stored: period figures

The Health screen's figures are computed on read, in a new
`lib/dashboard/call-metrics.ts`, in the same shape as the existing
`lib/dashboard/period-stats.ts`:

| Field | Derivation |
|---|---|
| `measuredCalls` | count of calls in the period where `reply_delay_ms is not null` |
| `totalCalls` | count of calls in the period |
| `averageReplyDelayMs` | mean of `reply_delay_ms` over measured calls, else null |
| `worstReplyDelayMs` | max of `reply_delay_p90_ms` over measured calls, else null |
| `totalCostCents` | sum of `cost_cents` over calls that report one |
| `averageCostCents` | `totalCostCents` / calls reporting a cost, else null |
| `overTarget` | `averageReplyDelayMs > 1500` |

`measuredCalls` is shown beside the figures, so one call is never presented as a
trend (FR-013). Every field is nullable so the empty state is a real state and
not a zero (FR-015).

## Not a table: the cached brief

The cached brief is a cache entry, not data. It holds exactly what
`GET /api/content?format=brief` already returns, keyed by nothing (there is one
live document) and tagged so publishing can invalidate it.

| Property | Value |
|---|---|
| Cache tag | `agent-brief` |
| Time to live | 60 seconds |
| Invalidated by | `revalidateTag("agent-brief")` after a successful publish |
| Source of truth | the `content` table, `channel = 'live'` — unchanged |

The live `content` row remains the only source of any fact the agent states
(Principle I). The cache can serve a stale brief for at most a minute; it can
never serve content that was not published.

## Not a column: the content budget

The brief's size is measured at render time and compared against the existing
`KNOWLEDGE_BUDGET` in `lib/content/agent-brief.ts:14`. It is computed, shown to
staff while editing, and not stored — a stored copy would be a second version of
a number that can be derived, which is exactly what Principle IV warns against.

What *is* recorded, when content overflows the budget, is the omission itself, so
that staff can see what the agent is not being told. It goes to the existing
`unanswered_questions` path rather than a new table: that table already exists to
record "the agent could not answer this", and content left out of the brief is
the same fact arriving from a different direction.

## State transitions

None. The three new columns are written once, when the call's final webhook event
is handled, and never updated afterwards. Writing them is idempotent: a repeated
webhook delivery writes the same values (FR-009, SC-009).
