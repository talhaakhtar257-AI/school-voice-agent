import { isDatabaseReachable } from "@/lib/supabase/health";

/**
 * The health check.
 *
 * It is a page rather than a route under app/api/ on purpose: .claude/rules/api.md
 * requires a shared secret header on every API endpoint, which would make this
 * impossible to open in a browser and break Principle IX — the maintainer must be
 * able to check this by clicking.
 *
 * Nothing here names the database, the key, the hostname or the underlying error.
 * A stranger who guesses this address learns only whether the system is healthy.
 */

// Never cached: a stale "reachable" would be worse than no answer at all.
export const dynamic = "force-dynamic";

export default async function HealthPage() {
  let reachable: boolean;
  let settingsMissing = false;

  try {
    reachable = await isDatabaseReachable();
  } catch {
    // A required setting is absent, so lib/env.ts threw. That is a configuration
    // problem rather than an unreachable database, and it is worth saying so —
    // without naming which setting, since anyone can open this page.
    reachable = false;
    settingsMissing = true;
  }

  const headline = reachable
    ? "The application can reach its database."
    : "The application cannot reach its database.";

  const detail = reachable
    ? "Everything needed for the database connection is working."
    : settingsMissing
      ? "The application is missing part of its configuration. Check the environment variables where this site is published."
      : "The database did not answer. Check that the Supabase project is running and that the environment variables are correct.";

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "32rem",
          padding: "1.25rem",
          borderRadius: "0.5rem",
          border: `2px solid ${
            reachable ? "var(--success-border)" : "var(--failure-border)"
          }`,
          background: reachable
            ? "var(--success-background)"
            : "var(--failure-background)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "1.1rem",
            fontWeight: 600,
          }}
        >
          {/* Colour is never the only signal — the words carry the result too. */}
          {reachable ? "✓ " : "✕ "}
          {headline}
        </p>
        <p
          style={{
            margin: "0.6rem 0 0",
            color: "var(--text-secondary)",
          }}
        >
          {detail}
        </p>
      </div>
    </main>
  );
}
