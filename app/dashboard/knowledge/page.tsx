import Link from "next/link";
import { listUnansweredQuestions } from "@/lib/unanswered/list";
import { readDraft } from "@/lib/content/queries";
import { orNull } from "@/lib/dashboard/overview";
import { formatDate } from "@/lib/dashboard/format";
import { readLang } from "@/lib/language-server";
import { knowledgeStrings as s } from "@/lib/strings/knowledge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { LanguageTag } from "@/components/dashboard/status-tag";
import { ImportForms } from "@/components/knowledge/import-forms";
import ui from "@/components/dashboard/ui.module.css";
import styles from "@/components/knowledge/knowledge.module.css";
import people from "@/components/leads/lead-details.module.css";

export const dynamic = "force-dynamic";

/**
 * Knowledge (feature 010, FR-012–FR-016): the old Gap list plus imported
 * documents. Every question and every document opens its own page.
 */
export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  const lang = await readLang();
  const showAnswered = (await searchParams).show === "answered";
  const [questions, draft] = await Promise.all([
    orNull("knowledge-questions", listUnansweredQuestions({ onlyOpen: false })),
    orNull("knowledge-draft", readDraft()),
  ]);

  const openCount = questions?.filter((q) => q.answered_at === null).length ?? 0;
  const answeredCount = (questions?.length ?? 0) - openCount;
  const shown = (questions ?? []).filter((q) => (showAnswered ? q.answered_at !== null : q.answered_at === null));
  const documents = (draft?.doc.knowledge ?? []).filter((k) => k.archivedAt === null).reverse();

  return (
    <div className={ui.stack}>
      <p className={styles.note}>
        {s.draftNote[lang]} <Link href="/dashboard/content">{s.openContent[lang]} →</Link>
      </p>

      <section className={ui.card}>
        <div className={ui.cardHead}>
          <div>
            <h2 className={ui.cardTitle}>{s.questionsTitle[lang]}</h2>
            <div className={ui.sub}>{s.questionsSub[lang]}</div>
          </div>
          <div className={`${people.chips} ${styles.tabs}`} role="group">
            <Link href="/dashboard/knowledge" className={people.chip} aria-pressed={!showAnswered} style={{ textDecoration: "none" }}>
              {s.showOpen[lang]} <span className={people.chipCount}>{openCount}</span>
            </Link>
            <Link href="/dashboard/knowledge?show=answered" className={people.chip} aria-pressed={showAnswered} style={{ textDecoration: "none" }}>
              {s.showAnswered[lang]} <span className={people.chipCount}>{answeredCount}</span>
            </Link>
          </div>
        </div>
        {questions === null ? (
          <EmptyState tone="error" title={s.errorTitle[lang]} body={s.errorBody[lang]} />
        ) : shown.length === 0 ? (
          <EmptyState title={showAnswered ? s.answeredEmpty[lang] : s.questionsEmpty[lang]} />
        ) : (
          <div className={ui.tscroll}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th scope="col">{s.questionHeading[lang]}</th>
                  <th scope="col">{s.timesAsked[lang]}</th>
                  <th scope="col">{s.source[lang]}</th>
                  <th scope="col">{showAnswered ? s.answeredOn[lang] : s.lastAsked[lang]}</th>
                  <th scope="col"><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{s.open[lang]}</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((q) => (
                  <tr key={q.id}>
                    <td style={{ minWidth: 220 }}>
                      <Link href={`/dashboard/knowledge/${q.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        {/* <bdi> keeps Urdu reading right-to-left without pushing it to the far edge. */}
                        <b><bdi>{q.question_text}</bdi></b>
                      </Link>
                    </td>
                    <td className={ui.num}><b>{q.times_asked}</b> {s.times[lang]}</td>
                    <td><LanguageTag language={q.language} lang={lang} /></td>
                    <td className={ui.num} style={{ whiteSpace: "nowrap" }}>
                      {formatDate(showAnswered && q.answered_at ? q.answered_at : q.updated_at, lang)}
                    </td>
                    <td>
                      <Link href={`/dashboard/knowledge/${q.id}`} className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                        {s.open[lang]} <span aria-hidden="true">{lang === "ur" ? "←" : "→"}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ImportForms lang={lang} />

      <section className={ui.card}>
        <div className={ui.cardHead}>
          <div>
            <h2 className={ui.cardTitle}>{s.docsTitle[lang]}</h2>
            <div className={ui.sub}>{s.docsSub[lang]}</div>
          </div>
        </div>
        {draft === null ? (
          <EmptyState tone="error" title={s.errorTitle[lang]} body={s.errorBody[lang]} />
        ) : documents.length === 0 ? (
          <EmptyState title={s.docsEmpty[lang]} />
        ) : (
          <div className={ui.tscroll}>
            <table className={ui.table}>
              <thead>
                <tr>
                  <th scope="col">{s.docsTitle[lang]}</th>
                  <th scope="col">{s.source[lang]}</th>
                  <th scope="col">{s.imported[lang]}</th>
                  <th scope="col"><span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>{s.open[lang]}</span></th>
                </tr>
              </thead>
              <tbody>
                {documents.map((k) => (
                  <tr key={k.id}>
                    <td style={{ minWidth: 200 }}>
                      <Link href={`/dashboard/knowledge/${k.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                        <b><bdi>{(lang === "ur" ? k.title.ur || k.title.en : k.title.en || k.title.ur) || k.source.name}</bdi></b>
                      </Link>
                      <div className={ui.muted} style={{ fontSize: "0.8rem" }}>
                        {k.text.length.toLocaleString("en-US")} {s.characters[lang]}
                      </div>
                    </td>
                    <td>
                      <span className={`${ui.tag} ${k.source.kind === "pdf" ? ui.tagUr : ui.tagEn}`}>
                        {k.source.kind === "pdf" ? s.pdf[lang] : s.website[lang]}
                      </span>{" "}
                      <bdi dir="ltr" className={ui.muted} style={{ fontSize: "0.8rem", overflowWrap: "anywhere" }}>{k.source.name}</bdi>
                    </td>
                    <td className={ui.num} style={{ whiteSpace: "nowrap" }}>{formatDate(k.importedAt, lang)}</td>
                    <td>
                      <Link href={`/dashboard/knowledge/${k.id}`} className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                        {s.open[lang]} <span aria-hidden="true">{lang === "ur" ? "←" : "→"}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
