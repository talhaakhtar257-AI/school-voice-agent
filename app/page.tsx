import { readLiveForApi } from "@/lib/content/queries";
import { forPublicApi, type ContentDoc } from "@/lib/content/schema";
import { englishFont, urduFont } from "@/lib/fonts";
import { dirFor } from "@/lib/language";
import { readLang } from "@/lib/language-server";
import { sectionStrings } from "@/lib/strings/landing-sections";
import { DocumentLanguage } from "@/components/landing/document-language";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { Hero } from "@/components/landing/hero";
import { TalkCard } from "@/components/landing/talk-card";
import { ProgramsSection } from "@/components/landing/programs-section";
import { FeesSection } from "@/components/landing/fees-section";
import { ProcessDocumentsSection } from "@/components/landing/process-documents-section";
import { FaqSection } from "@/components/landing/faq-section";
import { HowItWorks } from "@/components/voice/how-it-works";
import { TextChat } from "@/components/voice/text-chat";
import landing from "@/components/landing/landing.module.css";

// Always check for a fresh publish — never a cached "nothing published" state.
export const dynamic = "force-dynamic";

/**
 * The public admissions page. A server component: everything except the talk
 * card and the text chat is plain HTML that needs neither JavaScript nor Retell
 * to appear (FR-020, FR-021, FR-040).
 *
 * One language at a time, chosen by the `lang` cookie. Classes, fees, process,
 * documents, FAQ and office hours all come from the published content — the
 * same source the voice agent answers from. A failed content read still renders
 * the page; each section shows its own "temporarily unavailable" card.
 */
export default async function HomePage() {
  const lang = await readLang();

  let content: ContentDoc | null = null;
  let contentFailed = false;
  try {
    const live = await readLiveForApi();
    content = live?.doc ?? null;
  } catch {
    contentFailed = true;
  }

  const publicContent = content ? forPublicApi(content) : null;

  return (
    <div
      lang={lang}
      dir={dirFor(lang)}
      className={`${landing.page} ${englishFont.variable} ${urduFont.variable}`}
    >
      <DocumentLanguage lang={lang} />
      <SiteHeader lang={lang} />

      <div className={`${landing.wrap} ${landing.layout}`}>
        <aside id="talk" className={landing.aside}>
          <TalkCard lang={lang} />
        </aside>

        <main className={landing.main}>
          <Hero lang={lang} />
          <HowItWorks lang={lang} />
          <ProgramsSection lang={lang} facts={publicContent?.facts ?? null} failed={contentFailed} />
          <FeesSection lang={lang} facts={publicContent?.facts ?? null} failed={contentFailed} />
          <ProcessDocumentsSection lang={lang} policies={publicContent?.policies ?? null} failed={contentFailed} />
          <FaqSection lang={lang} faqs={publicContent?.faqs ?? []} failed={contentFailed} />
          {content && <TextChat content={content} lang={lang} />}
        </main>
      </div>

      <SiteFooter lang={lang} officeHours={publicContent?.facts.officeHours ?? []} />

      <a href="#talk" className={landing.fab}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" aria-hidden="true">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
        </svg>
        {sectionStrings.fab[lang]}
      </a>
    </div>
  );
}
