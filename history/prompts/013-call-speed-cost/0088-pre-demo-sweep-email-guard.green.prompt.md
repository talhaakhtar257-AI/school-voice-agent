---
id: 0088
title: Pre-demo sweep and the unconfigured-email guard
stage: green
date: 2026-11-10
surface: agent
model: claude-opus-5
feature: 013-call-speed-cost
branch: main
user: talhawork257
command: /sp.phr
labels: ["pre-demo", "audit", "email", "send-details", "constitution", "limits", "cost", "verification"]
links:
  spec: specs/013-call-speed-cost/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - lib/email/send-details-flow.ts
 - history/prompts/013-call-speed-cost/0088-pre-demo-sweep-email-guard.green.prompt.md
tests:
 - npm run build (passed)
 - npx tsc --noEmit (passed)
 - npm run lint (1 pre-existing warning in lib/content/schema.ts, untouched)
 - POST /api/send-details with a wrong secret -> HTTP 401 (auth control holds)
 - POST /api/send-details with Retell's wrapped payload and a non-existent call id -> no-email, nothing sent
 - Supabase: leads, content, voice_usage_daily, voice_usage_monthly inspected
 - Retell: all 9 billed calls summed for remaining trial credit
---

## Prompt

of the office call, is there something remaining to you have to do? if it's something remaining to do it and complete it and fix all of things and go with the perfection, we have to show the client at this week. So we don't want more issues and bugs that client go away. And the number is still 0 to 1 0 0 0 0 0 0. So we will keep it right now because we need to show the demo after the royal right. We will get the client number and add it. So don't worry about the number.

continue

## Outcome

- Impact: **Found and fixed one real bug that only a demo would have exposed.**
  `planDetailsSend` checked the database and the per-call limit but never
  checked that an email provider exists. With no `BREVO_API_KEY` or
  `RESEND_API_KEY` it still returned `ready`, so the route answered the agent
  with "the email is on its way", the agent said exactly that to the parent, and
  the real send — which happens afterwards in `after()` — failed into a server
  log nobody reads. The assistant would have stated something untrue to a
  parent, which Constitution I forbids, and the only symptom is an email that
  never arrives. The check now runs first and returns the existing `error`
  branch, which apologises and offers the office number.
  Running it *first* was deliberate beyond correctness: it makes production
  testable without sending mail to anyone. A request naming a call id that does
  not exist answers `no-email` when a provider is configured and `error` when
  one is not, because the configuration check precedes the lookup.
  **`send_details` has never fired on any real call**, so this entire path was
  unexercised going into the demo.
  Swept the rest and found it sound, which is worth recording as much as the
  bug: leads save correctly (the latest 129s call shows `save_lead` firing, and
  every call has phone, email, consent, summary and duration); `get_school_content`
  no longer fires at all, confirming the preloaded brief; published content is
  12,593 characters with no placeholder text; the per-visitor daily cap is a
  non-issue (the busiest visitor ever used 3 of 10); `NEXT_PUBLIC_SITE_URL` is
  read without being set but falls back to the production URL; and the
  `unanswered` page that appeared to have no empty state is a redirect to
  `knowledge`, which has one.
  **Remaining trial credit: $7.82 of $10 — about 50 minutes.** Enough for the
  demo, but it is the one thing that can stop a call dead mid-sentence.
- Tests: build, type check and lint pass. The auth control on `send-details`
  returns 401 on a wrong secret, and the safe probe returns `no-email` without
  sending.
- Files: `lib/email/send-details-flow.ts` only.
- Next prompts: confirm the Brevo key is set in Vercel — the probe answers this
  once the guard is certainly deployed. Then the owner's call. Deferred by the
  owner: the placeholder office number, which stays until the client gives the
  real one. Still open: the cheap-voice comparison by ear, prefetching the gate
  to remove ~1.2s of connect wait, and the `agent_version` pin.
- Reflection: asked "is anything remaining", the temptation is to invent work or
  to add the connect-time optimisation. With a client demo this week the better
  reading is "find what will embarrass me", which means auditing the paths
  nobody has exercised rather than improving the ones that work. The email path
  had never run once — and it was broken in the specific way that is invisible
  until a real person waits for a real email. I also deliberately did **not**
  do two things that were tempting: splitting the 445-line `call-provider.tsx`
  (CLAUDE.md wants files under ~200 lines, but restructuring the call flow the
  week of a demo is the wrong risk), and the gate prefetch (it trades a stray
  reservation for ~1.2s and changes the riskiest code path in the app).

## Evaluation notes (flywheel)

- Failure modes observed: two small ones of mine, both caught by the build.
  I imported `isEmailConfigured` when the export is `emailConfigured` — the
  function name was assumed rather than read, and Turbopack caught it in one
  line. And I flagged `app/dashboard/unanswered/page.tsx` as missing an empty
  state on the strength of a keyword count before opening it; it is six lines
  and a redirect. Counting keywords is not reading the file.
- Graders run and results (PASS/FAIL): PASS — build, type check, lint; 401 on a
  bad secret; `no-email` on a non-existent call with nothing sent.
- Prompt variant (if applicable): none. Agent version 11 untouched this turn.
- Next experiment (smallest change to try): on the demo call, ask her to email
  the fees. If the parent receives it, the path is proven; if she offers the
  office number instead, the guard is doing its job and the Brevo key is
  missing in Vercel.
