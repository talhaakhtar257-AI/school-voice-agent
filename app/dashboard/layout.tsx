import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { dirFor } from "@/lib/language";
import { readLang } from "@/lib/language-server";
import { dashboardUrduFont, englishFont } from "@/lib/fonts";
import { runHealthChecks } from "@/lib/dashboard/health";
import { orNull } from "@/lib/dashboard/overview";
import { countLiveCalls } from "@/lib/calls/live";
import { DocumentLanguage } from "@/components/landing/document-language";
import { Sidebar, navItems } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import shell from "@/components/dashboard/shell.module.css";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * The shell around every dashboard screen: sidebar, top bar, language.
 *
 * Reads the signed-in user with the server Supabase client. proxy.ts is the
 * real gate - it also refreshes the session and stops any dashboard HTML being
 * sent to a signed-out visitor. This redirect is a second guard in one place
 * (the layout, not each page) for any request the proxy does not match. A
 * dashboard screen must never finish rendering for someone not signed in.
 *
 * Every read below happens on the server with the staff session; the browser
 * never talks to Supabase except to sign out.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const lang = await readLang();
  const [checks, liveCalls] = await Promise.all([runHealthChecks(), orNull("live-count", countLiveCalls())]);
  const items = navItems(lang, liveCalls ?? 0);

  return (
    <div
      lang={lang}
      dir={dirFor(lang)}
      className={`${shell.app} ${englishFont.variable} ${dashboardUrduFont.variable}`}
    >
      <DocumentLanguage lang={lang} />
      <Sidebar lang={lang} email={user.email} items={items} />
      <div className={shell.main}>
        <Topbar lang={lang} items={items} allOk={checks.every((check) => check.ok)} />
        <main className={shell.content}>{children}</main>
      </div>
    </div>
  );
}
