import Link from "next/link";
import { listHistory } from "@/lib/content/queries";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";

export const dynamic = "force-dynamic";

/** The change history — most recent publish first (FR-021, FR-023), paginated. */
export default async function ContentHistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(0, Math.floor(Number(pageParam ?? 0)) || 0);

  let data: Awaited<ReturnType<typeof listHistory>>;
  try {
    data = await listHistory(page);
  } catch {
    return (
      <p dir="auto" role="alert" style={{ color: "var(--failure-border)" }}>
        {s.loadError.en}
        <br />
        {s.loadError.ur}
      </p>
    );
  }

  return (
    <div dir="auto" style={{ maxWidth: "44rem", margin: "0 auto" }}>
      <h2>
        {s.historyTitle.en} · {s.historyTitle.ur}
      </h2>

      {data.rows.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>
          {s.historyEmpty.en}
          <br />
          {s.historyEmpty.ur}
        </p>
      ) : (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
          }}
        >
          {data.rows.map((r) => (
            <li
              key={r.id}
              style={{
                border: "1px solid rgba(128,128,128,0.3)",
                borderRadius: "0.5rem",
                padding: "0.75rem",
              }}
            >
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {new Date(r.published_at).toLocaleString()} —{" "}
                {r.published_by_email ?? "unknown"}
              </div>
              <ul
                style={{
                  margin: "0.4rem 0 0.5rem",
                  paddingInlineStart: "1.2rem",
                  fontSize: "0.9rem",
                }}
              >
                {r.change_summary.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
              <Link
                href={`/dashboard/content/history/${r.id}`}
                style={{ fontSize: "0.85rem" }}
              >
                See what the content said before this publish
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem" }}>
        {page > 0 && (
          <Link href={`/dashboard/content/history?page=${page - 1}`}>← Newer</Link>
        )}
        {data.hasMore && (
          <Link href={`/dashboard/content/history?page=${page + 1}`}>Older →</Link>
        )}
      </div>
    </div>
  );
}
