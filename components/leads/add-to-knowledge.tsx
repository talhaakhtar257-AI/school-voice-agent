"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Lang } from "@/lib/language";
import { knowledgeStrings as k } from "@/lib/strings/knowledge";
import { leadDetailStrings as s } from "@/lib/strings/lead-details";
import { addCallToKnowledgeAction } from "@/app/dashboard/knowledge/actions";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./lead-details.module.css";

/**
 * "Add to Knowledge" on a lead's page (tester round 3). Creates a draft
 * Knowledge document from the call and opens it for editing.
 */
export function AddToKnowledge({ leadId, lang }: { leadId: string; lang: Lang }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function add() {
    setError(null);
    start(async () => {
      const result = await addCallToKnowledgeAction(leadId).catch(() => ({ ok: false as const, reason: "error" }));
      if (result.ok) router.push(`/dashboard/knowledge/${result.value}`);
      else setError(result.reason);
    });
  }

  return (
    <div className={styles.addKnowledge}>
      <button type="button" className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`} onClick={add} disabled={pending} title={s.addToKnowledgeHint[lang]}>
        {pending ? s.addingToKnowledge[lang] : `+ ${s.addToKnowledge[lang]}`}
      </button>
      <p className={styles.addKnowledgeHint}>{s.addToKnowledgeHint[lang]}</p>
      {error && (
        <p className={styles.addKnowledgeError} role="alert">
          {(k.errors[error] ?? k.errors.error)[lang]}
        </p>
      )}
    </div>
  );
}
