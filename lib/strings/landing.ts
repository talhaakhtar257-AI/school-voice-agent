/**
 * Every sentence a parent sees on the public landing page, English and Urdu
 * side by side, so a missing translation is visible while reading the file
 * rather than found on screen (Constitution IV).
 */
export const landingStrings = {
  // Header
  schoolName: { en: "Al-Noor Public School", ur: "النور پبلک سکول" },
  headline: {
    en: "Ask our admissions assistant anything, any time.",
    ur: "ہمارے داخلہ اسسٹنٹ سے کسی بھی وقت کچھ بھی پوچھیں۔",
  },

  // The talk button
  talkButton: { en: "Talk to Admission Office", ur: "داخلہ آفس سے بات کریں" },
  decisionNotice: {
    en: "Final admission decisions are made by school staff, not by this assistant.",
    ur: "داخلے کا حتمی فیصلہ اسکول کا عملہ کرتا ہے، یہ اسسٹنٹ نہیں۔",
  },

  // How it works
  howItWorksTitle: { en: "How it works", ur: "یہ کیسے کام کرتا ہے" },
  howItWorksStep1: {
    en: "1. Tap Talk and allow the microphone.",
    ur: "١۔ بات کریں پر ٹیپ کریں اور مائیکروفون کی اجازت دیں۔",
  },
  howItWorksStep2: {
    en: "2. Ask your question in Urdu or English.",
    ur: "٢۔ اردو یا انگریزی میں اپنا سوال پوچھیں۔",
  },
  howItWorksStep3: {
    en: "3. Get an answer, or be connected to the office.",
    ur: "٣۔ جواب حاصل کریں، یا دفتر سے رابطہ کروایا جائے گا۔",
  },

  // Consent and control
  micExplainerTitle: {
    en: "Why we ask for your microphone",
    ur: "ہم مائیکروفون کیوں مانگتے ہیں",
  },
  // These three sentences must agree with each other and with the privacy policy
  // (feature 012). An earlier "nothing is used for anything else" contradicted
  // the recording notice, on the very screen where the parent gives consent.
  micExplainerBody: {
    en: "The assistant hears your question through your microphone and answers out loud, like a phone call. The microphone is used only during the call.",
    ur: "اسسٹنٹ آپ کے مائیکروفون کے ذریعے آپ کا سوال سنتا ہے اور فون کال کی طرح زبانی جواب دیتا ہے۔ مائیکروفون صرف کال کے دوران استعمال ہوتا ہے۔",
  },
  micExplainerContinue: { en: "Continue", ur: "جاری رکھیں" },
  recordingNotice: {
    en: "This call is recorded and written down so the school can follow up your enquiry and improve the assistant's answers.",
    ur: "یہ کال ریکارڈ اور تحریر کی جاتی ہے تاکہ اسکول آپ کی درخواست پر رابطہ کر سکے اور اسسٹنٹ کے جوابات بہتر بنا سکے۔",
  },
  privacyLine: {
    en: "Your details are used only for your admission enquiry and to improve this assistant. They are never sold or used for advertising.",
    ur: "آپ کی تفصیلات صرف آپ کی داخلہ درخواست اور اس اسسٹنٹ کو بہتر بنانے کے لیے استعمال ہوتی ہیں۔ انہیں کبھی فروخت یا اشتہارات کے لیے استعمال نہیں کیا جاتا۔",
  },
  aiDisclosure: {
    en: "You are talking to an AI assistant, not a person.",
    ur: "آپ ایک AI اسسٹنٹ سے بات کر رہے ہیں، کسی شخص سے نہیں۔",
  },

  // Call states
  stateConnecting: { en: "Connecting…", ur: "رابطہ ہو رہا ہے…" },
  stateListening: { en: "Listening…", ur: "سن رہا ہے…" },
  stateSpeaking: { en: "Speaking…", ur: "بول رہا ہے…" },
  endCall: { en: "End Call", ur: "کال ختم کریں" },
  micRefused: {
    en: "Microphone access was not given. You can still type a question below, read our answers, or call the office.",
    ur: "مائیکروفون تک رسائی نہیں دی گئی۔ آپ نیچے سوال ٹائپ کر سکتے ہیں، ہمارے جوابات پڑھ سکتے ہیں، یا دفتر کو کال کر سکتے ہیں۔",
  },
  callTimeUp: {
    en: "This call has reached its time limit. Please call the office to continue.",
    ur: "اس کال کا وقت ختم ہو گیا ہے۔ جاری رکھنے کے لیے براہ کرم دفتر کو کال کریں۔",
  },

  // Fallback reasons (from POST /api/retell/web-call)
  noContentYet: {
    en: "The assistant has no information to share yet. Please call the office.",
    ur: "ابھی اسسٹنٹ کے پاس بتانے کے لیے کوئی معلومات نہیں۔ براہ کرم دفتر کو کال کریں۔",
  },
  assistantUnavailable: {
    en: "The assistant is not available right now. Please call the office.",
    ur: "اسسٹنٹ اس وقت دستیاب نہیں ہے۔ براہ کرم دفتر کو کال کریں۔",
  },
  limitReached: {
    en: "We've reached today's limit for calls. Please call the office, or type your question below.",
    ur: "آج کالز کی حد پوری ہو چکی ہے۔ براہ کرم دفتر کو کال کریں، یا نیچے اپنا سوال ٹائپ کریں۔",
  },

  // Text chat
  textChatTitle: { en: "Or type your question", ur: "یا اپنا سوال ٹائپ کریں" },
  textChatFromPublished: {
    en: "Answers come from our published information, not a live agent.",
    ur: "جوابات ہماری شائع شدہ معلومات سے آتے ہیں، کسی زندہ ایجنٹ سے نہیں۔",
  },
  textChatPlaceholder: {
    en: "e.g. What is the fee for Class 6?",
    ur: "مثلاً کلاس 6 کی فیس کتنی ہے؟",
  },
  textChatSend: { en: "Ask", ur: "پوچھیں" },
  textChatHandoff: {
    en: "For this, please contact the office:",
    ur: "اس کے لیے براہ کرم دفتر سے رابطہ کریں:",
  },
  textChatNoMatch: {
    en: "We don't have published information about that yet. Please call the office.",
    ur: "ابھی اس بارے میں شائع شدہ معلومات موجود نہیں۔ براہ کرم دفتر کو کال کریں۔",
  },

  // Written FAQ
  faqTitle: { en: "Common questions", ur: "عام سوالات" },
  faqEmpty: {
    en: "Answers will appear here once the school publishes them.",
    ur: "اسکول کی جانب سے شائع ہونے کے بعد جوابات یہاں ظاہر ہوں گے۔",
  },
  faqUnavailable: {
    en: "Answers are temporarily unavailable. Please call the office.",
    ur: "جوابات عارضی طور پر دستیاب نہیں ہیں۔ براہ کرم دفتر کو کال کریں۔",
  },
} as const;
