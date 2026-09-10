import { readDraft } from "@/lib/content/queries";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { ContentEditor } from "@/components/content/content-editor";

// Always show the current draft — never a cached copy.
export const dynamic = "force-dynamic";

/**
 * The content editor screen. Loads the draft; on a load failure it shows a
 * bilingual error rather than a blank screen (FR-028).
 */
export default async function ContentPage() {
  let draft: Awaited<ReturnType<typeof readDraft>>;
  try {
    draft = await readDraft();
  } catch {
    return (
      <p
        dir="auto"
        role="alert"
        style={{ color: "var(--failure-border)", maxWidth: "40rem", margin: "0 auto" }}
      >
        {s.loadError.en}
        <br />
        {s.loadError.ur}
      </p>
    );
  }

  return (
    <ContentEditor
      initialDoc={draft.doc}
      initialUpdatedAt={draft.updatedAt}
    />
  );
}
