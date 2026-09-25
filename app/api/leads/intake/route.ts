/**
 * POST /api/leads/intake — the details the parent typed before the call
 * (feature 011), sent by their browser the moment the call goes live. Creates
 * the call's enquiry straight away, so the office has the name, number and
 * email even if the call drops in the first second.
 *
 * Browser-called, so there is no agent secret: like /api/leads/email, the
 * visitor cookie decides which browser owns a call, and the call must be a
 * real call of our agent (`.claude/rules/api.md`).
 *
 * Constitution V: a name and number the parent typed themselves count as
 * confirmed — the same reasoning as the email box. The parent submitted the
 * number so the office can call back, so consent is recorded.
 *
 * Test with curl:
 *
 *   # no cookie -> 403
 *   curl -s -X POST http://localhost:3000/api/leads/intake -H "Content-Type: application/json" \
 *     -d '{"callId":"call_x","name":"Ahmed Khan","phone":"03001234567","email":"a@b.co"}'
 *
 *   # a call id Retell doesn't know -> 403
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getRetellCall } from "@/lib/calls/retell-api";
import { linkLeadToCall, saveParentEmail } from "@/lib/calls/queries";
import { upsertLeadForCall } from "@/lib/leads/queries";
import { EMAIL_PATTERN, normalisePkMobile } from "@/lib/strings/pre-call";

export const dynamic = "force-dynamic";

const intakeBody = z.object({
  callId: z.string().min(1).max(200),
  name: z.string().trim().min(2).max(120),
  phone: z.string().max(30),
  // Optional: the parent may skip it on the form.
  email: z.union([z.literal(""), z.string().trim().toLowerCase().max(254).regex(EMAIL_PATTERN)]).default(""),
});

export async function POST(request: NextRequest) {
  const visitorId = request.cookies.get("visitor_id")?.value;
  if (!visitorId) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body must be valid JSON" }, { status: 400 });
  }

  const parsed = intakeBody.safeParse(body);
  const phone = parsed.success ? normalisePkMobile(parsed.data.phone) : null;
  if (!parsed.success || !phone) return NextResponse.json({ error: "invalid details" }, { status: 400 });
  const { callId, name, email } = parsed.data;

  try {
    const retellCall = await getRetellCall(callId);
    if (!retellCall || retellCall.agentId !== process.env.NEXT_PUBLIC_RETELL_AGENT_ID) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    // Claims the call for this browser (403 if another browser owns it) and
    // stores the email on the call.
    if ((await saveParentEmail(callId, visitorId, email || null)) === "forbidden") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { id } = await upsertLeadForCall(
      { parentName: name, parentNameConfirmed: true, phone, phoneConfirmed: true, consent: true },
      callId,
    );
    await linkLeadToCall(callId, id);
    // Only ids are logged — never the name, number or email.
    console.info(`[api/leads/intake] lead ${id} for ${callId}`);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/leads/intake] ${message} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}
