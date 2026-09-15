import type { Lang } from "@/lib/language";

/**
 * Landing page strings for the top of the page: announcement bar, header,
 * hero, agent card, figures strip and the floating talk card. English and Urdu
 * side by side. No school facts live here — those come from published content.
 */
export const heroStrings = {
  // Announcement bar + sample ribbon
  admissionsOpenUntil: { en: "Admissions open until", ur: "داخلے جاری ہیں، آخری تاریخ" },
  nextAdmissions: { en: "Next admissions open on", ur: "اگلے داخلے شروع ہوں گے" },
  officeOpenNow: { en: "Office open now", ur: "دفتر ابھی کھلا ہے" },
  officeClosedNow: { en: "Office closed now", ur: "دفتر ابھی بند ہے" },
  sampleRibbon: {
    en: "Sample content — not real school information.",
    ur: "نمونہ مواد — یہ اسکول کی اصل معلومات نہیں ہیں۔",
  },

  // Header
  navLabel: { en: "Page sections", ur: "صفحے کے حصے" },
  navPrograms: { en: "Classes", ur: "کلاسز" },
  navFees: { en: "Fees", ur: "فیس" },
  navProcess: { en: "Admission", ur: "داخلہ" },
  navFaq: { en: "FAQ", ur: "سوالات" },
  languageLabel: { en: "Language", ur: "زبان" },
  officeLabel: { en: "School office", ur: "اسکول کا دفتر" },
  headerCall: { en: "Talk", ur: "بات کریں" },

  // Hero
  heroEyebrow: { en: "Admissions enquiries", ur: "داخلہ معلومات" },
  heroTitle: {
    en: "Every admission question, answered in seconds.",
    ur: "داخلے کا ہر سوال، چند سیکنڈ میں جواب۔",
  },
  heroLead: {
    en: "Talk to our AI admissions assistant about classes, fees, documents and the admission process — in English or Urdu.",
    ur: "ہمارے AI داخلہ اسسٹنٹ سے کلاسز، فیس، کاغذات اور داخلے کے طریقہ کار کے بارے میں بات کریں — اردو یا انگریزی میں۔",
  },
  callOffice: { en: "Call the office", ur: "دفتر کو کال کریں" },
  chipLanguages: { en: "English & Urdu", ur: "اردو اور انگریزی" },
  chipAi: { en: "AI assistant", ur: "AI اسسٹنٹ" },
  chipStaff: { en: "Staff make final decisions", ur: "حتمی فیصلہ عملہ کرتا ہے" },

  // Agent card
  assistantReady: { en: "Assistant ready", ur: "اسسٹنٹ تیار ہے" },
  startCall: { en: "Start voice call", ur: "وائس کال شروع کریں" },
  micNote: {
    en: "Your microphone is used only during the call.",
    ur: "مائیکروفون صرف کال کے دوران استعمال ہوتا ہے۔",
  },

  // Figures strip
  statsLabel: { en: "School figures", ur: "اسکول کے اعداد" },
  statStudents: { en: "Students enrolled", ur: "زیرِ تعلیم طلبہ" },
  statTeachers: { en: "Qualified teachers", ur: "تربیت یافتہ اساتذہ" },
  statYears: { en: "Years of service", ur: "سال کی خدمات" },
  statLanguages: { en: "Languages: English & Urdu", ur: "زبانیں: اردو اور انگریزی" },

  // Floating talk card + phone button
  floatingTitle: { en: "Questions about admission?", ur: "داخلے کے بارے میں سوال؟" },
  floatingButton: { en: "Talk to admissions", ur: "داخلہ آفس سے بات کریں" },
  floatingShort: { en: "Talk", ur: "بات" },
  fab: { en: "Talk", ur: "بات کریں" },
} as const;

/** The agent card's greeting, built around the school name (stored once). */
export function agentQuote(schoolName: string, lang: Lang): string {
  return lang === "ur"
    ? `“السلام علیکم۔ میں ${schoolName} کا داخلہ اسسٹنٹ ہوں۔ کلاسز، فیس یا کاغذات کے بارے میں پوچھیں۔”`
    : `“Assalam-o-Alaikum. I am the admissions assistant for ${schoolName}. Ask me about classes, fees or documents.”`;
}
