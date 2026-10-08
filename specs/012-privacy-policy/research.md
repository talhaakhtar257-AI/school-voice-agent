# Research: Privacy Policy (012)

All decisions below were made by reading the current code on 2026-10-08. Nothing here needed outside research: the policy describes this system, so the system is the source.

## D-1 Where the page lives and how it is rendered
- **Decision**: A server component at `app/privacy/page.tsx`. It reads the language from the existing `lang` cookie (`readLang()` in `lib/language-server.ts`). It needs no login and does not depend on the database for its text.
- **Rationale**: This matches `app/page.tsx`: one language at a time, right direction on the first paint, and it works without JavaScript. `setLanguage` (`app/actions/language.ts`) re-renders the current page, so the existing toggle works on `/privacy` unchanged.
- **Alternatives considered**:
  - A section on the home page: rejected, because it can't be linked from the call window without leaving the page.
  - A modal: rejected, because a modal over the pre-call form adds focus-trap complexity, and FR-009 is met more simply by a new tab.

## D-2 Page frame: what to reuse from the landing page
- **Decision**:
  - Reuse `AnnouncementBar` with `facts={null}`. It then shows only the office phone, which satisfies the "visible without scrolling" rule (Constitution VII).
  - Reuse `DocumentLanguage`, the sample-content ribbon, `SiteFooter`, and the landing fonts and CSS classes.
  - Write a **small new header** (`components/privacy/privacy-header.tsx`): logo and school name linking to `/`, `LanguageToggle`, and a "Back to admissions" link.
- **Rationale**: `SiteHeader` contains `CallButton` and `#programs`-style anchors. `CallButton` needs `CallProvider`, which loads the Retell browser library; the QA report found that library is the main cause of the slow mobile score. The anchors would point at sections that don't exist on `/privacy`. A 30-line header avoids both problems.
- **Content read**:
  - The ribbon flag and the footer's address and hours come from `readLiveForApi()` inside `try/catch`, as on the home page.
  - If the read fails, the policy still renders (FR-012). The ribbon then shows by default, because this is a demo school, and the footer shows its existing "not available" texts.

## D-3 Where the wording lives
- **Decision**:
  - **`lib/strings/privacy.ts`**: page chrome in `{ en, ur }` pairs — title, description, draft notice, "last updated" label, back link, footer and in-call link labels, and "opens in a new tab".
  - **`lib/strings/privacy-sections.ts`**: the 11 sections from FR-003, each as `{ id, heading: {en, ur}, paragraphs: {en: string[], ur: string[]}, list?: {en: string[], ur: string[]} }`.
  - **Splitting**: if that file passes about 200 lines (Constitution VIII), it splits into `privacy-sections-1.ts` (sections 1–6) and `privacy-sections-2.ts` (sections 7–11), combined in one array.
- **Rationale**: This follows the existing `lib/strings/*.ts` pattern of English and Urdu side by side, so a missing translation is visible. The school's edits touch wording only (FR-014).
- **Values stored once (Constitution IV)**:
  - The office phone comes from `lib/office.ts`, and the school name from `landingStrings.schoolName`.
  - The "last updated" date is one ISO value (`PRIVACY_LAST_UPDATED = "2026-10-08"`), formatted per language with the existing `formatDateKey` in `lib/landing/admissions.ts`.
- **Draft flag**: `PRIVACY_POLICY_APPROVED = false` in `lib/strings/privacy.ts`. When it is false, the FR-006 notice shows.

## D-4 Links from the call flow without losing typed details (FR-007, FR-009)
- **Decision**:
  - **Inside the call window** (the pre-call form next to the consent tick, and the microphone explainer): `<a href="/privacy" target="_blank" rel="noopener">` with a visually hidden "(opens in a new tab)".
  - **On the page itself** (the footer, and under the agent card's notices): a normal link.
- **Rationale**: A new tab is the simplest way to guarantee that the form state in `PreCallForm` (React `useState`) and any live call in `CallProvider` survive. No new state handling is needed.
- **Alternative considered**: keeping the form values in storage before navigating. Rejected, because CLAUDE.md forbids `localStorage` and `sessionStorage`.

## D-5 The three contradictory sentences (FR-008)
- **Decision**: rewrite the English and Urdu values of `micExplainerBody`, `recordingNotice` and `privacyLine` in `lib/strings/landing.ts`. The keys stay the same, so `MicExplainer` and `AgentCard` pick up the new wording with no layout change.
  - **micExplainerBody**: the assistant hears the question through the microphone and answers out loud. The microphone is used only during the call.
  - **recordingNotice**: the call is recorded and written down so the school can follow up the enquiry and improve the assistant's answers.
  - **privacyLine**: details are used only for the admission enquiry and to improve the assistant; never sold or used for advertising.
- **Rationale**: Each sentence becomes a true subset of the policy, with no "nothing else" claim that the recording notice contradicts.

## D-6 Page title and description (FR-010)
- **Decision**: `generateMetadata()` in `app/privacy/page.tsx` reads the language and returns the localised `title` and `description` from `lib/strings/privacy.ts`. The root layout's title template adds the school name.
- **Rationale**: This Next.js version supports reading cookies in `generateMetadata` (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`).

## D-7 Hiding ID numbers written in Urdu digits (keeps FR-004 true)
- **Finding**: the policy says a spoken CNIC or B-Form number is hidden in the transcript. `lib/calls/mask.ts` matches only ASCII digits (`\d` with no `u` flag). A number transcribed as Urdu (۰–۹) or Arabic (٠–٩) digits is **not** hidden. The QA report flagged this too.
- **Decision**: widen `ID_NUMBER` to accept `[0-9۰-۹٠-٩]` in each digit position, and mask every one of those digits. This is a one-line pattern change. `lib/knowledge/from-call.ts` already calls `maskIdNumbers`, so it inherits the fix.
- **Rationale**: Without it, the policy would promise something the system doesn't do. Constitution VI also requires these numbers never be stored.
- **Alternative considered**: weakening the sentence to "we try to hide". Rejected, because it leaves a Constitution VI gap open.

## D-8 Statement traceability (FR-004)

Each statement in the policy maps to where the system does it:

| # | Policy statement | Source in the system |
|---|---|---|
| 1 | Pre-call: name, mobile, optional email, consent tick | `components/landing/call/pre-call-form.tsx:30-47` (name ≥2 chars, PK mobile required, email optional, consent required) |
| 2 | Typed details become the call's lead | `app/api/leads/intake/route.ts`; feature 011 FR-002 |
| 3 | Lead fields: parent name, child's name, class wanted, age, phone, current class, previous school, fresh/transfer, language | `leads` table: `parent_name, student_name, class_wanted, student_age, phone, current_class, previous_school, admission_type, language, consent` (initial migration) |
| 4 | A name the parent did not confirm is left empty | Constitution V; `save_lead` rules in `docs/retell-agent-prompt.md` |
| 5 | Transcript and summary are stored; the audio is not stored in the school's database | `calls.transcript`, `calls.summary`; no recording column in any migration |
| 6 | The voice-call service keeps the recording | Retell stores call recordings by default. **To verify in the Retell dashboard** (agent → "Opt out of data storage" must be off for this to be true); listed in quickstart |
| 7 | Unanswered questions kept as question text and language only | `unanswered_questions (question_text, language, times_asked)`; `app/api/unanswered/route.ts` |
| 8 | CNIC/B-Form never asked for; hidden if spoken | `docs/retell-agent-prompt.md` (never collects); `lib/calls/mask.ts` after D-7 |
| 9 | AI, information only, never confirms admission or offers discounts | Constitution II/III; prompt v9 rules; `landingStrings.aiDisclosure`, `decisionNotice` |
| 10 | Staff may listen to a call live or join it | `app/dashboard/live/page.tsx`, `components/live/monitor-panel.tsx` (watch, listen, take over) |
| 11 | Office phone always available | `lib/office.ts`; `AnnouncementBar`; Constitution VII |
| 12 | Emails: parent gets the requested information and the conversation; school gets summary and transcript | `lib/email/send-summaries.ts`, `lib/email/templates.ts`; `app/api/send-details/route.ts` |
| 13 | Questions from calls become new answers with personal details removed | `lib/knowledge/from-call.ts` (`scrub`: ID numbers, PK mobiles, emails, names) |
| 14 | Services: voice-call (with AI language and voice providers), database, website host, email with backup | Retell (`retell-client-js-sdk`, webhook), GPT-4.1 mini and ElevenLabs (`docs/retell-agent-prompt.md:139`), Supabase, Vercel, Brevo then Resend (`lib/email/send.ts`) |
| 15 | Some data stored outside Pakistan | Vercel functions run in `iad1` (US East) per the QA report; Retell is a US service |
| 16 | No selling, no advertising | No ad or analytics code (QA check 19: nothing installed) |
| 17 | `lang` cookie: language preference, 1 year | `app/actions/language.ts` (maxAge 365 days) |
| 18 | `visitor_id` cookie: anonymous, only to limit calls per day | `lib/voice/limits.ts:4-24` (random UUID, httpOnly, ~400 days) |
| 19 | Staff login cookies only on staff pages | Supabase SSR auth, `proxy.ts` |
| 20 | Retention: current admission session; deletion on request, by hand | **Assumption** (spec); no automated deletion exists, matching "by hand" |
