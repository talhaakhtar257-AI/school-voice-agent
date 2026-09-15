/**
 * The voice limits as the call gate sees them. Mirrors lib/voice/limits.ts: a
 * value that is missing, zero or not a number counts as not set, and if any
 * one is not set the gate refuses every call. Server only — reads env vars.
 */
function readPositive(name: string): number | null {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : null;
}

export function voiceLimits() {
  const maxCallSeconds = readPositive("VOICE_MAX_CALL_SECONDS");
  const callsPerVisitorPerDay = readPositive("VOICE_MAX_CALLS_PER_VISITOR_PER_DAY");
  const monthlyCapMinutes = readPositive("VOICE_MONTHLY_CAP_MINUTES");
  return {
    maxCallSeconds,
    callsPerVisitorPerDay,
    monthlyCapMinutes,
    complete: maxCallSeconds !== null && callsPerVisitorPerDay !== null && monthlyCapMinutes !== null,
  };
}

/** Only whether the keys exist — never their values. */
export function retellConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY && process.env.NEXT_PUBLIC_RETELL_AGENT_ID);
}
