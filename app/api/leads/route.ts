/**
 * POST /api/leads — Retell's save_lead tool posts the enquiry here, once the
 * phone is confirmed and again at the end of the call. Server-to-server,
 * untrusted (`.claude/rules/api.md`).
 *
 * Test with curl:
 *
 *   # no secret -> 401
 *   curl -i -X POST http://localhost:3000/api/leads
 *
 *   # flat body ("Payload: args only" ON), phone NOT confirmed -> 200, phone left NULL
 *   curl -s -X POST http://localhost:3000/api/leads \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" \
 *     -d '{"parentName":"Ahmed","parentNameConfirmed":true,"phone":"03001234567","phoneConfirmed":false,"classWanted":"Class 6"}'
 *
 *   # wrapped body (args only OFF) -> 200; send it twice with the same call_id
 *   # and the second answer says "updated": true — still one lead
 *   curl -s -X POST http://localhost:3000/api/leads \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" \
 *     -d '{"name":"save_lead","call":{"call_id":"call_test_1"},"args":{"parentName":"Ahmed","parentNameConfirmed":true}}'
 */
import { NextResponse, type NextRequest } from "next/server";
import { parseAgentBody } from "@/lib/leads/schema";
import { insertLead, upsertLeadForCall } from "@/lib/leads/queries";
import { linkLeadToCall } from "@/lib/calls/queries";
import { hasValidAgentSecret } from "@/lib/api/secret";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

function methodNotAllowed() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}

export async function POST(request: NextRequest) {
  if (!hasValidAgentSecret(request)) {
    return unauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body must be valid JSON" }, { status: 400 });
  }

  const parsed = parseAgentBody(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.message }, { status: 400 });
  }

  try {
    if (!parsed.callId) {
      const id = await insertLead(parsed.enquiry);
      console.info(`[api/leads] inserted ${id} without call id`);
      return NextResponse.json({ ok: true, id, updated: false });
    }

    const { id, updated } = await upsertLeadForCall(parsed.enquiry, parsed.callId);
    await linkLeadToCall(parsed.callId, id, parsed.enquiry.language);
    console.info(`[api/leads] ${updated ? "updated" : "inserted"} ${id} for ${parsed.callId}`);
    return NextResponse.json({ ok: true, id, updated });
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
