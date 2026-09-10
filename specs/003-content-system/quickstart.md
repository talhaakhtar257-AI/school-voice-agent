# Quickstart: Verifying the School Content System

**Feature**: `003-content-system` | **Phase**: 1

How to check this feature by clicking, with no code reading. Run these against
the Vercel preview for `003-content-system` (or `npm run dev` locally). Sign in
first with the feature-002 staff account.

---

## Part 0 — Setup

1. The migration has been run against Supabase (a task confirms this with you
   first). `content` has two rows; `content_history` is empty.
2. `RETELL_WEBHOOK_SECRET` is set in `.env.local` and in Vercel (Preview).
3. Sign in at `/login`. You are on `/dashboard`.

## Part 1 — The editor saves a draft, not live (US2)

| # | Do this | You should see |
|---|---|---|
| 1 | Open `/dashboard/content` | Four sections: Facts, Policies, FAQs, Escalation Topics. Each loads (loading state), then shows current draft values or a designed empty state. |
| 2 | Change the fee for one class | The field accepts digits only; letters are rejected with a message. |
| 3 | Click Save | A "draft saved" confirmation. Nothing says "published". |
| 4 | Reload the page | Your change is still there, marked as draft. |
| 5 | In another browser, call `GET /api/content` with the secret (see Part 5) | The fee is the **old** value — the draft was never published. |

## Part 2 — Bilingual gaps are caught (US2 scenario 3, FR-008)

| # | Do this | You should see |
|---|---|---|
| 1 | Add a new FAQ. Fill the English question and answer. Leave the Urdu answer blank. | |
| 2 | Click Save | Saving a draft is allowed with gaps — but the field shows it is incomplete. |
| 3 | Click Publish | Publishing is **refused**. The message names the field ("FAQ … answer") and the missing language ("Urdu"). |
| 4 | Fill the Urdu answer, Save, Publish again | Now the publish confirmation appears. |

## Part 3 — The test tool (US3)

| # | Do this | You should see |
|---|---|---|
| 1 | Open `/dashboard/content/test` | A box to type a question. A visible notice: this is a simulation; the live agent may answer differently. |
| 2 | Change a fee in the draft (Part 1), come back, ask "what is the fee for Class 6?" | The answer reflects the **draft** figure, not live. |
| 3 | Ask about a discount | The result shows the question being handed to a person — the escalation hand-off wording — never a discount answer. |
| 4 | After testing, call `GET /api/content` | Live content is unchanged. The history has no new row. Testing published nothing. |

## Part 4 — Publishing is deliberate (US4)

| # | Do this | You should see |
|---|---|---|
| 1 | Make a draft change. Click Publish. | A dialog listing exactly what will change (old value → new value), for each changed field. |
| 2 | Click Cancel | Nothing published. Live unchanged. |
| 3 | Click Publish again, then Confirm | "Published" confirmation. |
| 4 | Call `GET /api/content` with the secret | Live content now matches what the draft was. |
| 5 | Press Publish once more with no new changes | "Nothing to publish." No new history row. |

## Part 5 — The agent endpoint (US1)

Replace `<url>` with the preview URL.

```bash
# 1. No secret -> refused
curl -i https://<url>/api/content
# expect: HTTP/1.1 401

# 2. Wrong secret -> refused
curl -i https://<url>/api/content -H "X-Agent-Secret: wrong"
# expect: HTTP/1.1 401

# 3. Correct secret -> the live content as JSON
curl -s https://<url>/api/content -H "X-Agent-Secret: <the secret>" | jq
# expect: { "published": true, "content": { ... } }
#   - compare "content" against what the editor shows as live: they match
#   - no draft-only edits appear
#   - archived FAQs / escalation topics are absent
```

Before anything has ever been published, step 3 returns `{ "published": false }`
— not an error, not an empty object.

## Part 6 — History (US4 scenarios 3 and 5)

| # | Do this | You should see |
|---|---|---|
| 1 | Open `/dashboard/content/history` | Most recent publish first. Each row: when, which staff member, and a summary of what changed. |
| 2 | Open one record | The full previous content is shown — enough to read a value and type it back into the draft. |
| 3 | Try to edit or delete a history row | There is no control to do so. |

## Part 7 — Removing an escalation topic (FR-026)

| # | Do this | You should see |
|---|---|---|
| 1 | On the Escalation Topics section, click Remove on one | A confirmation dialog with the same weight as Publish — not a quiet delete. |
| 2 | Confirm | The topic disappears from the list and from `/api/content` after the next publish, but Part 6 still shows its history. |

## Part 8 — On a phone (FR-029)

1. Open the preview URL on a phone (or Chrome DevTools device mode at 360 px).
2. Sign in, open `/dashboard/content`.
3. Check: no sideways scrolling; every field reachable; Save and Publish buttons
   are full-width and at least 44 px tall; Urdu fields render right-to-left.

## Part 9 — Build gate (Constitution IX, X)

```bash
npm run build      # must pass
npx tsc --noEmit   # must be clean
```
