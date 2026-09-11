import Image from "next/image";
import { readLiveForApi } from "@/lib/content/queries";
import { forPublicApi, isEmptyDoc, type ContentDoc } from "@/lib/content/schema";
import { landingStrings as s } from "@/lib/strings/landing";
import { OfficePhone } from "@/components/office-phone";
import { TalkPanel } from "@/components/voice/talk-panel";
import { TextChat } from "@/components/voice/text-chat";
import { HowItWorks } from "@/components/voice/how-it-works";

// Always check for a fresh publish — never a cached "nothing published" state.
export const dynamic = "force-dynamic";

/**
 * The public admissions page. A server component: the name, logo, headline,
 * notices, how-it-works strip, and written FAQ are plain HTML that needs
 * neither JavaScript nor Retell to appear (FR-020, FR-021, FR-040). The only
 * client islands are TalkPanel and TextChat.
 *
 * A failed content read still renders everything except a working talk
 * button — the FAQ shows its own "temporarily unavailable" line rather than
 * the page going blank (FR-021, FR-041).
 */
export default async function HomePage() {
  let content: ContentDoc | null = null;
  let contentFailed = false;
  try {
    const live = await readLiveForApi();
    content = live?.doc ?? null;
  } catch {
    contentFailed = true;
  }

  const published = content && !isEmptyDoc(content);
  const publicContent = content ? forPublicApi(content) : null;

  return (
    <main
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "1.5rem 1rem 3rem",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      <header dir="auto" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <Image
          src="/school-logo.svg"
          alt="School logo"
          width={72}
          height={72}
          style={{ margin: "0 auto" }}
        />
        <h1 style={{ margin: 0, fontSize: "1.4rem" }}>{s.schoolName.en}</h1>
        <p style={{ margin: 0, fontSize: "1rem", color: "var(--text-secondary)" }}>
          {s.headline.en}
          <br />
          {s.headline.ur}
        </p>
      </header>

      <section dir="auto" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <TalkPanel />
        <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
          {s.decisionNotice.en}
          <br />
          {s.decisionNotice.ur}
        </p>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          {s.recordingNotice.en}
          <br />
          {s.recordingNotice.ur}
        </p>
        <p style={{ margin: 0, fontSize: "0.85rem" }}>
          {s.privacyLine.en}
          <br />
          {s.privacyLine.ur}
        </p>
      </section>

      <OfficePhone />

      <HowItWorks />

      {content && <TextChat content={content} />}

      <section dir="auto" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <h2 style={{ margin: 0, fontSize: "1.05rem" }}>
          {s.faqTitle.en} · {s.faqTitle.ur}
        </h2>

        {contentFailed && (
          <p style={{ color: "var(--failure-border)" }}>
            {s.faqUnavailable.en}
            <br />
            {s.faqUnavailable.ur}
          </p>
        )}

        {!contentFailed && !published && (
          <p style={{ color: "var(--text-secondary)" }}>
            {s.faqEmpty.en}
            <br />
            {s.faqEmpty.ur}
          </p>
        )}

        {publicContent?.faqs.map((faq) => (
          <div key={faq.id} style={{ borderTop: "1px solid rgba(128,128,128,0.3)", paddingTop: "0.6rem" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {faq.question.en}
              <br />
              {faq.question.ur}
            </p>
            <p style={{ margin: "0.3rem 0 0" }}>
              {faq.answer.en}
              <br />
              {faq.answer.ur}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}
