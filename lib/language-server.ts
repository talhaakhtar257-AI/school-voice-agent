import { cookies } from "next/headers";
import { LANG_COOKIE, isLang, type Lang } from "./language";

/** English when no cookie is set, or when the cookie holds anything unexpected. */
export async function readLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : "en";
}
