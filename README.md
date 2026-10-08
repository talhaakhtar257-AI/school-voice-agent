# Al-Noor Admissions Voice Agent

An AI admissions assistant for a school in Karachi. Parents talk to it in **Urdu or English** on a web page. It answers admission questions from the school's approved content and saves each enquiry as a lead for staff to follow up. It never confirms an admission or offers a discount, and it always offers a route to a person.

> **Demo school.** "Al-Noor Public School", its fees and its office phone (`021-000-000-000`) are sample data. The privacy policy is a draft awaiting the school's approval.

## Where to test

| What | Where |
|---|---|
| Parent page (voice call, text questions, fees, FAQ) | https://alnoor-school-admissions.vercel.app |
| Privacy policy | https://alnoor-school-admissions.vercel.app/privacy |
| Staff dashboard (leads, live calls, knowledge, content) | https://alnoor-school-admissions.vercel.app/login (the staff test login is shared with you separately) |

**Testing on the live site is the easiest route.** You need nothing installed.

### Test data
- Parent name: **Ahmed Khan**. Child: **Ali Ahmed**, Class 6, age 11.
- Mobile: **03000000000**. This is deliberately fake; please never use a real person's number.
- **Never say a real CNIC or B-Form number** in a call.

**Every voice call uses paid minutes.** Please keep calls short, and agree a number of test calls with the owner.

**Scenarios to test**: [`docs/agent-test-scenarios.md`](docs/agent-test-scenarios.md) has 50 of them: fees, ages, documents, dates, hand-over to a person, and the rules the assistant must never break.

## Run it on your own computer (optional)

Requirements: Node.js 20.9 or newer (built with Node 24), and npm.

```bash
npm install
cp .env.example .env.local     # then fill in the values — see below
npm run dev                    # http://localhost:3000
```

`.env.example` lists every setting the app needs, with comments on where to get them. **The keys are not in this project.**
- Use your own Supabase and Retell test accounts.
- Or ask the owner for test keys through a private channel.
- Never ask for, and never use, the production `SUPABASE_SERVICE_ROLE_KEY`.

| Command | What it does |
|---|---|
| `npm run dev` | Local development server |
| `npm run build` | Production build (must pass) |
| `npm run lint` | Lint |
| `npx tsc --noEmit` | Type check |

## How the code is organised

| Folder | Contents |
|---|---|
| `app/` | Every page and API route (each folder is a URL). `app/api/` holds the endpoints the voice agent calls. |
| `components/` | Page building blocks: landing page, call window, dashboard, privacy page |
| `lib/` | Logic: database access, emails, call processing, and all English/Urdu text (`lib/strings/`) |
| `supabase/migrations/` | Database tables and security rules |
| `docs/` | The voice agent's prompt (configured in Retell, outside this code) and test scenarios |
| `specs/` | What each feature must do (spec, plan, tasks), features 001–012 |

**Stack:**
- **Website:** Next.js 16 (App Router), TypeScript, hosted on Vercel.
- **Database and staff login:** Supabase (Postgres with row-level security).
- **Voice:** Retell AI.
- **Email:** Brevo, with Resend as the fallback.

## Known issues (please don't re-report these)

These were found in an internal review on 2026-10-08 and are scheduled to be fixed. Anything else you find is new and welcome.

| Area | Known issue |
|---|---|
| Mobile speed | Lighthouse mobile score is about 55; the voice library loads before Talk is tapped. |
| Mobile layout | In Urdu at 360px, the floating Talk button can cover the office call button. The phone number can wrap. The fee table's monthly column scrolls off-screen. Download links are under 44px tall. |
| 404 / error pages | Default unbranded pages, without the office phone. |
| Search and sharing | No `robots.txt`, `sitemap.xml`, Apple icon, web manifest, or social preview image. `/login` and `/health` can be indexed. |
| Colour contrast | Some gold and grey text on light backgrounds is below WCAG AA. |
| Calls to action | Several competing "Talk" buttons above the fold. |
| Text questions | On the Urdu page, typed questions are answered in English. |
| Voice-minute protection | The per-visitor daily limit can be bypassed by clearing cookies or by calling Retell directly. Unused reserved minutes are not released. There is no CAPTCHA. |
| Staff data rules | Database rules allow any signed-in account. Public sign-up is now disabled, and a staff-only rule is planned. |
| Pages not built yet | Terms & conditions. Analytics (none installed on purpose). |
| Placeholder data | The office phone `021-000-000-000` is a placeholder until the school gives its real number. |

## Rules this product follows
The assistant:
- answers only from approved content
- never confirms an admission and never offers a discount
- says it is an AI when asked
- always offers the office phone
- never collects CNIC or B-Form numbers (they are masked if spoken)
- saves a name or phone number only once it is confirmed

The full principles are in `.specify/memory/constitution.md`.
