"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/language";
import { createClient } from "@/lib/supabase/client";
import { staffLoginStrings as s } from "@/lib/strings/staff-login";
import styles from "@/components/login/login.module.css";

type MessageKey =
  | "wrongCredentials"
  | "networkFailure"
  | "cookiesBlocked"
  | "emailRequired"
  | "passwordRequired"
  | "emailMalformed";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M3 3l18 18" />}
    </svg>
  );
}

/**
 * The staff sign-in form.
 *
 * Client Component: holds field state and the loading flag, calls Supabase from
 * the browser so @supabase/ssr writes the session cookie, then moves to
 * /dashboard and refreshes so the server re-reads it.
 *
 * Every failure has its own message in the chosen language (T020-T024). Native
 * browser validation is off (noValidate) so every message is ours. An unknown
 * email and a wrong password produce the SAME message (FR-006).
 *
 * The Show / Hide button reveals the password while typing on a phone. It is a
 * plain button (type="button"), so it can never submit the form, and it resets
 * to hidden after each sign-in attempt so the password is not left on screen.
 */
export function LoginForm({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    setShowPassword(false);

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
        setFormError(error.code === "invalid_credentials" ? "wrongCredentials" : "networkFailure");
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

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form}>
      <label className={styles.field}>
        {s.emailLabel[lang]}
        <input
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          dir="ltr"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setEmailError(null);
          }}
          aria-invalid={emailError !== null}
          aria-describedby={emailError ? "email-error" : undefined}
          className={styles.input}
        />
        {emailError && (
          <span id="email-error" role="alert" className={styles.error}>
            {s[emailError][lang]}
          </span>
        )}
      </label>

      <div className={styles.field}>
        <label htmlFor="password">{s.passwordLabel[lang]}</label>
        <div className={styles.passwordWrap}>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            dir="ltr"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setPasswordError(null);
            }}
            aria-invalid={passwordError !== null}
            aria-describedby={passwordError ? "password-error" : undefined}
            className={styles.input}
          />
          <button
            type="button"
            className={styles.reveal}
            onClick={() => setShowPassword((shown) => !shown)}
            aria-pressed={showPassword}
            aria-controls="password"
            aria-label={showPassword ? s.hidePasswordLabel[lang] : s.showPasswordLabel[lang]}
          >
            <EyeIcon open={!showPassword} />
            {showPassword ? s.hidePassword[lang] : s.showPassword[lang]}
          </button>
        </div>
        {passwordError && (
          <span id="password-error" role="alert" className={styles.error}>
            {s[passwordError][lang]}
          </span>
        )}
      </div>

      {formError && (
        <p role="alert" className={styles.formError}>
          {s[formError][lang]}
        </p>
      )}

      <button type="submit" disabled={loading} className={styles.submit}>
        {loading ? s.signingIn[lang] : s.signInButton[lang]}
      </button>
    </form>
  );
}
