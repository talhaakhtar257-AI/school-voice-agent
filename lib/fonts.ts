import { Noto_Nastaliq_Urdu, Plus_Jakarta_Sans } from "next/font/google";

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
