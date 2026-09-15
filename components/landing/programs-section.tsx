import type { Bilingual, Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { hasAgeRange } from "@/lib/landing/class-finder";
import { contentStrings as s } from "@/lib/strings/landing-content";
import { ProgramIcon } from "./icons";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

type PublicProgram = { id: string; title: Bilingual; classes: string[]; description: Bilingual };

// The age tag spans the youngest and oldest ages across the program's classes,
// so it always agrees with the per-class ages in Facts.
function ageSpan(classes: string[], facts: Facts | null) {
  const ranges = classes.map((name) => facts?.ageCriteriaPerClass[name]).filter(hasAgeRange);
  if (ranges.length === 0) return null;
  return {
    min: Math.min(...ranges.map((r) => r.minYears)),
    max: Math.max(...ranges.map((r) => r.maxYears)),
  };
}

/** The design's program cards, one per published program. */
export function ProgramsSection({
  lang,
  programs,
  facts,
  failed,
}: {
  lang: Lang;
  programs: PublicProgram[];
  facts: Facts | null;
  failed: boolean;
}) {
  const visible = programs.filter((program) => program.title[lang]);

  return (
    <section className={styles.section} id="programs">
      <div className={landing.wrap}>
        <h2 className={styles.sectionTitle}>{s.programsTitle[lang]}</h2>
        <p className={styles.sectionLead}>{s.programsLead[lang]}</p>

        {failed || visible.length === 0 ? (
          <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.programsEmpty} lang={lang} />
        ) : (
          <ul className={styles.grid4}>
            {visible.map((program, i) => {
              const span = ageSpan(program.classes, facts);
              return (
                <li key={program.id} className={styles.card}>
                  <div className={styles.progIcon}>
                    <ProgramIcon index={i} />
                  </div>
                  {span && (
                    <div className={styles.progAge}>
                      {s.ageTag[lang]}{" "}
                      <bdi className={landing.latin}>
                        {span.min}–{span.max}
                      </bdi>{" "}
                      {s.years[lang]}
                    </div>
                  )}
                  <h3 dir="auto">{program.title[lang]}</h3>
                  {program.description[lang] && <p dir="auto">{program.description[lang]}</p>}
                  {program.classes.length > 0 && (
                    <p className={styles.progClasses} dir="auto">
                      {s.classesLabel[lang]}: {program.classes.join("، ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
