import { readDraft } from "@/lib/content/queries";
import { orNull } from "@/lib/dashboard/overview";
import { readLang } from "@/lib/language-server";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { dashboardStrings } from "@/lib/strings/dashboard";
import { ContentEditor } from "@/components/content/content-editor";
import { EmptyState } from "@/components/dashboard/empty-state";
import ui from "@/components/dashboard/ui.module.css";

// Always show the current draft — never a cached copy.
export const dynamic = "force-dynamic";

/**
 * The content editor screen. Loads the draft; on a load failure it shows an
 * error card rather than a blank screen (FR-028).
 */
export default async function ContentPage() {
  const lang = await readLang();
  const draft = await orNull("content-draft", readDraft());

  if (!draft) {
    return (
      <section className={ui.card}>
        <EmptyState tone="error" title={dashboardStrings.loadErrorTitle[lang]} body={s.loadError[lang]} />
      </section>
    );
  }

  return <ContentEditor initialDoc={draft.doc} initialUpdatedAt={draft.updatedAt} lang={lang} />;
}
