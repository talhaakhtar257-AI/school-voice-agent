# Research: School Content System

**Feature**: `003-content-system` | **Date**: 2026-09-10
**Phase**: 0 — Outline & Research

The stack is fixed by the constitution. What follows are the choices this feature
makes and the assumptions it takes where the spec left room. Each assumption is
something the maintainer should confirm or correct.

---

## D-001 — Storage: one JSON document per version

**Decision**: `content` holds two rows — `channel = 'draft'` and `channel =
'live'` — each with a single `doc jsonb` column holding the whole content
structure (Facts, Policies, FAQs, Escalation Topics). Not normalised tables.

**Rationale**: FR-013 and SC-002 demand that a reader see one complete version or
the other, never a mixture. With one row per version, publishing is one `UPDATE`
and a reader's `SELECT` is atomic — the requirement is true by construction
rather than by careful transaction handling across many tables. FR-024 (restore
by editing from the history) works because a history row can carry the entire
prior document. The spec states content volume is small and edited occasionally,
so losing per-item SQL queryability costs nothing here. Constitution VIII favours
the simple model.

**Alternatives considered**:
- *Normalised tables* (`facts`, `faqs`, `escalation_topics`, …) each with a
  `status` column — rejected. Publish becomes a multi-table transaction, "never a
  mixture" needs serialisable isolation or careful ordering, and the schema is
  larger for no benefit at this scale.
- *A row per content item with a `version` integer* — rejected for the same
  atomicity reasons, plus it complicates "show me the whole previous version".

---

## D-002 — Publishing is an atomic Postgres function

**Decision**: A `SECURITY DEFINER` function `publish_content(actor_id, actor_label)`
performs, in one transaction: read `draft.doc`; if it equals `live.doc`, do
nothing and return a "nothing to publish" signal; otherwise insert a
`content_history` row capturing `doc_before` (current live), `doc_after` (the
draft), the actor and the time, then copy `draft.doc` into `live.doc`. Called
from a Next.js server action that first runs the readiness check.

**Rationale**: FR-010 (never publish as a side effect), FR-021 (every publish
recorded), and the "press Publish twice" edge case all point to a single guarded
operation. Doing it in the database keeps the record and the copy inseparable —
they cannot half-happen. The server action owns the human-facing parts: the
confirmation dialog and the validation message.

---

## D-003 — Draft-vs-live concurrency: optimistic, no locking

**Decision**: The editor reads `draft.updated_at` when it loads and sends it back
with a save. The save is rejected if the stored value has moved on, and the
staff member sees "the draft changed since you opened it — reload to see the
current version" (FR-027).

**Rationale**: The spec's edge case is explicit: the second save must not
silently erase the first. A single timestamp check is the smallest thing that
satisfies it. Locking would be more machinery and a worse experience (a staff
member could hold a lock and go to lunch).

---

## D-004 — The test tool matches keywords; it does not call a model

**Decision**: `lib/content/simulate.ts` tokenises the typed question, scores each
draft FAQ (question + answer text) and each escalation topic against the tokens,
and returns the best match: the FAQ's draft answer, or — if an escalation topic
wins — its hand-off wording shown as "this goes to a person" (FR-019). Every
result carries the FR-018 notice that it is a simulation and the live agent may
answer differently. If nothing scores above a threshold, the tool says it could
not find draft content for that question.

**Rationale**: The spec's own example of the test tool's value is catching a fee
with a missing digit — that needs the tool to *surface the relevant draft
content*, not to reason like the real agent. The live agent runs on Retell,
configured outside this codebase; a local model would be a different system with
its own answers, and the spec assumption already warns that a simulation mistaken
for the real thing is the risk. A lookup is honest about being a lookup. It also
avoids adding an LLM SDK and an API key, which would be a dependency decision.

**Alternative considered**: *Call Claude via the Anthropic API to answer from the
draft content.* More faithful, but a new dependency, a new secret, a per-call
cost, and still not the real agent. Deferred to its own conversation if the
school wants it.

---

## D-005 — Validation with `zod`

**Decision**: `lib/content/schema.ts` defines the `ContentDoc` shape once as a
`zod` schema and derives the TypeScript type from it. The API route parses its
(empty) input and the stored document through it; the editor's save path and the
publish-readiness check reuse it.

**Rationale**: `.claude/rules/api.md` states plainly: "Validate every field with
Zod before touching the database." So Zod is already the project's sanctioned
validation tool — this feature is the first to need it. It is not yet in
`package.json`; adding it is expected rather than a fresh choice, but the
maintainer should still say yes.

---

## D-006 — Shared secret: reuse `RETELL_WEBHOOK_SECRET`

**Decision**: `GET /api/content` reads an `X-Agent-Secret` request header and
compares it to `process.env.RETELL_WEBHOOK_SECRET`. Missing or wrong → 401,
nothing else happens (FR-015, SC-006).

**Rationale**: The spec speaks of "the agreed shared secret" (one), and
`.claude/rules/api.md` of "a shared secret header" (one) for every
agent-facing endpoint. `.env.example` already carries `RETELL_WEBHOOK_SECRET`.
Reusing it keeps one secret to manage. A dedicated `CONTENT_API_SECRET` is a
one-line change if the maintainer prefers isolation per endpoint.

---

## D-007 — The `Facts` group: structured, language-neutral values

**Decision**: `facts` in the document is:
- `classes`: an ordered list of class names (strings such as "Nursery",
  "Class 6"). A class name is a label, not a sentence — stored once.
- `feePerClass`: a map from class name to a number (PKR).
- `ageCriteriaPerClass`: a map from class name to a structured range
  `{ minYears, maxYears }`, formatted for display ("5–6 years" / the Urdu
  equivalent) rather than stored as prose.
- `admissionDates`: a list of `{ label, startDate, endDate }` where `label` is a
  short neutral tag ("Session 2027 intake"); dates are ISO.
- `officeHours`: a list of `{ days, opens, closes }` (e.g. `Mon–Fri`, `08:00`,
  `14:00`), formatted for display.

**Rationale**: FR-006 lists all of these as stored once and not translated. The
risk is that a few carry a scrap of prose (a date's label, a day range). Keeping
them structured — numbers, enums, ISO strings — and formatting at display time
keeps the "one copy" rule honest and lets each language's rendering differ
(digits and separators) without a second stored value.

**Open for the maintainer**: whether `admissionDates.label` and any day-range
text should themselves be bilingual. Default here: neutral tags, formatted for
display. Easy to change in `data-model.md` before tasks.

---

## D-008 — Admin UI language

**Decision**: The surrounding admin interface (buttons, section headings, table
headers, validation messages *about the form*) is English. The content being
edited is bilingual because that is the feature. Feature-002 dashboard screens
were left English-primary for the same reason.

**Rationale**: Constitution IV binds *parent-facing* sentences. Staff using the
editor are not parents. Making the chrome bilingual is work with little payoff
and it competes for space at 360 px. The maintainer can ask for a bilingual
chrome later; the strings live in one file (`lib/strings/content-admin.ts`) so it
is a contained change.

---

## D-009 — No test framework

**Decision**: Manual verification by clicking, following `quickstart.md`.

**Rationale**: Consistent with feature 002 (its research D-006) and Constitution
IX. Adding a framework is an unapproved dependency and a workflow change.
