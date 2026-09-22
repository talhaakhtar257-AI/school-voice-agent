import { listLiveCalls } from "@/lib/calls/live";
import { orNull } from "@/lib/dashboard/overview";
import { readLang } from "@/lib/language-server";
import { liveStrings as s } from "@/lib/strings/live-calls";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AutoRefresh } from "@/components/live/auto-refresh";
import { LiveCalls } from "@/components/live/live-calls";
import ui from "@/components/dashboard/ui.module.css";

export const dynamic = "force-dynamic";

/**
 * Live calls (feature 010, User Story 4). Rows come from Retell's call
 * started / ended events via the webhook. The key that lets staff watch and
 * take over is read here, on the server, and handed only to this signed-in
 * page (FR-021b). If the dedicated staff key is not set, the site's own
 * public key is tried — Retell decides whether that key may monitor.
 */
export default async function LiveCallsPage() {
  const lang = await readLang();
  const calls = await orNull("live-calls", listLiveCalls());
  const staffKey = process.env.RETELL_STAFF_PUBLIC_KEY || process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY || null;

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <div>
          <h2 className={ui.cardTitle}>{s.title[lang]}</h2>
          <div className={ui.sub}>{s.sub[lang]}</div>
        </div>
      </div>
      {calls === null ? (
        <>
          <AutoRefresh seconds={10} />
          <EmptyState tone="error" title={s.errorTitle[lang]} body={s.errorBody[lang]} />
        </>
      ) : calls.length === 0 ? (
        <>
          <AutoRefresh seconds={10} />
          <EmptyState title={s.empty[lang]} />
        </>
      ) : (
        <LiveCalls lang={lang} calls={calls} staffKey={staffKey} />
      )}
    </section>
  );
}
