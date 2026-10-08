---
id: 0067
title: Pre-handover QA by tester subagent
stage: general
date: 2026-10-08
surface: agent
model: claude-opus-5-5
feature: none
branch: 011-tester-feedback
user: talhawork257
command: none
labels: ["qa", "security", "seo", "accessibility", "performance", "handover"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - history/prompts/general/0067-pre-handover-qa-tester.general.prompt.md
  - (report outside the repo) session scratchpad qa/qa-report.md, qa/screens/, qa/lh/, qa/live/api-probes.txt
tests:
  - npm run build (pass), npx tsc --noEmit (pass), npm run lint (0 errors, 1 warning)
  - local Lighthouse mobile/desktop (PageSpeed Insights API was rate-limited, HTTP 429)
  - live safe probes only — all secret-protected endpoints returned 401/403
  - DB row counts before and after testing identical (leads 16, calls 13, unanswered 6); git status identical
---

## Prompt

n link fixes
  -  Form validation
  -  Spam protection
  -  Analytics setup
  -  Single clear CTA

 before i give them zip file i want you create subagent who act as a tester with experience of years and it test these all points then we do correction if any will need to improve

(Full checklist given in the follow-up answer: Privacy policy, Terms & conditions, Remove frontend secrets, Enforce HTTPS, Cookie consent banner, Meta titles/descriptions, Social preview image, Favicon, Sitemap and robots.txt, Image alt text, Image compression, Page load speed check, Color contrast fixes, Mobile responsiveness, Custom 404 page, Broken link fixes, Form validation, Spam protection, Analytics setup, Single clear CTA. The scope chosen was safe live tests only.)

## Response snapshot

Planned, then ran one general-purpose "senior QA" subagent. Its rules were: report only, no repo edits, and on the live site only GETs and probes designed to be rejected.

**Result:** 3 PASS, 5 FAIL, 5 MISSING, 6 PARTIAL, 1 N/A.

The Critical finding was verified directly:
- Supabase Auth has public sign-up enabled (`disable_signup=false`).
- RLS gives every `authenticated` user SELECT on leads, calls and unanswered_questions, and UPDATE on leads.
- Storage policies let any authenticated user insert, update or delete in the `downloads` bucket.

`auth.users` holds only one account, the owner's test domain, so there was no sign of misuse.

Other spot checks were also confirmed:
- These files are missing: `not-found`, `error`, `robots`, `sitemap`, `manifest`, the OpenGraph image and the Apple icon.
- `retell-client-js-sdk` is imported statically by the landing page's call provider.
- `lib/content/simulate.ts` falls back to `.en`, so the text chat answers in English on the Urdu page.
- Brand colour pairs fail WCAG AA. For example, gold `#c98500` on paper is 2.92:1.

**Deviation:** the tester used local Lighthouse and Playwright through npx, because the PageSpeed Insights API quota was exhausted. Nothing was added to the project.

## Outcome

- ✅ Impact: there is now an evidence-backed pre-handover defect list. One critical data-exposure risk was found while still unexploited.
- 🧪 Tests: build, tsc and lint baselines; Lighthouse; live probe log; database counts before and after; git status before and after.
- 📁 Files: no project files changed except this PHR. The report lives in the session scratchpad and was sent to the user.
- 🔁 Next prompts:
  - The user turns off sign-ups in the Supabase dashboard.
  - Then `/sp.specify 012-pre-handover-polish` to cover these fixes:
    - RLS staff allowlist and storage policy
    - voice-minute protection
    - privacy and terms pages
    - branded 404 and error pages
    - robots, sitemap and favicon set
    - social preview image
    - contrast fixes
    - mobile layout fixes
    - lazy-loading the Retell SDK
    - a single CTA
    - Urdu answers in the text chat
  - Real phone number and legal text come from the owner.
- 🧠 Reflection: the default Supabase setting (sign-ups on), combined with "any authenticated user" RLS, is a common trap. Staff-only apps should disable sign-up and check an allowlist in their policies.

## Evaluation notes (flywheel)

- Failure modes observed: the PSI API was rate-limited without a key; the tester switched tools without asking (harmless, but not in the plan).
- Graders run and results (PASS/FAIL): safety verification PASS (no DB writes, no repo changes).
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): give the tester a PSI API key, or name the fallback tools in the brief up front.
