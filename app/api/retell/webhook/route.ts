/**
 * POST /api/retell/webhook?secret=… — Retell reports call_started, call_ended
 * and call_analyzed here (contracts/api.md §2). Set it as the agent's webhook
 * URL in Retell.
 *
 * Nothing in the posted body is stored. Only its call id is used, to read the
 * call back from Retell's own API (research R-002), and only a call belonging
 * to our agent is kept. Must answer within Retell's 10-second timeout.
 *
 * Test with curl:
 *
 *   # no secret -> 401
 *   curl -i -X POST http://localhost:3000/api/retell/webhook
 *
 *   # made-up call id -> 200 {"ok":true,"ignored":true}
 *   curl -s -X POST "http://localhost:3000/api/retell/webhook?secret=$RETELL_WEBHOOK_SECRET" \
 *     -H "Content-Type: application/json" -d '{"event":"call_ended","call":{"call_id":"call_fake"}}'
 */
import { NextResponse, type NextRequest } from "next/server";
import { hasValidQuerySecret } from "@/lib/api/secret";
import { isHandledEvent, webhookBody } from "@/lib/calls/schema";
import { getRetellCall } from "@/lib/calls/retell-api";
import { upsertCallFromRetell } from "@/lib/calls/queries";
import { sendCallSummaries } from "@/lib/email/send-summaries";
import { releaseUnusedMinutes } from "@/lib/voice/limits";

export const dynamic = "force-dynamic";

const ignored = () => NextResponse.json({ ok: true, ignored: true });

export async function POST(request: NextRequest) {
  if (!hasValidQuerySecret(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "body must be valid JSON" }, { status: 400 });
  }

  const parsed = webhookBody.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid event" }, { status: 400 });
  const { event, call } = parsed.data;
  if (!isHandledEvent(event)) return ignored();

  let retellCall;
  try {
    retellCall = await getRetellCall(call.call_id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/retell/webhook] ${event} ${call.call_id}: Retell unreachable: ${message}`);
    return NextResponse.json({ error: "retell unavailable" }, { status: 502 }); // Retell retries
  }

  // Unknown to Retell, or another agent's call: answer 200 so a forgery is
  // not retried, and store nothing.
  if (!retellCall || retellCall.agentId !== process.env.NEXT_PUBLIC_RETELL_AGENT_ID) {
    console.warn(`[api/retell/webhook] ${event} ${call.call_id}: not our call, ignored`);
    return ignored();
  }

  try {
    const saved = await upsertCallFromRetell(retellCall);
    // Stage 5: once the summary exists, email the school (and the parent if
    // they typed an email). Sent at most once per call; never throws.
    if (saved.summary) await sendCallSummaries(saved, new URL(request.url).origin);
    // Give back the minutes the call did not use. A failure here must not
    // make Retell retry the whole event, so it is logged and swallowed.
    if (saved.status === "ended") {
      await releaseUnusedMinutes(saved.id, saved.duration_seconds).catch((error: unknown) =>
        console.error(`[api/retell/webhook] release minutes ${call.call_id}: ${error instanceof Error ? error.message : "unknown"}`),
      );
    }
    console.info(`[api/retell/webhook] ${event} ${call.call_id}: ${saved.status}, lead ${saved.lead_id ?? "none"}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/retell/webhook] ${event} ${call.call_id}: ${message} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "method not allowed" }, { status: 405 });
}
