---
paths:
  - "app/**/*.tsx"
  - "components/**/*.tsx"
---

# Frontend rules

Two very different audiences use this app. Do not treat them the same.

| Screen | User | Priority |
|---|---|---|
| Landing page | A parent on a cheap Android phone | Clarity, trust, one tap |
| Dashboard | School staff on a laptop or phone | Density, speed, accuracy |

## Every screen

- Mobile first. Design for a 360px wide screen, then widen.
- Every list has three states: loading, empty, and error. Build all three.
- The empty state explains what will appear here, it never shows a blank box.
- Never use localStorage or sessionStorage.
- No layout shift after data loads. Reserve the space.

## Landing page

- The talk button is the largest element on the screen and sits above the fold.
- Explain why the microphone is needed before the browser permission box appears.
- Show a connecting state, then a clear listening or speaking state.
- The End Call button is visible during the whole conversation.
- The recording notice and privacy line appear before any conversation starts.
- The office phone number is always visible without scrolling.
- The written FAQ works with JavaScript failing and with the AI unavailable.

## Dashboard

- Tables over cards. Staff scan rows, they do not browse.
- Newest first, always.
- Never hide an important number behind a click.
- Every screen has a date range selector in the same position.
- Charts need a title and axis labels. A chart without labels is decoration.

## Urdu and English

- Every parent-facing string exists in both languages.
- Transcripts contain Urdu script. Set `dir="auto"` on any element that renders
  transcript text.
- Never truncate Urdu text with a fixed character count.
- Test any text change at 360px width before saying it is done.

## Accessibility

- Touch targets at least 44px.
- Every button has a readable label, not only an icon.
- Colour is never the only signal. Pair it with text or an icon.
