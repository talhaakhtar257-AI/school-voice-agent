import { readLang } from "@/lib/language-server";
import { ContentTabs } from "@/components/dashboard/content-tabs";

/** Tabs shared by the content editor, the test tool, and the history. */
export default async function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await readLang();
  return (
    <div>
      <ContentTabs lang={lang} />
      {children}
    </div>
  );
}
