import Link from "next/link";
import { listHistory } from "@/lib/content/queries";
import { orNull } from "@/lib/dashboard/overview";
import { formatDateTime } from "@/lib/dashboard/format";
import { readLang } from "@/lib/language-server";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { dashboardStrings } from "@/lib/strings/dashboard";
import { EmptyState } from "@/components/dashboard/empty-state";
import ui from "@/components/dashboard/ui.module.css";

export const dynamic = "force-dynamic";

/** The change history — most recent publish first (FR-021, FR-023), paginated. */
export default async function ContentHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(0, Math.floor(Number(pageParam ?? 0)) || 0);
  const lang = await readLang();
  const data = await orNull("content-history", listHistory(page));

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <h2 className={ui.cardTitle}>{s.historyTitle[lang]}</h2>
      </div>

      {data === null ? (
        <EmptyState tone="error" title={dashboardStrings.loadErrorTitle[lang]} body={s.loadError[lang]} />
      ) : data.rows.length === 0 ? (
        <EmptyState title={s.historyTitle[lang]} body={s.historyEmpty[lang]} />
      ) : (
        <div className={ui.cardBody}>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {data.rows.map((r) => (
              <li key={r.id} style={{ border: "1px solid var(--line)", borderRadius: "14px", padding: "0.85rem 1rem" }}>
                <div className={ui.sub}>
                  <span className={ui.num}>{formatDateTime(r.published_at, lang)}</span> — <bdi>{r.published_by_email ?? "unknown"}</bdi>
                </div>
                <ul dir="auto" style={{ margin: "0.4rem 0 0.5rem", paddingInlineStart: "1.2rem", fontSize: "0.9rem" }}>
                  {r.change_summary.map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
                <Link href={`/dashboard/content/history/${r.id}`} className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                  See what the content said before this publish
                </Link>
              </li>
            ))}
          </ul>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            {page > 0 && (
              <Link href={`/dashboard/content/history?page=${page - 1}`} className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                ← Newer
              </Link>
            )}
            {data.hasMore && (
              <Link href={`/dashboard/content/history?page=${page + 1}`} className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                Older →
              </Link>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
