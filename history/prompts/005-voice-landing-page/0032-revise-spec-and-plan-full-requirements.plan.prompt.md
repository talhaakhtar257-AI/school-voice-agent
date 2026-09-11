---
id: 0032
title: Revise spec and plan for the full requirements list
stage: plan
date: 2026-09-11
surface: agent
model: claude-sonnet-5
feature: 005-voice-landing-page
branch: 005-voice-landing-page
user: talhaakhtar257-AI
command: (fuller requirements list, then two confirmations)
labels: [spec, plan, feature-005, rate-limiting, text-chat, sdd]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/005-voice-landing-page/spec.md (revised, 41 FRs)
  - specs/005-voice-landing-page/checklists/requirements.md (revised)
  - specs/005-voice-landing-page/plan.md (revised)
  - specs/005-voice-landing-page/research.md (D-009..D-012 added)
  - specs/005-voice-landing-page/data-model.md (voice_usage_daily/monthly added)
  - specs/005-voice-landing-page/contracts/web-call-api.md (capped reason, limit-check steps)
  - specs/005-voice-landing-page/quickstart.md (text chat, low-limit test, iOS Safari, slow-3G)
tests:
  - spec validation: 0 NEEDS CLARIFICATION, 41 FRs, 13 SCs
commits:
  - spec: 005 revised with the fuller requirements list
  - plan: 005 revised for rate limiting, text chat, logo, how-it-works
---

## Prompt

Build the public landing page where parents talk to the agent.

- School name and logo, headline in Urdu and English
- A large "Talk to Admission Office" button using the Retell web widget
- Explain why the microphone is needed BEFORE the browser asks
- A connecting state, then a clear listening or speaking state
- An always-visible End Call button
- Recording notice and privacy line before any conversation starts
- A visible line stating final admission decisions are made by school staff
- The office phone number, always visible
- A text chat fallback for parents who refuse the microphone
- A written FAQ below that works even if the AI is unavailable
- A three-step "how it works" strip

Protection:
- Maximum call length per visitor
- Maximum calls per visitor per day
- A monthly minutes cap. When reached, show the office number instead of failing

Must work on Android Chrome and iPhone Safari, on slow mobile data.

(followed by: "SDK, custom UI" and "Looks up published content" answering the
two clarifying questions this prompt raised)

## Response snapshot

Treated this as a revision of the already-planned feature 005, not a new
feature — it expanded the same page's requirements substantially, most
importantly moving rate limiting from Out of Scope (feature 005's own prior
assumption) into a required P2 user story.

Rewrote spec.md: added FR-002 (logo), FR-005 (decisions-by-staff line), FR-006
(how-it-works strip), FR-016-018 (text chat), FR-030-034 (the three usage
limits, all env-configurable, all falling back to the phone number/text
chat/FAQ), FR-039/040 (iOS Safari, slow-mobile first paint). 41 FRs total, 13
SCs, a fifth user story (US5, "the school's voice bill cannot run away").

Two of the new requirements had a real design fork, so asked before replanning
rather than guessing: (1) "Retell web widget" — the fixed drop-in widget cannot
support the custom mic-explainer timing, custom states, or custom End Call
control the same prompt also asked for, so this was really asking to confirm the
SDK; maintainer confirmed. (2) the text chat's nature — a second AI vs.
answering from published content; maintainer confirmed the latter, which lets it
reuse lib/content/simulate.ts (feature 003) directly with no new endpoint.

Rewrote plan.md, research.md (D-009 monthly reservation design, D-010 visitor
cookie, D-011 text-chat reuse, D-012 static content pieces), data-model.md
(voice_usage_daily, voice_usage_monthly), contracts/web-call-api.md (the
"capped" reason and the full limit-check sequence), and quickstart.md.

Surfaced explicitly rather than added quietly: the two usage tables are not on
`.claude/rules/database.md`'s documented table list. plan.md's opening section
and its Complexity Tracking table both flag this as needing the maintainer's
yes, alongside the SDK dependency and the placeholder logo.

## Outcome

- ✅ Impact: feature 005's spec and plan now match the full requirement set, including rate limiting, with two real design choices confirmed rather than assumed.
- 🧪 Tests: spec validation clean; no code yet.
- 📁 Files: spec, checklist, plan, research, data-model, one contract, quickstart all revised.
- 🔁 Next prompts: maintainer approves the SDK dependency, the two off-list tables, and the placeholder logo; then /sp.tasks; then build.
- 🧠 Reflection: reserving the monthly cap at call start rather than reconciling actual duration at call end is what lets the limit be a real guarantee without pulling in webhooks or a calls table this feature was built to avoid.

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): spec validation PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
