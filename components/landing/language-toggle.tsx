import { setLanguage } from "@/app/actions/language";
import type { Lang } from "@/lib/language";
import { heroStrings as s } from "@/lib/strings/landing-hero";
import styles from "./landing.module.css";

/**
 * English / اردو switch. A real form posting to a Server Function, so it works
 * with JavaScript off. Each button's label is in its own language, so a parent
 * who reads only one of them can still find it.
 */
export function LanguageToggle({ lang }: { lang: Lang }) {
  return (
    <form action={setLanguage} className={styles.langSwitch} aria-label={s.languageLabel[lang]}>
      <button
        type="submit"
        name="lang"
        value="en"
        lang="en"
        className={styles.langButton}
        aria-pressed={lang === "en"}
      >
        English
      </button>
      <button
        type="submit"
        name="lang"
        value="ur"
        lang="ur"
        className={`${styles.langButton} ${styles.langUrdu}`}
        aria-pressed={lang === "ur"}
      >
        اردو
      </button>
    </form>
  );
}
