"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { staffLoginStrings as s } from "@/lib/strings/staff-login";

type MessageKey =
  | "wrongCredentials"
  | "networkFailure"
  | "cookiesBlocked"
  | "emailRequired"
  | "passwordRequired"
  | "emailMalformed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Both languages of one message, stacked, announced to screen readers. */
function Message({ messageKey }: { messageKey: MessageKey }) {
  return (
    <p
      role="alert"
      dir="auto"
      style={{ margin: 0, color: "var(--failure-border)", fontSize: "0.9rem" }}
    >
      {s[messageKey].en}
      <br />
      {s[messageKey].ur}
    </p>
  );
}

/**
 * The staff sign-in form.
 *
 * Client Component: holds field state and the loading flag, calls Supabase from
 * the browser so @supabase/ssr writes the session cookie, then moves to
 * /dashboard and refreshes so the server re-reads it.
 *
 * Every failure has its own bilingual message (T020-T024). Native browser
 * validation is off (noValidate) so every message is ours and in both languages.
 * An unknown email and a wrong password produce the SAME message (FR-006).
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<MessageKey | null>(null);
  const [passwordError, setPasswordError] = useState<MessageKey | null>(null);
  const [formError, setFormError] = useState<MessageKey | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return; // blocks a second submission (FR-010)

    setEmailError(null);
    setPasswordError(null);
    setFormError(null);

    const trimmedEmail = email.trim();
    let stop = false;
    if (trimmedEmail === "") {
      setEmailError("emailRequired");
      stop = true;
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setEmailError("emailMalformed");
      stop = true;
    }
    if (password === "") {
      setPasswordError("passwordRequired");
      stop = true;
    }
    if (stop) return;

    if (!navigator.cookieEnabled) {
      setFormError("cookiesBlocked");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });
      if (error) {
        // Same message for an unknown email and a wrong password (FR-006).
        // Anything else the server returned is a server-side failure, distinct
        // from bad credentials (T023).
        setFormError(
          error.code === "invalid_credentials"
            ? "wrongCredentials"
            : "networkFailure",
        );
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      // fetch threw — offline, DNS failure, request blocked.
      setFormError("networkFailure");
      setLoading(false);
    }
  }

  const cell = { minHeight: "44px", padding: "0.5rem", fontSize: "1rem" };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
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
          inputMode="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          aria-invalid={emailError !== null}
          style={cell}
        />
        {emailError && <Message messageKey={emailError} />}
      </label>

      <label style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        <span>
          {s.passwordLabel.en} · {s.passwordLabel.ur}
        </span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setPasswordError(null);
          }}
          aria-invalid={passwordError !== null}
          style={cell}
        />
        {passwordError && <Message messageKey={passwordError} />}
      </label>

      {formError && <Message messageKey={formError} />}

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
