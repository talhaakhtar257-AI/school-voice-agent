import { z } from "zod";

/**
 * What POST /api/leads accepts from the voice agent. Every field optional
 * (FR-023) — a parent may refuse to answer anything. No CNIC, B-Form, or
 * payment field is defined here, so one arriving in a request is silently
 * dropped rather than stored (FR-028): Zod strips unknown keys by default.
 *
 * The `*Confirmed` booleans decide whether the paired value is actually stored
 * (FR-024) — see lib/leads/queries.ts. They are not themselves stored.
 */
export const incomingEnquiry = z.object({
  parentName: z.string().max(200).optional(),
  parentNameConfirmed: z.boolean().optional(),
  studentName: z.string().max(200).optional(),
  studentNameConfirmed: z.boolean().optional(),
  classWanted: z.string().max(100).optional(),
  studentAge: z.number().int().min(0).max(25).optional(),
  phone: z.string().max(30).optional(),
  phoneConfirmed: z.boolean().optional(),
  currentClass: z.string().max(100).optional(),
  previousSchool: z.string().max(200).optional(),
  admissionType: z.enum(["fresh", "transfer"]).optional(),
  language: z.enum(["ur", "en"]).optional(),
  consent: z.boolean().optional(),
  retellCallId: z.string().max(200).optional(),
});

export type IncomingEnquiry = z.infer<typeof incomingEnquiry>;

const wrappedBody = z.object({
  args: z.unknown(),
  call: z.object({ call_id: z.string().max(200).optional() }).passthrough().optional(),
});

/**
 * Retell sends a custom function's arguments either flat ("Payload: args only"
 * ON) or wrapped as { name, call, args } (OFF). Accepting both means that
 * toggle can no longer silently break saving, and the wrapped form carries the
 * real call id, which the model cannot be trusted to invent (research R-001).
 */
export function parseAgentBody(
  body: unknown,
): { success: true; enquiry: IncomingEnquiry; callId: string | null } | { success: false; message: string } {
  const wrapped = wrappedBody.safeParse(body);
  const isWrapped = wrapped.success && typeof wrapped.data.args === "object" && wrapped.data.args !== null;
  const args = isWrapped ? wrapped.data.args : body;

  const parsed = incomingEnquiry.safeParse(args);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "invalid enquiry" };
  }
  const callId = (isWrapped ? wrapped.data.call?.call_id : undefined) ?? parsed.data.retellCallId ?? null;
  return { success: true, enquiry: parsed.data, callId };
}
