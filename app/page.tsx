/**
 * The public page.
 *
 * It fetches nothing on purpose. FR-004 requires this page to render whether or
 * not the database is reachable, and the surest way to guarantee that is for the
 * page not to depend on the database at all.
 *
 * FR-005: this page is NOT parent-facing in its current form. Before its address
 * is given to any parent, the Urdu versions of both lines and the school office
 * phone number must be added. That debt is recorded in the specification and in
 * specs/001-app-foundation/tasks.md.
 */

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "clamp(1.6rem, 7vw, 2.5rem)",
          fontWeight: 600,
        }}
      >
        Al-Noor Public School
      </h1>
      <p
        style={{
          margin: "0.75rem 0 0",
          fontSize: "clamp(1rem, 4vw, 1.25rem)",
          color: "var(--text-secondary)",
        }}
      >
        Admissions Assistant
      </p>
    </main>
  );
}
