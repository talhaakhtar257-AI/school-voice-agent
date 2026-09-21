/**
 * Strings for the call pop-up window. The call states, End Call, and the
 * fallback messages stay in landing.ts, where the call flow first defined them.
 */
export const callStrings = {
  windowSub: { en: "Admissions assistant · English & Urdu", ur: "داخلہ اسسٹنٹ · اردو اور انگریزی" },
  ready: { en: "Before we start", ur: "شروع کرنے سے پہلے" },
  ended: { en: "Call ended", ur: "کال ختم ہو گئی" },
  endedBody: {
    en: "Thank you for calling. You can talk again, or call the office.",
    ur: "کال کرنے کا شکریہ۔ آپ دوبارہ بات کر سکتے ہیں، یا دفتر کو کال کریں۔",
  },
  transcriptEmpty: { en: "The conversation will appear here.", ur: "گفتگو یہاں نظر آئے گی۔" },
  keepOpen: {
    en: "Keep this page open until the call ends.",
    ur: "کال ختم ہونے تک یہ صفحہ کھلا رکھیں۔",
  },
  assistant: { en: "Assistant", ur: "اسسٹنٹ" },
  you: { en: "You", ur: "آپ" },
  mute: { en: "Mute", ur: "آواز بند" },
  unmute: { en: "Unmute", ur: "آواز کھولیں" },
  talkAgain: { en: "Talk again", ur: "دوبارہ بات کریں" },
  close: { en: "Close", ur: "بند کریں" },
  timerLabel: { en: "Call time", ur: "کال کا وقت" },
  officeLine: { en: "School office:", ur: "اسکول کا دفتر:" },
} as const;
