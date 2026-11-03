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
import { hasValidAgentSecret } from "@/lib/api/secret";
import { readCachedBrief } from "@/lib/content/brief-cache";

// The route itself always runs, so the shared secret is always checked. What is
// cached is the brief the route serves, inside lib/content/brief-cache.ts, and
// that cache does not vary by caller (feature 013, D-002).
export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function methodNotAllowed() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}

export async function GET(request: NextRequest) {
  // Check the secret before anything else (FR-015). No hint about why on failure.
  if (!hasValidAgentSecret(request)) {
    return unauthorized();
  }

  try {
    // ?format=brief — the compact text version for the voice agent (cheaper
    // per reply; see lib/content/agent-brief.ts). This is the path the agent
    // actually calls, before the first answer of every call, so it is the one
    // that is cached. Default stays the full JSON, read fresh.
    if (request.nextUrl.searchParams.get("format") === "brief") {
      const cached = await readCachedBrief();
      if (cached.state === "empty") {
        return NextResponse.json({ published: false });
      }
      return NextResponse.json({
        published: true,
        publishedAt: cached.publishedAt,
        brief: cached.brief,
      });
    }

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
