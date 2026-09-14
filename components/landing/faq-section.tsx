import type { Bilingual } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { SectionState } from "./section-state";
import styles from "./sections.module.css";

type PublicFaq = { id: string; question: Bilingual; answer: Bilingual };

/**
 * Published questions and answers. <details>/<summary> open and close without
 * JavaScript, so the FAQ works when scripts fail and when the AI is unavailable
 * (FR-019). Archived FAQs are already removed by forPublicApi.
 */
export function FaqSection({ lang, faqs, failed }: { lang: Lang; faqs: PublicFaq[]; failed: boolean }) {
  // An FAQ missing this language's text would render as an empty row; skip it.
  const visible = faqs.filter((faq) => faq.question[lang] && faq.answer[lang]);

  return (
    <section className={styles.section} id="faq">
      <h2 className={styles.title}>{landingStrings.faqTitle[lang]}</h2>

      {failed || visible.length === 0 ? (
        <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={landingStrings.faqEmpty} lang={lang} />
      ) : (
        <div className={styles.faq}>
          {visible.map((faq) => (
            <details key={faq.id} className={styles.faqItem}>
              <summary className={styles.faqQuestion}>
                <span dir="auto">{faq.question[lang]}</span>
                <svg className={styles.plus} width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </summary>
              <p className={styles.faqAnswer} dir="auto">
                {faq.answer[lang]}
              </p>
            </details>
          ))}
        </div>
      )}
    </section>
  );
}
