import { z } from "zod";
import type { Turn } from "./mask";
import { INFO_TOPICS, type InfoTopic } from "@/lib/email/info-pack";

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
  transcript_with_tool_calls: z
    .array(z.object({ role: z.string(), name: z.string().optional(), arguments: z.string().optional() }).passthrough())
    .optional(),
  call_analysis: z.object({ call_summary: z.string().optional() }).nullish(),
});

/** What the parent asked to receive in writing during the call (send_details). */
export type RequestedDetails = { topics: InfoTopic[]; classWanted: string | null };

const sendDetailsArgs = z.object({
  topics: z.array(z.string()).optional(),
  class_wanted: z.string().max(40).optional(),
});

/**
 * Collect every send_details call the assistant made, so the after-call email
 * repeats only what the parent actually asked for (tester round 3).
 */
function requestedFrom(entries: z.infer<typeof retellCall>["transcript_with_tool_calls"]): RequestedDetails {
  const topics = new Set<InfoTopic>();
  let classWanted: string | null = null;
  for (const entry of entries ?? []) {
    if (entry.role !== "tool_call_invocation" || entry.name !== "send_details" || !entry.arguments) continue;
    let raw: unknown;
    try {
      raw = JSON.parse(entry.arguments);
    } catch {
      continue; // a malformed tool call is skipped, not fatal
    }
    const parsed = sendDetailsArgs.safeParse(raw);
    if (!parsed.success) continue;
    for (const t of parsed.data.topics ?? []) if ((INFO_TOPICS as readonly string[]).includes(t)) topics.add(t as InfoTopic);
    if (parsed.data.class_wanted?.trim()) classWanted = parsed.data.class_wanted.trim();
  }
  return { topics: [...topics], classWanted };
}

export type RetellCall = {
  callId: string;
  agentId: string | null;
  ended: boolean;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSeconds: number | null;
  transcript: Turn[] | null;
  summary: string | null;
  requested: RequestedDetails;
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
    requested: requestedFrom(call.transcript_with_tool_calls),
  };
}
