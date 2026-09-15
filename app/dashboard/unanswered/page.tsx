import Link from "next/link";
import { listUnansweredQuestions } from "@/lib/unanswered/list";
import { orNull } from "@/lib/dashboard/overview";
import { formatDate } from "@/lib/dashboard/format";
import { readLang } from "@/lib/language-server";
import { unansweredAdminStrings as s } from "@/lib/strings/unanswered-admin";
import { dashboardStrings } from "@/lib/strings/dashboard";
import { screenStrings as d } from "@/lib/strings/dashboard-screens";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LanguageTag } from "@/components/dashboard/status-tag";
import ui from "@/components/dashboard/ui.module.css";

export const dynamic = "force-dynamic";

/**
 * The gap list: every question the agent could not answer, most asked first
 * (006 FR-007, 004 FR-019). Each row links to the FAQ section of the content
 * editor, where the missing answer is added and published (004 FR-020).
 */
export default async function GapListPage() {
  const lang = await readLang();
  const rows = await orNull("gaps", listUnansweredQuestions());

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <div>
          <h2 className={ui.cardTitle}>{dashboardStrings.navGaps[lang]}</h2>
          <div className={ui.sub}>{d.gapsSub[lang]}</div>
        </div>
      </div>

      {rows === null ? (
        <EmptyState tone="error" title={s.errorTitle[lang]} body={s.errorBody[lang]} />
      ) : rows.length === 0 ? (
        <EmptyState title={s.emptyTitle[lang]} body={s.emptyBody[lang]} />
      ) : (
        <div className={ui.tscroll}>
          <table className={ui.table}>
            <thead>
              <tr>
                <th scope="col">{s.question[lang]}</th>
                <th scope="col">{s.timesAsked[lang]}</th>
                <th scope="col">{s.language[lang]}</th>
                <th scope="col">{s.lastAsked[lang]}</th>
                <th scope="col">
                  <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
                    {d.addAnswer[lang]}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td dir="auto"><b>{row.question_text}</b></td>
                  <td className={ui.num}><b>{row.times_asked}</b></td>
                  <td><LanguageTag language={row.language} lang={lang} /></td>
                  <td className={ui.num} style={{ whiteSpace: "nowrap" }}>{formatDate(row.updated_at, lang)}</td>
                  <td>
                    <Link href="/dashboard/content#faqs" className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                      {d.addAnswer[lang]}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
