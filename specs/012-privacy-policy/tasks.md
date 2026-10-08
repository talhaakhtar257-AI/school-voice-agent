---
description: "Task list for 012-privacy-policy"
---

# Tasks: Privacy Policy

**Input**: Design documents from `/specs/012-privacy-policy/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/privacy-page.md, quickstart.md

**Tests**: no automated tests. The spec did not ask for them and the project has no test suite. Each story ends with a click-through check from `quickstart.md`. `npx tsc --noEmit` runs after every code task.

**Organization**: grouped by user story (spec.md):
- **US1**: a parent reads the policy (P1)
- **US2**: the call flow is consistent and links to the policy (P1)
- **US3**: the school approves the draft (P2)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: can run in parallel (a different file, no dependency on an unfinished task)
- Paths are relative to the repository root `C:\Users\scs\Desktop\school-voice-agent\`

---

## Phase 1: Setup

- [X] T001 Confirm the starting point on branch `012-privacy-policy`: run `npx tsc --noEmit` and `npm run build` and record that both pass before any change. No file is edited.

---

## Phase 2: Foundational (wording that US1 and US2 both use)

**⚠️ Must be complete before US1 and US2**: the page and the links read their labels from these files.

- [X] T002 [P] Create `lib/strings/privacy.ts`. It holds:
  - `privacyStrings`, each key as an `{ en, ur }` pair: `title`, `description`, `heading`, `draftNotice` ("Draft — awaiting the school's approval. This is not legal advice."), `lastUpdatedLabel`, `backHome`, `linkLabel` ("Privacy policy"), `opensNewTab` ("(opens in a new tab)"), `contactLine` (with a `{phone}` marker).
  - The constants `PRIVACY_LAST_UPDATED = "2026-10-08"` and `PRIVACY_POLICY_APPROVED = false`.
  - The exported type `PrivacySection` (`id`, `heading`, `paragraphs`, optional `list`), as in data-model.md.

  Follow the comment style of `lib/strings/pre-call.ts`. Explain *why* the draft flag exists.
- [X] T003 [P] Create `lib/strings/privacy-sections.ts` exporting `privacySections: PrivacySection[]`. It holds the 11 sections of spec FR-003, in order, in English and Urdu (Urdu in Urdu script, never Roman Urdu).
  - **Rules for the wording:**
    - Use only facts from research.md D-8.
    - Insert the phone and school name only through `{phone}` and `{school}` markers.
    - Describe services by role: "the company that runs the voice calls", "our database provider". The one exception is the recording sentence, where "Retell" may be named.
    - Keep each language to about 900 words or fewer (SC-005).
  - Give each section a stable `id`: `who-we-are`, `before-a-call`, `during-a-call`, `never-collected`, `ai-assistant`, `why`, `who-else`, `cookies`, `retention-and-choices`, `children`, `changes`.
  - If the file passes about 200 lines, split it into `lib/strings/privacy-sections-1.ts` (sections 1–6) and `lib/strings/privacy-sections-2.ts` (7–11). Re-export the combined array from `lib/strings/privacy-sections.ts`.

**Checkpoint**: `npx tsc --noEmit` passes. Nothing visible changes yet.

---

## Phase 3: User Story 1 - A parent reads how their information is used (P1) 🎯 MVP

**Goal**: `/privacy` works in English and Urdu, shows the office phone without scrolling, and describes only real behaviour.

**Independent test**: quickstart.md §1, steps 2–8. Open `/privacy` directly by typing the URL; the footer link comes in US2.

- [X] T004 [P] [US1] Create `components/privacy/privacy.module.css`:
  - a reading column of max width ~46rem with the side padding of `landing.module.css` `.wrap`
  - heading sizes
  - Urdu paragraphs and lists with `line-height: 2.1` under `[dir="rtl"]`, so Nastaliq is not clipped
  - a draft notice box in the gold-50 / gold-700 colours from `landing.module.css`
  - long words wrap (`overflow-wrap: anywhere`) so 360 px never scrolls sideways
  - `@media print` hides the announcement bar, the header toggle and the footer's staff link
- [X] T005 [P] [US1] Create `components/privacy/privacy-header.tsx`, a server component. It contains:
  - a `<header>` using the `landing.module.css` `header`/`wrap`/`nav`/`brand` classes
  - the logo (`/school-logo.svg`, `alt=""`) and `landingStrings.schoolName[lang]`, linking to `/`
  - `LanguageToggle` from `components/landing/language-toggle.tsx`
  - a `Link href="/"` with `privacyStrings.backHome[lang]`

  No `CallButton`, so no `CallProvider` is needed (research D-2). Keep it under ~50 lines.
- [X] T006 [US1] Create `components/privacy/privacy-body.tsx`, a server component taking `lang`. It renders:
  - an `<h1>` (`privacyStrings.heading`)
  - the contact line, with the office phone as `<a href={`tel:${OFFICE_PHONE_E164}`}>` and `<bdi>{OFFICE_PHONE_DISPLAY}</bdi>` from `lib/office.ts`
  - "Last updated" + `formatDateKey(PRIVACY_LAST_UPDATED, lang)` from `lib/landing/admissions.ts`
  - each `privacySections` entry as `<section id={id}>` with an `<h2>`, `<p>` per paragraph and `<ul>` for `list`

  It replaces the `{phone}` and `{school}` markers with a small local `fill()` function. **Leave out the draft notice for now** (added in T016). Depends on T002, T003 and T004.
- [X] T007 [US1] Create `app/privacy/page.tsx`, with the default export `PrivacyPage` and `export const dynamic = "force-dynamic"`.
  - **Language**: `const lang = await readLang()`.
  - **Content read**: `readLiveForApi()` in `try/catch`, as in `app/page.tsx`. On failure, set `contentFailed`; never rethrow.
  - **Layout**: render the `<div lang dir className={landing.page + font variables}>` wrapper, containing:
    - `<DocumentLanguage lang>`
    - `<AnnouncementBar lang facts={null}>`, which gives the office phone without scrolling (Constitution VII)
    - the sample ribbon, shown when `content?.profile.showSampleBanner !== false` (so it shows when the content read failed)
    - `<PrivacyHeader lang>`
    - `<main><PrivacyBody lang></main>`
    - `<SiteFooter lang profile officeHours schoolTimings>`, fed from the content read or null/[]
  - **Metadata**: add `export async function generateMetadata()` returning `{ title: privacyStrings.title[lang], description: privacyStrings.description[lang] }` (research D-6). Before writing, read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md`.

  Depends on T005 and T006.
- [X] T008 [P] [US1] In `lib/calls/mask.ts`, widen `ID_NUMBER` so each digit position accepts `[0-9۰-۹٠-٩]`, with the same 5-7-1 shape and optional `-` or space separators, and keep the look-around guards on that same digit class.
  - `maskIdNumbers` must replace every one of those digits with `*`.
  - Update the comment to say why (research D-7: the policy promises spoken ID numbers are hidden, and Retell can transcribe Urdu digits).
  - Verify with a `node -e` run, or a temporary script in the scratchpad (not in the repo), that `42101-1234567-1` and `۴۲۱۰۱-۱۲۳۴۵۶۷-۱` are masked and that `03001234567` is unchanged.
- [X] T009 [US1] Check US1: run `npx tsc --noEmit`, then `npm run dev`, and walk quickstart.md §1 steps 2–8 by opening http://localhost:3000/privacy directly.
  - English and Urdu both render.
  - The phone is visible without scrolling at 360 px.
  - There is no sideways scroll.
  - Turn off the network to Supabase, or temporarily point `readLiveForApi` at a bad URL locally without committing, and confirm the page still renders (FR-012).

**Checkpoint**: US1 works on its own. The policy exists at `/privacy`.

---

## Phase 4: User Story 2 - The call flow tells one consistent story and points to the policy (P1)

**Goal**: the three sentences agree, and four places link to `/privacy`. Links inside the call window open a new tab, so typed details and a live call survive (FR-009).

**Independent test**: quickstart.md §1 step 1 and §2.

- [X] T010 [P] [US2] In `lib/strings/landing.ts`, reword the English and Urdu values of `micExplainerBody`, `recordingNotice` and `privacyLine` per research D-5. Keys stay unchanged.
  - **micExplainerBody**: the microphone is used only during the call to hear the question and answer out loud.
  - **recordingNotice**: the call is recorded and written down so the school can follow up and improve the assistant's answers.
  - **privacyLine**: used only for the enquiry and to improve the assistant; never sold or used for advertising.
  - Nothing may say "nothing is used for anything else".
- [X] T011 [P] [US2] In `components/landing/site-footer.tsx`, add `<Link href="/privacy">{privacyStrings.linkLabel[lang]}</Link>` in the `footBottom` row before the staff sign-in link. Keep the existing styles; if needed, add a gap rule in `components/landing/landing.module.css` `.footBottom`.
- [X] T012 [P] [US2] In `components/landing/agent-card.tsx`, add a same-tab link to `/privacy` (`privacyStrings.linkLabel`) directly after the `acNotices` list. If needed, give it a 44 px minimum tap height in `components/landing/hero.module.css`.
- [X] T013 [P] [US2] In `components/landing/call/pre-call-form.tsx`, add `<a href="/privacy" target="_blank" rel="noopener">{privacyStrings.linkLabel[lang]}<span className={styles.srOnly}>{privacyStrings.opensNewTab[lang]}</span></a>` directly after the consent `<label>`.
  - Use an existing visually hidden utility if `call.module.css` or `globals.css` has one; otherwise add a small `.srOnly` rule to `components/landing/call/call.module.css`.
  - The link must not be inside the `<label>`, so tapping it doesn't toggle the tick.
- [X] T014 [P] [US2] In `components/voice/mic-explainer.tsx`, add the same new-tab link after the `notices` list (before the Continue button).
  - **Outcome (2026-10-08):** not added. `MicExplainer` is only shown inside `PreCallForm`, so a second link would sit on the same screen just below the T013 link. The T013 link next to the consent tick covers FR-007 for this screen, and `mic-explainer.tsx` is unchanged.
- [X] T015 [US2] Check US2: run `npx tsc --noEmit`, `npm run dev`, then walk quickstart.md §2.
  - Type a name and `03000000000`, tap Privacy policy, close the new tab, and confirm the fields still hold the values.
  - Do not start a call.
  - Check the footer link and agent-card link in both languages.

**Checkpoint**: US1 and US2 both work. The QA "Privacy policy" item can now pass, apart from approval.

---

## Phase 5: User Story 3 - The school reviews and approves the draft (P2)

**Goal**: the draft is clearly marked and can be approved by changing one constant. Wording edits never touch layout.

**Independent test**: quickstart.md §1 step 3 and §4.

- [X] T016 [US3] In `components/privacy/privacy-body.tsx`, render `privacyStrings.draftNotice[lang]` in the notice box (`role="note"`) directly under the `<h1>` when `PRIVACY_POLICY_APPROVED` is `false` (FR-006).
  - Locally set the constant to `true` once to confirm the notice disappears, then set it back to `false`. Do not commit `true`.
- [X] T017 [US3] At the top of `lib/strings/privacy-sections.ts` (or `-1.ts` if split), add a short comment for the owner:
  - this file holds the policy wording only
  - every sentence must stay true to research.md D-8
  - how to approve: set `PRIVACY_POLICY_APPROVED` to `true` and update `PRIVACY_LAST_UPDATED` in `lib/strings/privacy.ts`

**Checkpoint**: all three stories work.

---

## Phase 6: Polish & Cross-Cutting

- [X] T018 Traceability review: read every sentence of the English and Urdu policy against research.md D-8. Remove or correct anything not backed by the system. Confirm the Urdu says the same as the English.
- [X] T019 [P] File-size check: `wc -l` on every new or edited file. Anything over ~200 lines is split (Constitution VIII).
  - `components/landing/call/pre-call-form.tsx` is at 107 lines and `call.module.css` is untouched except possibly `.srOnly`.
  - If `privacy-sections.ts` is over ~200 lines, apply the T003 split.
- [X] T020 Definition of done: `npx tsc --noEmit`, `npm run lint` (0 errors) and `npm run build` all pass. Walk the whole quickstart.md (§1–§3) at 360 px in English and Urdu.
- [X] T021 Write the implementation PHR to `history/prompts/012-privacy-policy/` and tell the owner in one sentence what changed. List the owner checks:
  - switch off Supabase sign-up
  - the Retell "opt out of data storage" setting
  - the retention sentence
  - the approval flag
- [ ] T022 Commit on branch `012-privacy-policy`, only after T020 passes, with a message in the project's style (e.g. `feat: bilingual privacy policy page, consistent call-flow privacy wording, Urdu-digit ID masking`). Merge to `main` locally and push only when the owner says so (no pull request).

---

## Dependencies & Execution Order

- **Setup (T001)**: first.
- **Foundational (T002, T003)**: in parallel. They block US1 (T006) and US2 (T011–T014, which use `privacyStrings.linkLabel`).
- **US1**:
  - T004, T005 and T008 can start once Foundational is done, in parallel.
  - T006 needs T002, T003 and T004.
  - T007 needs T005 and T006.
  - T009 needs T007 and T008.
- **US2**: T010–T014 are all different files and can run in parallel after Foundational. T015 needs them all. US2 does not depend on US1, but its links point at a page that only exists after US1, so do US1 first.
- **US3**: T016 needs T006; T017 needs T003.
- **Polish**: T018–T022 run after all stories, in order, except that T019 is parallel to T018.

### Parallel examples

```text
Foundational:  T002 (privacy.ts)  ||  T003 (privacy-sections.ts)
US1:           T004 (css)  ||  T005 (header)  ||  T008 (mask.ts)
US2:           T010 (landing.ts) || T011 (footer) || T012 (agent card) || T013 (pre-call form) || T014 (mic explainer)
```

## Implementation Strategy

1. **MVP = Setup + Foundational + US1**: `/privacy` exists and is true. This alone moves QA item 1 forward.
2. **Then US2**: the links and the consistent sentences, which is what the QA tester saw on the call screen.
3. **Then US3**: the draft notice. Ship US1 and US3 together if possible, so the policy never appears without its draft label in production.
4. **Then Polish and commit.**

Every phase leaves the app building and running (Constitution X).
