import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseAnonKey, getSupabaseUrl } from "../env";

/**
 * The Supabase client for browser code — any "use client" component that signs
 * a staff member in or out.
 *
 * createBrowserClient from @supabase/ssr keeps the session in cookies. The plain
 * @supabase/supabase-js client would put it in localStorage, which the project
 * rules forbid and which proxy.ts and Server Components cannot read.
 *
 * A fresh client per call is the documented @supabase/ssr pattern: the cookie
 * store holds the session, so there is nothing in the object worth reusing.
 */
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
