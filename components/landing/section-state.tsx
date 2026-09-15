import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

/**
 * The card a section shows instead of data: "empty" when nothing is published
 * yet, "unavailable" when the content read failed. Both point to the office,
 * so a parent is never left at a blank box.
 */
export function SectionState({
  kind,
  emptyMessage,
  lang,
}: {
  kind: "empty" | "unavailable";
  emptyMessage: { en: string; ur: string };
  lang: Lang;
}) {
  const unavailable = kind === "unavailable";
  return (
    <div
      className={`${styles.state} ${unavailable ? styles.stateUnavailable : ""}`}
      role={unavailable ? "alert" : undefined}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5M12 16.5v.5" />
      </svg>
      <div>
        <p>{unavailable ? s.sectionUnavailable[lang] : emptyMessage[lang]}</p>
        <p>
          {s.callOfficeHint[lang]}{" "}
          <a href={`tel:${OFFICE_PHONE_E164}`} className={`${landing.phoneLink} ${landing.latin}`}>
            {OFFICE_PHONE_DISPLAY}
          </a>
        </p>
      </div>
    </div>
  );
}
