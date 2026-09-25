/** Strings for the details form before a call, and call-state messages (feature 011). */
export const preCallStrings = {
  title: { en: "Before we start", ur: "شروع کرنے سے پہلے" },
  intro: {
    en: "Please type your details so the assistant gets them exactly right. It will not ask for them again.",
    ur: "براہ کرم اپنی تفصیلات لکھ دیں تاکہ اسسٹنٹ انہیں بالکل درست لے۔ وہ دوبارہ نہیں پوچھے گا۔",
  },
  name: { en: "Your name", ur: "آپ کا نام" },
  namePlaceholder: { en: "e.g. Ahmed Khan", ur: "مثلاً احمد خان" },
  phone: { en: "Mobile number", ur: "موبائل نمبر" },
  phonePlaceholder: { en: "03XX XXXXXXX", ur: "03XX XXXXXXX" },
  email: { en: "Email", ur: "ای میل" },
  emailPlaceholder: { en: "you@example.com", ur: "you@example.com" },
  emailHint: {
    en: "We email you the fees, documents and admission form after the call.",
    ur: "کال کے بعد ہم آپ کو فیس، دستاویزات اور داخلہ فارم ای میل کریں گے۔",
  },
  nameError: { en: "Please enter your name.", ur: "براہ کرم اپنا نام لکھیں۔" },
  phoneError: {
    en: "Please enter a Pakistani mobile number, e.g. 03001234567.",
    ur: "براہ کرم پاکستانی موبائل نمبر لکھیں، مثلاً 03001234567۔",
  },
  emailError: { en: "Please check the email address.", ur: "براہ کرم ای میل ایڈریس دوبارہ دیکھیں۔" },

  // During the call
  thinking: { en: "Assistant is thinking…", ur: "اسسٹنٹ سوچ رہا ہے…" },
  couldNotConnect: {
    en: "The assistant couldn't connect this time. Please tap Talk again, or call the office.",
    ur: "اس بار اسسٹنٹ سے رابطہ نہیں ہو سکا۔ براہ کرم دوبارہ بات کریں دبائیں، یا دفتر کو کال کریں۔",
  },

  // After the call
  whatsapp: { en: "Save these details on WhatsApp", ur: "یہ تفصیلات واٹس ایپ پر محفوظ کریں" },
  emailedNote: {
    en: "We are emailing the details to {email}.",
    ur: "ہم تفصیلات {email} پر ای میل کر رہے ہیں۔",
  },
} as const;

/** A Pakistani mobile number, typed any common way: 03001234567, 0300-1234567, +92 300 1234567. */
export function normalisePkMobile(input: string): string | null {
  const digits = input.replace(/[^\d+]/g, "");
  const m = digits.match(/^(?:\+?92|0)?(3\d{9})$/);
  return m ? `0${m[1]}` : null;
}

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
