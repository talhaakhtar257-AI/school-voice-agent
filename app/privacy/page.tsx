import type { Metadata } from "next";
import { readLiveForApi } from "@/lib/content/queries";
import type { ContentDoc } from "@/lib/content/schema";
import { englishFont, urduFont } from "@/lib/fonts";
import { dirFor } from "@/lib/language";
import { readLang } from "@/lib/language-server";
import { heroStrings } from "@/lib/strings/landing-hero";
import { privacyStrings } from "@/lib/strings/privacy";
import { DocumentLanguage } from "@/components/landing/document-language";
import { AnnouncementBar } from "@/components/landing/announcement-bar";
import { SiteFooter } from "@/components/landing/site-footer";
import { PrivacyHeader } from "@/components/privacy/privacy-header";
import { PrivacyBody } from "@/components/privacy/privacy-body";
import landing from "@/components/landing/landing.module.css";
import styles from "@/components/privacy/privacy.module.css";

// The language comes from a cookie, so the page is rendered per request.
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await readLang();
  return {
    title: privacyStrings.title[lang],
    description: privacyStrings.description[lang],
  };
}

/**
 * The public privacy policy (feature 012), in the visitor's chosen language.
 * The policy text never depends on the database, so it always renders (FR-012).
 * Published content is read only for the sample ribbon and the footer's address
 * and hours. There is no call button or call window here, so no voice code loads.
 */
export default async function PrivacyPage() {
  const lang = await readLang();

  let content: ContentDoc | null = null;
  try {
    const live = await readLiveForApi();
    content = live?.doc ?? null;
  } catch (error) {
    // Not fatal: the footer shows its own "not available" text. Logged so a
    // failing database is still noticed. The error holds no parent data.
    console.error("privacy page: published content could not be read", error);
  }

  // A demo school shows the sample ribbon unless published content turns it off,
  // and also when the content could not be read at all.
  const showSampleRibbon = content?.profile.showSampleBanner !== false;

  return (
    <div lang={lang} dir={dirFor(lang)} className={`${landing.page} ${englishFont.variable} ${urduFont.variable}`}>
      <DocumentLanguage lang={lang} />
      <div className={styles.noPrint}>
        <AnnouncementBar lang={lang} facts={null} />
      </div>
      {showSampleRibbon && (
        <div className={landing.ribbon} role="note">
          {heroStrings.sampleRibbon[lang]}
        </div>
      )}
      <PrivacyHeader lang={lang} />

      <main>
        <PrivacyBody lang={lang} />
      </main>

      <div className={styles.noPrint}>
        <SiteFooter
          lang={lang}
          profile={content?.profile ?? null}
          officeHours={content?.facts.officeHours ?? []}
          schoolTimings={content?.facts.schoolTimings ?? []}
        />
      </div>
    </div>
  );
}
