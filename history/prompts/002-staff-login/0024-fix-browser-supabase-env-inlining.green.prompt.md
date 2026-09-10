---
id: 0024
title: Fix browser Supabase client env inlining
stage: green
date: 2026-09-10
surface: agent
model: claude-sonnet-5
feature: 002-staff-login
branch: 002-staff-login
user: talhaakhtar257-AI
command: (debugging — sign-in always showed "Could not reach the server")
labels: [feature-002, bugfix, next-env, supabase, green]
links:
  spec: specs/002-staff-login/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - .env.local (NEXT_PUBLIC_SUPABASE_URL corrected to the API URL; user-owned, gitignored)
  - lib/supabase/client.ts (reads NEXT_PUBLIC_ vars as static process.env.<NAME> literals)
tests:
  - npm run build — pass; project URL now present in .next/static
  - browser fetch to Supabase auth endpoint — reaches it (HTTP response, no CORS block)
  - user: sign-in now lands on /dashboard
commits:
  - 527bf0c fix: browser Supabase client reads NEXT_PUBLIC_ vars as static literals
  - (c811c8d earlier — proxy fails safe when Supabase unreachable)
---

## Prompt

i am logging in
[then, twice] Could not reach the server. Check your internet connection and try again.
سرور تک رسائی نہیں ہو سکی۔ اپنا انٹرنیٹ کنکشن دیکھ کر دوبارہ کوشش کریں۔
[then] signed in done

## Response snapshot

The sign-in form always showed the networkFailure message. Ruled out, in order:
CORS (preflight 200, ACAO correct for localhost:3000), the auth endpoint (curl
returns clean invalid_credentials), the account (admin@alnoor.test, confirmed via
the admin API), and memory pressure (the dev server was OOM-killed once, but the
production build showed the same failure).

Root cause found by grepping the built browser bundle: the Supabase project ref
was nowhere in .next/static. lib/supabase/client.ts got its URL and key from
lib/env.ts, which reads `process.env[name]` with a computed key. Next.js only
inlines a NEXT_PUBLIC_ variable into the browser bundle when it sees the literal
`process.env.NEXT_PUBLIC_X` expression, so in the browser both values were
undefined, createClient() threw, and login-form.tsx's catch reported it as a
network failure. Server-side code (proxy.ts) worked because it reads env at
runtime.

Fix: lib/supabase/client.ts now reads process.env.NEXT_PUBLIC_SUPABASE_URL and
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY directly, with its own missing-var
guard. After rebuild, the URL is present in .next/static and the browser reaches
Supabase. User confirmed sign-in works.

Also in this arc: the user's .env.local NEXT_PUBLIC_SUPABASE_URL had been set to
the dashboard URL (https://supabase.com/dashboard/project/<ref>) rather than the
API URL; corrected to https://<ref>.supabase.co. And the proxy was hardened
earlier to fail safe (redirect /dashboard to /login, keep /login rendering) when
updateSession throws.

## Outcome

- ✅ Impact: staff sign-in works end to end.
- 🧪 Tests: build clean; URL confirmed in client bundle; browser reaches Supabase; user signed in.
- 📁 Files: lib/supabase/client.ts (committed); .env.local (user-owned, not committed).
- 🔁 Next prompts: finish the feature 002 click-through — session persistence, sign-out + back button, wrong-password message, expired/deleted session, 360px, Vercel.
- 🧠 Reflection: lib/env.ts (feature 001) has the same latent gap for any future browser code; it should be fixed on feature 001, not patched per-consumer here. The networkFailure catch-all also masks a thrown config error as a network problem — worth tightening.

## Evaluation notes (flywheel)

- Failure modes observed: NEXT_PUBLIC_ var not inlined due to computed process.env access; misleading networkFailure message for a non-network cause; dev server OOM-killed under memory pressure.
- Graders run and results (PASS/FAIL): build PASS; client-bundle-contains-URL PASS.
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): fix lib/env.ts on feature 001 to expose NEXT_PUBLIC_ vars via literal accessors.
