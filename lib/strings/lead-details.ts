/** Strings for the lead details page and the new Leads table columns (feature 010). */
export const leadDetailStrings = {
  name: { en: "Name", ur: "نام" },
  noName: { en: "Name not given", ur: "نام نہیں دیا گیا" },
  noSummary: { en: "No summary yet", ur: "ابھی خلاصہ نہیں" },
  filterAll: { en: "All", ur: "تمام" },
  filterLabel: { en: "Show leads by status", ur: "حالت کے حساب سے درخواستیں" },
  searchLabel: { en: "Search leads", ur: "درخواستیں تلاش کریں" },
  searchPlaceholder: { en: "Search name, phone or email…", ur: "نام، فون یا ای میل تلاش کریں…" },
  noMatchesTitle: { en: "No leads match", ur: "کوئی درخواست نہیں ملی" },
  noMatchesBody: {
    en: "Try another name or number, or choose All.",
    ur: "کوئی اور نام یا نمبر آزمائیں، یا “تمام” چنیں۔",
  },
  enquiry: { en: "Enquiry", ur: "درخواست" },
  received: { en: "Received", ur: "موصول" },
  contact: { en: "Contact", ur: "رابطہ" },
  email: { en: "Email", ur: "ای میل" },
  summary: { en: "Summary", ur: "خلاصہ" },
  callLength: { en: "Call length", ur: "کال کا دورانیہ" },
  allLeads: { en: "All leads", ur: "تمام درخواستیں" },
  open: { en: "Open", ur: "کھولیں" },
  summaryTitle: { en: "Summary of the call", ur: "کال کا خلاصہ" },
  summaryPending: {
    en: "The summary appears a minute or two after the call ends.",
    ur: "خلاصہ کال ختم ہونے کے ایک دو منٹ بعد نظر آئے گا۔",
  },
  summaryNone: {
    en: "No summary for this lead. It was saved before calls were recorded.",
    ur: "اس درخواست کا خلاصہ نہیں۔ یہ کالز محفوظ ہونے سے پہلے کی ہے۔",
  },
  detailsTitle: { en: "Details", ur: "تفصیلات" },
  conversationTitle: { en: "Full conversation", ur: "مکمل گفتگو" },
  parent: { en: "Parent", ur: "والدین" },
  assistant: { en: "Assistant", ur: "اسسٹنٹ" },
  conversationLive: {
    en: "This call is still going on. Refresh in a minute to see the conversation.",
    ur: "یہ کال ابھی جاری ہے۔ گفتگو دیکھنے کے لیے ایک منٹ بعد صفحہ ریفریش کریں۔",
  },
  conversationProcessing: {
    en: "The conversation is still being processed. Refresh in a minute.",
    ur: "گفتگو ابھی تیار ہو رہی ہے۔ ایک منٹ بعد ریفریش کریں۔",
  },
  conversationNone: {
    en: "No conversation saved for this lead.",
    ur: "اس درخواست کی کوئی گفتگو محفوظ نہیں۔",
  },
  notFoundTitle: { en: "Lead not found", ur: "درخواست نہیں ملی" },
  notFoundBody: {
    en: "This lead does not exist. Go back to the list of leads.",
    ur: "یہ درخواست موجود نہیں۔ درخواستوں کی فہرست پر واپس جائیں۔",
  },
  errorTitle: { en: "Could not load this lead", ur: "یہ درخواست لوڈ نہیں ہو سکی" },
  errorBody: {
    en: "Something went wrong while reading it. Refresh the page to try again.",
    ur: "پڑھتے ہوئے کچھ غلط ہو گیا۔ دوبارہ کوشش کے لیے صفحہ ریفریش کریں۔",
  },
} as const;
