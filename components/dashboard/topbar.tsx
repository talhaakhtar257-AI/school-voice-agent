import Link from "next/link";
import type { Lang } from "@/lib/language";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import { LanguageToggle } from "@/components/landing/language-toggle";
import { PageTitle, type NavItem } from "./nav-links";
import shell from "./shell.module.css";

/**
 * Sticky top bar: page title, the Ready / Needs attention pill (from the health
 * checks, linking to the Health screen) and the shared language toggle.
 */
export function Topbar({ lang, items, allOk }: { lang: Lang; items: NavItem[]; allOk: boolean }) {
  return (
    <header className={shell.topbar}>
      <PageTitle items={items} fallback={s.navOverview[lang]} />
      <Link href="/dashboard/health" className={`${shell.pill} ${allOk ? shell.pillOk : shell.pillWarn}`}>
        <i aria-hidden="true" />
        {allOk ? s.statusReady[lang] : s.statusAttention[lang]}
      </Link>
      <LanguageToggle lang={lang} />
    </header>
  );
}
