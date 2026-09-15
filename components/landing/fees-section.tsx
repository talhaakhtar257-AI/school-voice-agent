import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

// Stored once as a number; formatted here, in Latin digits for both languages.
function formatFee(amount: number) {
  return `Rs ${amount.toLocaleString("en-US")}`;
}

/**
 * The fee table, read from the same published content the voice agent answers
 * from — so the page and the agent can never quote different fees.
 */
export function FeesSection({ lang, facts, failed }: { lang: Lang; facts: Facts | null; failed: boolean }) {
  const rows = (facts?.classes ?? [])
    .filter((className) => facts?.feePerClass[className] !== undefined)
    .map((className) => ({ className, fee: facts!.feePerClass[className] }));

  return (
    <section className={styles.section} id="fees">
      <h2 className={styles.title}>{s.feesTitle[lang]}</h2>
      <p className={styles.lead}>{s.feesLead[lang]}</p>

      {failed || rows.length === 0 ? (
        <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.feesEmpty} lang={lang} />
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">{s.feeColumnClass[lang]}</th>
                <th scope="col">{s.feeColumnFee[lang]}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.className}>
                  <td dir="auto">{row.className}</td>
                  <td className={`${styles.feeAmount} ${landing.latin}`} dir="ltr">
                    {formatFee(row.fee)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
