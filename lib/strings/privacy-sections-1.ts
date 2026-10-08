import type { PrivacySection } from "./privacy";

/** Policy sections 1–6. Read the note in privacy-sections.ts before editing. */
export const privacySectionsOneToSix: PrivacySection[] = [
  {
    id: "who-we-are",
    heading: { en: "Who we are", ur: "ہم کون ہیں" },
    paragraphs: {
      en: [
        "This policy explains how {school}, Karachi (\"the school\", \"we\") handles the information you give when you use this website and its AI admissions assistant.",
        "If you have a question about your information, or want to see, correct or delete it, call the school office on {phone}.",
      ],
      ur: [
        "یہ پالیسی بتاتی ہے کہ {school}، کراچی (\"اسکول\"، \"ہم\") اس ویب سائٹ اور اس کے اے آئی داخلہ اسسٹنٹ کے استعمال کے دوران آپ کی دی ہوئی معلومات کو کیسے سنبھالتا ہے۔",
        "اگر آپ کی معلومات کے بارے میں کوئی سوال ہو، یا آپ انہیں دیکھنا، درست کروانا یا حذف کروانا چاہیں، تو اسکول کے دفتر کو {phone} پر کال کریں۔",
      ],
    },
  },
  {
    id: "before-a-call",
    heading: { en: "What we collect before a call", ur: "کال سے پہلے ہم کیا لیتے ہیں" },
    paragraphs: {
      en: ["Before the voice assistant starts, we ask you to type:"],
      ur: ["وائس اسسٹنٹ شروع ہونے سے پہلے ہم آپ سے یہ لکھنے کو کہتے ہیں:"],
    },
    list: {
      en: [
        "Your name",
        "Your mobile number",
        "Your email address — only if you choose to give it",
        "Your agreement to a recorded call (the tick box)",
      ],
      ur: [
        "آپ کا نام",
        "آپ کا موبائل نمبر",
        "آپ کی ای میل — صرف اگر آپ دینا چاہیں",
        "ریکارڈ شدہ کال کے لیے آپ کی رضامندی (نشان والا خانہ)",
      ],
    },
    after: {
      en: ["The assistant uses your name to greet you, and the office uses these details to follow up your enquiry. The assistant does not ask for them again during the call."],
      ur: ["اسسٹنٹ آپ کا نام لے کر آپ کو خوش آمدید کہتا ہے، اور دفتر انہی تفصیلات سے آپ کی درخواست پر رابطہ کرتا ہے۔ کال کے دوران اسسٹنٹ یہ دوبارہ نہیں پوچھتا۔"],
    },
  },
  {
    id: "during-a-call",
    heading: { en: "What we keep from a call", ur: "کال سے ہم کیا محفوظ رکھتے ہیں" },
    paragraphs: {
      en: [
        "The conversation with the assistant is recorded. We keep a written copy of it (a transcript) and a short summary.",
        "If you share them, we also keep these enquiry details:",
      ],
      ur: [
        "اسسٹنٹ کے ساتھ گفتگو ریکارڈ کی جاتی ہے۔ ہم اس کی تحریری نقل (ٹرانسکرپٹ) اور ایک مختصر خلاصہ محفوظ رکھتے ہیں۔",
        "اگر آپ بتائیں تو ہم داخلے سے متعلق یہ تفصیلات بھی رکھتے ہیں:",
      ],
    },
    list: {
      en: [
        "The parent's name and phone number",
        "The child's name and age",
        "The class you are applying for, the child's current class and previous school",
        "Whether it is a new admission or a transfer",
        "The language you spoke in",
      ],
      ur: [
        "والدین کا نام اور فون نمبر",
        "بچے کا نام اور عمر",
        "جس کلاس میں داخلہ چاہیے، بچے کی موجودہ کلاس اور پچھلا اسکول",
        "نیا داخلہ ہے یا ٹرانسفر",
        "جس زبان میں آپ نے بات کی",
      ],
    },
    after: {
      en: [
        "A name or number is saved only after you confirm it. A name you do not confirm is left empty.",
        "When the assistant cannot answer a question, the question is added to a list for the school to answer. That list keeps only the question and its language.",
      ],
      ur: [
        "نام یا نمبر آپ کی تصدیق کے بعد ہی محفوظ ہوتا ہے۔ جس نام کی آپ تصدیق نہ کریں وہ خالی چھوڑ دیا جاتا ہے۔",
        "جب اسسٹنٹ کسی سوال کا جواب نہ دے سکے تو وہ سوال اسکول کی ایک فہرست میں شامل ہو جاتا ہے تاکہ جواب تیار کیا جا سکے۔ اس فہرست میں صرف سوال اور اس کی زبان رکھی جاتی ہے۔",
      ],
    },
  },
  {
    id: "never-collected",
    heading: { en: "What we never collect", ur: "ہم کیا کبھی نہیں لیتے" },
    paragraphs: {
      en: [
        "The assistant never asks for a CNIC or B-Form number, and the school does not need one at the enquiry stage. Please do not say these numbers during the call. If one is spoken, it is hidden with stars in the written transcript we keep.",
        "We do not collect payment or bank card details.",
      ],
      ur: [
        "اسسٹنٹ کبھی شناختی کارڈ یا ب فارم نمبر نہیں مانگتا، اور معلومات کے اس مرحلے پر اسکول کو اس کی ضرورت نہیں۔ براہ کرم کال کے دوران یہ نمبر نہ بتائیں۔ اگر بتا دیا جائے تو ہماری محفوظ تحریری نقل میں اسے ستاروں سے چھپا دیا جاتا ہے۔",
        "ہم ادائیگی یا بینک کارڈ کی تفصیلات نہیں لیتے۔",
      ],
    },
  },
  {
    id: "ai-assistant",
    heading: { en: "About the AI assistant", ur: "اے آئی اسسٹنٹ کے بارے میں" },
    paragraphs: {
      en: [
        "You are talking to an AI assistant, not a person. It answers only from information the school has approved.",
        "It never confirms an admission, never promises a seat and never offers a discount. Admission decisions are made by school staff.",
        "You can always speak to a person by calling the office on {phone}. School staff may also listen to a call while it is happening, or join it to help you.",
      ],
      ur: [
        "آپ ایک اے آئی اسسٹنٹ سے بات کر رہے ہیں، کسی شخص سے نہیں۔ یہ صرف اسکول کی منظور شدہ معلومات سے جواب دیتا ہے۔",
        "یہ کبھی داخلے کی تصدیق نہیں کرتا، سیٹ کا وعدہ نہیں کرتا اور کوئی رعایت پیش نہیں کرتا۔ داخلے کا فیصلہ اسکول کا عملہ کرتا ہے۔",
        "آپ دفتر کو {phone} پر کال کر کے ہمیشہ کسی شخص سے بات کر سکتے ہیں۔ اسکول کا عملہ کال کے دوران اسے سن بھی سکتا ہے، یا آپ کی مدد کے لیے کال میں شامل ہو سکتا ہے۔",
      ],
    },
  },
  {
    id: "why",
    heading: { en: "Why we use your information", ur: "ہم آپ کی معلومات کیوں استعمال کرتے ہیں" },
    paragraphs: { en: ["We use it:"], ur: ["ہم اسے ان کاموں کے لیے استعمال کرتے ہیں:"] },
    list: {
      en: [
        "To answer your admission questions",
        "So the school office can contact you about your enquiry",
        "To email you the information you asked for, if you gave an email address",
        "To improve the assistant's answers. Staff may turn questions from calls into new answers, after names, phone numbers, email addresses and ID numbers are removed.",
      ],
      ur: [
        "آپ کے داخلے سے متعلق سوالوں کے جواب دینے کے لیے",
        "تاکہ اسکول کا دفتر آپ کی درخواست کے بارے میں آپ سے رابطہ کر سکے",
        "اگر آپ نے ای میل دی ہو تو آپ کی مانگی ہوئی معلومات ای میل کرنے کے لیے",
        "اسسٹنٹ کے جوابات بہتر بنانے کے لیے۔ عملہ کالوں کے سوالوں سے نئے جوابات بنا سکتا ہے، لیکن اس سے پہلے نام، فون نمبر، ای میل اور شناختی نمبر ہٹا دیے جاتے ہیں۔",
      ],
    },
    after: {
      en: ["We do not sell your information, and we do not use it for advertising."],
      ur: ["ہم آپ کی معلومات فروخت نہیں کرتے اور انہیں اشتہارات کے لیے استعمال نہیں کرتے۔"],
    },
  },
];
