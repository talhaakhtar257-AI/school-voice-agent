---
id: 0071
title: Privacy policy implementation
stage: green
date: 2026-10-08
surface: agent
model: claude-opus-5-5
feature: 012-privacy-policy
branch: 012-privacy-policy
user: talhawork257
command: /sp.implement
labels: ["privacy", "implementation", "bilingual", "masking"]
links:
  spec: specs/012-privacy-policy/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - app/privacy/page.tsx
  - components/privacy/privacy-header.tsx
  - components/privacy/privacy-body.tsx
  - components/privacy/privacy.module.css
  - lib/strings/privacy.ts
  - lib/strings/privacy-sections.ts
  - lib/strings/privacy-sections-1.ts
  - lib/strings/privacy-sections-2.ts
  - lib/strings/landing.ts
  - lib/calls/mask.ts
  - components/landing/site-footer.tsx
  - components/landing/landing.module.css
  - components/landing/agent-card.tsx
  - components/landing/hero.module.css
  - components/landing/call/pre-call-form.tsx
  - components/landing/call/call.module.css
  - .gitignore
  - specs/012-privacy-policy/tasks.md
  - specs/012-privacy-policy/data-model.md
  - history/prompts/012-privacy-policy/0071-privacy-policy-implement.green.prompt.md
tests:
  - npx tsc --noEmit — pass
  - npm run lint — 0 errors (1 old warning in lib/content/schema.ts:226, unrelated)
  - npm run build — pass, /privacy listed as a dynamic route
  - masking check — 7/7 cases (ASCII, Urdu and Arabic-Indic digits masked; phones and fees untouched)
  - /privacy at 360px in EN and UR via headless Chrome — no sideways scroll, office phone visible without scrolling, 11 sections, 0 unfilled markers, no Retell code loaded
  - call flow in EN and UR — footer and agent-card links present, old sentence gone, pre-call link opens a new tab, outside the consent label, 44px tall, typed name and phone kept, consent untouched
  - draft notice hidden when PRIVACY_POLICY_APPROVED=true, shown when false (flag restored to false)
---

## Prompt

cotinue

## Response snapshot

Ran `/sp.implement` for 012-privacy-policy. The checklist passed (16/16). Added `*.log` to `.gitignore`, so the stray Chrome `debug.log` is ignored. The baseline tsc and build passed.

**What was built:**
- **Wording.** Bilingual policy text in `lib/strings/privacy*.ts`: 11 sections with the same 54 pieces in each language, about 760 English words, and `{phone}` and `{school}` filled in at render. Added an `after` field (paragraphs after a list), recorded in `data-model.md`.
- **Page.** `/privacy` reuses the announcement bar (office phone), ribbon, footer and language toggle, with a new small header and no call machinery. The draft notice uses dark text on gold for contrast.
- **Contradictory sentences.** Rewrote the three sentences in `landing.ts`.
- **Links:**
  - the footer, next to "Staff sign in"
  - the agent card
  - the pre-call form, in a new tab, outside the consent label
- **Masking.** `lib/calls/mask.ts` now covers Urdu and Arabic-Indic digits.

**Deviation (T014).** No link was added to `MicExplainer`, because it only renders inside `PreCallForm`; a second link on the same screen would be clutter.

**Fixed during the fact-check (T018).** "type your question on this page" now says "on the admissions page", because the privacy page has no question box.

**Not tested:** forcing the content read to fail. That needs the database down; the try/catch path was confirmed by reading the code.

## Outcome

- ✅ Impact: QA item 1 (Privacy policy) is now implemented and awaits only the school's approval. The call-flow privacy wording is consistent. Spoken ID numbers in Urdu digits are now hidden in transcripts.
- 🧪 Tests: all definition-of-done checks pass (see the tests list).
- 📁 Files: 8 new, 8 edited (see the files list).
- 🔁 Next prompts:
  - The owner checks the Urdu wording, the Retell "opt out of data storage" setting (must be off) and the retention sentence.
  - The owner switches off Supabase public sign-up.
  - The owner says when to merge to main and push. Then come the remaining QA fixes (404 page, robots and sitemap, contrast, mobile speed).
- 🧠 Reflection: a scripted 360px check over the Chrome DevTools Protocol (cookie, viewport, scrollWidth, typing, a new-tab check) gave click-level evidence without the Chrome extension.

## Evaluation notes (flywheel)

- Failure modes observed: a misread screenshot (an RTL link looked misplaced) was resolved by measuring the element's position, not by eye; Windows console encoding broke Urdu output in a check script (fixed with PYTHONIOENCODING); shell quoting mangled regex in one-off scripts (moved to scratchpad files).
- Graders run and results (PASS/FAIL): tsc PASS, lint PASS, build PASS, masking 7/7 PASS, 360px EN/UR PASS, call-flow EN/UR PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): keep `shot.mjs` and `callflow.mjs` as a reusable local QA kit for the next features.
