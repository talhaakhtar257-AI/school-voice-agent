"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/language";
import { knowledgeStrings as s } from "@/lib/strings/knowledge";
import { answerQuestionAction } from "@/app/dashboard/knowledge/actions";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./knowledge.module.css";

/**
 * Write the answer to a parent's question (FR-014). The question arrives in the
 * language the parent asked it, and is pre-filled in the matching box.
 */
export function AnswerForm({
  lang,
  questionId,
  questionText,
  questionLanguage,
}: {
  lang: Lang;
  questionId: string;
  questionText: string;
  questionLanguage: "ur" | "en" | null;
}) {
  const router = useRouter();
  const isUrdu = questionLanguage === "ur" || /[؀-ۿ]/.test(questionText);
  const [question, setQuestion] = useState({ en: isUrdu ? "" : questionText, ur: isUrdu ? questionText : "" });
  const [answer, setAnswer] = useState({ en: "", ur: "" });
  const [status, setStatus] = useState<"idle" | "ok" | string>("idle");
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await answerQuestionAction({ questionId, question, answer }).catch(() => ({ ok: false as const, reason: "error" }));
      if (result.ok) {
        setStatus("ok");
        router.refresh();
      } else setStatus(result.reason);
    });
  }

  if (status === "ok") return <p className={styles.ok} role="status">{s.answerSaved[lang]}</p>;

  const box = (label: string, value: string, onChange: (v: string) => void, dir: "ltr" | "rtl", tall = false) => (
    <label className={styles.field}>
      {label}
      <textarea
        className={`${styles.textarea}`}
        style={tall ? undefined : { minHeight: 60 }}
        dir={dir}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );

  return (
    <form className={styles.form} onSubmit={submit}>
      <p className={styles.hint}>{s.writeAnswerHint[lang]}</p>
      <div className={styles.grid2}>
        {box(s.questionEn[lang], question.en, (v) => setQuestion({ ...question, en: v }), "ltr")}
        {box(s.questionUr[lang], question.ur, (v) => setQuestion({ ...question, ur: v }), "rtl")}
        {box(s.answerEn[lang], answer.en, (v) => setAnswer({ ...answer, en: v }), "ltr", true)}
        {box(s.answerUr[lang], answer.ur, (v) => setAnswer({ ...answer, ur: v }), "rtl", true)}
      </div>
      {status !== "idle" && (
        <p className={styles.error} role="alert">{(s.errors[status] ?? s.errors.error)[lang]}</p>
      )}
      <div>
        <button type="submit" className={`${ui.btn} ${ui.btnPrimary}`} disabled={pending}>
          {pending ? s.saving[lang] : s.saveAnswer[lang]}
        </button>
      </div>
    </form>
  );
}
