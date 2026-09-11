"use client";

import { useState } from "react";
import type { ContentDoc } from "@/lib/content/schema";
import type { Problem } from "@/lib/content/validate";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import {
  confirmPublishAction,
  preparePublishAction,
  saveDraftAction,
} from "@/app/dashboard/content/actions";
import { FactsEditor } from "./facts-editor";
import { PoliciesEditor } from "./policies-editor";
import { FaqEditor } from "./faq-editor";
import { EscalationEditor } from "./escalation-editor";
import { PublishDialog } from "./publish-dialog";

const section = {
  border: "1px solid rgba(128,128,128,0.3)",
  borderRadius: "0.6rem",
  padding: "1rem",
  marginBottom: "1rem",
};
const btn = {
  minHeight: "44px",
  padding: "0.5rem 1rem",
  fontSize: "1rem",
  fontWeight: 600,
};

/**
 * The content editor. Holds the working document; Save writes it to the draft
 * (FR-009); Publish is disabled until saved, then goes through the confirm
 * dialog (FR-010, FR-011).
 */
export function ContentEditor({
  initialDoc,
  initialUpdatedAt,
}: {
  initialDoc: ContentDoc;
  initialUpdatedAt: string;
}) {
  const [doc, setDoc] = useState(initialDoc);
  const [savedDoc, setSavedDoc] = useState(initialDoc);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [dialog, setDialog] = useState<{
    changes: string[];
    problems: Problem[];
  } | null>(null);
  const [publishing, setPublishing] = useState(false);

  const dirty = JSON.stringify(doc) !== JSON.stringify(savedDoc);

  async function save() {
    setBusy(true);
    setStatus(null);
    const r = await saveDraftAction(doc, updatedAt);
    setBusy(false);
    if (r.ok) {
      setSavedDoc(doc);
      setUpdatedAt(r.updatedAt);
      setStatus(`${s.draftSaved.en} · ${s.draftSaved.ur}`);
    } else if (r.reason === "conflict") {
      setStatus(`${s.draftConflict.en}\n${s.draftConflict.ur}`);
    } else {
      setStatus(`${s.loadError.en} · ${s.loadError.ur}`);
    }
  }

  async function openPublish() {
    setBusy(true);
    const r = await preparePublishAction();
    setBusy(false);
    if (r.ok) setDialog({ changes: r.changes, problems: r.problems });
    else setStatus(`${s.loadError.en} · ${s.loadError.ur}`);
  }

  async function doPublish() {
    setPublishing(true);
    const r = await confirmPublishAction();
    setPublishing(false);
    if (r.ok) {
      setStatus(
        r.outcome === "published"
          ? `${s.published.en} · ${s.published.ur}`
          : `${s.nothingToPublish.en} · ${s.nothingToPublish.ur}`,
      );
      setDialog(null);
    } else if (r.reason === "blocked" && r.problems) {
      setDialog({ changes: [], problems: r.problems });
    } else {
      setStatus(`${s.loadError.en} · ${s.loadError.ur}`);
      setDialog(null);
    }
  }

  return (
    <div dir="auto" style={{ maxWidth: "48rem", margin: "0 auto" }}>
      <section style={section}>
        <h2>
          {s.factsTitle.en} · {s.factsTitle.ur}
        </h2>
        <FactsEditor
          value={doc.facts}
          onChange={(facts) => setDoc({ ...doc, facts })}
        />
      </section>

      <section style={section}>
        <h2>
          {s.policiesTitle.en} · {s.policiesTitle.ur}
        </h2>
        <PoliciesEditor
          value={doc.policies}
          onChange={(policies) => setDoc({ ...doc, policies })}
        />
      </section>

      <section style={section}>
        <h2>
          {s.faqsTitle.en} · {s.faqsTitle.ur}
        </h2>
        <FaqEditor value={doc.faqs} onChange={(faqs) => setDoc({ ...doc, faqs })} />
      </section>

      <section style={section}>
        <h2>
          {s.escalationTitle.en} · {s.escalationTitle.ur}
        </h2>
        <EscalationEditor
          value={doc.escalationTopics}
          onChange={(escalationTopics) => setDoc({ ...doc, escalationTopics })}
        />
      </section>

      <div
        style={{
          position: "sticky",
          bottom: 0,
          background: "var(--page-background)",
          padding: "0.75rem 0",
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          alignItems: "center",
          borderTop: "1px solid rgba(128,128,128,0.3)",
        }}
      >
        <button type="button" style={btn} disabled={busy || !dirty} onClick={save}>
          {busy ? s.saving.en : `${s.save.en} · ${s.save.ur}`}
        </button>
        <button
          type="button"
          style={btn}
          disabled={busy || dirty}
          onClick={openPublish}
        >
          {s.publish.en} · {s.publish.ur}
        </button>
        {dirty && (
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
            Unsaved changes — save before publishing.
          </span>
        )}
        {status && (
          <span
            role="status"
            style={{ fontSize: "0.9rem", whiteSpace: "pre-line" }}
          >
            {status}
          </span>
        )}
      </div>

      {dialog && (
        <PublishDialog
          changes={dialog.changes}
          problems={dialog.problems}
          busy={publishing}
          onCancel={() => setDialog(null)}
          onConfirm={doPublish}
        />
      )}
    </div>
  );
}
