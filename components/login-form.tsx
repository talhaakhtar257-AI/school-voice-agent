"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffLoginStrings as s } from "@/lib/strings/staff-login";

/**
 * The staff sign-in form.
 *
 * Client Component: it holds the field state and the loading flag, and calls
 * Supabase from the browser so @supabase/ssr writes the session cookie. On
 * success it moves to /dashboard and refreshes so the server re-reads the cookie.
 *
 * This step (T009) is the happy path plus the loading state that blocks a second
 * submit. The specific error messages — wrong password, empty field, malformed
 * email, network failure, cookies blocked — arrive in Phase 5 (T020-T024). Until
 * then any failure shows one generic bilingual message rather than failing
 * silently.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return; // blocks a second submission (FR-010, scenario 3)

    setLoading(true);
    setFailed(false);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setFailed(true);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      // Network or cookie failure. Phase 5 (T023, T024) tells these apart.
      setFailed(true);
      setLoading(false);
    }
  }

  const cell = { minHeight: "44px", padding: "0.5rem", fontSize: "1rem" };

  return (
    <form
      onSubmit={handleSubmit}
      dir="auto"
      style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}
    >
      <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <span>
          {s.emailLabel.en} · {s.emailLabel.ur}
        </span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={cell}
        />
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <span>
          {s.passwordLabel.en} · {s.passwordLabel.ur}
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={cell}
        />
      </label>

      {failed && (
        <p role="alert" style={{ margin: 0, color: "var(--failure-border)" }}>
          {s.wrongCredentials.en}
          <br />
          {s.wrongCredentials.ur}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        style={{
          minHeight: "44px",
          padding: "0.6rem",
          fontSize: "1rem",
          fontWeight: 600,
        }}
      >
        {loading
          ? `${s.signingIn.en} · ${s.signingIn.ur}`
          : `${s.signInButton.en} · ${s.signInButton.ur}`}
      </button>
    </form>
  );
}
