/**
 * Staff dashboard strings for Health, Settings, the gap list and the lead
 * drawer. English and Urdu side by side, same pattern as dashboard.ts.
 */
export const screenStrings = {
  // Leads screen + drawer
  leadsSub: {
    en: "Every parent enquiry, newest first. Tap a row for details.",
    ur: "والدین کی ہر درخواست، نئی پہلے۔ تفصیل کے لیے سطر پر ٹیپ کریں۔",
  },
  details: { en: "Details", ur: "تفصیل" },
  leadDetails: { en: "Lead details", ur: "درخواست کی تفصیل" },
  callBack: { en: "Call back", ur: "واپس کال کریں" },
  close: { en: "Close", ur: "بند کریں" },
  noPhone: { en: "No confirmed phone number.", ur: "کوئی تصدیق شدہ فون نمبر نہیں۔" },

  // Gap list
  gapsSub: {
    en: "Most asked first. Add the answer in the content editor, then publish.",
    ur: "سب سے زیادہ پوچھے گئے پہلے۔ مواد میں جواب شامل کریں، پھر شائع کریں۔",
  },
  addAnswer: { en: "Add answer", ur: "جواب شامل کریں" },

  // Health
  healthCallsToday: { en: "Calls started today", ur: "آج شروع ہونے والی کالز" },
  healthMinutes: { en: "Minutes reserved this month", ur: "اس مہینے محفوظ منٹ" },
  healthMinutesHint: {
    en: "Each call reserves its full maximum length against the cap.",
    ur: "ہر کال حد میں سے اپنی پوری زیادہ سے زیادہ مدت محفوظ کرتی ہے۔",
  },
  healthGaps: { en: "Open gaps", ur: "کھلی کمیاں" },
  checksTitle: { en: "System checks", ur: "سسٹم کی جانچ" },
  ok: { en: "OK", ur: "ٹھیک" },
  attention: { en: "Needs attention", ur: "توجہ درکار" },
  checkDb: { en: "Database connection", ur: "ڈیٹا بیس رابطہ" },
  checkDbOk: { en: "The app can reach its database.", ur: "ایپ ڈیٹا بیس تک پہنچ سکتی ہے۔" },
  checkDbBad: {
    en: "The database did not answer, or configuration is missing.",
    ur: "ڈیٹا بیس نے جواب نہیں دیا، یا ترتیب نامکمل ہے۔",
  },
  checkContent: { en: "Published content", ur: "شائع شدہ مواد" },
  checkContentOk: { en: "Content is published.", ur: "مواد شائع ہے۔" },
  checkContentBad: {
    en: "Nothing is published — the assistant has nothing to answer from.",
    ur: "کچھ شائع نہیں — اسسٹنٹ کے پاس جواب دینے کو کچھ نہیں۔",
  },
  checkRetell: { en: "Retell voice keys", ur: "Retell وائس کیز" },
  checkRetellOk: { en: "Keys are set.", ur: "کیز موجود ہیں۔" },
  checkRetellBad: { en: "Keys are missing — calls cannot start.", ur: "کیز موجود نہیں — کالز شروع نہیں ہو سکتیں۔" },
  checkLimits: { en: "Voice limits", ur: "وائس کی حدیں" },
  checkLimitsOk: { en: "All three limits are set.", ur: "تینوں حدیں مقرر ہیں۔" },
  checkLimitsBad: {
    en: "A limit is missing — every call is refused.",
    ur: "کوئی حد موجود نہیں — ہر کال رد ہو جاتی ہے۔",
  },
  checkPhone: { en: "Office phone number", ur: "دفتر کا فون نمبر" },
  checkPhoneOk: { en: "A real number is set.", ur: "اصل نمبر موجود ہے۔" },
  checkPhoneDemo: {
    en: "Demo number in use (021-000-000-000), as expected while the content is marked as sample. Replace it with the school's number before launch.",
    ur: "ڈیمو نمبر استعمال ہو رہا ہے (021-000-000-000)، جو نمونہ مواد کے دوران درست ہے۔ اجرا سے پہلے اسکول کا نمبر ڈالیں۔",
  },
  checkPhoneBad: {
    en: "Still the placeholder number — replace it before the demo.",
    ur: "ابھی عارضی نمبر ہے — ڈیمو سے پہلے تبدیل کریں۔",
  },
  phase2Note: {
    en: "Response delay and transfer rate need call records, which arrive in phase 2.",
    ur: "جواب میں تاخیر اور منتقلی کی شرح کے لیے کال ریکارڈ درکار ہیں، جو دوسرے مرحلے میں آئیں گے۔",
  },

  // Settings
  settingsTitle: { en: "Current settings", ur: "موجودہ سیٹنگز" },
  settingsBanner: {
    en: "Read-only for now. Editable settings come in a later update.",
    ur: "فی الحال صرف دیکھنے کے لیے۔ قابلِ تبدیلی سیٹنگز بعد میں آئیں گی۔",
  },
  officePhone: { en: "Office phone", ur: "دفتر کا فون" },
  maxCallLength: { en: "Maximum call length", ur: "کال کی زیادہ سے زیادہ مدت" },
  callsPerVisitor: { en: "Calls per visitor per day", ur: "فی وزیٹر روزانہ کالز" },
  monthlyCap: { en: "Monthly minute cap", ur: "ماہانہ منٹ کی حد" },
  retellConfigured: { en: "Retell configured", ur: "Retell ترتیب شدہ" },
  whereOffice: {
    en: "Changed in the code file lib/office.ts.",
    ur: "کوڈ فائل lib/office.ts میں تبدیل ہوتا ہے۔",
  },
  whereEnv: {
    en: "Changed in Vercel → Settings → Environment Variables, then redeploy.",
    ur: "Vercel → Settings → Environment Variables میں تبدیل کریں، پھر دوبارہ ڈیپلائے کریں۔",
  },
  notSet: { en: "Not set", ur: "مقرر نہیں" },
  yes: { en: "Yes", ur: "ہاں" },
  no: { en: "No", ur: "نہیں" },
  minutes: { en: "min", ur: "منٹ" },
  seconds: { en: "seconds", ur: "سیکنڈ" },
  callsUnit: { en: "calls", ur: "کالز" },
} as const;
