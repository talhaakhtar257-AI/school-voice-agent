import { staffLoginStrings as s } from "@/lib/strings/staff-login";

/**
 * The dashboard home.
 *
 * Nothing to list yet - leads and transcripts arrive in later features.
 * Constitution IX and the empty-states rule forbid a blank screen, so this is a
 * designed empty state saying what will appear here, in both languages.
 */
export default function DashboardHomePage() {
  return (
    <div
      dir="auto"
      style={{
        maxWidth: "32rem",
        margin: "2rem auto",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>
        {s.dashboardEmptyTitle.en} · {s.dashboardEmptyTitle.ur}
      </h2>
      <p style={{ margin: 0, color: "var(--text-secondary)" }}>
        {s.dashboardEmptyBody.en}
      </p>
      <p style={{ margin: 0, color: "var(--text-secondary)" }}>
        {s.dashboardEmptyBody.ur}
      </p>
    </div>
  );
}
