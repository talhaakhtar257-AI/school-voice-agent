import { readDraft } from "@/lib/content/queries";
import { contentAdminStrings as s } from "@/lib/strings/content-admin";
import { TestTool } from "@/components/content/test-tool";

export const dynamic = "force-dynamic";

/** Try a question against the draft content (FR-017). */
export default async function ContentTestPage() {
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

  return <TestTool draft={draft.doc} />;
}
