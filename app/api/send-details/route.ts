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
 *     -d '{"name":"send_details","call":{"call_id":"call_x"},"args":{"topics":["fees","documents"],"class_wanted":"Playgroup"}}'
 */
import { after, NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { hasValidAgentSecret } from "@/lib/api/secret";
import { INFO_TOPICS } from "@/lib/email/info-pack";
import { deliverDetails, planDetailsSend } from "@/lib/email/send-details-flow";

export const dynamic = "force-dynamic";

const args = z.object({
  topics: z.array(z.enum(INFO_TOPICS)).max(INFO_TOPICS.length).default([]),
  retellCallId: z.string().max(200).optional(),
  // The answers the assistant gave on the call, written from the school content.
  answers: z.string().max(2000).optional(),
  // The class the parent is asking about, so the email carries that class's
  // fee and documents even if save_lead has not stored it yet.
  class_wanted: z.string().max(40).optional(),
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
    // Plan with indexed reads only, answer the agent, then do the slow half in
    // after(): three database reads, a content parse, an HTML render and an
    // 8-second email send used to happen before this response, while the parent
    // listened to silence (feature 013, slice B).
    const plan = await planDetailsSend(callId);

    if (plan.state === "no-email") {
      return NextResponse.json({
        ok: true,
        sending: false,
        reason: "no-email",
        say: "There is no email address on record for this parent; offer the office number instead.",
      });
    }

    if (plan.state === "error") {
      // Something is wrong on our side. Never claim there is no address on
      // record — that would be telling the parent something untrue.
      return NextResponse.json({
        ok: true,
        sending: false,
        reason: "error",
        say: "The details cannot be emailed right now. Apologise briefly and give the parent the office number.",
      });
    }

    if (plan.state === "limit") {
      // FR-007. Warmly, and with a way to a human (Constitution VII).
      return NextResponse.json({
        ok: true,
        sending: false,
        reason: "limit",
        say: "The details have already been emailed to this parent during this call. Say so kindly and give them the office number if they need anything more.",
      });
    }

    after(() =>
      deliverDetails(plan, parsed.data.topics, parsed.data.answers ?? "", parsed.data.class_wanted?.trim() || null),
    );

    // "sending", never "sent": the agent speaks this, and the email has not
    // left yet. Promising delivery here would make the assistant say something
    // untrue if the provider then failed (Constitution I).
    //
    // Worded as an instruction because prompt v9 hardcodes the past tense —
    // 'I have sent these details to your email' / 'بھیج دی ہیں' — which is no
    // longer true at the moment it is spoken. Until that line is corrected in
    // Retell, this is what steers the agent away from claiming delivery.
    return NextResponse.json({
      ok: true,
      sending: true,
      say: "The email is on its way but has NOT arrived yet. Say it is being sent right now — do NOT say you have already sent it. English: \"I'm sending these details to your email now.\" Urdu: \"میں یہ تفصیلات ابھی آپ کی ای میل پر بھیج رہی ہوں۔\"",
    });
  } catch (error) {
    console.error(`[api/send-details] ${error instanceof Error ? error.message : "unknown"} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}
