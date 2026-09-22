/**
 * Staff dashboard strings for the shell, Overview and content tabs. English and
 * Urdu side by side so a missing translation is visible while reading. Health,
 * Settings, the gap list and the lead drawer live in dashboard-screens.ts.
 */
export const dashboardStrings = {
  // Shell
  brandSub: { en: "Admissions console", ur: "داخلہ کنسول" },
  navLabel: { en: "Dashboard", ur: "ڈیش بورڈ" },
  navOverview: { en: "Overview", ur: "خلاصہ" },
  navLeads: { en: "Leads", ur: "درخواستیں" },
  navGaps: { en: "Knowledge", ur: "معلومات" },
  navContent: { en: "Content", ur: "مواد" },
  navHealth: { en: "Agent health", ur: "ایجنٹ کی حالت" },
  navSettings: { en: "Settings", ur: "سیٹنگز" },
  viewSite: { en: "Open public site ↗", ur: "عوامی ویب سائٹ کھولیں ↗" },
  signedInAs: { en: "Signed in as", ur: "لاگ ان" },
  statusReady: { en: "Ready", ur: "تیار" },
  statusAttention: { en: "Needs attention", ur: "توجہ درکار" },

  // Overview tiles
  tileCallsToday: { en: "Calls started today", ur: "آج شروع ہونے والی کالز" },
  tileCallsTodayHint: {
    en: "Calls that passed the limits check (UTC day)",
    ur: "وہ کالز جو حد کی جانچ سے گزریں (UTC دن)",
  },
  tileLeads7: { en: "Leads, last 7 days", ur: "درخواستیں، پچھلے 7 دن" },
  tileNewLeads: { en: "New leads waiting", ur: "نئی منتظر درخواستیں" },
  tileNewLeadsHint: { en: "Status still “New”", ur: "حالت ابھی “نیا” ہے" },
  tileGaps: { en: "Open gaps", ur: "کھلی کمیاں" },
  tileGapsHint: {
    en: "Questions the assistant couldn't answer",
    ur: "وہ سوال جن کا اسسٹنٹ جواب نہ دے سکا",
  },
  notAvailable: { en: "Could not load", ur: "لوڈ نہیں ہو سکا" },

  // Chart
  chartTitle: { en: "Leads per day", ur: "روزانہ درخواستیں" },
  chartSub: { en: "Last 7 days, split by language", ur: "پچھلے 7 دن، زبان کے حساب سے" },
  axisDay: { en: "Day", ur: "دن" },
  axisLeads: { en: "Leads", ur: "درخواستیں" },
  seriesEn: { en: "English", ur: "انگریزی" },
  seriesUr: { en: "Urdu", ur: "اردو" },
  seriesNone: { en: "Not given", ur: "نہیں بتایا" },
  showTable: { en: "Show data table", ur: "ڈیٹا ٹیبل دکھائیں" },
  hideTable: { en: "Hide data table", ur: "ڈیٹا ٹیبل چھپائیں" },
  chartEmpty: {
    en: "No leads in the last 7 days. When parents leave their details, this chart fills in.",
    ur: "پچھلے 7 دنوں میں کوئی درخواست نہیں۔ جب والدین اپنی تفصیل دیں گے تو یہ چارٹ بھر جائے گا۔",
  },

  // Top gaps + recent leads
  topGapsTitle: { en: "What the assistant couldn't answer", ur: "جن سوالوں کا جواب نہ مل سکا" },
  topGapsEmpty: {
    en: "Nothing yet — the assistant has answered everything asked so far.",
    ur: "ابھی کچھ نہیں — اسسٹنٹ نے اب تک ہر سوال کا جواب دیا ہے۔",
  },
  timesShort: { en: "times", ur: "بار" },
  seeAllGaps: { en: "Open Knowledge", ur: "معلومات کھولیں" },
  statsToday: { en: "Today", ur: "آج" },
  statsWeek: { en: "This week", ur: "اس ہفتے" },
  statsWeekHint: { en: "Last 7 days, Pakistan time", ur: "پچھلے 7 دن، پاکستانی وقت" },
  statsCalls: { en: "Calls", ur: "کالز" },
  statsLeads: { en: "Leads", ur: "درخواستیں" },
  statsAvgLength: { en: "Avg. call length", ur: "اوسط کال دورانیہ" },
  statsNewQuestions: { en: "New questions", ur: "نئے سوالات" },
  recentTitle: { en: "Recent leads", ur: "حالیہ درخواستیں" },
  seeAllLeads: { en: "See all leads", ur: "تمام درخواستیں" },
  loadErrorTitle: { en: "Could not load this", ur: "یہ لوڈ نہیں ہو سکا" },
  loadErrorBody: {
    en: "Something went wrong reading the data. Reload the page to try again.",
    ur: "ڈیٹا پڑھنے میں مسئلہ ہوا۔ دوبارہ کوشش کے لیے صفحہ ری لوڈ کریں۔",
  },

  // Content tabs
  tabEdit: { en: "Edit", ur: "ترمیم" },
  tabTest: { en: "Test the draft", ur: "مسودہ آزمائیں" },
  tabHistory: { en: "History", ur: "تاریخ" },
  unsavedHint: {
    en: "Unsaved changes — save before publishing.",
    ur: "غیر محفوظ تبدیلیاں — شائع کرنے سے پہلے محفوظ کریں۔",
  },
} as const;
