import Image from "next/image";
import Link from "next/link";
import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import { liveStrings } from "@/lib/strings/live-calls";
import { SignOutButton } from "@/components/sign-out-button";
import { NavLinks, type NavItem } from "./nav-links";
import shell from "./shell.module.css";

/** `liveCalls` > 0 adds a badge such as "2 live" to Live calls. */
export function navItems(lang: Lang, liveCalls = 0): NavItem[] {
  return [
    { href: "/dashboard", label: s.navOverview[lang], icon: "overview" },
    { href: "/dashboard/leads", label: s.navLeads[lang], icon: "leads" },
    {
      href: "/dashboard/live",
      label: liveStrings.nav[lang],
      icon: "live",
      badge: liveCalls > 0 ? `${liveCalls} ${liveStrings.live[lang]}` : undefined,
    },
    { href: "/dashboard/knowledge", label: s.navGaps[lang], icon: "gaps" },
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
