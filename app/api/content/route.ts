/**
 * GET /api/content — the live school content as JSON, for the Retell voice agent.
 *
 * This endpoint is called server-to-server, never by a browser. It is gated by a
 * shared secret, not by a staff session, and it returns only the LIVE version —
 * the draft is unreachable here under any path (FR-016).
 *
 * Test with curl:
 *
 *   # no secret -> 401
 *   curl -i http://localhost:3000/api/content
 *
 *   # wrong secret -> 401
 *   curl -i http://localhost:3000/api/content -H "X-Agent-Secret: wrong"
 *
 *   # correct secret -> 200 with the live content (or { "published": false })
 *   curl -s http://localhost:3000/api/content \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" | jq
 */
import { NextResponse, type NextRequest } from "next/server";
import { readLiveForApi } from "@/lib/content/queries";
import { forPublicApi, isEmptyDoc } from "@/lib/content/schema";

// The agent must see a publish immediately — never serve a cached response.
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function methodNotAllowed() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}

export async function GET(request: NextRequest) {
  const provided = request.headers.get("x-agent-secret");
  const expected = process.env.RETELL_WEBHOOK_SECRET;

  // Check the secret before anything else (FR-015). No hint about why on failure.
  if (!expected || !provided || provided !== expected) {
    return unauthorized();
  }

  try {
    const live = await readLiveForApi();
    if (!live || isEmptyDoc(live.doc)) {
      // Unambiguous: nothing published yet (FR-004). Not an error, not an empty
      // object with keys.
      return NextResponse.json({ published: false });
    }
    return NextResponse.json({
      published: true,
      publishedAt: live.updatedAt,
      content: forPublicApi(live.doc),
    });
  } catch (error) {
    // Log enough to debug — endpoint, message, timestamp — and nothing else
    // (`.claude/rules/api.md`). Never return the DB error to the caller.
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/content] ${message} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export const POST = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
