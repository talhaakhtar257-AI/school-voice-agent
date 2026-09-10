import Link from "next/link";

const link = { fontSize: "0.9rem" };

/** Sub-navigation shared by the content editor, the test tool, and the history. */
export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          paddingBottom: "0.75rem",
          marginBottom: "1rem",
          borderBottom: "1px solid rgba(128,128,128,0.3)",
        }}
      >
        <Link href="/dashboard/content" style={link}>
          Edit
        </Link>
        <Link href="/dashboard/content/test" style={link}>
          Test the draft
        </Link>
        <Link href="/dashboard/content/history" style={link}>
          History
        </Link>
      </nav>
      {children}
    </div>
  );
}
