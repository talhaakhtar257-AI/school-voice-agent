import { readLiveForApi } from "@/lib/content/queries";
import { isEmptyDoc } from "@/lib/content/schema";
import { OFFICE_PHONE_E164 } from "@/lib/office";
import { isDatabaseReachable } from "@/lib/supabase/health";
import { retellConfigured, voiceLimits } from "./settings";

export type CheckKey = "db" | "content" | "retell" | "limits" | "phone";
export type Check = { key: CheckKey; ok: boolean };

// lib/office.ts ships an all-zero placeholder until the school gives a number.
const PLACEHOLDER_PHONE = /^\+920+$/;

/**
 * The Health screen's checks, and the source of the top bar's Ready pill.
 * Each check is a plain yes/no: no key, hostname or error text leaves here.
 */
export async function runHealthChecks(): Promise<Check[]> {
  let db: boolean;
  try {
    db = await isDatabaseReachable();
  } catch {
    // isDatabaseReachable throws only when a Supabase env var is missing —
    // for this check that is the same answer: the database is not usable.
    db = false;
  }

  const live = await readLiveForApi();

  return [
    { key: "db", ok: db },
    { key: "content", ok: live !== null && !isEmptyDoc(live.doc) },
    { key: "retell", ok: retellConfigured() },
    { key: "limits", ok: voiceLimits().complete },
    { key: "phone", ok: !PLACEHOLDER_PHONE.test(OFFICE_PHONE_E164) },
  ];
}
