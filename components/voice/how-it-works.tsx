import { landingStrings as s } from "@/lib/strings/landing";

/** The three-step strip, shown before a parent starts a conversation (FR-006). */
export function HowItWorks() {
  const steps = [s.howItWorksStep1, s.howItWorksStep2, s.howItWorksStep3];

  return (
    <section
      dir="auto"
      style={{
        maxWidth: "32rem",
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <h2 style={{ margin: "0 0 0.5rem", fontSize: "1rem" }}>
        {s.howItWorksTitle.en} · {s.howItWorksTitle.ur}
      </h2>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.4rem",
          fontSize: "0.9rem",
        }}
      >
        {steps.map((step, i) => (
          <li key={i}>
            {step.en}
            <br />
            <span dir="rtl">{step.ur}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
