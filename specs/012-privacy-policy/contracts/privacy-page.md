# Contract: `/privacy` page and privacy links

This feature adds no API endpoint. The contract is the public page and the links that lead to it.

## GET `/privacy`

| Aspect | Contract |
|---|---|
| Auth | None. Public, the same as `/`. |
| Status | `200` |
| Language | From the `lang` cookie (`en` default, `ur`). `<div lang dir>` wraps the page, and `DocumentLanguage` sets `<html lang dir>`. |
| `<title>` | English: "Privacy policy · Al-Noor Public School". Urdu: "رازداری کی پالیسی · Al-Noor Public School" (root template appends the school name). |
| Meta description | A localised one-sentence summary |
| Indexing | Allowed (no `noindex`) |
| Top of page | Announcement bar with a tappable office phone (`tel:+920000000000`, shown `021-000-000-000`), the sample-content ribbon (shown unless the published content says otherwise, or the content read fails), and the privacy header: logo + school name linking to `/`, the language toggle, and a "Back to admissions" link |
| Body | `<h1>`; the draft notice while `PRIVACY_POLICY_APPROVED` is false; "Last updated" with the formatted date; then the 11 sections as `<section id>` with `<h2>`, in FR-003 order |
| Footer | The existing `SiteFooter`, including the new "Privacy policy" link |
| Not present | Call button, floating Talk card, call window, the Retell library, analytics |
| Content read fails | Still `200`, with the full policy text and phone; the footer shows its "not available" texts |
| Language toggle | Posts `setLanguage` and re-renders `/privacy` in the other language |

## Links to `/privacy`

| Place | Element | Opens in |
|---|---|---|
| Landing footer bottom row (`components/landing/site-footer.tsx`) | `<Link href="/privacy">` beside "Staff sign in" | Same tab |
| Agent card notices (`components/landing/agent-card.tsx`) | Link after the notices list | Same tab |
| Pre-call form, beside the consent tick (`components/landing/call/pre-call-form.tsx`) | `<a target="_blank" rel="noopener">` + hidden "(opens in a new tab)" | New tab: the form keeps its values (FR-009) |
| Microphone explainer notices (`components/voice/mic-explainer.tsx`) | Same as the pre-call form | New tab: a call in progress is not interrupted |

All link labels come from `privacyStrings.linkLabel[lang]`. Every link target is at least 44 px tall (frontend rules).
