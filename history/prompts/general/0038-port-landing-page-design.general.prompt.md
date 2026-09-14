---
id: 0038
title: Port landing page design into Next.js
stage: general
date: 2026-09-15
surface: agent
model: claude-opus-5
feature: none
branch: 007-landing-redesign
user: talhaakhtar257-AI
command: none
labels: ["landing-page", "design", "i18n", "rtl", "sticky-talk-card"]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - app/page.tsx
 - app/actions/language.ts
 - lib/language.ts
 - lib/language-server.ts
 - lib/fonts.ts
 - lib/strings/landing-sections.ts
 - components/landing/document-language.tsx
 - components/landing/language-toggle.tsx
 - components/landing/site-header.tsx
 - components/landing/site-footer.tsx
 - components/landing/hero.tsx
 - components/landing/talk-card.tsx
 - components/landing/section-state.tsx
 - components/landing/programs-section.tsx
 - components/landing/fees-section.tsx
 - components/landing/process-documents-section.tsx
 - components/landing/faq-section.tsx
 - components/landing/landing.module.css
 - components/landing/sections.module.css
 - components/landing/talk-card.module.css
 - components/voice/talk-panel.tsx
 - components/voice/mic-explainer.tsx
 - components/voice/text-chat.tsx
 - components/voice/how-it-works.tsx
tests:
 - npx tsc --noEmit (pass)
 - npm run lint (pass, 2 pre-existing warnings in lib/content/schema.ts)
 - npm run build (pass)
 - Chrome check at 1280px: sticky talk card holds at 88px and stops above footer
 - Chrome check Urdu: html dir=rtl lang=ur, Nastaliq font, card mirrored to the right
 - Chrome check 360px frame: no sideways scroll, Talk button above fold, phone in header, floating Talk button visible
---

## Prompt

& 'c:\Users\scs\Downloads\index (3).html'   Port the uploaded landing page design into our Next.js app as React
components.

Keep these sections: hero, how it works, programs, fees, process,
documents, FAQ.

REMOVE the application form section for now — it needs a database table
and an endpoint we have not built. We will add it in phase 2.

Critical, do not change these:
- Keep our /api/retell/web-call server route. Do NOT use the design's
  browser-side Retell SDK code.
- Keep our single multilingual agent. Delete the design's two-agent
  English/Urdu logic.
- Keep our cookie-based language toggle, not the design's URL parameter.

DO keep the design's RTL handling — it sets documentElement.dir to rtl
when Urdu is active. That is correct.

Load fonts with next/font, not a Google Fonts link tag.

Replace every fee number with our placeholder values.

Show me the plan before changing any file.

(follow-up) do perfect planning for it then create

## Response snapshot

Planned in plan mode. The user chose two options: read fees, classes, process and documents from the published `content` table (not hard-coded), and include the sticky talk card. Plan approved.

Findings:
- No cookie language toggle existed, so one was built: a `lang` cookie set by a Server Function form.
- Dropped from the design as rule-breaking: sibling discount, invented stats, address, email, 24-hour and free claims, and the hard-coded B-Form/CNIC document list.

What was built:
- The page is redesigned as React components on branch 007-landing-redesign.
- The talk card is sticky in a side column on wide screens (left in English, right in Urdu) and stops at the footer. On phones it is the first block, with a floating Talk link.
- The call logic in TalkPanel is unchanged apart from `lang` and styling.
- The build first failed because next/headers was imported into a client bundle. Fixed by splitting out lib/language-server.ts.

## Outcome

- ✅ Impact: The public landing page has the new design, one language at a time with a cookie toggle and RTL, fonts via next/font, content-driven sections with empty and unavailable states, and a sticky talk card.
- 🧪 Tests: tsc, lint and build all pass. Chrome checks passed at desktop, in Urdu and at 360px.
- 📁 Files: 18 new files and 5 modified (see list).
- 🔁 Next prompts: user clicks through locally, then merge 007 into main; update spec 005 via /sp.specify; replace the test content (currently gibberish text) in the content editor before the demo.
- 🧠 Reflection: Rendering fees from the content table keeps the page and the agent consistent. A literal "placeholder fees in code" would have created two sources of truth.

## Evaluation notes (flywheel)

- Failure modes observed: a shared module importing next/headers broke the client bundle. Chrome window resize was ignored, so a 360px iframe was used instead.
- Graders run and results (PASS/FAIL): build PASS, tsc PASS, lint PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): add Mute to the talk card if the user wants it.
