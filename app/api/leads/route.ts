/**
 * POST /api/leads — Retell posts the captured enquiry here when a conversation
 * ends. Server-to-server, untrusted (`.claude/rules/api.md`).
 *
 * Test with curl:
 *
 *   # no secret -> 401
 *   curl -i -X POST http://localhost:3000/api/leads
 *
 *   # full enquiry, phone NOT confirmed -> 200, phone left NULL
 *   curl -s -X POST http://localhost:3000/api/leads \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" \
 *     -d '{"parentName":"Ahmed","parentNameConfirmed":true,"phone":"03001234567","phoneConfirmed":false,"classWanted":"Class 6"}'
 *
 *   # empty enquiry -> 200, a bare row
 *   curl -s -X POST http://localhost:3000/api/leads \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" -d '{}'
 */
import { NextResponse, type NextRequest } from "next/server";
import { incomingEnquiry } from "@/lib/leads/schema";
import { insertLead } from "@/lib/leads/queries";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function methodNotAllowed() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  const provided = request.headers.get("x-agent-secret");
  const expected = process.env.RETELL_WEBHOOK_SECRET;
  if (!expected || !provided || provided !== expected) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body must be valid JSON" }, { status: 400 });
  }

  const parsed = incomingEnquiry.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid enquiry" },
      { status: 400 },
    );
  }

  try {
    const id = await insertLead(parsed.data);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    // Log the route and message only — never a name, a phone, or the DB error
    // text itself (`.claude/rules/api.md`, FR-029).
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/leads] ${message} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
