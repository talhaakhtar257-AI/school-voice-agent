import type { PrivacySection } from "./privacy";

/** Policy sections 7–11. Read the note in privacy-sections.ts before editing. */
export const privacySectionsSevenToEleven: PrivacySection[] = [
  {
    id: "who-else",
    heading: { en: "Who else handles your information", ur: "آپ کی معلومات اور کون سنبھالتا ہے" },
    paragraphs: {
      en: ["A few service providers run this system for the school. They handle your information only to provide their service:"],
      ur: ["چند سروس فراہم کنندگان اسکول کے لیے یہ نظام چلاتے ہیں۔ وہ آپ کی معلومات صرف اپنی سروس فراہم کرنے کے لیے استعمال کرتے ہیں:"],
    },
    list: {
      en: [
        "The company that runs the voice calls (Retell AI). It turns speech into text and back, uses AI language and voice providers to create the replies, and keeps the call recording.",
        "Our database provider, which stores enquiries, transcripts and summaries.",
        "Our website host.",
        "Our email providers, which send you the information you asked for and send the school office the enquiry summary and conversation.",
      ],
      ur: [
        "وائس کالز چلانے والی کمپنی (Retell AI)۔ یہ آواز کو تحریر اور تحریر کو آواز میں بدلتی ہے، جواب بنانے کے لیے اے آئی زبان اور آواز کی سروسز استعمال کرتی ہے، اور کال کی ریکارڈنگ رکھتی ہے۔",
        "ہمارا ڈیٹا بیس فراہم کنندہ، جو درخواستیں، ٹرانسکرپٹ اور خلاصے محفوظ رکھتا ہے۔",
        "ہماری ویب سائٹ کی ہوسٹنگ سروس۔",
        "ہماری ای میل سروسز، جو آپ کو مانگی ہوئی معلومات اور اسکول کے دفتر کو درخواست کا خلاصہ اور گفتگو بھیجتی ہیں۔",
      ],
    },
    after: {
      en: ["Some of these providers store or process information on servers outside Pakistan."],
      ur: ["ان میں سے کچھ فراہم کنندگان معلومات پاکستان سے باہر سرورز پر محفوظ یا پروسیس کرتے ہیں۔"],
    },
  },
  {
    id: "cookies",
    heading: { en: "Cookies", ur: "کوکیز" },
    paragraphs: {
      en: ["This website sets only two small cookies for parents:"],
      ur: ["یہ ویب سائٹ والدین کے لیے صرف دو چھوٹی کوکیز رکھتی ہے:"],
    },
    list: {
      en: [
        "A language cookie, which remembers whether you chose English or Urdu. It lasts one year.",
        "An anonymous visitor cookie, used only to limit how many calls one device can start each day. It does not contain your name or number, and lasts about a year.",
      ],
      ur: [
        "زبان کی کوکی، جو یاد رکھتی ہے کہ آپ نے انگریزی چنی یا اردو۔ یہ ایک سال تک رہتی ہے۔",
        "ایک گمنام وزیٹر کوکی، جو صرف یہ حد رکھنے کے لیے ہے کہ ایک ڈیوائس سے روزانہ کتنی کالیں شروع ہو سکتی ہیں۔ اس میں آپ کا نام یا نمبر نہیں ہوتا، اور یہ تقریباً ایک سال رہتی ہے۔",
      ],
    },
    after: {
      en: ["School staff who sign in to the staff pages also get login cookies. We do not use analytics or advertising cookies."],
      ur: ["عملے کے صفحات پر لاگ اِن کرنے والے اسکول کے عملے کو لاگ اِن کوکیز بھی ملتی ہیں۔ ہم تجزیاتی یا اشتہاری کوکیز استعمال نہیں کرتے۔"],
    },
  },
  {
    id: "retention-and-choices",
    heading: { en: "How long we keep it, and your choices", ur: "ہم معلومات کب تک رکھتے ہیں، اور آپ کے اختیارات" },
    paragraphs: {
      en: [
        "We keep enquiry details, transcripts and summaries for the current admission session, so the office can follow up.",
        "You can ask the school office at any time to see, correct or delete your details. Call {phone} and a member of staff will make the change.",
        "You do not have to use the voice assistant. You can type your question on the admissions page instead, or call the office. Giving an email address is optional.",
      ],
      ur: [
        "ہم داخلے کی تفصیلات، ٹرانسکرپٹ اور خلاصے موجودہ داخلہ سیشن تک رکھتے ہیں تاکہ دفتر آپ سے رابطہ کر سکے۔",
        "آپ کسی بھی وقت اسکول کے دفتر سے اپنی تفصیلات دیکھنے، درست کرنے یا حذف کرنے کا کہہ سکتے ہیں۔ {phone} پر کال کریں، عملے کا کوئی رکن تبدیلی کر دے گا۔",
        "وائس اسسٹنٹ استعمال کرنا ضروری نہیں۔ آپ داخلے کے صفحے پر اپنا سوال لکھ سکتے ہیں، یا دفتر کو کال کر سکتے ہیں۔ ای میل دینا اختیاری ہے۔",
      ],
    },
  },
  {
    id: "children",
    heading: { en: "Children's information", ur: "بچوں کی معلومات" },
    paragraphs: {
      en: ["Details about a child, such as name, age and class, are given by the parent or guardian making the enquiry. We use them only for that admission enquiry."],
      ur: ["بچے کی تفصیلات، جیسے نام، عمر اور کلاس، درخواست کرنے والے والدین یا سرپرست دیتے ہیں۔ ہم انہیں صرف اسی داخلہ درخواست کے لیے استعمال کرتے ہیں۔"],
    },
  },
  {
    id: "changes",
    heading: { en: "Changes to this policy", ur: "اس پالیسی میں تبدیلیاں" },
    paragraphs: {
      en: ["If we change how we use information, we will update this page and the date at the top."],
      ur: ["اگر ہم معلومات کے استعمال کا طریقہ بدلیں تو اس صفحے اور اوپر دی گئی تاریخ کو اپ ڈیٹ کریں گے۔"],
    },
  },
];
