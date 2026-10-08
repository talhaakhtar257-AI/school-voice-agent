# Implementation Plan: Privacy Policy

**Branch**: `012-privacy-policy` | **Date**: 2026-10-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-privacy-policy/spec.md`

## Summary

Add a public, bilingual `/privacy` page whose 11 sections describe only what the system does. Each statement is traced to code in [research.md](./research.md) D-8. Link it from four places:
- the landing footer
- the agent card notices
- the pre-call form, beside the consent tick (opens a new tab)
- the microphone explainer (opens a new tab)

Three other changes go with it:
- Reword the three contradictory call-flow sentences so they agree with the policy.
- Widen the CNIC/B-Form masking to Urdu and Arabic-Indic digits, so the policy's "hidden if spoken" promise is true.
- The page reuses the landing frame (announcement bar with the office phone, ribbon, footer) but leaves out the call machinery, so it loads no Retell code.

## Technical Context

**Language/Version**: TypeScript, Next.js 16.3 (App Router), React 19.2
**Primary Dependencies**: existing only. No new package.
**Storage**: none. Policy wording is code (`lib/strings/privacy*.ts`); no migration.
**Testing**: `npm run build`, `npx tsc --noEmit`, `npm run lint`, plus the click-through in [quickstart.md](./quickstart.md). The project has no automated test suite.
**Target Platform**: Vercel; mobile browsers first (360 px)
**Project Type**: web application (single Next.js app)
**Performance Goals**: the page ships no call or Retell JavaScript; it is text plus the existing fonts
**Constraints**: no `localStorage`/`sessionStorage`; every parent-facing sentence in English and Urdu; office phone visible without scrolling; files under ~200 lines
**Scale/Scope**: 1 new page, 3 new small components/files, about 6 edited files, ~900 words per language

## Constitution Check

*Checked before research and again after design. Both passes are green.*

- [x] **I. Honesty**: the agent's answers are untouched. The policy itself follows the same rule: every statement traces to code (research D-8), and the two that depend on outside settings are listed as owner checks (Retell data storage; the retention period).
- [x] **II. No Authority**: the policy restates that the assistant never confirms admission or offers discounts. Nothing changes the agent.
- [x] **III. Disclosure**: the AI disclosure is repeated in the policy (section 5), and the call-flow sentence stays.
- [x] **IV. Bilingual Prose**: every new sentence has English and Urdu values side by side. The phone, school name and "last updated" date are stored once and formatted for display.
- [x] **V. Confirm Before Saving**: not affected. No data is saved by this feature.
- [x] **VI. No Sensitive Data**: no new data is collected. The masking gap for Urdu digits is closed (D-7).
- [x] **VII. Human Exit**: `/privacy` shows the office phone in the announcement bar, reachable without scrolling.
- [x] **VIII. Simple Over Clever**: plain server components and string files. No dependency. Wording files split at ~200 lines.
- [x] **IX. Testable By A Non-Developer**: the [quickstart](./quickstart.md) is all clicks. The error state (content read fails) still renders. Checked at 360 px.
- [x] **X. Small Steps**: four independent steps, each of which builds: (1) wording and the reworded sentences, (2) the page, (3) the links, (4) masking.
- [x] **Feature sequencing**: 011 is implemented and running in production; its only open tasks are owner actions (Vercel env vars, test calls).

## Project Structure

### Documentation (this feature)

```text
specs/012-privacy-policy/
├── spec.md
├── plan.md              # this file
├── research.md          # decisions D-1..D-7 and the D-8 traceability table
├── data-model.md        # string shapes and constants (no database change)
├── quickstart.md        # click-through checks + owner checks
├── contracts/
│   └── privacy-page.md  # the /privacy page and link contract
├── checklists/
│   └── requirements.md
└── tasks.md             # next: /sp.tasks
```

### Source Code (repository root)

```text
app/
└── privacy/
    └── page.tsx                      # NEW — server component + generateMetadata (D-1, D-6)

components/
├── privacy/
│   ├── privacy-header.tsx            # NEW — logo/name → "/", language toggle, back link (D-2)
│   ├── privacy-body.tsx              # NEW — h1, draft notice, last updated, 11 sections
│   └── privacy.module.css            # NEW — reading width, Urdu line height, print rules
├── landing/
│   ├── site-footer.tsx               # EDIT — "Privacy policy" link in the bottom row
│   ├── agent-card.tsx                # EDIT — link after the notices
│   └── call/pre-call-form.tsx        # EDIT — new-tab link beside the consent tick
└── voice/
    └── mic-explainer.tsx             # EDIT — new-tab link after the notices

lib/
├── strings/
│   ├── privacy.ts                    # NEW — page chrome strings, PRIVACY_LAST_UPDATED, PRIVACY_POLICY_APPROVED
│   ├── privacy-sections.ts           # NEW — the 11 bilingual sections (split in two if > ~200 lines)
│   └── landing.ts                    # EDIT — reword micExplainerBody, recordingNotice, privacyLine
└── calls/
    └── mask.ts                       # EDIT — Urdu/Arabic-Indic digits in ID_NUMBER (D-7)
```

**Structure Decision**: the existing single Next.js app layout. The new page goes under `app/privacy/`, and its parts under `components/privacy/`, following the per-area component folders already used (`components/landing`, `components/live`, …). Wording goes in `lib/strings/`, as for every other screen.

## Implementation steps (each one builds on its own)

1. **Wording**: add `lib/strings/privacy.ts` and `lib/strings/privacy-sections.ts`, and reword the three sentences in `lib/strings/landing.ts`. *Visible result: the home page notices read consistently.*
2. **Page**: add `app/privacy/page.tsx` and `components/privacy/*`, reusing `AnnouncementBar` (with `facts={null}` for the phone), `DocumentLanguage`, the ribbon, `SiteFooter`, `LanguageToggle`, `englishFont`/`urduFont`, `landing.module.css`, and `formatDateKey`. *Visible result: `/privacy` works in both languages.*
3. **Links**: footer, agent card, pre-call form (new tab), microphone explainer (new tab). *Visible result: one tap to the policy from each place; typed details survive.*
4. **Masking**: widen `ID_NUMBER` in `lib/calls/mask.ts`. *Check: a quick `node -e` run masks `۴۲۱۰۱-۱۲۳۴۵۶۷-۱` and `42101-1234567-1`, and leaves `03001234567` alone.*

After each step, run `npx tsc --noEmit`. At the end, run `npm run build` and `npm run lint`, and walk through the quickstart.

## Risks
- **The Urdu policy text needs checking by an Urdu reader.** The owner reviews it before the school does.
- **Retell's data-storage setting.** If "opt out of data storage" is on, the recording sentence is wrong. This is an owner check in the quickstart.
- **Legal approval.** The draft notice stays until the school approves. This is a one-constant change.

## Complexity Tracking

No constitution violations, so nothing to justify.
