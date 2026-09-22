/** Strings for the Live calls screen (feature 010, stage 4). */
export const liveStrings = {
  nav: { en: "Live calls", ur: "جاری کالز" },
  live: { en: "live", ur: "جاری" },
  title: { en: "Calls happening now", ur: "اس وقت جاری کالز" },
  sub: {
    en: "Updates by itself every 10 seconds. Watch a call, listen in, or take it over and talk to the parent yourself.",
    ur: "ہر 10 سیکنڈ میں خود تازہ ہوتا ہے۔ کال دیکھیں، سنیں، یا خود سنبھال کر والدین سے بات کریں۔",
  },
  empty: {
    en: "No one is talking to the assistant right now. Calls appear here the moment they start.",
    ur: "اس وقت کوئی اسسٹنٹ سے بات نہیں کر رہا۔ کالز شروع ہوتے ہی یہاں نظر آئیں گی۔",
  },
  errorTitle: { en: "Could not load live calls", ur: "جاری کالز لوڈ نہیں ہو سکیں" },
  errorBody: { en: "Refresh the page to try again.", ur: "دوبارہ کوشش کے لیے صفحہ ریفریش کریں۔" },
  started: { en: "Started", ur: "شروع" },
  running: { en: "Running for", ur: "دورانیہ" },
  language: { en: "Language", ur: "زبان" },
  parent: { en: "Parent", ur: "والدین" },
  notYet: { en: "Not given yet", ur: "ابھی نہیں بتایا" },
  timeLimit: {
    en: "Calls end automatically after 5 minutes, including after you take over.",
    ur: "کالز 5 منٹ بعد خود ختم ہو جاتی ہیں، سنبھالنے کے بعد بھی۔",
  },

  // Actions
  watch: { en: "Watch", ur: "دیکھیں" },
  stopWatching: { en: "Close", ur: "بند کریں" },
  listen: { en: "Listen", ur: "سنیں" },
  stopListening: { en: "Stop listening", ur: "سننا بند کریں" },
  takeOver: { en: "Take over", ur: "کال سنبھالیں" },
  callParent: { en: "Call parent now", ur: "ابھی والدین کو کال کریں" },
  endCall: { en: "End call", ur: "کال ختم کریں" },
  confirmTitle: { en: "Take over this call?", ur: "یہ کال سنبھالیں؟" },
  confirmBody: {
    en: "The assistant goes silent and you speak to the parent through your microphone. This cannot be undone. Your browser will ask for the microphone first.",
    ur: "اسسٹنٹ خاموش ہو جائے گا اور آپ مائیکروفون سے والدین سے بات کریں گے۔ یہ واپس نہیں ہو سکتا۔ براؤزر پہلے مائیکروفون کی اجازت مانگے گا۔",
  },
  confirmYes: { en: "Yes, take over", ur: "ہاں، سنبھالیں" },
  cancel: { en: "Cancel", ur: "منسوخ" },

  // Monitor status
  connecting: { en: "Connecting…", ur: "رابطہ ہو رہا ہے…" },
  monitoring: { en: "Watching — the conversation appears below.", ur: "دیکھ رہے ہیں — گفتگو نیچے نظر آئے گی۔" },
  listening: { en: "Listening to the call.", ur: "کال سن رہے ہیں۔" },
  takenOver: { en: "You are on the call. The assistant is silent.", ur: "آپ کال پر ہیں۔ اسسٹنٹ خاموش ہے۔" },
  ended: { en: "The call has ended.", ur: "کال ختم ہو گئی۔" },
  waiting: { en: "Waiting for the conversation…", ur: "گفتگو کا انتظار…" },
  failed: {
    en: "Could not connect to this call. It may have ended, or the staff key is not set up yet.",
    ur: "اس کال سے رابطہ نہیں ہو سکا۔ ممکن ہے کال ختم ہو گئی ہو، یا اسٹاف کی کلید ابھی سیٹ نہیں۔",
  },
  micRefused: {
    en: "The microphone was not allowed, so the assistant is still talking.",
    ur: "مائیکروفون کی اجازت نہیں ملی، اس لیے اسسٹنٹ بات جاری رکھے ہوئے ہے۔",
  },
  assistant: { en: "Assistant", ur: "اسسٹنٹ" },
  you: { en: "Staff", ur: "اسٹاف" },
  parentSaid: { en: "Parent", ur: "والدین" },
  notConfigured: {
    en: "Watching and taking over need Retell's staff key (RETELL_STAFF_PUBLIC_KEY). Until it is added, you can still call the parent.",
    ur: "دیکھنے اور سنبھالنے کے لیے Retell کی اسٹاف کلید (RETELL_STAFF_PUBLIC_KEY) درکار ہے۔ تب تک آپ والدین کو کال کر سکتے ہیں۔",
  },
  markedContacted: { en: "Marked as Contacted.", ur: "“رابطہ ہو گیا” درج ہو گیا۔" },
} as const;
