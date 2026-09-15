"use client";

import { useState } from "react";
import type { ContentDoc } from "@/lib/content/schema";
import type { Problem } from "@/lib/content/validate";
import type { Lang } from "@/lib/language";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { dashboardStrings } from "@/lib/strings/dashboard";
import {
  confirmPublishAction,
  preparePublishAction,
  saveDraftAction,
} from "@/app/dashboard/content/actions";
import ui from "@/components/dashboard/ui.module.css";
import panels from "@/components/dashboard/panels.module.css";
import { FactsEditor } from "./facts-editor";
import { ProfileEditor } from "./profile-editor";
import { ProgramsEditor } from "./programs-editor";
import { PoliciesEditor } from "./policies-editor";
import { FaqEditor } from "./faq-editor";
import { EscalationEditor } from "./escalation-editor";
import { PublishDialog } from "./publish-dialog";

/**
 * The content editor. Holds the working document; Save writes it to the draft
 * (FR-009); Publish is disabled until saved, then goes through the confirm
 * dialog (FR-010, FR-011). Each section has an id so other screens can link
 * straight to it — the gap list links to #faqs.
 */
export function ContentEditor({
  initialDoc,
  initialUpdatedAt,
  lang,
}: {
  initialDoc: ContentDoc;
  initialUpdatedAt: string;
  lang: Lang;
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
      setStatus(s.draftSaved[lang]);
    } else if (r.reason === "conflict") {
      setStatus(s.draftConflict[lang]);
    } else {
      setStatus(s.loadError[lang]);
    }
  }

  async function openPublish() {
    setBusy(true);
    const r = await preparePublishAction();
    setBusy(false);
    if (r.ok) setDialog({ changes: r.changes, problems: r.problems });
    else setStatus(s.loadError[lang]);
  }

  async function doPublish() {
    setPublishing(true);
    const r = await confirmPublishAction();
    setPublishing(false);
    if (r.ok) {
      setStatus(r.outcome === "published" ? s.published[lang] : s.nothingToPublish[lang]);
      setDialog(null);
    } else if (r.reason === "blocked" && r.problems) {
      setDialog({ changes: [], problems: r.problems });
    } else {
      setStatus(s.loadError[lang]);
      setDialog(null);
    }
  }

  const sections = [
    {
      id: "profile",
      title: s.profileTitle,
      body: (
        <ProfileEditor
          profile={doc.profile}
          stats={doc.facts.stats}
          onProfileChange={(profile) => setDoc({ ...doc, profile })}
          onStatsChange={(stats) => setDoc({ ...doc, facts: { ...doc.facts, stats } })}
        />
      ),
    },
    {
      id: "facts",
      title: s.factsTitle,
      body: <FactsEditor value={doc.facts} onChange={(facts) => setDoc({ ...doc, facts })} lang={lang} />,
    },
    {
      id: "programs",
      title: s.programsTitle,
      body: (
        <ProgramsEditor
          value={doc.programs}
          classes={doc.facts.classes}
          onChange={(programs) => setDoc({ ...doc, programs })}
          lang={lang}
        />
      ),
    },
    { id: "policies", title: s.policiesTitle, body: <PoliciesEditor value={doc.policies} onChange={(policies) => setDoc({ ...doc, policies })} /> },
    { id: "faqs", title: s.faqsTitle, body: <FaqEditor value={doc.faqs} onChange={(faqs) => setDoc({ ...doc, faqs })} lang={lang} /> },
    {
      id: "escalation",
      title: s.escalationTitle,
      body: (
        <EscalationEditor
          value={doc.escalationTopics}
          onChange={(escalationTopics) => setDoc({ ...doc, escalationTopics })}
          lang={lang}
        />
      ),
    },
  ];

  return (
    <div className={ui.stack}>
      {sections.map((section) => (
        <section key={section.id} id={section.id} className={`${ui.card} ${panels.editorSection}`}>
          <div className={ui.cardHead}>
            <h2 className={ui.cardTitle}>{section.title[lang]}</h2>
          </div>
          {/* Field labels inside stay English · Urdu: these fields hold both languages. */}
          <div className={ui.cardBody} dir="auto">
            {section.body}
          </div>
        </section>
      ))}

      <div className={panels.actionBar}>
        <button type="button" className={`${ui.btn} ${ui.btnGhost}`} disabled={busy || !dirty} onClick={save}>
          {busy ? s.saving[lang] : s.save[lang]}
        </button>
        <button type="button" className={`${ui.btn} ${ui.btnPrimary}`} disabled={busy || dirty} onClick={openPublish}>
          {s.publish[lang]}
        </button>
        {dirty && <span className={ui.muted}>{dashboardStrings.unsavedHint[lang]}</span>}
        {status && (
          <span role="status" className={panels.statusText}>
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
          lang={lang}
        />
      )}
    </div>
  );
}
