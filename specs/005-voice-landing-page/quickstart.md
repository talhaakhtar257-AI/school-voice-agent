# Quickstart: Verifying the Parent-Facing Voice Landing Page

**Feature**: `005-voice-landing-page` | **Phase**: 1

How to check this feature by clicking and with `curl`. Run against the Vercel
preview for this branch, or `npm run dev`. No sign-in — this page is public.

---

## Part 0 — Setup

1. The `leads` migration has been run (a task confirms it with you first).
2. `RETELL_WEBHOOK_SECRET` is set in `.env.local` (a dev value is already there).
3. For the **live voice** parts (5, 6): `NEXT_PUBLIC_RETELL_PUBLIC_KEY` and
   `NEXT_PUBLIC_RETELL_AGENT_ID` are set and a Retell agent exists. Without them,
   Parts 1–4 and 7 still pass and the talk button shows the "not available"
   fallback.
4. Publish some content in `/dashboard/content` so the FAQ and the talk button
   have something to work with.

## Part 1 — The page loads and puts a person within reach (US1, US4)

| # | Do | Expect |
|---|---|---|
| 1 | Open `/` | The school name and logo are at the top; a bilingual headline; the "Talk to Admission Office" button is the biggest thing on screen, above the fold. |
| 2 | Look without scrolling | The recording notice, the privacy line, the "staff make the final decision" line, and the office phone number are all visible. |
| 3 | Scroll a little | The three-step "how it works" strip, above the talk area or just below it. |
| 4 | Read the page | Every sentence is in English and Urdu; Urdu reads right to left. |
| 5 | Tap the office phone number on a phone | It offers to call. |

## Part 1b — The text chat (US2)

| # | Do | Expect |
|---|---|---|
| 1 | Find the text chat entry point (near the button, or shown after refusing the microphone) | A box to type a question, labelled as answering from the school's published information — not a live agent. |
| 2 | Type a question the published content answers (e.g. a fee) | The matching published answer appears. |
| 3 | Ask about a discount or other escalation topic | It points to the office, not an answer. |
| 4 | Ask something unrelated to anything published | A plain "couldn't find an answer to that" message, with the phone number nearby. |
| 5 | Check the `leads` table and the browser's network tab afterwards | Nothing was stored or sent anywhere — the text chat runs entirely in the browser. |

## Part 2 — The written FAQ survives JavaScript failing (US2)

| # | Do | Expect |
|---|---|---|
| 1 | Open `/`, scroll to the answers | The published FAQ questions and answers, both languages, matching what is live in `/dashboard/content`. |
| 2 | In Chrome DevTools, disable JavaScript, reload `/` | The FAQ text and the office phone number are still there and readable. The talk button may be inert — that is expected. |
| 3 | Re-enable JavaScript | The talk button works again. |

## Part 3 — Nothing published (US1 scenario 5, SC-010)

| # | Do | Expect |
|---|---|---|
| 1 | Un-publish everything (or test before the first publish), open `/` | The talk button is disabled with a plain line: the assistant has nothing to share yet, please call the office. The phone number is right there. |
| 2 | `curl -s -X POST http://localhost:3000/api/retell/web-call` | `{ "reason": "no-content" }` |

## Part 4 — The enquiry endpoint (US3)

```bash
SECRET=<the value of RETELL_WEBHOOK_SECRET>

# 1. no secret -> refused
curl -i -X POST http://localhost:3000/api/leads
# expect: HTTP/1.1 401

# 2. full enquiry, phone NOT confirmed -> stored, phone left empty
curl -s -X POST http://localhost:3000/api/leads \
  -H "X-Agent-Secret: $SECRET" -H "Content-Type: application/json" \
  -d '{"parentName":"Ahmed","parentNameConfirmed":true,"phone":"03001234567","phoneConfirmed":false,"classWanted":"Class 6","language":"ur"}'
# expect: { "ok": true, "id": "..." }

# 3. empty enquiry -> still stored
curl -s -X POST http://localhost:3000/api/leads \
  -H "X-Agent-Secret: $SECRET" -H "Content-Type: application/json" -d '{}'
# expect: { "ok": true, "id": "..." }

# 4. a CNIC field is sent -> ignored, rest stored
curl -s -X POST http://localhost:3000/api/leads \
  -H "X-Agent-Secret: $SECRET" -H "Content-Type: application/json" \
  -d '{"parentName":"Sara","parentNameConfirmed":true,"cnic":"42101-1234567-1"}'
# expect: { "ok": true, "id": "..." }
```

Then check the `leads` table (Supabase dashboard or a query):
- Row 2 has `parent_name = 'Ahmed'`, `phone` **NULL**, `status = 'new'`.
- Row 3 has only `id`, timestamps, `status = 'new'`.
- Row 4 has `parent_name = 'Sara'` and **no `cnic` column exists**.
- No row was overwritten — each `curl` added one.

## Part 4b — The three usage limits (US5) — set low limits in `.env.local` for this test

Set `VOICE_MAX_CALL_SECONDS=20`, `VOICE_MAX_CALLS_PER_VISITOR_PER_DAY=2`,
`VOICE_MONTHLY_CAP_MINUTES=1`, restart the dev server.

| # | Do | Expect |
|---|---|---|
| 1 | Start a call and let it run past 20 seconds | It ends on its own; the page says the call time is up and shows the phone number. |
| 2 | Start and end two calls today, then try a third | Refused: "reached today's limit," with the phone number, text chat, and FAQ all still offered. |
| 3 | `curl -s -X POST http://localhost:3000/api/retell/web-call` a third time | `{ "reason": "capped" }` |
| 4 | With the monthly cap at 1 minute and the per-call length at 20 seconds, start two calls (different visitor cookies, e.g. two browsers) | The second is refused once the reservation would exceed the 1-minute cap — likely on the very first or second call, depending on the numbers you set. |
| 5 | Reset the env values to real ones afterwards | — |

Restore normal values (e.g. `VOICE_MAX_CALL_SECONDS=300`,
`VOICE_MAX_CALLS_PER_VISITOR_PER_DAY=5`, `VOICE_MONTHLY_CAP_MINUTES=500`, or
whatever the school agrees) before deploying.

## Part 5 — A live conversation (US1, US4) — needs Retell configured

| # | Do | Expect |
|---|---|---|
| 1 | Open `/`, tap Talk | An explanation of why the microphone is needed appears **before** the browser's permission prompt. |
| 2 | Allow the microphone | State changes to connecting, then to listening. |
| 3 | Ask "what is the fee for Class 6?" in English | State shows the assistant speaking; the answer matches published content; the transcript shows both turns. |
| 4 | Ask the same in Urdu | The reply is in Urdu; the transcript renders it right to left. |
| 5 | Ask "are you a real person?" | It says it is an AI. |
| 6 | Ask about a discount | It points you to the office rather than answering. |
| 7 | Tap End Call | The conversation stops on the first tap; the page returns to its start state. |
| 8 | Tap Talk again during a call (step 2–6) | Nothing happens — only one conversation runs. |

## Part 6 — The enquiry reaches the school (US3, end to end) — needs Retell configured

1. Have a full conversation, giving a name, a child's name, a class, and a phone
   number; confirm each when the assistant reads it back.
2. End the call.
3. Check the `leads` table — a new row with what you confirmed, `status = 'new'`.

## Part 7 — On a phone (FR-038, FR-039, SC-002)

1. Open `/` on a real Android phone (Chrome) and a real iPhone (Safari) if you
   have both; otherwise Chrome DevTools device mode at 360 px is the minimum.
2. Check: no sideways scrolling; the logo, the Talk button, the recording
   notice, and the office phone number all visible without scrolling; the
   transcript (if a call is running) does not push the End Call button off
   screen; Urdu reads right to left.
3. On iPhone Safari specifically: the microphone prompt appears only after a
   tap (not on page load); the assistant's first reply is audible without a
   second tap.
4. On a throttled "Slow 3G" network profile (DevTools → Network): the school
   name, logo, headline, button, and notices all appear without waiting for
   Retell or the content check to finish (FR-040).

## Part 8 — Build gate

```bash
npm run build      # must pass
npx tsc --noEmit   # must be clean
```
