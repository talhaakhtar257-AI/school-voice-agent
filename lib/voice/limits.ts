import type { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VISITOR_COOKIE = "visitor_id";
const VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 400; // ~400 days, the browser ceiling

/**
 * Read the visitor's cookie, or generate a fresh random id if it is absent
 * (D-010). No personal data — just an id to count against.
 */
export function getVisitorId(request: NextRequest): string {
  return request.cookies.get(VISITOR_COOKIE)?.value ?? crypto.randomUUID();
}

/** Set the visitor cookie on the response — in every case, including refusals. */
export function setVisitorCookie(response: NextResponse, visitorId: string): void {
  response.cookies.set(VISITOR_COOKIE, visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: VISITOR_COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Check the daily-per-visitor limit and the monthly total-minutes cap, and if
 * both allow it, reserve one call's worth of usage — all in one atomic database
 * call (`reserve_voice_call`, see the migration), so the monthly cap is a real
 * ceiling under concurrent requests, not just usually true (FR-031, FR-032).
 *
 * If the three limit env vars are not all set, this fails CLOSED (returns
 * false) rather than open — an unconfigured limit must never mean "unlimited".
 */
export async function checkAndReserve(visitorId: string): Promise<boolean> {
  const maxCallsPerDay = Number(process.env.VOICE_MAX_CALLS_PER_VISITOR_PER_DAY);
  const maxCallSeconds = Number(process.env.VOICE_MAX_CALL_SECONDS);
  const monthlyCapMinutes = Number(process.env.VOICE_MONTHLY_CAP_MINUTES);

  if (!maxCallsPerDay || !maxCallSeconds || !monthlyCapMinutes) {
    return false;
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("reserve_voice_call", {
    p_visitor_id: visitorId,
    p_max_calls_per_day: maxCallsPerDay,
    p_call_minutes: maxCallSeconds / 60,
    p_monthly_cap_minutes: monthlyCapMinutes,
  });

  if (error) throw error;
  return data === true;
}
