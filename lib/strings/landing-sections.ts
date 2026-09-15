/**
 * Strings for the redesigned landing page sections, English and Urdu side by
 * side. Call-flow strings stay in landing.ts. No school facts live here — fees,
 * classes, ages, process and documents come from the published content.
 */
export const sectionStrings = {
  // Header
  navPrograms: { en: "Classes", ur: "کلاسز" },
  navFees: { en: "Fees", ur: "فیس" },
  navProcess: { en: "Admission", ur: "داخلہ" },
  navFaq: { en: "FAQ", ur: "سوالات" },
  languageLabel: { en: "Language", ur: "زبان" },
  officeLabel: { en: "School office", ur: "اسکول کا دفتر" },

  // Hero
  heroEyebrow: { en: "Admissions enquiries", ur: "داخلہ معلومات" },
  heroLead: {
    en: "Talk to our AI admissions assistant about classes, fees, documents and the admission process — in English or Urdu.",
    ur: "ہمارے AI داخلہ اسسٹنٹ سے کلاسز، فیس، کاغذات اور داخلے کے طریقہ کار کے بارے میں بات کریں — اردو یا انگریزی میں۔",
  },
  chipLanguages: { en: "English & Urdu", ur: "اردو اور انگریزی" },
  chipAi: { en: "AI assistant", ur: "AI اسسٹنٹ" },
  chipStaff: { en: "Staff make final decisions", ur: "حتمی فیصلہ عملہ کرتا ہے" },

  // Talk card
  talkCardTitle: { en: "Admissions assistant", ur: "داخلہ اسسٹنٹ" },
  talkCardReady: { en: "Ready to talk", ur: "بات کے لیے تیار" },
  transcriptEmpty: { en: "The conversation will appear here.", ur: "گفتگو یہاں نظر آئے گی۔" },
  transcriptAssistant: { en: "Assistant", ur: "اسسٹنٹ" },
  transcriptYou: { en: "You", ur: "آپ" },
  fab: { en: "Talk", ur: "بات کریں" },

  // How it works
  howLead: {
    en: "No app, no form, no appointment. One tap and you are talking.",
    ur: "نہ ایپ، نہ فارم، نہ وقت لینا۔ ایک ٹیپ اور بات شروع۔",
  },

  // Programs
  programsTitle: { en: "Classes we offer", ur: "ہماری کلاسز" },
  programsEmpty: {
    en: "Classes will appear here once the school publishes them.",
    ur: "اسکول کی جانب سے شائع ہونے کے بعد کلاسز یہاں ظاہر ہوں گی۔",
  },
  ageRange: { en: "Age", ur: "عمر" },
  years: { en: "years", ur: "سال" },

  // Fees
  feesTitle: { en: "Fee structure", ur: "فیس کی تفصیل" },
  feesLead: {
    en: "The assistant quotes exactly these published figures.",
    ur: "اسسٹنٹ یہی شائع شدہ رقم بتاتا ہے۔",
  },
  feesEmpty: {
    en: "Fees will appear here once the school publishes them.",
    ur: "اسکول کی جانب سے شائع ہونے کے بعد فیس یہاں ظاہر ہوگی۔",
  },
  feeColumnClass: { en: "Class", ur: "کلاس" },
  feeColumnFee: { en: "Fee", ur: "فیس" },

  // Process + documents
  processTitle: { en: "How admission works", ur: "داخلہ کیسے ہوتا ہے" },
  processEmpty: {
    en: "The admission process will appear here once the school publishes it.",
    ur: "اسکول کی جانب سے شائع ہونے کے بعد داخلے کا طریقہ یہاں ظاہر ہوگا۔",
  },
  documentsTitle: { en: "Documents needed", ur: "ضروری کاغذات" },
  documentsEmpty: {
    en: "The list of documents will appear here once the school publishes it.",
    ur: "اسکول کی جانب سے شائع ہونے کے بعد کاغذات کی فہرست یہاں ظاہر ہوگی۔",
  },
  askCardTitle: { en: "Not sure what applies to you?", ur: "سمجھ نہیں آ رہا کہ آپ پر کیا لاگو ہے؟" },
  askCardBody: {
    en: "Ask the assistant about your situation.",
    ur: "اسسٹنٹ سے اپنی صورتحال کے بارے میں پوچھیں۔",
  },
  askCardButton: { en: "Ask the assistant", ur: "اسسٹنٹ سے پوچھیں" },

  // Shared states
  sectionUnavailable: {
    en: "This information is temporarily unavailable.",
    ur: "یہ معلومات عارضی طور پر دستیاب نہیں ہیں۔",
  },
  callOfficeHint: { en: "You can call the office:", ur: "آپ دفتر کو کال کر سکتے ہیں:" },

  // Footer
  footerOfficeHours: { en: "Office hours", ur: "دفتری اوقات" },
  footerHoursEmpty: {
    en: "Office hours will appear here once published.",
    ur: "شائع ہونے کے بعد دفتری اوقات یہاں ظاہر ہوں گے۔",
  },
  footerContact: { en: "Contact", ur: "رابطہ" },
} as const;
