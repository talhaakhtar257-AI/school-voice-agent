# Quickstart: checking feature 013 by clicking

**Feature**: 013-call-speed-cost | **Date**: 2026-11-03

No code reading. Everything below is checkable by clicking, listening, or
looking at a screen — Principle IX. Each slice can be checked on its own, so you
do not have to wait for the whole feature.

## Before you start

Nothing new to install and no new environment variable. One database migration
adds three columns to `calls`; it adds nothing you have to fill in.

The figures to beat, measured on the 3 November 2026 call:

| | Now |
|---|---|
| Typical wait after you stop speaking | 2.28s |
| Worst wait (9 turns in 10) | 2.91s |
| Cost per minute | $0.1846 |
| Five-minute call | $0.92 |

## Slice A — the first answer stops waiting

1. Open the live site and start a call.
2. Ask your **first** question ("what are the fees for class 6?").
3. **What to notice**: the first answer used to arrive about a second later than
   the ones after it. It should now feel the same as the rest.
4. Now test freshness: in the dashboard, change a fee and **publish** it. Within
   a minute, start a new call and ask about that class. **The agent must say the
   new figure.** If it says the old one, this slice has failed.

## Slice B — asking for details no longer freezes the call

1. During a call, say "can you email me the fee details?".
2. **What to notice**: the agent says it is sending them and **keeps talking**.
   Before, it went silent for up to 8 seconds mid-sentence.
3. Check your inbox — the email still arrives.
4. Ask a fourth time in the same call. The agent should say it has already sent
   them and offer the office number, and no fourth email arrives.

## Slice C — one enquiry, not four

1. Make a call that mentions, in this order: the class you want, the child's
   age, and that it is a transfer from another school.
2. Open **Dashboard → Leads**.
3. **What to notice**: exactly **one** new enquiry, holding all three facts.
   Not two rows, and nothing missing.
4. Also check the pre-call form's name and phone survived — they must not have
   been overwritten by the agent's own saves.

## Slice D — you can finally see speed and cost

1. Finish a call.
2. Open **Dashboard → Health**.
3. **What to notice**: two figures that have never been there before — the
   average reply delay, and what calls cost. Beside them, **how many calls the
   figures are based on**.
4. If the average is above 1.5 seconds, the screen says so **in words**, not
   just a colour.
5. Check the empty state: pick a date range with no calls. You should see a
   designed message explaining that figures appear once calls are answered — not
   a blank box and not a zero.
6. Check it at phone width (360px): the figures must still read.

## Slice E — adding content warns you

1. Open **Dashboard → Content** and start adding FAQs.
2. **What to notice**: an indicator showing how full the agent's working budget
   is.
3. Keep adding until you cross it. You should be **warned before publishing**,
   told plainly that calls past this point get slower and more expensive.
4. Publish anyway. The agent must still answer correctly from the content that
   fits, and what was left out must show up for you to see — not vanish.

## The whole-feature check

One five-minute call covering a fees question in English, an admission question
in Urdu, a request for emailed details, and a question the agent cannot answer.
Then:

| Check | Where | Pass |
|---|---|---|
| Typical wait | Health screen | under 1.5s |
| Worst wait | Health screen | under 2.5s |
| Cost of the call | Health screen | less than $0.92 for five minutes |
| One enquiry, complete | Leads | yes |
| Transcript in Urdu script | Lead details | renders correctly |
| Office number visible | every parent screen, no scrolling | yes |
| Call not retried | the call completes once | yes |

## If something looks wrong

- **The agent says an old fee after you published**: slice A's invalidation.
  Worst case it corrects itself within a minute; if it does not, the cache is not
  being invalidated.
- **The agent says it cannot reach the school's information**: that is the
  correct behaviour when content cannot be read — it must never answer as though
  the school has no fees. Check the database is reachable on the Health screen.
- **Health figures say "not measured"**: Retell reports no timings for very
  short calls, and calls from before this feature shipped have none. Expected.
- **It still feels slow**: roughly a quarter of a second is Karachi-to-US network
  time, because Retell runs only in the United States. No code change removes it,
  and Retell's own dashboard figure excludes it — so the parent always feels a
  little more delay than the number shows.
