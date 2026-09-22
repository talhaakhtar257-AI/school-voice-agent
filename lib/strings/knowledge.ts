/** Strings for the Knowledge screens (feature 010, stage 3). English and Urdu side by side. */
export const knowledgeStrings = {
  title: { en: "Knowledge", ur: "معلومات" },
  sub: {
    en: "What the assistant knows beyond your content: questions parents asked that need an answer, and documents you imported.",
    ur: "مواد کے علاوہ اسسٹنٹ کی معلومات: والدین کے وہ سوال جن کا جواب درکار ہے، اور آپ کی شامل کی ہوئی دستاویزات۔",
  },
  draftNote: {
    en: "Everything here goes into the draft. Parents hear it only after you press Publish on the Content screen.",
    ur: "یہاں سب کچھ مسودے میں جاتا ہے۔ والدین تک یہ تبھی پہنچتا ہے جب آپ مواد والی اسکرین پر شائع کریں۔",
  },
  openContent: { en: "Open Content to publish", ur: "شائع کرنے کے لیے مواد کھولیں" },

  // Questions
  questionsTitle: { en: "Asked by parents", ur: "والدین کے سوالات" },
  questionsSub: {
    en: "Questions the assistant could not answer. Open one to write its answer.",
    ur: "وہ سوال جن کا جواب اسسٹنٹ نہ دے سکا۔ جواب لکھنے کے لیے کھولیں۔",
  },
  showOpen: { en: "Needs an answer", ur: "جواب درکار" },
  showAnswered: { en: "Answered", ur: "جواب دیا گیا" },
  timesAsked: { en: "Asked", ur: "پوچھا گیا" },
  times: { en: "times", ur: "بار" },
  lastAsked: { en: "Last asked", ur: "آخری بار" },
  answeredOn: { en: "Answered on", ur: "جواب کی تاریخ" },
  open: { en: "Open", ur: "کھولیں" },
  questionsEmpty: {
    en: "Nothing waiting — the assistant has answered every question so far.",
    ur: "کچھ باقی نہیں — اسسٹنٹ نے اب تک ہر سوال کا جواب دیا ہے۔",
  },
  answeredEmpty: { en: "No answered questions yet.", ur: "ابھی کوئی سوال جواب شدہ نہیں۔" },

  // Documents
  docsTitle: { en: "Documents", ur: "دستاویزات" },
  docsSub: {
    en: "Text imported from a PDF or your website. Check it, then publish.",
    ur: "پی ڈی ایف یا ویب سائٹ سے لی گئی تحریر۔ دیکھ لیں، پھر شائع کریں۔",
  },
  docsEmpty: {
    en: "No documents yet. Add a PDF or a website address above.",
    ur: "ابھی کوئی دستاویز نہیں۔ اوپر پی ڈی ایف یا ویب سائٹ کا پتا شامل کریں۔",
  },
  source: { en: "Source", ur: "ذریعہ" },
  imported: { en: "Imported", ur: "شامل کی گئی" },
  characters: { en: "characters", ur: "حروف" },
  pdf: { en: "PDF", ur: "پی ڈی ایف" },
  website: { en: "Website", ur: "ویب سائٹ" },

  // Import
  addPdf: { en: "Add from PDF", ur: "پی ڈی ایف سے شامل کریں" },
  addPdfHint: {
    en: "A PDF up to 4 MB made from text (not a scanned photo).",
    ur: "4 ایم بی تک کی پی ڈی ایف جو تحریر سے بنی ہو (اسکین شدہ تصویر نہیں)۔",
  },
  choosePdf: { en: "Choose PDF", ur: "پی ڈی ایف چنیں" },
  addWebsite: { en: "Add from website", ur: "ویب سائٹ سے شامل کریں" },
  addWebsiteHint: {
    en: "Paste a page address. Up to 10 pages of the same website are read.",
    ur: "صفحے کا پتا لکھیں۔ اسی ویب سائٹ کے زیادہ سے زیادہ 10 صفحات پڑھے جائیں گے۔",
  },
  websitePlaceholder: { en: "https://www.your-school.edu.pk/admissions", ur: "https://www.your-school.edu.pk/admissions" },
  importButton: { en: "Import", ur: "شامل کریں" },
  importing: { en: "Reading…", ur: "پڑھا جا رہا ہے…" },
  imported_ok: { en: "Imported into the draft.", ur: "مسودے میں شامل ہو گیا۔" },

  // Import errors (by reason code from the actions)
  errors: {
    "no-file": { en: "Choose a PDF file first.", ur: "پہلے پی ڈی ایف فائل چنیں۔" },
    "too-big": { en: "This PDF is larger than 4 MB.", ur: "یہ پی ڈی ایف 4 ایم بی سے بڑی ہے۔" },
    "not-pdf": { en: "This file could not be read as a PDF.", ur: "یہ فائل پی ڈی ایف کے طور پر نہیں پڑھی جا سکی۔" },
    "no-text": {
      en: "No text could be read. A scanned PDF or an empty page has no text to import.",
      ur: "کوئی تحریر نہیں پڑھی جا سکی۔ اسکین شدہ پی ڈی ایف یا خالی صفحے میں تحریر نہیں ہوتی۔",
    },
    "invalid-url": { en: "That is not a valid web address.", ur: "یہ درست ویب ایڈریس نہیں۔" },
    private: { en: "That address cannot be read from here.", ur: "یہ پتا یہاں سے نہیں پڑھا جا سکتا۔" },
    unreachable: { en: "That website could not be reached.", ur: "اس ویب سائٹ تک رسائی نہیں ہو سکی۔" },
    invalid: { en: "Please fill in the required fields.", ur: "براہ کرم ضروری خانے پُر کریں۔" },
    missing: { en: "This item no longer exists.", ur: "یہ چیز اب موجود نہیں۔" },
    auth: { en: "Please sign in again.", ur: "براہ کرم دوبارہ سائن ان کریں۔" },
    error: { en: "Something went wrong. Please try again.", ur: "کچھ غلط ہو گیا۔ دوبارہ کوشش کریں۔" },
  } as Record<string, { en: string; ur: string }>,

  // Question page
  allKnowledge: { en: "Knowledge", ur: "معلومات" },
  questionHeading: { en: "Question from parents", ur: "والدین کا سوال" },
  askedTimes: { en: "Asked", ur: "پوچھا گیا" },
  writeAnswer: { en: "Write the answer", ur: "جواب لکھیں" },
  writeAnswerHint: {
    en: "This becomes a new FAQ in the draft. Tidy the question if needed; the assistant uses both.",
    ur: "یہ مسودے میں نیا عام سوال بن جائے گا۔ ضرورت ہو تو سوال درست کریں؛ اسسٹنٹ دونوں استعمال کرتا ہے۔",
  },
  questionEn: { en: "Question (English)", ur: "سوال (انگریزی)" },
  questionUr: { en: "Question (Urdu)", ur: "سوال (اردو)" },
  answerEn: { en: "Answer (English)", ur: "جواب (انگریزی)" },
  answerUr: { en: "Answer (Urdu)", ur: "جواب (اردو)" },
  saveAnswer: { en: "Save answer to draft", ur: "جواب مسودے میں محفوظ کریں" },
  saving: { en: "Saving…", ur: "محفوظ ہو رہا ہے…" },
  answerSaved: {
    en: "Saved as a draft FAQ. Publish on the Content screen so the assistant uses it.",
    ur: "مسودے میں عام سوال کے طور پر محفوظ ہو گیا۔ اسسٹنٹ کے استعمال کے لیے مواد والی اسکرین پر شائع کریں۔",
  },
  alreadyAnswered: {
    en: "This question was answered. Its answer is in the FAQs on the Content screen.",
    ur: "اس سوال کا جواب دیا جا چکا ہے۔ جواب مواد والی اسکرین پر عام سوالات میں ہے۔",
  },

  // Document page
  documentHeading: { en: "Imported document", ur: "شامل کی گئی دستاویز" },
  titleEn: { en: "Title (English)", ur: "عنوان (انگریزی)" },
  titleUr: { en: "Title (Urdu)", ur: "عنوان (اردو)" },
  textLabel: { en: "Text the assistant reads", ur: "وہ تحریر جو اسسٹنٹ پڑھتا ہے" },
  textHint: {
    en: "Remove anything wrong or out of date. The assistant answers only from what is here.",
    ur: "غلط یا پرانی بات ہٹا دیں۔ اسسٹنٹ صرف اسی سے جواب دیتا ہے۔",
  },
  saveDocument: { en: "Save changes", ur: "تبدیلیاں محفوظ کریں" },
  documentSaved: { en: "Saved in the draft.", ur: "مسودے میں محفوظ ہو گیا۔" },
  removeDocument: { en: "Remove document", ur: "دستاویز ہٹائیں" },
  confirmRemove: { en: "Yes, remove it", ur: "ہاں، ہٹا دیں" },
  cancel: { en: "Cancel", ur: "منسوخ" },
  removed: {
    en: "Removed from the draft. Publish so the assistant stops using it.",
    ur: "مسودے سے ہٹا دی گئی۔ شائع کریں تاکہ اسسٹنٹ اسے استعمال نہ کرے۔",
  },
  removedDoc: { en: "This document was removed.", ur: "یہ دستاویز ہٹا دی گئی ہے۔" },

  notFoundTitle: { en: "Not found", ur: "نہیں ملا" },
  notFoundBody: {
    en: "This question or document does not exist. Go back to Knowledge.",
    ur: "یہ سوال یا دستاویز موجود نہیں۔ معلومات پر واپس جائیں۔",
  },
  errorTitle: { en: "Could not load Knowledge", ur: "معلومات لوڈ نہیں ہو سکیں" },
  errorBody: {
    en: "Something went wrong while reading it. Refresh the page to try again.",
    ur: "پڑھتے ہوئے کچھ غلط ہو گیا۔ دوبارہ کوشش کے لیے صفحہ ریفریش کریں۔",
  },
} as const;
