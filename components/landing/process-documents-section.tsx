import type { ContentDoc } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import { SectionState } from "./section-state";
import styles from "./sections.module.css";

/**
 * The admission process and document requirements, exactly as staff published
 * them. No document list is typed into code: the school decides what to ask
 * for, and this page never names ID numbers on its own.
 */
export function ProcessDocumentsSection({
  lang,
  policies,
  failed,
}: {
  lang: Lang;
  policies: ContentDoc["policies"] | null;
  failed: boolean;
}) {
  const process = policies?.admissionProcess[lang] ?? "";
  const documents = policies?.documentRequirements[lang] ?? "";

  return (
    <section className={styles.section} id="process">
      <div className={styles.split}>
        <div>
          <h2 className={styles.title}>{s.processTitle[lang]}</h2>
          {failed || !process ? (
            <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.processEmpty} lang={lang} />
          ) : (
            <p className={styles.prose}>{process}</p>
          )}
        </div>

        <div>
          <h2 className={styles.title}>{s.documentsTitle[lang]}</h2>
          {failed || !documents ? (
            <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.documentsEmpty} lang={lang} />
          ) : (
            <p className={styles.prose}>{documents}</p>
          )}

          <div className={`${styles.card} ${styles.askCard}`}>
            <h3>{s.askCardTitle[lang]}</h3>
            <p>{s.askCardBody[lang]}</p>
            <a href="#talk" className={styles.button}>
              {s.askCardButton[lang]}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
