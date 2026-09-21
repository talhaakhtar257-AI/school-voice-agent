/**
 * POST /api/leads/email — the optional email box on the parent's call screen
 * (contracts/api.md §3). Called by the parent's browser, so there is no agent
 * secret; the visitor cookie set by /api/retell/web-call decides which browser
 * owns a call (research R-003, `.claude/rules/api.md`).
 *
 * Test with curl:
 *
 *   # bad email -> 400
 *   curl -s -X POST http://localhost:3000/api/leads/email \
 *     -H "Content-Type: application/json" -d '{"callId":"call_test_1","email":"nope"}'
 *
 *   # a call id Retell doesn't know -> 403. With a real live call id: 200,
 *   # and the same call id from another cookie -> 403
 *   curl -s -X POST http://localhost:3000/api/leads/email -b "visitor_id=test-visitor" \
 *     -H "Content-Type: application/json" -d '{"callId":"call_test_1","email":"parent@example.com"}'
 */
import { NextResponse, type NextRequest } from "next/server";
import { emailBoxBody } from "@/lib/calls/schema";
import { saveParentEmail } from "@/lib/calls/queries";
import { getRetellCall } from "@/lib/calls/retell-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // No cookie means this browser never passed the call gate, so it cannot own a call.
  const visitorId = request.cookies.get("visitor_id")?.value;
  if (!visitorId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body must be valid JSON" }, { status: 400 });
  }

  const parsed = emailBoxBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid email" }, { status: 400 });

  try {
    // Only a real call of our agent may get a row, so a made-up id cannot
    // fill the calls table.
    const retellCall = await getRetellCall(parsed.data.callId);
    if (!retellCall || retellCall.agentId !== process.env.NEXT_PUBLIC_RETELL_AGENT_ID) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const result = await saveParentEmail(parsed.data.callId, visitorId, parsed.data.email);
    if (result === "forbidden") return NextResponse.json({ error: "forbidden" }, { status: 403 });
    // The address itself is never logged.
    console.info(`[api/leads/email] saved for ${parsed.data.callId}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/leads/email] ${message} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}
