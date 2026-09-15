import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { heroStrings as h } from "@/lib/strings/landing-hero";
import landing from "./landing.module.css";
import styles from "./hero.module.css";

/**
 * The design's dark figures strip. Only figures the school has published are
 * shown; with none published the strip is left out entirely rather than
 * showing zeros or invented numbers.
 */
export function StatsBand({ lang, stats }: { lang: Lang; stats: Facts["stats"] | null }) {
  if (!stats) return null;

  const items: { key: string; value: string; label: string }[] = [];
  if (stats.studentsEnrolled !== null) {
    items.push({ key: "students", value: stats.studentsEnrolled.toLocaleString("en-US"), label: h.statStudents[lang] });
  }
  if (stats.teachers !== null) {
    items.push({ key: "teachers", value: stats.teachers.toLocaleString("en-US"), label: h.statTeachers[lang] });
  }
  if (stats.foundedYear !== null) {
    const years = new Date().getFullYear() - stats.foundedYear;
    if (years >= 0) items.push({ key: "years", value: String(years), label: h.statYears[lang] });
  }
  // The languages item is always true, so on its own it is no reason to show the strip.
  if (items.length === 0) return null;
  items.push({ key: "languages", value: "2", label: h.statLanguages[lang] });

  return (
    <section className={styles.stats} aria-label={h.statsLabel[lang]}>
      <div className={`${landing.wrap} ${styles.statsGrid}`}>
        {items.map((item) => (
          <div key={item.key}>
            <div className={styles.statValue}>{item.value}</div>
            <div className={styles.statLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
