# Getting this online, step by step

**Feature**: 001-app-foundation | **Date**: 2026-09-09

You have not deployed a site before, so this explains what each step is *for*, not
just what to click. Read it once through before starting anything.

**One warning about screenshots and menu names.** Supabase and Vercel change their
dashboards regularly. The *shape* of every step below is stable — you will always
be creating a project, copying two values, and pasting them somewhere — but a
button may sit in a different place or be worded differently than described. Where
that happens, trust the description of what you are looking for over the exact
label. If you cannot find something, say so and I will help you find it rather than
guessing from here.

---

## What you are actually building

Four things that need to know about each other:

| Piece | What it is | What it does here |
|---|---|---|
| **Your computer** | Where the code is written | Runs the site locally so you can see it before anyone else does |
| **GitHub** | A website that stores code | Holds the code where Vercel can see it |
| **Vercel** | A hosting company | Takes your code from GitHub, builds it, and puts it on the internet at an `https` address |
| **Supabase** | A database company | Holds the data. Empty for now — this feature only proves you can reach it |

The flow is: you write code → push it to GitHub → Vercel notices and publishes it
→ the published site talks to Supabase.

**The single most important idea in this document:** the code goes to GitHub, and
GitHub is public-ish and permanent. Your Supabase keys never go there. They get
typed into Vercel's settings screen instead, where they stay private. That is why
`.env.local` is in `.gitignore` and why `lib/env.ts` reads from the environment
rather than from a file in the repository.

---

## Step 1 — Create the Supabase project

**Why first:** it produces two values everything else needs, and creating the
project takes a couple of minutes on their end.

1. Go to **supabase.com** and sign in. Use the Google or GitHub sign-in if you have
   one — fewer passwords to lose.
2. Create a new project. You will be asked for:
   - **A name.** `school-voice-agent` — it is only a label.
   - **A database password.** Generate a strong one and **save it in your password
     manager immediately.** You will not need it for this feature, but you cannot
     retrieve it later, only reset it.
   - **A region.** Pick the one closest to Karachi that is offered — likely
     Singapore or Mumbai. This affects how fast parents' requests are answered.
     It cannot be changed later without creating a new project, so take the extra
     ten seconds here.
3. Wait for it to finish setting up. Two or three minutes is normal.

Then find the two values. Look for the project's **API settings** — the section
that shows connection details for developers. You need:

- **The project URL.** Looks like `https://something.supabase.co`
- **The anon / public key.** A very long string of letters and numbers.

**On that page you will also see a `service_role` key.** Do not copy it. Do not put
it anywhere yet. That key bypasses every security rule in the database, and this
feature has no use for it. If you ever paste it somewhere by accident, tell me and
we rotate it.

Put both values into `CLAUDE.local.md` under "My URLs" so you can find them again.
That file is in `.gitignore` and never leaves your computer.

---

## Step 2 — Run it on your own machine first

**Why:** if it does not work here, it will not work published — and problems are
far easier to understand on your own machine.

1. Create a file called `.env.local` in the project folder. It is not committed;
   `.gitignore` already excludes it.
2. Put your two values in it:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://something.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-long-anon-key
   ```

   No quotes, no spaces around the `=`.
3. Run `npm install`, then `npm run dev`.
4. Open `http://localhost:3000` — you should see the school name and "Admissions
   Assistant".
5. Open `http://localhost:3000/health` — it should say the database is reachable.

**Prove the health check actually works before trusting it.** Change
`NEXT_PUBLIC_SUPABASE_URL` to something wrong, stop the server with `Ctrl+C`, start
it again, and reload `/health`. It must now say *not* reachable. A health check
that says "healthy" no matter what is worse than no health check — it tells you
everything is fine while the site is broken. Put the correct value back afterwards.

---

## Step 3 — Put the code on GitHub

**Why:** Vercel publishes from GitHub. It watches your repository and rebuilds the
site every time you push.

The `gh` command-line tool is not installed on this machine, so the repository gets
created in the browser.

1. Go to **github.com** and sign in.
2. Create a new repository. Name it `school-voice-agent`.
   - **Choose Private** unless you specifically want the code public. A school's
     project is normally private.
   - **Do not** let GitHub add a README, a `.gitignore`, or a licence. This project
     already has its own history, and those extra files cause a conflict on the
     first push that is confusing to untangle.
3. GitHub then shows you commands for "pushing an existing repository". They will
   look like this — tell me when you have the repository created and I will run
   them, or you can run them yourself:

   ```bash
   git remote add origin https://github.com/<your-username>/school-voice-agent.git
   git push -u origin main
   git push -u origin 001-app-foundation
   ```

**Before that push, confirm what is going up.** Run `git status` and check that
`.env.local` and `CLAUDE.local.md` are *not* listed. They should already be
excluded, and this was verified when the first commit was made — but check anyway.
A key pushed to GitHub must be treated as compromised even if you delete it a
minute later, because it is in the history and possibly already scraped.

---

## Step 4 — Connect Vercel

**Why:** this is the step that puts the site on a real address.

1. Go to **vercel.com** and sign in **with GitHub**. This matters — signing in that
   way is what lets Vercel see your repositories.
2. Create a new project and import `school-voice-agent` from the list. Vercel will
   recognise it as a Next.js project on its own; you do not need to change the
   build settings.
3. **Before clicking deploy, add the environment variables.** There is a section
   for them on the import screen. Add both:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | the same URL from Step 1 |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the same key from Step 1 |

   This is the moment the "no keys in code" rule pays off. The keys live here, in
   Vercel's settings, not in any file. Changing a key later means editing it here
   and redeploying — no code change, which is what FR-013 asks for.

   Add only these two. The other three in `.env.example` belong to features that do
   not exist yet, and `lib/env.ts` deliberately does not require them.

4. Deploy. It takes a minute or two.

**If the build fails**, read the log Vercel shows you. The most common causes are a
missing environment variable — the error will name it, because that is exactly what
`lib/env.ts` is built to do — or a typo in a pasted value. Send me the error and I
will tell you what it means.

---

## Step 5 — Confirm it is actually done

The feature is complete when all of these are true. Check them in order, on your
phone, using mobile data rather than office wifi — that proves it is reachable from
the real internet and not just your network.

- [ ] The site opens at its `https` address and shows "Al-Noor Public School" and
      "Admissions Assistant".
- [ ] The address bar shows a padlock — the connection is secure.
- [ ] Both lines are readable on the phone with no sideways scrolling.
- [ ] `/health` on that same address says the database is reachable.
- [ ] The failure case was tested at least once locally in Step 2, and reported
      correctly.
- [ ] Nothing on the `/health` page shows a URL, a key, or a technical error.
- [ ] `git status` shows no `.env.local` and no `CLAUDE.local.md`.

Then fill in the blanks in `CLAUDE.local.md` — the Vercel address and the Supabase
project — so the next session does not have to ask you for them.

---

## One thing this feature deliberately does not do

The published page shows the school name in English only, and does not show the
office phone number. Both are required by the constitution for any page a parent
sees, and both are deliberately deferred — recorded as **FR-005** in the
specification.

That deferral holds on one condition: **do not give this address to a parent yet.**
It is for you, me, and anyone you are showing progress to. Before a parent sees it,
the Urdu text and the real office phone number go on the page — and I will need
that phone number from you, since school data is never invented.
