import type { ContentDoc } from "@/lib/content/schema";

const block = {
  border: "1px solid rgba(128,128,128,0.3)",
  borderRadius: "0.5rem",
  padding: "0.75rem",
  marginBottom: "0.75rem",
};
const dim = { fontSize: "0.8rem", color: "var(--text-secondary)" };

function Pair({ label, v }: { label: string; v: { en: string; ur: string } }) {
  return (
    <div style={{ marginTop: "0.5rem" }}>
      <div style={dim}>{label}</div>
      <div>EN: {v.en || <em style={dim}>empty</em>}</div>
      <div dir="rtl">اردو: {v.ur || <em style={dim}>empty</em>}</div>
    </div>
  );
}

/**
 * A read-only, plain-language rendering of a content document — used to show what
 * the content said before a publish, so a staff member can read a value and type
 * it back into the editor (FR-024, SC-005). No developer needed.
 */
export function DocView({ doc }: { doc: ContentDoc }) {
  return (
    <div dir="auto">
      <div style={block}>
        <strong>Facts</strong>
        <div style={{ marginTop: "0.4rem" }}>
          {doc.facts.classes.length === 0 ? (
            <em style={dim}>No classes</em>
          ) : (
            <ul style={{ margin: 0, paddingInlineStart: "1.2rem" }}>
              {doc.facts.classes.map((c) => (
                <li key={c}>
                  {c}: fee {doc.facts.feePerClass[c] ?? "?"}, age{" "}
                  {doc.facts.ageCriteriaPerClass[c]?.minYears ?? "?"}–
                  {doc.facts.ageCriteriaPerClass[c]?.maxYears ?? "?"} years
                </li>
              ))}
            </ul>
          )}
          <div style={{ marginTop: "0.4rem" }}>
            Admission dates:{" "}
            {doc.facts.admissionDates.map((d) => `${d.label} (${d.startDate}–${d.endDate})`).join("; ") || <em style={dim}>none</em>}
          </div>
          <div>
            Office hours:{" "}
            {doc.facts.officeHours.map((h) => `${h.days} ${h.opens}–${h.closes}`).join("; ") || <em style={dim}>none</em>}
          </div>
        </div>
      </div>

      <div style={block}>
        <strong>Policies</strong>
        <Pair label="Admission process" v={doc.policies.admissionProcess} />
        <Pair label="Document requirements" v={doc.policies.documentRequirements} />
      </div>

      <div style={block}>
        <strong>FAQs</strong>
        {doc.faqs.filter((f) => f.archivedAt === null).length === 0 && (
          <div style={dim}>None</div>
        )}
        {doc.faqs
          .filter((f) => f.archivedAt === null)
          .map((f, i) => (
            <div key={f.id} style={{ marginTop: "0.5rem" }}>
              <div style={dim}>FAQ {i + 1}</div>
              <Pair label="Question" v={f.question} />
              <Pair label="Answer" v={f.answer} />
            </div>
          ))}
      </div>

      <div style={block}>
        <strong>Escalation topics</strong>
        {doc.escalationTopics.filter((t) => t.archivedAt === null).length === 0 && (
          <div style={dim}>None</div>
        )}
        {doc.escalationTopics
          .filter((t) => t.archivedAt === null)
          .map((t, i) => (
            <div key={t.id} style={{ marginTop: "0.5rem" }}>
              <div style={dim}>Topic {i + 1}</div>
              <Pair label="Subject" v={t.topic} />
              <Pair label="Hand-off wording" v={t.handoffWording} />
            </div>
          ))}
      </div>
    </div>
  );
}
