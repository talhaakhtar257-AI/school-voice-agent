import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { contentStrings as s } from "@/lib/strings/landing-content";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

// Stored once as a number; formatted here, in Latin digits for both languages.
function formatFee(amount: number | undefined) {
  return amount === undefined || amount <= 0 ? "—" : `Rs ${amount.toLocaleString("en-US")}`;
}

/**
 * The design's fee table, read from the same published content the voice
 * agent answers from — so the page and the agent can never quote different
 * fees. No discount wording, ever (constitution).
 */
export function FeesSection({ lang, facts, failed }: { lang: Lang; facts: Facts | null; failed: boolean }) {
  const rows = (facts?.classes ?? []).filter((name) => facts?.feePerClass[name] !== undefined);

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} id="fees">
      <div className={landing.wrap}>
        <h2 className={styles.sectionTitle}>{s.feesTitle[lang]}</h2>
        <p className={styles.sectionLead}>{s.feesLead[lang]}</p>

        {failed || !facts || rows.length === 0 ? (
          <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.feesEmpty} lang={lang} />
        ) : (
          <div className={styles.tableWrap}>
            <div className={styles.tscroll}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th scope="col">{s.feeClass[lang]}</th>
                    <th scope="col">{s.feeAdmission[lang]}</th>
                    <th scope="col">{s.feeMonthly[lang]}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((name) => (
                    <tr key={name}>
                      <td dir="auto">{name}</td>
                      <td className={styles.tabular}>
                        <bdi>{formatFee(facts.admissionFeePerClass[name])}</bdi>
                      </td>
                      <td className={styles.tabular}>
                        <bdi>{formatFee(facts.feePerClass[name])}</bdi>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={styles.feeNote}>{s.feeNote[lang]}</div>
          </div>
        )}
      </div>
    </section>
  );
}
