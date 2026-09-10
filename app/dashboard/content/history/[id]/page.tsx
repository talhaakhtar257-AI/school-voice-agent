import Link from "next/link";
import { getHistoryRecord } from "@/lib/content/queries";
import { parseDoc } from "@/lib/content/schema";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { DocView } from "@/components/content/doc-view";

export const dynamic = "force-dynamic";

/**
 * One history record — the content as it was BEFORE this publish, shown in full
 * so a value can be read and typed back into the editor (FR-024, SC-005). There
 * is no edit or delete control here (FR-022).
 */
export default async function HistoryRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let record: Awaited<ReturnType<typeof getHistoryRecord>>;
  try {
    record = await getHistoryRecord(id);
  } catch {
    return (
      <p dir="auto" role="alert" style={{ color: "var(--failure-border)" }}>
        {s.loadError.en}
        <br />
        {s.loadError.ur}
      </p>
    );
  }

  if (!record) {
    return (
      <p dir="auto">
        Not found.{" "}
        <Link href="/dashboard/content/history">Back to the history</Link>
      </p>
    );
  }

  const before = parseDoc(record.doc_before);

  return (
    <div dir="auto" style={{ maxWidth: "44rem", margin: "0 auto" }}>
      <Link href="/dashboard/content/history">← {s.historyTitle.en}</Link>
      <h2>Content before this publish</h2>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
        Published {new Date(record.published_at).toLocaleString()} by{" "}
        {record.published_by_email ?? "unknown"}. To bring any of this back, retype
        the values into the editor and publish again.
      </p>
      <div style={{ margin: "0.75rem 0" }}>
        <strong style={{ fontSize: "0.9rem" }}>What changed in this publish:</strong>
        <ul style={{ margin: "0.3rem 0 0", paddingInlineStart: "1.2rem", fontSize: "0.9rem" }}>
          {record.change_summary.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ul>
      </div>
      <DocView doc={before} />
    </div>
  );
}
