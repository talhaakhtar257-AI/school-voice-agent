# Research: Faster answers, lower cost, and both made visible

**Feature**: 013-call-speed-cost
**Date**: 2026-11-03
**Spec**: [spec.md](./spec.md)

All measurements below come from the 3 November 2026 test call on the new Retell
account (call `call_…19559a8`, 300s, 10 measured turns) and from timing the live
production endpoints from Karachi. Nothing here is estimated.

## D-001: Where the delay actually is

**Decision**: Treat the per-turn work our own code does as the target. Leave the
speaking model, the language model and every Retell setting alone.

**Rationale**: Measured on the test call:

| Stage | p50 | p90 | max |
|---|---|---|---|
| ASR (noticing the parent stopped) | 583ms | 750ms | 1,448ms |
| LLM (deciding what to say) | 738ms | 1,647ms | 2,210ms |
| TTS (starting to speak) | 603ms | 712ms | 764ms |
| **End to end** | **2,279ms** | **2,913ms** | **3,233ms** |

The obvious suspect — the language model — is the *fastest* part at its median.
Its p90 and max are where the overrun lives, and those are the turns that call
our API: the call made 6 tool calls. `GET /api/content?format=brief` timed from
Karachi against production, five consecutive warm requests:
1.53s, 1.11s, 1.07s, 1.14s, 0.67s.

**Alternatives considered**: Switching to a faster model (Claude 5.5 Haiku at
$0.0032/min, gpt-5-mini at $0.008/min). Rejected *for this feature*: the model's
median is already 738ms, so it is not the bottleneck, and changing it demands
re-running the 50 Urdu scenarios. It stays on the separate tuning track.

## D-002: How to make the school content fast to fetch

**Decision**: Cache the rendered brief with `unstable_cache` from `next/cache`,
tagged, with `revalidate: 60`, and call `revalidateTag` when staff publish.

**Rationale**: The route is currently `dynamic = "force-dynamic"` and reads the
whole content document plus a full Zod parse on every call. `unstable_cache`
persists across requests *and* deployments in Next's own data cache, so a
cold function instance can serve the brief without a Supabase round trip — which
matters because the demo case is one call after a long idle period. `revalidate:
60` satisfies SC-005 on its own, so a missed tag invalidation delays a published
fee change by at most a minute rather than serving it forever.

**Alternatives considered**:
- **`use cache` directive.** This is the Next 16 replacement and
  `unstable_cache` is marked deprecated in its favour. Rejected for now: it
  requires `cacheComponents: true` in `next.config.ts`, which changes caching
  semantics for every route in the project. That is a far larger change than
  this feature needs and would breach Principle X (small steps). Recorded as a
  known follow-up; the bundled guide
  `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`
  documents the `unstable_cache` path as supported for projects in our position.
- **A module-level variable with a TTL.** Simpler still, and genuinely boring,
  but it lives inside one function instance. It would do nothing for the cold
  start, which is the case that actually risks Retell's 5s tool timeout.
- **Pushing content into Retell's knowledge base.** Rejected: $0.005/min, and it
  breaks Principle I, which requires every fact to come from the live `content`
  table rather than a copy held elsewhere.

## D-003: How to stop slow work blocking a reply

**Decision**: Use `after()` from `next/server` to run the email send and the
other post-reply work after the response has been sent.

**Rationale**: `after()` is a stable, documented API in this Next version
(`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/after.md`),
is explicitly intended for "side effects that should not block the response",
works in Route Handlers, and runs even if the response errored. It is the
boring, framework-supported answer; the alternative is a floating promise that
the platform may kill as soon as the response is flushed.

Two callers:
- `POST /api/send-details` answers Retell immediately with the sentence for the
  agent to speak, then sends the email in `after()`. Measured saving: up to 8s
  of mid-sentence silence.
- `POST /api/retell/webhook` acknowledges Retell, then does the emails in
  `after()`, keeping the handler inside Retell's 10s limit so it stops retrying
  the whole path.

**Note on duration**: `after()` runs within the route's max duration, so the
email still needs to finish inside the function's budget — it is moved off the
parent's critical path, not made unlimited. A failure inside `after()` must be
logged, since nothing is waiting to observe it (FR-006).

**Alternatives considered**: A queue table polled by a cron job. Rejected as
disproportionate — Principle VIII — for two emails that already succeed, and it
would add a moving part the maintainer would have to understand and monitor.

## D-004: Making the enquiry save safe to repeat

**Decision**: Make `POST /api/leads` idempotent by ignoring a request whose
meaningful fields are unchanged from what is already stored for that call, and
collapse the existing 3-5 serial queries into fewer round trips.

**Rationale**: The test call shows the model firing the tool twice with identical
arguments, back to back:

```
-> save_lead
-> save_lead
   result: {"id":"adf73a82…","updated":true}
   result: {"id":"adf73a82…","updated":true}
```

Four invocations, two distinct states. This is the model's behaviour, not a loop
in our code, so it cannot be fixed by prompt wording alone and must be made
harmless at the endpoint. Comparing against stored values also fixes the
separate race in which the parent's typed form and the agent's first save hit the
same row at once.

**Constitution constraint**: Principle V still governs *what* may be stored —
an unconfirmed name stays empty and the lead still saves. Idempotency changes
only whether a repeat write happens, never which fields are allowed.

**Alternatives considered**: A per-call lock. Rejected: it would serialise the
very calls we are trying to speed up, and the existing partial unique index on
`leads(retell_call_id)` already guarantees one row per call.

## D-005: Where speed and cost figures come from

**Decision**: Store Retell's own `latency` and `call_cost` values on the `calls`
row, read from the `get-call` response the webhook already fetches.

**Rationale**: The webhook calls `GET /v2/get-call/{id}` on every event and
discards both objects. `latency` carries `e2e`, `llm`, `tts` and `asr`, each with
p50/p90/p95/max/num; `call_cost` carries `combined_cost` in cents plus a
per-product breakdown. Using the provider's own numbers means the figures on the
Health screen match what Retell bills and reports, and costs no extra request.
Timing it ourselves would measure something different and invite two numbers that
disagree.

**What to store**: the end-to-end p50 and p90 in milliseconds, and the combined
cost in cents. Not the full `values` array — that is one entry per turn and
belongs to Retell, not to this product's reporting.

**Alternatives considered**:
- Timing our own handlers. Rejected: it would not include ASR, model or speech
  time, so it could not answer "how long does the parent wait?".
- Backfilling earlier calls. Rejected: Retell's data storage settings expire old
  calls, and the old account's calls are unreachable from the new key. Earlier
  calls read as not measured.

## D-006: Why the surcharge appeared, and what bounds it

**Decision**: Measure the brief against a known budget, show staff how full it
is while they edit, warn before they cross it, and record anything left out.

**Rationale**: `llm_token_surcharge` read $0.00 across the old account's 8 calls
and $0.03 (rate $0.0600/min) on this one. The difference is the per-turn context:
the brief measured **5,927 bytes against the 6,000-character budget** in
`lib/content/agent-brief.ts:14`, i.e. already full. That budget caps *imported
documents only* — FAQs, programs, classes, process and documents text, and the
escalation wording emitted in both languages, are all uncapped. So a staff member
adding FAQs after handover makes every turn of every future call slower and
dearer, silently, with nobody measuring.

**Why not simply trim harder**: Principle I. Quietly dropping the newest FAQ
makes the assistant *wrong*, not merely slower, and the parent would be told the
school has no answer when it does. Staff must be told instead, and what was left
out must be recorded.

**Alternatives considered**: Raising the budget. Rejected: it moves the problem
and increases the surcharge, which is the thing being bounded.

## D-007: Keeping the first answer honest when the cache is empty

**Decision**: When the brief cannot be produced at all, the tool returns a
response that routes the parent to the office, and the failure is logged.

**Rationale**: The current route is also the only thing standing between the
agent and answering with no school content, which the prompt's "FIRST ACTION OF
EVERY CALL" rule makes load-bearing. Caching reduces how often this happens but
must not change what happens when it does: Principle I forbids answering as
though the school had no fees or classes, and Principle VII requires a route to a
human. A cached brief must never be served as "no content"; absent content and
failed retrieval are different answers.

## Open question carried to planning

**The content-overflow behaviour** (Assumptions in spec.md) is the decision most
worth challenging: warn staff and record the omission, versus refusing to publish
past the budget. This plan takes the warn-and-record route because refusing to
publish would block the school from recording true information about itself,
which is worse than a slower call. Flagged for the maintainer.
