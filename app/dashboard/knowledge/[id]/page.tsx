import Link from "next/link";
import { getUnansweredQuestion } from "@/lib/unanswered/list";
import { readDraft } from "@/lib/content/queries";
import { orNull } from "@/lib/dashboard/overview";
import { formatDate, formatDateTime } from "@/lib/dashboard/format";
import { readLang } from "@/lib/language-server";
import { knowledgeStrings as s } from "@/lib/strings/knowledge";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AnswerForm } from "@/components/knowledge/answer-form";
import { DocumentEditor } from "@/components/knowledge/document-editor";
import ui from "@/components/dashboard/ui.module.css";
import styles from "@/components/knowledge/knowledge.module.css";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * One Knowledge entry (FR-013): either a question parents asked (answer it) or
 * an imported document (check and correct it). Both ids are UUIDs, so the
 * question table is tried first, then the draft's documents.
 */
export default async function KnowledgeEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lang = await readLang();
  const backLink = (
    <Link href="/dashboard/knowledge" className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
      ← {s.allKnowledge[lang]}
    </Link>
  );

  const [question, draft] = await Promise.all([
    UUID.test(id) ? orNull("knowledge-question", getUnansweredQuestion(id)) : Promise.resolve(null),
    orNull("knowledge-draft", readDraft()),
  ]);
  const doc = draft?.doc.knowledge.find((k) => k.id === id) ?? null;

  if (question) {
    return (
      <div className={ui.stack}>
        <div>{backLink}</div>
        <section className={ui.card}>
          <div className={ui.cardBody}>
            <div className={ui.sub}>{s.questionHeading[lang]}</div>
            <p className={styles.quote} dir="auto">“{question.question_text}”</p>
            <div className={styles.meta}>
              {s.askedTimes[lang]} <b className={ui.num}>{question.times_asked}</b> {s.times[lang]} · {s.lastAsked[lang]}{" "}
              {formatDateTime(question.updated_at, lang)}
            </div>
          </div>
        </section>
        <section className={ui.card}>
          <div className={ui.cardHead}>
            <h2 className={ui.cardTitle}>{s.writeAnswer[lang]}</h2>
          </div>
          <div className={ui.cardBody}>
            {question.answered_at ? (
              <p className={styles.ok}>{s.alreadyAnswered[lang]} ({formatDate(question.answered_at, lang)})</p>
            ) : (
              <AnswerForm
                lang={lang}
                questionId={question.id}
                questionText={question.question_text}
                questionLanguage={question.language}
              />
            )}
          </div>
        </section>
      </div>
    );
  }

  if (doc) {
    return (
      <div className={ui.stack}>
        <div>{backLink}</div>
        <section className={ui.card}>
          <div className={ui.cardHead}>
            <div>
              <h2 className={ui.cardTitle}>{s.documentHeading[lang]}</h2>
              <div className={ui.sub}>
                {doc.source.kind === "pdf" ? s.pdf[lang] : s.website[lang]} · <bdi dir="ltr">{doc.source.name}</bdi> ·{" "}
                {s.imported[lang]} {formatDate(doc.importedAt, lang)}
              </div>
            </div>
          </div>
          <div className={ui.cardBody}>
            {doc.archivedAt ? <p className={styles.note}>{s.removedDoc[lang]}</p> : <DocumentEditor lang={lang} doc={doc} />}
          </div>
        </section>
        <p className={styles.note}>
          {s.draftNote[lang]} <Link href="/dashboard/content">{s.openContent[lang]} →</Link>
        </p>
      </div>
    );
  }

  const failed = draft === null;
  return (
    <div className={ui.stack}>
      <div>{backLink}</div>
      <section className={ui.card}>
        <EmptyState
          tone={failed ? "error" : "empty"}
          title={failed ? s.errorTitle[lang] : s.notFoundTitle[lang]}
          body={failed ? s.errorBody[lang] : s.notFoundBody[lang]}
        />
      </section>
    </div>
  );
}
