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
import { readLiveForApi } from "@/lib/content/queries";
import { isEmptyDoc } from "@/lib/content/schema";
import { checkAndReserve, getVisitorId, setVisitorCookie } from "@/lib/voice/limits";

export const dynamic = "force-dynamic";

function methodNotAllowed() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const visitorId = getVisitorId(request);

  function respond(body: { ok: true; maxCallSeconds: number } | { reason: string }) {
    const response = NextResponse.json(body);
    setVisitorCookie(response, visitorId);
    return response;
  }

  try {
    const live = await readLiveForApi();
    if (!live || isEmptyDoc(live.doc)) {
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
