# Quickstart: Staff Login

**Feature**: `002-staff-login` | **Date**: 2026-09-09
**Phase**: 1 — Design

How to check this feature works, by clicking. No code reading required. Written
for the maintainer, who is not a developer, in the order the checks should be
done.

**Before any of this**: feature `001-app-foundation` must be built, because the
application does not exist yet. See the blocking prerequisite at the top of
`plan.md`.

---

## Part 1 — One-time setup

### 1.1 Create a staff account by hand

1. Open your Supabase project in a browser.
2. Go to **Authentication** in the left sidebar, then **Users**.
3. Click **Add user**, then **Create new user**.
4. Enter an email address you can remember and a password you write down
   somewhere safe. Use a real-looking address such as `office@yourschool.edu.pk`.
5. Turn **Auto Confirm User** on. Without it, Supabase waits for the address to
   be confirmed by email and sign-in will fail.
6. Click **Create user**. The address now appears in the list.

Keep this email and password to hand. Every check below uses it.

### 1.2 Check your environment variables

In `.env.local` at the top level of the project, you need:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Both come from your Supabase project under **Settings → API**.

Two warnings:

- The **anon** key is the right one here. It is safe in a browser.
- The **service role** key is not. It must never appear in a variable whose name
  starts with `NEXT_PUBLIC_`, because anything with that prefix is sent to every
  visitor's browser.
- `.env.local` is never committed to git.

---

## Part 2 — The main check (User Story 1)

Run `npm run dev` and open `http://localhost:3000`.

| # | Do this | You should see |
|---|---|---|
| 1 | Open `http://localhost:3000/dashboard` | The sign-in screen, not the dashboard. You were redirected. |
| 2 | Look at the screen | Every label in Urdu **and** English. The office phone number, visible without scrolling. |
| 3 | Type your email and password, click sign in | The button shows a loading state, then the dashboard opens. |
| 4 | Look at the dashboard | Your email address somewhere on screen, so you know which account you are in. A designed empty state — words explaining what will appear here later, not a blank white page. |
| 5 | Reload the page | You stay on the dashboard. You are not asked to sign in again. |
| 6 | Open `http://localhost:3000/dashboard` in a new tab | The dashboard, straight away. |

---

## Part 3 — Keeping others out (User Story 2)

| # | Do this | You should see |
|---|---|---|
| 1 | Sign out, or open a private/incognito window | — |
| 2 | Type `http://localhost:3000/dashboard` in the address bar | The sign-in screen. **Watch carefully**: no flash of dashboard content before the redirect. If you see one, this check has failed. |
| 3 | Open `http://localhost:3000/` — the public landing page | It loads normally. No sign-in prompt, no redirect. Parents must never be asked to log in. |
| 4 | Sign in, then type `http://localhost:3000/login` | You are sent on to the dashboard, not shown the form again. |

---

## Part 4 — Wrong details (User Story 3)

| # | Do this | You should see |
|---|---|---|
| 1 | Sign out. Enter your real email with a wrong password | A readable bilingual message saying the email or password was not recognised. Your email is still in the box, so you need not retype it. |
| 2 | Enter an email with no account, any password | **The same message, word for word.** If it differs, the screen is telling strangers which addresses have staff accounts. That is a bug. |
| 3 | Leave both boxes empty and click sign in | The form does not submit. The empty boxes are marked, in both languages. |
| 4 | Type `notanemail` in the email box and click sign in | A bilingual message about the address, before anything is sent to the server. |
| 5 | Turn off your wifi, then try to sign in | A bilingual "could not reach the server" message — clearly different from the wrong-password message. |
| 6 | Turn wifi back on, sign in normally | It works. |

---

## Part 5 — Signing out (User Story 4)

| # | Do this | You should see |
|---|---|---|
| 1 | Sign in, then click sign out | The sign-in screen. |
| 2 | Press the browser **back** button | The sign-in screen again. **No dashboard content.** If the dashboard reappears, this check has failed. |

---

## Part 6 — On a phone

The client will look at this on a phone. Check it before saying it is done.

1. In Chrome, press **F12**, then click the small phone-and-tablet icon at the
   top left of the panel that opens.
2. In the dropdown at the top, choose a device, or set the width to **360**.
3. Walk through Part 2 again at that width.

Look for: nothing cut off at the right edge, no sideways scrolling, buttons big
enough to tap with a thumb, the office phone number visible without scrolling,
and Urdu text reading right to left correctly.

---

## Part 7 — On the deployed preview

Cookies behave differently on a real domain than on `localhost`. Sign-in can work
on your machine and fail once deployed, so this part is not optional.

1. Push the branch and open the Vercel preview URL.
2. Repeat Part 2 and Part 3 there.
3. Confirm sign-in works and the session survives a reload.

---

## Part 8 — The build

In the project folder:

```bash
npm run build      # must pass
npx tsc --noEmit   # must report no errors
```

Both must be clean. Per the constitution, the work is not done until they are.

---

## If something fails

- **Sign-in does nothing and the page reloads** — usually cookies. Check the
  browser is not blocking them, and that you are using `@supabase/ssr` rather
  than the plain client.
- **"Invalid login credentials" with the right password** — the account was
  probably created without **Auto Confirm User** turned on. Delete it in Supabase
  and create it again with that switch on.
- **The dashboard flashes before redirecting** — protection is happening in the
  page rather than in `middleware.ts`. It needs to move.
- **Signed in on reload but signed out in a new tab** — the session went to
  `localStorage` instead of cookies. That breaks a project rule as well as this
  check.
