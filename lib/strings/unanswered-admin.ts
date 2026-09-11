/**
 * UI strings for the Unanswered Questions dashboard screen. Same pattern as
 * lib/strings/leads-admin.ts: English-primary chrome, Urdu kept alongside
 * each entry so a missing translation is visible while reading.
 */
export const unansweredAdminStrings = {
  title: { en: "Unanswered Questions", ur: "ان جواب سوالات" },
  question: { en: "Question", ur: "سوال" },
  timesAsked: { en: "Times asked", ur: "کتنی بار پوچھا گیا" },
  language: { en: "Language", ur: "زبان" },
  lastAsked: { en: "Last asked", ur: "آخری بار پوچھا گیا" },
  urdu: { en: "Urdu", ur: "اردو" },
  english: { en: "English", ur: "انگریزی" },
  notGiven: { en: "—", ur: "—" },

  emptyTitle: { en: "No gaps yet", ur: "ابھی کوئی کمی نہیں" },
  emptyBody: {
    en: "The assistant has answered everything asked so far. Questions it can't answer will appear here.",
    ur: "اسسٹنٹ نے اب تک پوچھے گئے ہر سوال کا جواب دیا ہے۔ جن سوالوں کا جواب نہ دیا جا سکے وہ یہاں نظر آئیں گے۔",
  },
  errorTitle: { en: "Could not load questions", ur: "سوالات لوڈ نہیں ہو سکے" },
  errorBody: {
    en: "Something went wrong reading the list. Reload the page to try again.",
    ur: "فہرست پڑھنے میں مسئلہ ہوا۔ دوبارہ کوشش کے لیے صفحہ ری لوڈ کریں۔",
  },
} as const;
