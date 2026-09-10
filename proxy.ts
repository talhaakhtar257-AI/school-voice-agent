import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Route protection for the dashboard - Next.js 16's Proxy (the renamed
 * Middleware). It runs before any dashboard component, so a signed-out visitor
 * is redirected before any dashboard HTML is produced (SC-002 - no flash).
 *
 * updateSession (lib/supabase/proxy.ts) refreshes the Supabase session cookie on
 * every matched request and reports whether a user is signed in. Then:
 *   - no user on a /dashboard path -> /login
 *   - a signed-in user on /login   -> /dashboard   (T015)
 * Everything else passes through carrying the refreshed cookies.
 *
 * The matcher covers /dashboard and /login only. The public landing page and
 * every other route are never touched (FR-004).
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let user: Awaited<ReturnType<typeof updateSession>>["user"] = null;
  let response = NextResponse.next({ request });
  try {
    ({ response, user } = await updateSession(request));
  } catch {
    // Supabase unreachable — bad config or an outage. Treat as no session: the
    // dashboard fails closed below, and /login still renders so staff can retry.
  }

  const onDashboard = pathname.startsWith("/dashboard");
  const onLogin = pathname === "/login";

  if (onDashboard && !user) return redirectTo("/login", request, response);
  if (onLogin && user) return redirectTo("/dashboard", request, response);

  return response;
}

/**
 * Redirect while keeping any Set-Cookie the session refresh added, so a token
 * refreshed on this request is not lost by the redirect.
 */
function redirectTo(pathname: string, request: NextRequest, from: NextResponse) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);
  from.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
