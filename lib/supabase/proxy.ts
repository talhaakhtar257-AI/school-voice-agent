import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "../env";

/**
 * Refreshes the Supabase session on every request proxy.ts matches, and reports
 * whether the request has a signed-in user.
 *
 * This is the one place a session token is rewritten: proxy code can read and
 * write cookies, Server Components cannot. Calling supabase.auth.getUser() here
 * forces @supabase/ssr to validate the token with Supabase and, if it is near
 * expiry, issue a fresh one — which setAll writes onto both the request (so this
 * request sees it) and the response (so the browser stores it).
 *
 * Returns the response to send and the user, so proxy.ts can decide redirects
 * without building a second client. Nothing runs between createServerClient and
 * getUser(), per the @supabase/ssr warning.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
