import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * The shell around every dashboard screen.
 *
 * Reads the signed-in user with the server Supabase client and shows their email
 * in the header. proxy.ts (T014) is the real gate - it also refreshes the
 * session and stops any dashboard HTML being sent to a signed-out visitor. This
 * redirect is a second guard in one place (the layout, not each page) for the
 * window before proxy.ts exists and for any request it does not match. A
 * dashboard screen must never finish rendering for someone not signed in.
 *
 * The sign-out button (T027) joins this header in Phase 6.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header
        dir="auto"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(128,128,128,0.3)",
        }}
      >
        <strong style={{ fontSize: "0.95rem" }}>Al-Noor Public School</strong>
        <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          {user.email}
        </span>
      </header>
      <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
    </div>
  );
}
