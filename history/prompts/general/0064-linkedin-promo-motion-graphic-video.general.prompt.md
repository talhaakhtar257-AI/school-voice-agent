---
id: 0064
title: LinkedIn promo motion-graphic video
stage: general
date: 2026-10-07
surface: agent
model: claude-opus-5-5
feature: none
branch: 011-tester-feedback
user: talhawork257
command: none
labels: ["marketing", "video", "remotion", "linkedin"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - C:/Users/scs/Desktop/alnoor-promo-video/ (new, separate project outside this repo)
  - history/prompts/general/0064-linkedin-promo-motion-graphic-video.general.prompt.md
tests:
  - npx tsc --noEmit in alnoor-promo-video (pass)
  - review stills of all 11 scenes rendered and checked by eye
  - full MP4 render checked with ffprobe
---

## Prompt

iwanna create motion graphic video for this whole project for linkdin to get clients use mcp and calude chrome  and create shocing and comprehensive video

## Response snapshot

Planned in plan mode, then built a 60-second, 4:5 portrait (1080x1350, 30 fps) motion-graphic promo with Remotion. It lives in a new folder, `Desktop/alnoor-promo-video`, outside the app repo, so the app's build and dependencies are untouched.

The user chose the options in the plan: Remotion, 4:5 at about 60 s, Al-Noor branding marked as a demo school, and captions with music supplied by the user.

The story runs as follows:
1. A parent calls at 10:47 PM and nobody answers.
2. A glitch cut: "So they call the next school."
3. Green reveal of the Al-Noor shield.
4. An Urdu-to-English call that quotes the real demo Class 6 fees.
5. The lead is captured.
6. Emails go to the parent and to the school.
7. The dashboard.
8. Live takeover.
9. The knowledge loop.
10. The guardrails.
11. Call to action.

The Supabase MCP was used read-only on the `content` table: Class 6 is Rs 10,500 a month with a Rs 30,000 admission fee, so the video matches the live site. No lead data was read.

Claude in Chrome was not connected during the session, so the planned fallback was used: still images of every scene were rendered and reviewed. Layout fixes followed from that review.

## Outcome

- ✅ Impact: a postable LinkedIn MP4 and cover image, with no made-up statistics, no real parent data, and phone numbers kept obviously fake.
- 🧪 Tests: the type check passes; all scenes were reviewed visually from stills; the render was verified with ffprobe.
- 📁 Files: a new Remotion project, `alnoor-promo-video` (scenes, components, theme, demo content, CTA config); this PHR.
- 🔁 Next prompts: the user fills in their name in `src/cta.ts`, optionally adds `public/music.mp3`, checks the Urdu lines, and re-renders.
- 🧠 Reflection: keeping the video outside the app repo avoided adding dependencies to the app.

## Evaluation notes (flywheel)

- Failure modes observed: Chrome extension not connected; the first layouts left empty space and the cursor missed its target, both caught by stills review.
- Graders run and results (PASS/FAIL): tsc PASS; still review PASS after fixes.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add a real Urdu voice clip from a test call to the Conversation scene.
