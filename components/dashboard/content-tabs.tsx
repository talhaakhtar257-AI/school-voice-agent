"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Lang } from "@/lib/language";
import { dashboardStrings as s } from "@/lib/strings/dashboard";
import panels from "./panels.module.css";

/** Edit / Test / History tabs above every content screen. */
export function ContentTabs({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/dashboard/content", label: s.tabEdit[lang], active: pathname === "/dashboard/content" },
    { href: "/dashboard/content/test", label: s.tabTest[lang], active: pathname.startsWith("/dashboard/content/test") },
    { href: "/dashboard/content/history", label: s.tabHistory[lang], active: pathname.startsWith("/dashboard/content/history") },
  ];

  return (
    <nav className={panels.tabs} aria-label={s.navContent[lang]}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`${panels.tab} ${tab.active ? panels.tabActive : ""}`}
          aria-current={tab.active ? "page" : undefined}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
