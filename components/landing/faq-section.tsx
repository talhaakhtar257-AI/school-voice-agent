import type { Bilingual } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { contentStrings } from "@/lib/strings/landing-content";
import { PlusIcon } from "./icons";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

type PublicFaq = { id: string; question: Bilingual; answer: Bilingual };

/**
 * Published questions and answers as the design's accordion. <details> opens
 * and closes without JavaScript, so the FAQ works when scripts fail and when
 * the AI is unavailable (FR-019). Archived FAQs are removed by forPublicApi.
 */
export function FaqSection({ lang, faqs, failed }: { lang: Lang; faqs: PublicFaq[]; failed: boolean }) {
  // An FAQ missing this language's text would render as an empty row; skip it.
  const visible = faqs.filter((faq) => faq.question[lang] && faq.answer[lang]);

  return (
    <section className={styles.section} id="faq">
      <div className={`${landing.wrap} ${styles.narrow}`}>
        <h2 className={styles.sectionTitle}>{landingStrings.faqTitle[lang]}</h2>
        <p className={styles.sectionLead}>{contentStrings.faqLead[lang]}</p>

        {failed || visible.length === 0 ? (
          <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={landingStrings.faqEmpty} lang={lang} />
        ) : (
          <div className={styles.faq}>
            {visible.map((faq) => (
              <details key={faq.id} className={styles.faqItem}>
                <summary className={styles.faqQuestion}>
                  <span dir="auto">{faq.question[lang]}</span>
                  <span className={styles.plus}>
                    <PlusIcon size={17} strokeWidth={2.4} />
                  </span>
                </summary>
                <p className={styles.faqAnswer} dir="auto">
                  {faq.answer[lang]}
                </p>
              </details>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
