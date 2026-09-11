/**
 * UI strings for the Leads dashboard screen. Same pattern as
 * lib/strings/content-admin.ts: English-primary chrome, Urdu kept alongside
 * each entry so a missing translation is visible while reading.
 */
export const leadsAdminStrings = {
  title: { en: "Leads", ur: "والدین کی درخواستیں" },

  // Column headings
  parentName: { en: "Parent name", ur: "والد/والدہ کا نام" },
  studentName: { en: "Student name", ur: "طالب علم کا نام" },
  classWanted: { en: "Class wanted", ur: "مطلوبہ کلاس" },
  currentClass: { en: "Current class", ur: "موجودہ کلاس" },
  age: { en: "Age", ur: "عمر" },
  phone: { en: "Phone", ur: "فون" },
  previousSchool: { en: "Previous school", ur: "سابقہ اسکول" },
  admissionType: { en: "Type", ur: "قسم" },
  language: { en: "Language", ur: "زبان" },
  date: { en: "Date", ur: "تاریخ" },
  status: { en: "Status", ur: "حالت" },

  // Values
  fresh: { en: "Fresh", ur: "نیا داخلہ" },
  transfer: { en: "Transfer", ur: "تبادلہ" },
  urdu: { en: "Urdu", ur: "اردو" },
  english: { en: "English", ur: "انگریزی" },
  statusNew: { en: "New", ur: "نیا" },
  statusContacted: { en: "Contacted", ur: "رابطہ ہو گیا" },
  statusApplied: { en: "Applied", ur: "درخواست دی" },
  statusClosed: { en: "Closed", ur: "بند" },

  // Empty / loading / error states
  emptyTitle: { en: "No enquiries yet", ur: "ابھی کوئی درخواست نہیں" },
  emptyBody: {
    en: "When a parent talks to the admissions assistant, their enquiry appears here — newest first.",
    ur: "جب والدین داخلہ اسسٹنٹ سے بات کریں گے تو ان کی درخواست یہاں نظر آئے گی — نئی پہلے۔",
  },
  errorTitle: { en: "Could not load leads", ur: "درخواستیں لوڈ نہیں ہو سکیں" },
  errorBody: {
    en: "Something went wrong reading the leads. Reload the page to try again.",
    ur: "درخواستیں پڑھنے میں مسئلہ ہوا۔ دوبارہ کوشش کے لیے صفحہ ری لوڈ کریں۔",
  },
  saveFailed: { en: "Status not saved — try again.", ur: "حالت محفوظ نہیں ہوئی — دوبارہ کوشش کریں۔" },
  notGiven: { en: "—", ur: "—" },
} as const;
