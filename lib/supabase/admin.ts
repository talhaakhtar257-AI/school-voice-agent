import { createClient } from "@supabase/supabase-js";

/**
 * The service-role Supabase client. Server-side only — it bypasses row-level
 * security.
 *
 * NEVER import this from a client component or anything that reaches the browser.
 * It is used by `app/api/content/route.ts` (which has no staff session) and by
 * the publish server action (which needs to call `publish_content`, whose EXECUTE
 * grant was revoked from every other role in the harden migration).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — set both in the environment.",
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
