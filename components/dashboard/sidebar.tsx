import Image from "next/image";
import Link from "next/link";
import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import { SignOutButton } from "@/components/sign-out-button";
import { NavLinks, type NavItem } from "./nav-links";
import shell from "./shell.module.css";

export function navItems(lang: Lang): NavItem[] {
  return [
    { href: "/dashboard", label: s.navOverview[lang], icon: "overview" },
    { href: "/dashboard/leads", label: s.navLeads[lang], icon: "leads" },
    { href: "/dashboard/unanswered", label: s.navGaps[lang], icon: "gaps" },
    { href: "/dashboard/content", label: s.navContent[lang], icon: "content" },
    { href: "/dashboard/health", label: s.navHealth[lang], icon: "health" },
    { href: "/dashboard/settings", label: s.navSettings[lang], icon: "settings" },
  ];
}

/**
 * Dark sidebar on wide screens; on phones the same block sits above the page
 * with the links as a horizontal scrolling strip (no menu script needed).
 */
export function Sidebar({ lang, email, items }: { lang: Lang; email: string | undefined; items: NavItem[] }) {
  return (
    <aside className={shell.sidebar}>
      <div className={shell.logo}>
        <Image src="/school-logo.svg" alt="" width={36} height={36} />
        <span className={shell.logoText}>
          <b>{landingStrings.schoolName[lang]}</b>
          <span className={shell.brandSub}>{s.brandSub[lang]}</span>
        </span>
      </div>

      <NavLinks items={items} label={s.navLabel[lang]} />

      <div className={shell.sideFoot}>
        <Link href="/" target="_blank" rel="noopener">
          {s.viewSite[lang]}
        </Link>
        {email && (
          <span className={shell.sideEmail}>
            {s.signedInAs[lang]}: <bdi>{email}</bdi>
          </span>
        )}
        <SignOutButton />
      </div>
    </aside>
  );
}
