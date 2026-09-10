/**
 * Every visible string on the staff sign-in screen and the dashboard shell, in
 * English and Urdu side by side.
 *
 * One file, both languages per entry, so a missing Urdu translation is obvious
 * while reading rather than found on screen. No i18n library (research D-005).
 *
 * The office phone number is NOT a string here — it is a language-neutral value
 * (CLAUDE.md, Urdu rules). Entries that mention it leave a {phone} slot the
 * component fills at render time.
 *
 * The Urdu was written during development and should be checked by a native
 * speaker before the client sees it.
 */
export const staffLoginStrings = {
  screenTitle: { en: "School office sign in", ur: "اسکول دفتر سائن اِن" },
  emailLabel: { en: "Email address", ur: "ای میل ایڈریس" },
  passwordLabel: { en: "Password", ur: "پاس ورڈ" },
  signInButton: { en: "Sign in", ur: "سائن اِن کریں" },
  signingIn: { en: "Signing in…", ur: "سائن اِن ہو رہا ہے…" },

  wrongCredentials: {
    en: "That email and password do not match. Please try again.",
    ur: "یہ ای میل اور پاس ورڈ آپس میں میل نہیں کھاتے۔ دوبارہ کوشش کریں۔",
  },
  networkFailure: {
    en: "Could not reach the server. Check your internet connection and try again.",
    ur: "سرور تک رسائی نہیں ہو سکی۔ اپنا انٹرنیٹ کنکشن دیکھ کر دوبارہ کوشش کریں۔",
  },
  emailRequired: {
    en: "Enter your email address.",
    ur: "اپنا ای میل ایڈریس درج کریں۔",
  },
  passwordRequired: {
    en: "Enter your password.",
    ur: "اپنا پاس ورڈ درج کریں۔",
  },
  emailMalformed: {
    en: "That does not look like an email address.",
    ur: "یہ ای میل ایڈریس درست نہیں لگتا۔",
  },
  cookiesBlocked: {
    en: "Your browser is blocking cookies, which are needed to stay signed in. Allow cookies for this site and try again.",
    ur: "آپ کا براؤزر کوکیز روک رہا ہے، جو سائن اِن رہنے کے لیے ضروری ہیں۔ اس سائٹ کے لیے کوکیز کی اجازت دے کر دوبارہ کوشش کریں۔",
  },
  forgotPassword: {
    en: "Forgotten your password? Call the school office.",
    ur: "پاس ورڈ بھول گئے؟ اسکول کے دفتر کو کال کریں۔",
  },

  signOutButton: { en: "Sign out", ur: "سائن آؤٹ کریں" },
  dashboardEmptyTitle: { en: "Nothing here yet", ur: "ابھی یہاں کچھ نہیں ہے" },
  dashboardEmptyBody: {
    en: "Enquiries from parents will appear here once the assistant starts taking calls.",
    ur: "والدین کی درخواستیں یہاں ظاہر ہوں گی جب اسسٹنٹ کالیں لینا شروع کرے گا۔",
  },
} as const;
