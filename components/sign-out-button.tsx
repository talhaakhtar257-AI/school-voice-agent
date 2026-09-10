"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffLoginStrings as s } from "@/lib/strings/staff-login";

/**
 * Signs the current staff member out and returns them to /login.
 *
 * Client Component: signOut() clears the session cookie through the browser
 * client - the same path sign-in used - then router.push + refresh so the server
 * sees the cleared cookie and the proxy governs everything after. Disabled while
 * the request is in flight so it cannot be double-fired. The back button landing
 * on /dashboard afterwards is caught by the proxy (no session -> /login).
 */
export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (loading) return;
    setLoading(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // signOut() clears the local session before it returns even if the
      // server revoke call fails; go to /login regardless.
    }
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        minHeight: "44px",
        padding: "0.4rem 0.75rem",
        fontSize: "0.9rem",
        fontWeight: 600,
      }}
    >
      {s.signOutButton.en} · {s.signOutButton.ur}
    </button>
  );
}
