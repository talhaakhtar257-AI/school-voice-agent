/**
 * POST /api/send-details — Retell's send_details tool (feature 011). When a
 * parent asks for the fees, documents, process, dates or admission form
 * "on WhatsApp" or "by email", the assistant calls this and the details are
 * emailed to the address the parent typed before the call — straight away,
 * not after the call ends. Server-to-server; checks X-Agent-Secret.
 *
 * Test with curl:
 *
 *   # no secret -> 401
 *   curl -i -X POST http://localhost:3000/api/send-details
 *
 *   # a call with no email on record -> 200 {"ok":true,"sent":false,"reason":"no-email"}
 *   curl -s -X POST http://localhost:3000/api/send-details \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" \
 *     -d '{"name":"send_details","call":{"call_id":"call_x"},"args":{"topics":["fees","documents"]}}'
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hasValidAgentSecret } from "@/lib/api/secret";
import { INFO_TOPICS } from "@/lib/email/info-pack";
import { sendDetailsDuringCall } from "@/lib/email/send-summaries";

export const dynamic = "force-dynamic";

const args = z.object({
  topics: z.array(z.enum(INFO_TOPICS)).max(INFO_TOPICS.length).default([]),
  retellCallId: z.string().max(200).optional(),
});
const wrapped = z.object({ call: z.object({ call_id: z.string().max(200) }).passthrough(), args: z.unknown() });

export async function POST(request: NextRequest) {
  if (!hasValidAgentSecret(request)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body must be valid JSON" }, { status: 400 });
  }

  // Retell wraps the arguments with the call ({ name, call, args }) when
  // "Payload: args only" is off; the real call id comes from there.
  const w = wrapped.safeParse(body);
  const parsed = args.safeParse(w.success ? w.data.args : body);
  const callId = (w.success ? w.data.call.call_id : undefined) ?? (parsed.success ? parsed.data.retellCallId : undefined);
  if (!parsed.success || !callId) return NextResponse.json({ error: "invalid request" }, { status: 400 });

  try {
    const result = await sendDetailsDuringCall(callId, parsed.data.topics);
    // What the assistant reads back decides what it says to the parent.
    return NextResponse.json(
      result === "sent"
        ? { ok: true, sent: true, say: "The details have been emailed to the parent." }
        : { ok: true, sent: false, reason: result, say: "The email could not be sent; offer the office number instead." },
    );
  } catch (error) {
    console.error(`[api/send-details] ${error instanceof Error ? error.message : "unknown"} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}
