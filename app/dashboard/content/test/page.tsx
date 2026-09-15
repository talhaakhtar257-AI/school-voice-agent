import { readDraft } from "@/lib/content/queries";
import { orNull } from "@/lib/dashboard/overview";
import { readLang } from "@/lib/language-server";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { dashboardStrings } from "@/lib/strings/dashboard";
import { TestTool } from "@/components/content/test-tool";
import { EmptyState } from "@/components/dashboard/empty-state";
import ui from "@/components/dashboard/ui.module.css";

export const dynamic = "force-dynamic";

/** Try a question against the draft content (FR-017). */
export default async function ContentTestPage() {
  const lang = await readLang();
  const draft = await orNull("content-draft", readDraft());

  return (
    <section className={ui.card}>
      <div className={ui.cardHead}>
        <h2 className={ui.cardTitle}>{s.testHeading[lang]}</h2>
      </div>
      {draft ? (
        <div className={ui.cardBody}>
          <TestTool draft={draft.doc} />
        </div>
      ) : (
        <EmptyState tone="error" title={dashboardStrings.loadErrorTitle[lang]} body={s.loadError[lang]} />
      )}
    </section>
  );
}
