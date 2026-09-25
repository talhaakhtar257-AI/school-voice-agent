"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/language";
import type { DownloadItem } from "@/lib/content/schema";
import { downloadStrings as s } from "@/lib/strings/downloads";
import { knowledgeStrings as k } from "@/lib/strings/knowledge";
import { archiveDownloadAction, uploadDownloadAction } from "@/app/dashboard/knowledge/download-actions";
import { EmptyState } from "@/components/dashboard/empty-state";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./knowledge.module.css";

/** Upload and remove the PDFs parents can download (feature 011). */
export function DownloadsPanel({ lang, downloads }: { lang: Lang; downloads: DownloadItem[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [titleEn, setTitleEn] = useState("");
  const [titleUr, setTitleUr] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | string>("idle");
  const [pending, start] = useTransition();

  function upload(event: React.FormEvent) {
    event.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!file) return setStatus("no-file");
    if (file.size > 4 * 1024 * 1024) return setStatus("too-big");
    const data = new FormData();
    data.set("file", file);
    data.set("titleEn", titleEn);
    data.set("titleUr", titleUr);
    start(async () => {
      const result = await uploadDownloadAction(data).catch(() => ({ ok: false as const, reason: "error" }));
      if (result.ok) {
        setStatus("ok");
        setTitleEn("");
        setTitleUr("");
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
      } else setStatus(result.reason);
    });
  }

  function remove(id: string) {
    start(async () => {
      const result = await archiveDownloadAction(id).catch(() => ({ ok: false as const, reason: "error" }));
      if (result.ok) router.refresh();
      else setStatus(result.reason);
    });
  }

  const active = downloads.filter((d) => d.archivedAt === null);

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <div>
          <h2 className={ui.cardTitle}>{s.title[lang]}</h2>
          <div className={ui.sub}>{s.sub[lang]}</div>
        </div>
      </div>
      <form className={`${ui.cardBody} ${styles.form}`} onSubmit={upload}>
        <div className={styles.grid2}>
          <label className={styles.field}>
            {s.titleEn[lang]}
            <input id="dl-title-en" className={styles.input} dir="ltr" value={titleEn} placeholder={s.titleEnPlaceholder[lang]} onChange={(e) => setTitleEn(e.target.value)} />
          </label>
          <label className={styles.field}>
            {s.titleUr[lang]}
            <input id="dl-title-ur" className={styles.input} dir="rtl" value={titleUr} placeholder={s.titleUrPlaceholder[lang]} onChange={(e) => setTitleUr(e.target.value)} />
          </label>
        </div>
        <div className={styles.row}>
          <input id="dl-file" ref={fileRef} className={styles.input} type="file" accept="application/pdf,.pdf" aria-label={s.choose[lang]} onChange={() => setStatus("idle")} />
          <button type="submit" className={`${ui.btn} ${ui.btnPrimary}`} disabled={pending}>
            {pending ? s.uploading[lang] : s.upload[lang]}
          </button>
        </div>
        <p className={styles.hint}>{s.choose[lang]}</p>
        {status === "ok" && <p className={styles.ok} role="status">{s.uploaded[lang]}</p>}
        {status !== "idle" && status !== "ok" && (
          <p className={styles.error} role="alert">{(k.errors[status] ?? k.errors.error)[lang]}</p>
        )}
      </form>
      {active.length === 0 ? (
        <EmptyState title={s.empty[lang]} />
      ) : (
        <div className={ui.tscroll}>
          <table className={ui.table}>
            <tbody>
              {active.map((d) => (
                <tr key={d.id}>
                  <td style={{ minWidth: 180 }}>
                    <b><bdi>{(lang === "ur" ? d.title.ur || d.title.en : d.title.en || d.title.ur) || d.fileName}</bdi></b>
                    <div className={ui.muted} style={{ fontSize: "0.8rem" }}>
                      <bdi dir="ltr">{d.fileName}</bdi> · {(d.sizeBytes / 1024).toFixed(0)} KB
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <a href={d.url} target="_blank" rel="noopener" className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`}>
                      {s.open[lang]}
                    </a>{" "}
                    <button type="button" className={`${ui.btn} ${ui.btnSoft} ${ui.btnSmall}`} onClick={() => remove(d.id)} disabled={pending}>
                      {s.remove[lang]}
                    </button>
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
