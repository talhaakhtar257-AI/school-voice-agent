import { Noto_Naskh_Arabic, Noto_Nastaliq_Urdu, Plus_Jakarta_Sans } from "next/font/google";

/**
 * Landing-page fonts, self-hosted by next/font (no request to Google from the
 * parent's phone). Applied on the landing wrapper only, so the dashboard keeps
 * its system font.
 */
export const englishFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-en",
  display: "swap",
});

// Nastaliq files are large; not preloaded so English visitors never download it.
export const urduFont = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-ur",
  display: "swap",
  preload: false,
});

// The staff dashboard uses Naskh: far more compact than Nastaliq in dense
// tables, and it still renders Urdu script correctly right to left.
export const dashboardUrduFont = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-ur",
  display: "swap",
  preload: false,
});
