"use client";

import { useState } from "react";
import type { Lang } from "@/lib/language";
import { EMAIL_PATTERN, normalisePkMobile, preCallStrings as p } from "@/lib/strings/pre-call";
import { MicExplainer } from "@/components/voice/mic-explainer";
import styles from "./call.module.css";

/** `email` is "" when the parent chose not to give one. */
export type ParentDetails = { name: string; phone: string; email: string };

type Errors = Partial<Record<keyof ParentDetails | "consent", boolean>>;

/**
 * Name and mobile (required), email (optional) and permission to start the
 * call, before anything connects (feature 011). Testers spent half a call
 * correcting a spoken name; typed details are exact, so the assistant never
 * asks for them. The microphone explanation and notices stay directly below,
 * and its Continue button is what submits this form.
 */
export function PreCallForm({
  lang,
  initial,
  onSubmit,
}: {
  lang: Lang;
  initial: ParentDetails | null;
  onSubmit: (details: ParentDetails) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  function submit() {
    const cleanPhone = normalisePkMobile(phone);
    const cleanEmail = email.trim().toLowerCase();
    const next: Errors = {
      name: name.trim().length < 2,
      phone: cleanPhone === null,
      email: cleanEmail !== "" && !EMAIL_PATTERN.test(cleanEmail),
      consent: !consent,
    };
    setErrors(next);
    if (next.name || next.phone || next.email || next.consent || !cleanPhone) return;
    onSubmit({ name: name.trim().slice(0, 120), phone: cleanPhone, email: cleanEmail });
  }

  const field = (
    id: keyof ParentDetails,
    label: string,
    value: string,
    set: (v: string) => void,
    input: React.InputHTMLAttributes<HTMLInputElement>,
    error: string,
  ) => (
    <div className={styles.field}>
      <label htmlFor={`pre-${id}`}>{label}</label>
      <input
        id={`pre-${id}`}
        value={value}
        onChange={(event) => {
          set(event.target.value);
          if (errors[id]) setErrors({ ...errors, [id]: false });
        }}
        aria-invalid={errors[id] ?? false}
        aria-describedby={errors[id] ? `pre-${id}-err` : undefined}
        {...input}
      />
      {errors[id] && (
        <span id={`pre-${id}-err`} className={styles.fieldError} role="alert">
          {error}
        </span>
      )}
    </div>
  );

  return (
    <div className={styles.preCall}>
      <p className={styles.preCallIntro}>{p.intro[lang]}</p>
      {field("name", p.name[lang], name, setName, { required: true, autoComplete: "name", dir: "auto", placeholder: p.namePlaceholder[lang] }, p.nameError[lang])}
      {field("phone", p.phone[lang], phone, setPhone, { required: true, type: "tel", inputMode: "tel", autoComplete: "tel", dir: "ltr", placeholder: p.phonePlaceholder[lang] }, p.phoneError[lang])}
      {field("email", p.email[lang], email, setEmail, { type: "email", inputMode: "email", autoComplete: "email", dir: "ltr", placeholder: p.emailPlaceholder[lang] }, p.emailError[lang])}
      <p className={styles.fieldHint}>{p.emailHint[lang]}</p>
      <label className={styles.consent}>
        <input
          id="pre-consent"
          type="checkbox"
          checked={consent}
          onChange={(event) => {
            setConsent(event.target.checked);
            if (errors.consent) setErrors({ ...errors, consent: false });
          }}
          aria-invalid={errors.consent ?? false}
        />
        <span>{p.consent[lang]}</span>
      </label>
      {errors.consent && (
        <span className={styles.fieldError} role="alert">
          {p.consentError[lang]}
        </span>
      )}
      <MicExplainer lang={lang} onContinue={submit} />
    </div>
  );
}
