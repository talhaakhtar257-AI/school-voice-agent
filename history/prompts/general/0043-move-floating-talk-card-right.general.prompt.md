---
id: 0043
title: Move floating talk card to right
stage: general
date: 2026-09-15
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhaakhtar257-AI
command: none
labels: ["landing-page", "floating-talk", "rtl", "deploy", "domain"]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - components/landing/landing.module.css
 - components/landing/floating-talk.tsx
 - CLAUDE.local.md (local notes, not committed)
tests:
 - npm run build (pass)
 - https://alnoor-school-admissions.vercel.app returns 200 with content
 - school-voice-agent-2usd.vercel.app redirects 307 to the new link
 - Retell public key allows https://alnoor-school-admissions.vercel.app
---

## Prompt

Why this talk button on my left side, it should be on the right side. And after you change it, I will test the h i

## Response snapshot

The floating talk card was placed at the inline start, which is the left side in English, because of an earlier request. It now uses inline-end: right in English, and it mirrors to the left in Urdu.

Also verified the domain rename:
- The correctly spelled production link, alnoor-school-admissions.vercel.app, loads content.
- Retell allows the new link.
- The old -2usd link forwards to it.

The build passed. The change was committed on main and pushed to deploy, and the local notes were updated with the new link.

## Outcome

- ✅ Impact: the floating Talk card matches the user's expectation. There is one professional production link.
- 🧪 Tests: build passes; domain and Retell checks pass.
- 📁 Files: 2 code files changed; local notes updated.
- 🔁 Next prompts: user tests the deployed site end to end (call, lead, gap list, login, Urdu, class finder).
- 🧠 Reflection: side placement is a preference that flipped; logical properties made it a one-word change that stays correct in Urdu.

## Evaluation notes (flywheel)

- Failure modes observed: none.
- Graders run and results (PASS/FAIL): build PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): confirm on the live site at 1366px and at 1500px or wider (the compact and full card sizes).
