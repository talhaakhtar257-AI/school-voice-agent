---
id: 0042
title: Login redesign, logo, security review
stage: general
date: 2026-09-15
surface: agent
model: claude-opus-5
feature: none
branch: 009-landing-rebuild
user: talhaakhtar257-AI
command: none
labels: ["login", "logo", "security", "headers", "review", "deploy"]
links:
  spec: specs/002-staff-login/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - public/school-logo.svg
 - app/icon.svg
 - app/favicon.ico (deleted)
 - app/login/page.tsx
 - components/login-form.tsx
 - components/login/login.module.css
 - lib/strings/staff-login.ts
 - lib/api/secret.ts
 - app/api/content/route.ts
 - app/api/leads/route.ts
 - app/api/unanswered/route.ts
 - app/api/retell/web-call/route.ts
 - next.config.ts
 - app/layout.tsx
 - app/dashboard/layout.tsx
 - components/landing/announcement-bar.tsx
 - components/landing/site-header.tsx
 - components/landing/landing.module.css
tests:
 - npx tsc --noEmit (pass)
 - npm run lint (pass, 1 existing warning)
 - npm run build (pass)
 - Security headers present on / (nosniff, X-Frame-Options DENY, frame-ancestors none, Referrer-Policy, Permissions-Policy microphone=self, HSTS); X-Powered-By removed
 - POST /api/retell/web-call from a foreign origin -> 403; from a bare script -> 403
 - /api/content no secret -> 401, wrong secret -> 401, correct secret -> 200
 - /api/leads no secret -> 401; /api/unanswered wrong secret -> 401
 - /login in Chrome: Show toggles type password -> text -> password, aria-pressed updates, 44px, type=button; logo loads; phone visible; title set
 - Landing header on one row with phone in the announcement bar (Chrome, desktop)
 - NOT RE-RUN: 360px check (Chrome ignored window resize; iframe audit now blocked by the new frame-ancestors header)
---

## Prompt

redesign login page + password issue + logo for school and then test whole project as a senior designner and cyber expert and feature planner then fix them if you find any issue then deploy it i will test it

## Response snapshot

**Design**
- New school brand mark: a green shield with a gold eight-point star (Al-Noor) and an open book. Used as the site logo and the browser tab icon.
- Login page redesigned in the landing style: green brand panel, card form, English/Urdu toggle, office phone and a back link.
- A Show/Hide password button was added.
- The office phone moved into the announcement bar, so the landing header fits on one row.
- Page titles added.

**Security review — found and fixed**
- The call gate accepted cross-site and scripted requests. Each one reserved five minutes of the monthly cap, so anyone could lock out parents; a test request reproduced it. It now requires same-origin (Sec-Fetch-Site or Origin).
- The agent secret was compared with `!==`. It now uses a constant-time comparison in `lib/api/secret.ts`.
- The site sent no security headers. nosniff, frame protection, Referrer-Policy, Permissions-Policy (microphone for this site only) and HSTS were added, and X-Powered-By was removed.

**Reported but not changed** (these need the user)
- Supabase leaked-password protection is off; it is an Auth dashboard setting.
- The `rls_auto_enable` event-trigger function is executable by anon/authenticated. It is harmless outside a trigger, but revoking EXECUTE is a database change that needs approval.
- A Vercel firewall rate-limit on `/api/retell/web-call` is recommended, because scripts can still fake browser headers.
- One performance advisory: an unindexed foreign key on `content_history`. It is informational and the table is tiny.

## Outcome

- ✅ Impact: login matches the new design and can reveal the password. The school has a logo and favicon. Three real security weaknesses were fixed and verified.
- 🧪 Tests: see the tests list. All pass except that the 360px re-check could not run.
- 📁 Files: 18 changed or added, 1 deleted.
- 🔁 Next prompts: user tests the Vercel deploy; decide on the rls_auto_enable revoke and leaked-password protection; add a Vercel rate-limit rule; replace sample content, office phone and logo if the school has an official one.
- 🧠 Reflection: the most serious issue was cost and availability, not data. An open pre-flight route that reserves budget is an easy denial-of-service target even when it holds no personal data.

## Evaluation notes (flywheel)

- Failure modes observed:
  - PowerShell's reserved `$home` variable broke the header check; re-run under another name.
  - The new frame-ancestors header blocked the iframe-based 360px audit, which also confirms the protection works.
  - Chrome's window resize had no effect.
  - Earlier blank screenshots came from an unfocused window, not a rendering fault (confirmed with elementFromPoint).
- Graders run and results (PASS/FAIL): build PASS, tsc PASS, lint PASS, endpoint security checks PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): after deploy, open the production site on a real phone and test Show password and the call pop-up.
