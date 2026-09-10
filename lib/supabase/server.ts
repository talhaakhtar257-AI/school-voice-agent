import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseAnonKey, getSupabaseUrl } from "../env";

/**
 * The Supabase client for Server Components, reading the session from the
 * request cookies.
 *
 * A Server Component cannot set cookies, so setAll catches the failed attempt
 * and does nothing. That is safe here because proxy.ts refreshes the session on
 * every request before any Server Component runs — this client only needs to
 * read who is signed in. Omitting setAll entirely would make @supabase/ssr log
 * a warning, so it is provided as a guarded no-op instead.
 *
 * A new client per request, never shared — the documented @supabase/ssr rule.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component context — cookies are read-only here. proxy.ts
          // handles the refresh.
        }
      },
    },
  });
}
