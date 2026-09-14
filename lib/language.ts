/**
 * The landing page shows one language at a time, chosen by a cookie rather than
 * a URL parameter or browser storage, so the server renders the right language
 * and direction on the very first paint (no flash of the wrong script).
 *
 * Plain helpers only — safe in client components. The cookie reader lives in
 * lib/language-server.ts because next/headers is server-only.
 */
export type Lang = "en" | "ur";

export const LANG_COOKIE = "lang";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "ur";
}

export function dirFor(lang: Lang): "ltr" | "rtl" {
  return lang === "ur" ? "rtl" : "ltr";
}
