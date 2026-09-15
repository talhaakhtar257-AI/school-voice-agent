import { readLiveForApi } from "@/lib/content/queries";
import { forPublicApi, type ContentDoc } from "@/lib/content/schema";
import { englishFont, urduFont } from "@/lib/fonts";
import { dirFor } from "@/lib/language";
import { readLang } from "@/lib/language-server";
import { landingStrings } from "@/lib/strings/landing";
import { heroStrings } from "@/lib/strings/landing-hero";
import { CallProvider } from "@/components/landing/call/call-provider";
import { CallOverlay } from "@/components/landing/call/call-overlay";
import { DocumentLanguage } from "@/components/landing/document-language";
import { AnnouncementBar } from "@/components/landing/announcement-bar";
import { SiteHeader } from "@/components/landing/site-header";
import { Hero } from "@/components/landing/hero";
import { StatsBand } from "@/components/landing/stats-band";
import { AboutSection } from "@/components/landing/about-section";
import { ProgramsSection } from "@/components/landing/programs-section";
import { FeesSection } from "@/components/landing/fees-section";
import { ClassFinder } from "@/components/landing/class-finder";
import { ProcessDocumentsSection } from "@/components/landing/process-documents-section";
import { FaqSection } from "@/components/landing/faq-section";
import { AskBand } from "@/components/landing/ask-band";
import { SiteFooter } from "@/components/landing/site-footer";
import { FloatingTalk } from "@/components/landing/floating-talk";
import { HowItWorks } from "@/components/voice/how-it-works";
import landing from "@/components/landing/landing.module.css";

// Always check for a fresh publish — never a cached "nothing published" state.
export const dynamic = "force-dynamic";

/**
 * The public admissions page, laid out like the approved design. A server
 * component: everything except the call window, the floating Talk controls,
 * the class finder and the text chat is plain HTML that needs neither
 * JavaScript nor Retell to appear (FR-020, FR-021, FR-040).
 *
 * One language at a time, chosen by the `lang` cookie. Every school fact —
 * classes, fees, programs, process, documents, dates, timings, figures, FAQ —
 * comes from the published content the voice agent also answers from. A
 * failed content read still renders the page; each section shows its own
 * "temporarily unavailable" card.
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
  const facts = content?.facts ?? null;
  const schoolName = landingStrings.schoolName[lang];

  return (
    <div lang={lang} dir={dirFor(lang)} className={`${landing.page} ${englishFont.variable} ${urduFont.variable}`}>
      <DocumentLanguage lang={lang} />
      <CallProvider>
        <AnnouncementBar lang={lang} facts={facts} />
        {content?.profile.showSampleBanner && (
          <div className={landing.ribbon} role="note">
            {heroStrings.sampleRibbon[lang]}
          </div>
        )}
        <SiteHeader lang={lang} tagline={content?.profile.tagline[lang] ?? ""} />

        <main>
          <Hero lang={lang} admissionDates={facts?.admissionDates ?? []} schoolName={schoolName} />
          <StatsBand lang={lang} stats={facts?.stats ?? null} />
          <HowItWorks lang={lang} />
          <AboutSection
            lang={lang}
            profile={content?.profile ?? null}
            officeHours={facts?.officeHours ?? []}
            failed={contentFailed}
          />
          <ProgramsSection lang={lang} programs={publicContent?.programs ?? []} facts={facts} failed={contentFailed} />
          <FeesSection lang={lang} facts={facts} failed={contentFailed} />
          <ClassFinder
            lang={lang}
            classes={facts?.classes ?? []}
            ageCriteria={facts?.ageCriteriaPerClass ?? {}}
            admissionDates={facts?.admissionDates ?? []}
          />
          <ProcessDocumentsSection
            lang={lang}
            policies={content?.policies ?? null}
            admissionDates={facts?.admissionDates ?? []}
            schoolTimings={facts?.schoolTimings ?? []}
            failed={contentFailed}
          />
          <FaqSection lang={lang} faqs={publicContent?.faqs ?? []} failed={contentFailed} />
          <AskBand lang={lang} content={content} />
        </main>

        <SiteFooter
          lang={lang}
          profile={content?.profile ?? null}
          officeHours={facts?.officeHours ?? []}
          schoolTimings={facts?.schoolTimings ?? []}
        />
        <FloatingTalk lang={lang} />
        <CallOverlay lang={lang} />
      </CallProvider>
    </div>
  );
}
