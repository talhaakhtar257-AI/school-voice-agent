import type { ContentDoc } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { contentStrings as s } from "@/lib/strings/landing-content";
import { TextChat } from "@/components/voice/text-chat";
import landing from "./landing.module.css";
import sections from "./sections.module.css";
import styles from "./features.module.css";

/**
 * The design's dark "prefer to type?" band. The design put a lead form here;
 * we have no table for that yet (phase 2), so it holds the text chat instead —
 * the fallback a parent needs when the microphone is refused (FR-015, FR-016).
 */
export function AskBand({ lang, content }: { lang: Lang; content: ContentDoc | null }) {
  return (
    <section className={`${sections.section} ${styles.askBand}`} id="ask">
      <div className={`${landing.wrap} ${styles.askInner}`}>
        <span className={styles.askEyebrow}>{s.askEyebrow[lang]}</span>
        <h2 className={styles.askTitle}>{s.askTitle[lang]}</h2>
        <p className={styles.askLead}>{landingStrings.textChatFromPublished[lang]}</p>
        <div className={styles.askCard}>
          {content ? (
            <TextChat content={content} lang={lang} />
          ) : (
            <p role="alert">
              {s.askUnavailable[lang]}{" "}
              <a href={`tel:${OFFICE_PHONE_E164}`} className={`${landing.phoneLink} ${landing.latin}`} style={{ color: "#fff" }}>
                {OFFICE_PHONE_DISPLAY}
              </a>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
