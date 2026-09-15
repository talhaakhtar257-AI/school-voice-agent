import Link from "next/link";
import { getHistoryRecord } from "@/lib/content/queries";
import { parseDoc } from "@/lib/content/schema";
import { orNull } from "@/lib/dashboard/overview";
import { formatDateTime } from "@/lib/dashboard/format";
import { readLang } from "@/lib/language-server";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { dashboardStrings } from "@/lib/strings/dashboard";
import { DocView } from "@/components/content/doc-view";
import { EmptyState } from "@/components/dashboard/empty-state";
import ui from "@/components/dashboard/ui.module.css";

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
  const lang = await readLang();
  // null = the read failed; "missing" = the read worked but no such record exists.
  const record = await orNull(
    "content-history-record",
    getHistoryRecord(id).then((row) => row ?? ("missing" as const)),
  );
  const backLink = (
    <Link href="/dashboard/content/history" className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
      ← {s.historyTitle[lang]}
    </Link>
  );

  if (record === null || record === "missing") {
    const failed = record === null;
    return (
      <section className={ui.card}>
        <EmptyState
          tone={failed ? "error" : "empty"}
          title={failed ? dashboardStrings.loadErrorTitle[lang] : "Not found"}
          body={failed ? s.loadError[lang] : undefined}
        >
          <div style={{ marginTop: "1rem" }}>{backLink}</div>
        </EmptyState>
      </section>
    );
  }

  const before = parseDoc(record.doc_before);

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <h2 className={ui.cardTitle}>Content before this publish</h2>
        <span className={ui.headAction}>{backLink}</span>
      </div>
      <div className={ui.cardBody} dir="auto">
        <p className={ui.sub} style={{ marginTop: 0 }}>
          Published <span className={ui.num}>{formatDateTime(record.published_at, lang)}</span> by{" "}
          <bdi>{record.published_by_email ?? "unknown"}</bdi>. To bring any of this back, retype the values into
          the editor and publish again.
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
    </section>
  );
}
