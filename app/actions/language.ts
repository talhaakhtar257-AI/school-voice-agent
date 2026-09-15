"use server";

import { cookies } from "next/headers";
import { LANG_COOKIE, isLang } from "@/lib/language";

/**
 * Called by the language toggle's form. A form post rather than a click handler
 * so switching language still works when JavaScript fails to load on a slow
 * phone. Setting a cookie in a Server Function re-renders the current page.
 */
export async function setLanguage(formData: FormData) {
  const requested = formData.get("lang");
  // Ignore anything that is not a language we support rather than storing it.
  if (!isLang(requested)) return;

  (await cookies()).set(LANG_COOKIE, requested, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
