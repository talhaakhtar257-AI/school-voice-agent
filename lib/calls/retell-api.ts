import { z } from "zod";
import type { Turn } from "./mask";

const RETELL_API = "https://api.retellai.com";

const retellCall = z.object({
  call_id: z.string(),
  agent_id: z.string().optional(),
  call_status: z.string().optional(),
  start_timestamp: z.number().optional(),
  end_timestamp: z.number().optional(),
  duration_ms: z.number().optional(),
  transcript_object: z
    .array(z.object({ role: z.string(), content: z.string().optional() }))
    .optional(),
  call_analysis: z.object({ call_summary: z.string().optional() }).nullish(),
});

export type RetellCall = {
  callId: string;
  agentId: string | null;
  ended: boolean;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number | null;
  transcript: Turn[] | null;
  summary: string | null;
};

/**
 * Read a call straight from Retell with our secret API key (research R-002).
 * The webhook never trusts what it is sent: a forged event cannot make Retell's
 * own API return a call, so anything stored comes from here.
 *
 * Returns null when Retell has no such call. Throws when Retell cannot be
 * reached, so the webhook can answer 502 and Retell retries.
 */
export async function getRetellCall(callId: string): Promise<RetellCall | null> {
  const apiKey = process.env.RETELL_API_KEY;
  if (!apiKey) throw new Error("RETELL_API_KEY is not set");

  const res = await fetch(`${RETELL_API}/v2/get-call/${encodeURIComponent(callId)}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (res.status === 404 || res.status === 400) return null;
  if (!res.ok) throw new Error(`Retell get-call answered ${res.status}`);

  const parsed = retellCall.safeParse(await res.json());
  if (!parsed.success) throw new Error("Retell get-call returned an unexpected shape");
  const call = parsed.data;

  const transcript = call.transcript_object
    ?.filter((u): u is { role: "agent" | "user"; content: string } =>
      (u.role === "agent" || u.role === "user") && typeof u.content === "string" && u.content.trim() !== "",
    )
    .map((u) => ({ role: u.role, content: u.content }));

  return {
    callId: call.call_id,
    agentId: call.agent_id ?? null,
    ended: call.call_status === "ended" || call.call_status === "error" || call.end_timestamp !== undefined,
    startedAt: call.start_timestamp ? new Date(call.start_timestamp) : null,
    endedAt: call.end_timestamp ? new Date(call.end_timestamp) : null,
    durationSeconds: call.duration_ms !== undefined ? Math.round(call.duration_ms / 1000) : null,
    transcript: transcript && transcript.length > 0 ? transcript : null,
    summary: call.call_analysis?.call_summary?.trim() || null,
  };
}
