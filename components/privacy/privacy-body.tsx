import { Fragment, type ReactNode } from "react";
import type { Lang } from "@/lib/language";
import { formatDateKey } from "@/lib/landing/admissions";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { PRIVACY_LAST_UPDATED, PRIVACY_POLICY_APPROVED, privacyStrings as s } from "@/lib/strings/privacy";
import { privacySections } from "@/lib/strings/privacy-sections";
import landing from "@/components/landing/landing.module.css";
import styles from "./privacy.module.css";

/**
 * Puts the stored office number and school name where a sentence says {phone}
 * or {school}. They are stored once (CLAUDE.md), so the policy can never quote a
 * different number from the rest of the site.
 */
function fill(text: string, lang: Lang): ReactNode[] {
  return text.split(/(\{phone\}|\{school\})/).map((part, index) => {
    if (part === "{phone}") {
      return (
        <a key={index} className={`${styles.phone} ${landing.latin}`} href={`tel:${OFFICE_PHONE_E164}`}>
          <bdi dir="ltr">{OFFICE_PHONE_DISPLAY}</bdi>
        </a>
      );
    }
    if (part === "{school}") return <Fragment key={index}>{landingStrings.schoolName[lang]}</Fragment>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

/** The policy document: title, draft notice, date, office phone, then the eleven sections. */
export function PrivacyBody({ lang }: { lang: Lang }) {
  return (
    <article className={styles.article}>
      <h1>{s.heading[lang]}</h1>

      {!PRIVACY_POLICY_APPROVED && (
        <p className={styles.draft} role="note">
          {s.draftNotice[lang]}
        </p>
      )}

      <p className={styles.meta}>
        {s.lastUpdatedLabel[lang]} <bdi>{formatDateKey(PRIVACY_LAST_UPDATED, lang)}</bdi>
      </p>
      <p className={styles.contact}>{fill(s.contactLine[lang], lang)}</p>

      {privacySections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={styles.section}
          aria-labelledby={`${section.id}-title`}
        >
          <h2 id={`${section.id}-title`}>{section.heading[lang]}</h2>
          {section.paragraphs[lang].map((paragraph, index) => (
            <p key={index}>{fill(paragraph, lang)}</p>
          ))}
          {section.list && (
            <ul>
              {section.list[lang].map((item, index) => (
                <li key={index}>{fill(item, lang)}</li>
              ))}
            </ul>
          )}
          {section.after?.[lang].map((paragraph, index) => (
            <p key={`after-${index}`}>{fill(paragraph, lang)}</p>
          ))}
        </section>
      ))}
    </article>
  );
}
