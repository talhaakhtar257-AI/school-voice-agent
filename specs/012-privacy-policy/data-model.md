# Data Model: Privacy Policy (012)

**No database changes.** No table, column, migration, policy or cookie is added (FR-013). The only "data" is the policy wording, which lives in code as bilingual strings.

## PrivacySection (`lib/strings/privacy-sections.ts`)

| Field | Type | Rule |
|---|---|---|
| `id` | string | Stable anchor id, e.g. `what-we-collect-before`. Used for in-page links. Unique. |
| `heading` | `{ en: string; ur: string }` | Both languages required (Constitution IV). |
| `paragraphs` | `{ en: string[]; ur: string[] }` | Same number of paragraphs in each language. |
| `list` | `{ en: string[]; ur: string[] }`, optional | Bullet items, e.g. the data fields. Same length in each language. |
| `after` | `{ en: string[]; ur: string[] }`, optional | Paragraphs shown after the list (e.g. "We do not sell your information"). Same count in each language. |

The array holds exactly the 11 sections of spec FR-003, in that order.

**Values are never typed into the wording.** These are inserted when the page renders:
- the office phone, from `lib/office.ts`
- the school name, from `landingStrings.schoolName`

A sentence that needs one carries a `{phone}` or `{school}` marker, filled in at render.

## PrivacyPageStrings (`lib/strings/privacy.ts`)

| Key | Purpose |
|---|---|
| `title`, `description` | Page metadata (FR-010) |
| `heading` | The page `<h1>` |
| `draftNotice` | "Draft — awaiting the school's approval. This is not legal advice." (FR-006) |
| `lastUpdatedLabel` | Label shown before the formatted date |
| `backHome` | The header link back to the admissions page |
| `linkLabel` | "Privacy policy" (footer, agent card, call window) |
| `opensNewTab` | Visually hidden text on links that open a new tab |
| `contactLine` | The sentence around the office phone at the top of the page |

## Constants (stored once)

| Constant | Value | Notes |
|---|---|---|
| `PRIVACY_LAST_UPDATED` | `"2026-10-08"` | An ISO date key, formatted per language by `formatDateKey()` |
| `PRIVACY_POLICY_APPROVED` | `false` | When it is `false`, the draft notice shows. Set it to `true` only after the school approves. |

## Changed existing strings (`lib/strings/landing.ts`)

| Key | Change |
|---|---|
| `micExplainerBody` | Reworded in English and Urdu; it no longer says "nothing is used for anything else" |
| `recordingNotice` | Reworded: recorded and written down, for follow-up and improving answers |
| `privacyLine` | Reworded: used for the enquiry and to improve the assistant; never sold, no advertising |

## Changed pattern (`lib/calls/mask.ts`)

`ID_NUMBER` accepts the digits `0-9`, `۰-۹` (Urdu) and `٠-٩` (Arabic-Indic) in each position, with the same 5-7-1 grouping and separators. Every matched digit becomes `*`. Behaviour for 11-digit phone numbers is unchanged.
