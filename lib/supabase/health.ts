import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl } from "../env";

/**
 * Creates the Supabase client and answers one question: can this application
 * reach its database right now?
 *
 * The anonymous key is used deliberately. Checking reachability needs no
 * privilege, and the service role key bypasses row level security — it must
 * never appear in code a browser could reach.
 */

export function createSupabaseClient() {
  return createClient(getSupabaseUrl(), getSupabaseAnonKey());
}

/**
 * Returns true when the database answered, false when it did not.
 *
 * Why this returns a plain boolean and swallows the error: FR-008 forbids
 * exposing connection strings, keys, hostnames or error traces in any response,
 * including failures. The health page is reachable by anyone who guesses its
 * address, so the underlying error must not travel any further than this
 * function. This is the one place in the codebase where discarding an error is
 * the correct behaviour rather than a mistake.
 *
 * Supabase's own health endpoint is probed rather than a table, because FR-009
 * requires success against an empty database. It must be called with the key,
 * so a 200 also proves the URL and key are correct. The REST root (/rest/v1/)
 * was used before, but Supabase now refuses it with 401 for the anonymous key,
 * which made a healthy project report "cannot reach its database".
 */
export async function isDatabaseReachable(): Promise<boolean> {
  try {
    const response = await fetch(`${getSupabaseUrl()}/auth/v1/health`, {
      headers: {
        apikey: getSupabaseAnonKey(),
        Authorization: `Bearer ${getSupabaseAnonKey()}`,
      },
      cache: "no-store",
    });

    return response.ok;
  } catch {
    return false;
  }
}
