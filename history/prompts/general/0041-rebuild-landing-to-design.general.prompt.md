---
id: 0041
title: Rebuild landing page faithfully to design
stage: general
date: 2026-09-15
surface: agent
model: claude-opus-5
feature: none
branch: 009-landing-rebuild
user: talhaakhtar257-AI
command: none
labels: ["landing-page", "design", "content-system", "call-window", "class-finder", "sample-content"]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - lib/content/schema.ts
 - lib/content/validate.ts
 - lib/content/diff.ts
 - lib/content/simulate.ts
 - lib/strings/content-admin.ts
 - components/content/profile-editor.tsx
 - components/content/programs-editor.tsx
 - components/content/timings-editor.tsx
 - components/content/facts-editor.tsx
 - components/content/policies-editor.tsx
 - components/content/content-editor.tsx
 - components/content/doc-view.tsx
 - lib/landing/admissions.ts
 - lib/landing/class-finder.ts
 - lib/strings/landing-hero.ts
 - lib/strings/landing-content.ts
 - lib/strings/landing-call.ts
 - components/landing/call/call-provider.tsx
 - components/landing/call/call-overlay.tsx
 - components/landing/call/call-button.tsx
 - components/landing/call/call.module.css
 - components/landing/icons.tsx
 - components/landing/announcement-bar.tsx
 - components/landing/site-header.tsx
 - components/landing/language-toggle.tsx
 - components/landing/hero.tsx
 - components/landing/agent-card.tsx
 - components/landing/stats-band.tsx
 - components/landing/about-section.tsx
 - components/landing/programs-section.tsx
 - components/landing/fees-section.tsx
 - components/landing/class-finder.tsx
 - components/landing/admission-timeline.tsx
 - components/landing/process-documents-section.tsx
 - components/landing/faq-section.tsx
 - components/landing/ask-band.tsx
 - components/landing/section-state.tsx
 - components/landing/site-footer.tsx
 - components/landing/floating-talk.tsx
 - components/landing/landing.module.css
 - components/landing/hero.module.css
 - components/landing/sections.module.css
 - components/landing/features.module.css
 - components/voice/how-it-works.tsx
 - components/voice/mic-explainer.tsx
 - components/voice/text-chat.tsx
 - app/page.tsx
 - deleted: components/landing/talk-card.tsx, components/landing/talk-card.module.css, components/voice/talk-panel.tsx, lib/strings/landing-sections.ts
 - database: content draft row replaced with obviously-fake sample content (not published)
tests:
 - npx tsc --noEmit (pass)
 - npm run lint (pass, 1 pre-existing-style warning for _drop in schema.ts)
 - npm run build (pass)
 - GET / returns 200 with all 10 section ids present
 - NOT RUN: visual Chrome check (browser extension disconnected); live call; 360px check
---

## Prompt

you distroy landing page & 'c:\Users\scs\Downloads\index (3).html' accrding to this we have to make it our with  more features how you create it again with perfection like this index is generic we have build it with ourinformation  withmore feature

(follow-up) Continue from where you left off.

## Response snapshot

Why the page looked broken:
- The published content was keyboard-mash test data.
- The earlier port had dropped major design sections.
- The content system could not hold what the design shows.

The user chose:
- Obviously fake sample values.
- Extending the content editor.
- The design hero card plus a floating compact card.
- All four features: call pop-up, class finder, admission dates banner and timeline, and a stats band with about section.

What was built:
- **Part A — content system:**
  - New fields: profile, programs, admission fee, school timings and figures.
  - Validation, change summary, text-chat matching, new editor sections and the history view.
- **Part B — landing page rebuilt section by section to match the design:**
  - Announcement bar, sample ribbon and header.
  - Two-column hero with the green agent card, figures strip, how it works, about and visit.
  - Program cards, two-column fee table and class finder.
  - Process steps with admission timeline, documents checklist, timings and ask card.
  - FAQ accordion and the dark type-your-question band.
  - Three-column footer, floating talk card and phone Talk button.
  - The single-call pop-up window, with timer, bubbles, Mute and End call. The call logic was moved unchanged from talk-panel into CallProvider.
- **Part C — sample content:** written to the draft row only. The user must press Publish.

## Outcome

- ✅ Impact: the landing page matches the design's structure and look, and is driven by extended content. Four new features are added. The live site changes only after the user publishes the sample draft.
- 🧪 Tests: build, tsc and lint pass. The page renders all sections over HTTP. Visual, RTL and 360px checks are pending, because the Chrome extension was disconnected.
- 📁 Files: about 30 new or rewritten landing files, 8 content-system files, and 4 deleted.
- 🔁 Next prompts:
  - User publishes the sample draft and reviews in the browser at desktop, in Urdu and at phone width.
  - Try a live call in the pop-up.
  - Replace the sample content and office phone before the demo.
  - Merge 009 (which includes 008) into main.
  - Update specs 003 and 005 via /sp.specify.
  - Update the Retell agent prompt to mention programs and timings.
- 🧠 Reflection: the earlier port optimised for rules over resemblance. The user judged the page by how it looks, so this rebuild follows the design section by section and meets the rules inside that structure.

## Evaluation notes (flywheel)

- Failure modes observed:
  - Program icons stored as an array of JSX without keys failed lint; rewritten as a switch.
  - A PowerShell quoting error broke an inline HTTP check; rewritten with single quotes.
- Graders run and results (PASS/FAIL): build PASS, tsc PASS, lint PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): once published, screenshot the page at 1366px and 360px and compare side by side with the design file.
