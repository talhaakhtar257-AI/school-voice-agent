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
  emailLabel: {
    en: "Want a summary by email? (optional)",
    ur: "خلاصہ ای میل پر چاہیے؟ (اختیاری)",
  },
  emailPlaceholder: { en: "your@email.com", ur: "your@email.com" },
  emailSend: { en: "Send", ur: "بھیجیں" },
  emailSending: { en: "Sending…", ur: "بھیجا جا رہا ہے…" },
  emailSaved: {
    en: "Thank you. We will email you a summary of this call.",
    ur: "شکریہ۔ اس کال کا خلاصہ آپ کو ای میل کر دیا جائے گا۔",
  },
  emailInvalid: {
    en: "That email address doesn't look right. Please check it.",
    ur: "یہ ای میل ایڈریس درست نہیں لگتا۔ براہ کرم دوبارہ دیکھیں۔",
  },
  emailFailed: {
    en: "Sorry, we couldn't save your email. You can tell the office instead.",
    ur: "معذرت، ای میل محفوظ نہیں ہو سکی۔ آپ دفتر کو بتا سکتے ہیں۔",
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
