/**
 * POST /api/retell/web-call — a pre-flight gate, not a token mint.
 *
 * Retell's browser SDK (retell-client-js-sdk v3, RetellClient) connects
 * directly from the browser using a publishable key — see
 * specs/005-voice-landing-page/research.md D-001. This route only checks
 * whether a call should be allowed to start: published content exists, the
 * public key and agent id are configured, and the visitor is within the two
 * hard usage limits. It never talks to Retell itself.
 *
 * Test with curl:
 *
 *   # nothing published, or not configured, or capped -> a { "reason": ... }
 *   curl -s -X POST http://localhost:3000/api/retell/web-call | jq
 *
 *   # otherwise -> { "ok": true }
 */
import { NextResponse, type NextRequest } from "next/server";
import { readCachedBrief } from "@/lib/content/brief-cache";
import { checkAndReserve, getVisitorId, setVisitorCookie } from "@/lib/voice/limits";

export const dynamic = "force-dynamic";

function methodNotAllowed() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}

/**
 * Only this website's own page may start a call. Every reservation spends part
 * of the monthly minute budget, so another site — or a script that does not
 * present itself as this page — must not be able to use it up and lock real
 * parents out. Browsers send Sec-Fetch-Site on every fetch; Origin is the
 * fallback for older ones. A determined script can still fake both headers,
 * so a rate-limit rule at the hosting firewall remains the outer defence.
 */
function isFromThisSite(request: NextRequest): boolean {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin";
  const origin = request.headers.get("origin");
  return origin !== null && origin === request.nextUrl.origin;
}

export async function POST(request: NextRequest) {
  if (!isFromThisSite(request)) {
    return NextResponse.json({ reason: "forbidden" }, { status: 403 });
  }

  const visitorId = getVisitorId(request);

  function respond(body: { ok: true; maxCallSeconds: number } | { reason: string }) {
    const response = NextResponse.json(body);
    setVisitorCookie(response, visitorId);
    return response;
  }

  try {
    // The parent is waiting on this before the call can even connect, and it
    // only needs to know whether anything is published. It used to read the
    // whole content document and re-validate it from scratch to answer that —
    // about a second, in front of every call, which the owner reported on
    // 3 Nov as a pause after entering their name. The agent's brief is already
    // cached for exactly this data, so reuse it (feature 013, D-002).
    const brief = await readCachedBrief();
    if (brief.state === "empty") {
      return respond({ reason: "no-content" });
    }

    if (!process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY || !process.env.NEXT_PUBLIC_RETELL_AGENT_ID) {
      return respond({ reason: "not-configured" });
    }

    const allowed = await checkAndReserve(visitorId);
    if (!allowed) {
      return respond({ reason: "capped" });
    }

    // Hand the configured per-call length to the browser so its own timer
    // (the UX pacing backstop, T024) matches the value the reservation above
    // was computed from, without duplicating the setting as a second
    // NEXT_PUBLIC_ env var.
    return respond({
      ok: true,
      maxCallSeconds: Number(process.env.VOICE_MAX_CALL_SECONDS),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/retell/web-call] ${message} @ ${new Date().toISOString()}`);
    return respond({ reason: "retell-error" });
  }
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
