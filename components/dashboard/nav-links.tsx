"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import shell from "./shell.module.css";

export type NavIcon = "overview" | "leads" | "gaps" | "content" | "health" | "settings";
export type NavItem = { href: string; label: string; icon: NavIcon };

const ICONS: Record<NavIcon, React.ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  leads: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
    </>
  ),
  gaps: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
    </>
  ),
  content: (
    <>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
      <path d="M14 3v6h6M8 13h8M8 17h5" />
    </>
  ),
  health: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  settings: <path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6" />,
};

// Overview is an exact match; every other section also owns its sub-pages
// (e.g. /dashboard/content/history belongs to Content).
function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

/** Sidebar links. A client component only because it needs the current path. */
export function NavLinks({ items, label }: { items: NavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav className={shell.nav} aria-label={label}>
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${shell.navItem} ${active ? shell.navItemActive : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {ICONS[item.icon]}
            </svg>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** The top bar's page title, matched from the same nav list. */
export function PageTitle({ items, fallback }: { items: NavItem[]; fallback: string }) {
  const pathname = usePathname();
  const match = items.find((item) => isActive(pathname, item.href));
  return <h1 className={shell.pageTitle}>{match?.label ?? fallback}</h1>;
}
