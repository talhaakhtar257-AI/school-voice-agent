"use client";

import { useEffect } from "react";
import { dirFor, type Lang } from "@/lib/language";

/**
 * Sets <html lang dir> while the landing page is open, so the browser, screen
 * readers and form controls treat the whole document as Urdu right-to-left.
 * The root layout is shared with /login and /dashboard, so the values are put
 * back to English left-to-right when the parent leaves this page.
 */
export function DocumentLanguage({ lang }: { lang: Lang }) {
  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dirFor(lang);
    return () => {
      root.lang = "en";
      root.dir = "ltr";
    };
  }, [lang]);

  return null;
}
