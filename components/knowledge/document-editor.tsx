"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/language";
import type { KnowledgeDoc } from "@/lib/content/schema";
import { knowledgeStrings as s } from "@/lib/strings/knowledge";
import { archiveKnowledgeAction, saveKnowledgeAction } from "@/app/dashboard/knowledge/actions";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./knowledge.module.css";

/** Check and correct an imported document, or remove it (feature 010). Saves to the draft. */
export function DocumentEditor({ lang, doc }: { lang: Lang; doc: KnowledgeDoc }) {
  const router = useRouter();
  const [title, setTitle] = useState(doc.title);
  const [text, setText] = useState(doc.text);
  const [status, setStatus] = useState<"idle" | "saved" | "removed" | string>("idle");
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();

  function save(event: React.FormEvent) {
    event.preventDefault();
    start(async () => {
      const result = await saveKnowledgeAction({ id: doc.id, title, text }).catch(() => ({ ok: false as const, reason: "error" }));
      setStatus(result.ok ? "saved" : result.reason);
    });
  }

  function remove() {
    start(async () => {
      const result = await archiveKnowledgeAction(doc.id).catch(() => ({ ok: false as const, reason: "error" }));
      if (result.ok) {
        setStatus("removed");
        router.refresh();
      } else setStatus(result.reason);
    });
  }

  if (status === "removed") return <p className={styles.ok} role="status">{s.removed[lang]}</p>;

  return (
    <form className={styles.form} onSubmit={save}>
      <div className={styles.grid2}>
        <label className={styles.field}>
          {s.titleEn[lang]}
          <input className={styles.input} dir="ltr" value={title.en} onChange={(e) => setTitle({ ...title, en: e.target.value })} />
        </label>
        <label className={styles.field}>
          {s.titleUr[lang]}
          <input className={styles.input} dir="rtl" value={title.ur} onChange={(e) => setTitle({ ...title, ur: e.target.value })} />
        </label>
      </div>
      <label className={styles.field}>
        {s.textLabel[lang]}
        <span className={styles.hint}>{s.textHint[lang]}</span>
        <textarea
          className={`${styles.textarea} ${styles.textareaTall}`}
          dir="auto"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setStatus("idle");
          }}
        />
      </label>
      {status === "saved" && <p className={styles.ok} role="status">{s.documentSaved[lang]}</p>}
      {status !== "idle" && status !== "saved" && (
        <p className={styles.error} role="alert">{(s.errors[status] ?? s.errors.error)[lang]}</p>
      )}
      <div className={styles.row}>
        <button type="submit" className={`${ui.btn} ${ui.btnPrimary}`} disabled={pending}>
          {pending ? s.saving[lang] : s.saveDocument[lang]}
        </button>
        {confirming ? (
          <>
            <button type="button" className={`${ui.btn} ${ui.btnSoft}`} onClick={remove} disabled={pending}>
              {s.confirmRemove[lang]}
            </button>
            <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={() => setConfirming(false)}>
              {s.cancel[lang]}
            </button>
          </>
        ) : (
          <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={() => setConfirming(true)}>
            {s.removeDocument[lang]}
          </button>
        )}
      </div>
    </form>
  );
}
