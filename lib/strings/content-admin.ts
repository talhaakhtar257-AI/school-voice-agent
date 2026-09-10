/**
 * UI strings for the content admin screens. English-primary chrome (research
 * D-008), but the pair is kept per entry so a missing Urdu translation is visible
 * while reading. The *content being edited* is bilingual; these are the labels
 * around it.
 */
export const contentAdminStrings = {
  // Sections
  factsTitle: { en: "Facts", ur: "حقائق" },
  policiesTitle: { en: "Policies", ur: "پالیسیاں" },
  faqsTitle: { en: "FAQs", ur: "عمومی سوالات" },
  escalationTitle: { en: "Escalation topics", ur: "انسان کو منتقل کیے جانے والے موضوعات" },

  // Actions
  save: { en: "Save draft", ur: "مسودہ محفوظ کریں" },
  saving: { en: "Saving…", ur: "محفوظ ہو رہا ہے…" },
  publish: { en: "Publish", ur: "شائع کریں" },
  confirm: { en: "Confirm", ur: "تصدیق کریں" },
  cancel: { en: "Cancel", ur: "منسوخ کریں" },
  add: { en: "Add", ur: "شامل کریں" },
  remove: { en: "Remove", ur: "ہٹا دیں" },

  // Messages
  draftSaved: { en: "Draft saved.", ur: "مسودہ محفوظ ہو گیا۔" },
  draftConflict: {
    en: "The draft changed since you opened it. Reload to see the current version.",
    ur: "آپ کے کھولنے کے بعد سے مسودہ تبدیل ہو چکا ہے۔ موجودہ نسخہ دیکھنے کے لیے صفحہ دوبارہ لوڈ کریں۔",
  },
  nothingToPublish: {
    en: "Nothing to publish — the draft matches the live version.",
    ur: "شائع کرنے کے لیے کچھ نہیں — مسودہ لائیو نسخے جیسا ہی ہے۔",
  },
  published: { en: "Published.", ur: "شائع ہو گیا۔" },
  missingEn: { en: "English is missing here.", ur: "یہاں انگریزی موجود نہیں۔" },
  missingUr: { en: "Urdu is missing here.", ur: "یہاں اردو موجود نہیں۔" },

  // Test tool
  testHeading: { en: "Try a question against the draft", ur: "مسودے کے خلاف ایک سوال آزمائیں" },
  testPlaceholder: { en: "e.g. What is the fee for Class 6?", ur: "مثلاً کلاس 6 کی فیس کتنی ہے؟" },
  testRun: { en: "Try it", ur: "آزمائیں" },
  simulationNotice: {
    en: "This is a simulation of the draft content. The live voice agent may answer differently.",
    ur: "یہ مسودے کے مواد کی نقل ہے۔ لائیو صوتی ایجنٹ مختلف جواب دے سکتا ہے۔",
  },
  testHandoff: { en: "This question is passed to a person:", ur: "یہ سوال کسی فرد کو منتقل کیا جاتا ہے:" },
  testNoMatch: {
    en: "The draft has no content for that question yet.",
    ur: "مسودے میں ابھی اس سوال کے لیے کوئی مواد نہیں۔",
  },

  // Publish dialog
  publishHeading: { en: "These changes will go live", ur: "یہ تبدیلیاں لائیو ہو جائیں گی" },
  publishBlocked: {
    en: "Fix these before publishing:",
    ur: "شائع کرنے سے پہلے یہ ٹھیک کریں:",
  },

  // Escalation removal
  removeEscalationHeading: {
    en: "Remove this escalation topic?",
    ur: "کیا یہ موضوع ہٹا دیں؟",
  },
  removeEscalationWarning: {
    en: "Removing it means the agent may start answering this question instead of passing it to a person.",
    ur: "اسے ہٹانے کا مطلب ہے کہ ایجنٹ اسے کسی فرد کو منتقل کرنے کے بجائے خود جواب دینا شروع کر سکتا ہے۔",
  },

  // Empty / history
  historyTitle: { en: "Change history", ur: "تبدیلیوں کی تاریخ" },
  historyEmpty: {
    en: "Nothing has been published yet.",
    ur: "ابھی تک کچھ شائع نہیں ہوا۔",
  },
  loadError: {
    en: "Could not load this. Reload the page to try again.",
    ur: "یہ لوڈ نہیں ہو سکا۔ دوبارہ کوشش کے لیے صفحہ ری لوڈ کریں۔",
  },
} as const;
