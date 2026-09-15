import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { sectionStrings as s } from "@/lib/strings/landing-sections";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

/** One card per published class, with its published age range. */
export function ProgramsSection({ lang, facts, failed }: { lang: Lang; facts: Facts | null; failed: boolean }) {
  const classes = facts?.classes ?? [];

  return (
    <section className={styles.section} id="programs">
      <h2 className={styles.title}>{s.programsTitle[lang]}</h2>

      {failed || classes.length === 0 ? (
        <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.programsEmpty} lang={lang} />
      ) : (
        <div className={`${styles.grid} ${styles.gridThree}`}>
          {classes.map((className) => {
            const age = facts?.ageCriteriaPerClass[className];
            return (
              <div key={className} className={styles.card}>
                {age && (
                  <div className={styles.programAge}>
                    {s.ageRange[lang]}{" "}
                    <span className={landing.latin} dir="ltr">
                      {age.minYears}–{age.maxYears}
                    </span>{" "}
                    {s.years[lang]}
                  </div>
                )}
                <h3 dir="auto">{className}</h3>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
