import { listUnansweredQuestions } from "@/lib/unanswered/list";
import { unansweredAdminStrings as s } from "@/lib/strings/unanswered-admin";

export const dynamic = "force-dynamic";

/** Staff see every unanswered question, most-asked first (User Story 2, FR-007). */
export default async function UnansweredQuestionsPage() {
  let rows;
  try {
    rows = await listUnansweredQuestions();
  } catch {
    return (
      <div dir="auto" style={{ textAlign: "center", padding: "3rem 1rem" }}>
        <p role="alert" style={{ color: "var(--failure-border)", fontWeight: 600 }}>
          {s.errorTitle.en} · {s.errorTitle.ur}
        </p>
        <p style={{ color: "var(--text-secondary)" }}>{s.errorBody.en}</p>
        <p style={{ color: "var(--text-secondary)" }}>{s.errorBody.ur}</p>
      </div>
    );
  }

  return (
    <div dir="auto">
      <h2 style={{ margin: "0 0 1rem" }}>
        {s.title.en} · {s.title.ur}
      </h2>

      {rows.length === 0 ? (
        <div
          style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-secondary)" }}
        >
          <p style={{ fontWeight: 600, fontSize: "1.1rem", margin: 0 }}>
            {s.emptyTitle.en} · {s.emptyTitle.ur}
          </p>
          <p style={{ margin: "0.5rem 0 0" }}>{s.emptyBody.en}</p>
          <p style={{ margin: 0 }}>{s.emptyBody.ur}</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "start", borderBottom: "2px solid rgba(128,128,128,0.3)" }}>
                <th style={{ padding: "0.5rem 0.75rem" }}>
                  {s.question.en} · {s.question.ur}
                </th>
                <th style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                  {s.timesAsked.en} · {s.timesAsked.ur}
                </th>
                <th style={{ padding: "0.5rem 0.75rem" }}>
                  {s.language.en} · {s.language.ur}
                </th>
                <th style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                  {s.lastAsked.en} · {s.lastAsked.ur}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} style={{ borderBottom: "1px solid rgba(128,128,128,0.2)" }}>
                  <td dir="auto" style={{ padding: "0.5rem 0.75rem" }}>
                    {r.question_text}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", fontWeight: 600 }}>{r.times_asked}</td>
                  <td style={{ padding: "0.5rem 0.75rem" }}>
                    {r.language === "ur"
                      ? s.urdu.en
                      : r.language === "en"
                        ? s.english.en
                        : s.notGiven.en}
                  </td>
                  <td style={{ padding: "0.5rem 0.75rem", whiteSpace: "nowrap" }}>
                    {new Date(r.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
