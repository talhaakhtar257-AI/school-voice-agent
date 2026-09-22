"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/language";
import { knowledgeStrings as s } from "@/lib/strings/knowledge";
import { importPdfAction, importWebsiteAction } from "@/app/dashboard/knowledge/actions";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./knowledge.module.css";

type Status = { kind: "idle" } | { kind: "ok" } | { kind: "error"; reason: string };

/** "Add from PDF" and "Add from website" (FR-015, FR-016). Both land in the draft. */
export function ImportForms({ lang }: { lang: Lang }) {
  return (
    <div className={styles.imports}>
      <PdfImport lang={lang} />
      <WebsiteImport lang={lang} />
    </div>
  );
}

function Message({ status, lang }: { status: Status; lang: Lang }) {
  if (status.kind === "ok") return <p className={styles.ok} role="status">{s.imported_ok[lang]}</p>;
  if (status.kind === "error") {
    return <p className={styles.error} role="alert">{(s.errors[status.reason] ?? s.errors.error)[lang]}</p>;
  }
  return null;
}

function PdfImport({ lang }: { lang: Lang }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const file = input.current?.files?.[0];
    if (!file) return setStatus({ kind: "error", reason: "no-file" });
    if (file.size > 4 * 1024 * 1024) return setStatus({ kind: "error", reason: "too-big" });
    const data = new FormData();
    data.set("file", file);
    start(async () => {
      const result = await importPdfAction(data).catch(() => ({ ok: false as const, reason: "error" }));
      if (result.ok) {
        setStatus({ kind: "ok" });
        if (input.current) input.current.value = "";
        router.push(`/dashboard/knowledge/${result.value}`);
      } else setStatus({ kind: "error", reason: result.reason });
    });
  }

  return (
    <form className={`${ui.card} ${ui.cardBody} ${styles.importBox}`} onSubmit={submit}>
      <h3>{s.addPdf[lang]}</h3>
      <p className={styles.hint}>{s.addPdfHint[lang]}</p>
      <div className={styles.row}>
        <input ref={input} className={styles.input} type="file" accept="application/pdf,.pdf" aria-label={s.choosePdf[lang]} onChange={() => setStatus({ kind: "idle" })} />
        <button type="submit" className={`${ui.btn} ${ui.btnPrimary}`} disabled={pending}>
          {pending ? s.importing[lang] : s.importButton[lang]}
        </button>
      </div>
      <Message status={status} lang={lang} />
    </form>
  );
}

function WebsiteImport({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [pending, start] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!url.trim()) return setStatus({ kind: "error", reason: "invalid-url" });
    start(async () => {
      const withScheme = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
      const result = await importWebsiteAction(withScheme).catch(() => ({ ok: false as const, reason: "error" }));
      if (result.ok) {
        setStatus({ kind: "ok" });
        setUrl("");
        router.push(`/dashboard/knowledge/${result.value}`);
      } else setStatus({ kind: "error", reason: result.reason });
    });
  }

  return (
    <form className={`${ui.card} ${ui.cardBody} ${styles.importBox}`} onSubmit={submit}>
      <h3>{s.addWebsite[lang]}</h3>
      <p className={styles.hint}>{s.addWebsiteHint[lang]}</p>
      <div className={styles.row}>
        <input
          className={styles.input}
          type="url"
          dir="ltr"
          inputMode="url"
          placeholder={s.websitePlaceholder[lang]}
          aria-label={s.addWebsite[lang]}
          value={url}
          onChange={(event) => {
            setUrl(event.target.value);
            setStatus({ kind: "idle" });
          }}
        />
        <button type="submit" className={`${ui.btn} ${ui.btnPrimary}`} disabled={pending}>
          {pending ? s.importing[lang] : s.importButton[lang]}
        </button>
      </div>
      <Message status={status} lang={lang} />
    </form>
  );
}
