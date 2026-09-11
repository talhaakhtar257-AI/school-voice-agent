/**
 * POST /api/unanswered — Retell posts a question it could not answer here,
 * as it happens during a call. Server-to-server, untrusted (`.claude/rules/api.md`).
 * The same question reported again increments times_asked instead of
 * creating a duplicate row (see the unanswered_questions migration).
 *
 * Test with curl:
 *
 *   # no secret -> 401
 *   curl -i -X POST http://localhost:3000/api/unanswered
 *
 *   # first time -> 200, times_asked starts at 1
 *   curl -s -X POST http://localhost:3000/api/unanswered \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" \
 *     -d '{"questionText":"What are the fees?","language":"en"}'
 *
 *   # same question again -> 200, same row, times_asked becomes 2
 *   curl -s -X POST http://localhost:3000/api/unanswered \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" \
 *     -d '{"questionText":"what are the fees?","language":"en"}'
 *
 *   # missing questionText -> 400
 *   curl -s -X POST http://localhost:3000/api/unanswered \
 *     -H "X-Agent-Secret: $RETELL_WEBHOOK_SECRET" -H "Content-Type: application/json" -d '{}'
 */
import { NextResponse, type NextRequest } from "next/server";
import { incomingQuestion } from "@/lib/unanswered/schema";
import { upsertUnansweredQuestion } from "@/lib/unanswered/queries";

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

  const parsed = incomingQuestion.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "invalid question" },
      { status: 400 },
    );
  }

  try {
    const id = await upsertUnansweredQuestion(parsed.data);
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error(`[api/unanswered] ${message} @ ${new Date().toISOString()}`);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export const GET = methodNotAllowed;
export const PUT = methodNotAllowed;
export const PATCH = methodNotAllowed;
export const DELETE = methodNotAllowed;
