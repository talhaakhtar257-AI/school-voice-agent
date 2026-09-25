"use client";

import { useState } from "react";
import type { Lang } from "@/lib/language";
import { callStrings as c } from "@/lib/strings/landing-call";
import styles from "./call.module.css";

type State = "idle" | "sending" | "saved" | "invalid" | "failed";

// The box appears on the live screen and again after the call ends. These are
// two different components, so remember in memory (not browser storage) which
// calls already have an email, and don't ask twice.
const savedCalls = new Set<string>();

/**
 * Optional email box on the call screen (FR-005). The testers asked for a box
 * rather than spelling an address aloud, which speech recognition gets wrong.
 * Attaches to the call through Retell's call id; the server checks this
 * browser owns that call.
 */
export function EmailBox({ lang, callId }: { lang: Lang; callId: string | null }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>(() => (callId && savedCalls.has(callId) ? "saved" : "idle"));

  if (!callId) return null;
  if (state === "saved" || savedCalls.has(callId)) {
    return (
      <p className={styles.emailDone} role="status">
        {c.emailSaved[lang]}
      </p>
    );
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setState("invalid");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/leads/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId, email: email.trim() }),
      });
      if (res.ok && callId) savedCalls.add(callId);
      setState(res.ok ? "saved" : res.status === 400 ? "invalid" : "failed");
    } catch {
      setState("failed");
    }
  }

  const message = state === "invalid" ? c.emailInvalid[lang] : state === "failed" ? c.emailFailed[lang] : null;

  return (
    <form className={styles.emailBox} onSubmit={send} noValidate>
      <label htmlFor="call-email">{c.emailLabel[lang]}</label>
      <div className={styles.emailRow}>
        <input
          id="call-email"
          type="email"
          dir="ltr"
          inputMode="email"
          autoComplete="email"
          placeholder={c.emailPlaceholder[lang]}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            if (state !== "sending") setState("idle");
          }}
          aria-invalid={state === "invalid"}
          aria-describedby={message ? "call-email-msg" : undefined}
        />
        <button type="submit" disabled={state === "sending" || email.trim() === ""}>
          {state === "sending" ? c.emailSending[lang] : c.emailSend[lang]}
        </button>
      </div>
      {message && (
        <p id="call-email-msg" className={styles.emailError} role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
