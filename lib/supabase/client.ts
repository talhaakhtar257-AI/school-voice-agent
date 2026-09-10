import { createBrowserClient } from "@supabase/ssr";

/**
 * The Supabase client for browser code - any "use client" component that signs
 * a staff member in or out.
 *
 * The two NEXT_PUBLIC_ variables are read here as literal process.env.<NAME>
 * expressions, NOT through lib/env.ts. Next.js only inlines a NEXT_PUBLIC_
 * variable into the browser bundle when it sees that literal member expression
 * at build time; lib/env.ts reads process.env[name] with a computed key, which
 * is undefined in the browser. lib/env.ts still serves server-only code
 * (lib/supabase/server.ts, lib/supabase/proxy.ts), where runtime env works.
 *
 * createBrowserClient keeps the session in cookies, not localStorage - the
 * project rules forbid localStorage, and proxy.ts and Server Components cannot
 * read it.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Add both to .env.local and rebuild.",
    );
  }
  return createBrowserClient(url, anonKey);
}
