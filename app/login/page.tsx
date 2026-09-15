import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { LoginForm } from "@/components/login-form";
import { DocumentLanguage } from "@/components/landing/document-language";
import { LanguageToggle } from "@/components/landing/language-toggle";
import { PhoneIcon } from "@/components/landing/icons";
import { englishFont, urduFont } from "@/lib/fonts";
import { dirFor } from "@/lib/language";
import { readLang } from "@/lib/language-server";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings } from "@/lib/strings/landing";
import { staffLoginStrings as s } from "@/lib/strings/staff-login";
import landing from "@/components/landing/landing.module.css";
import styles from "@/components/login/login.module.css";

export const metadata: Metadata = { title: "Staff sign in" };

/**
 * The staff sign-in screen at /login, in the landing design's style.
 *
 * At /login, not /dashboard/login, so "everything under /dashboard needs a
 * session" keeps no exception (research D-003). Laid out for a 360px screen
 * first. The office phone number is on this screen (FR-013), so a parent who
 * reaches it by mistake still has a route to a human (Constitution VII).
 */
export default async function LoginPage() {
  const lang = await readLang();
  const schoolName = landingStrings.schoolName[lang];

  return (
    <div lang={lang} dir={dirFor(lang)} className={`${landing.page} ${englishFont.variable} ${urduFont.variable}`}>
      <DocumentLanguage lang={lang} />
      <div className={styles.shell}>
        <aside className={styles.brandPanel}>
          <div className={styles.brandTop}>
            <Link href="/" className={styles.brandLink}>
              <Image src="/school-logo.svg" alt="" width={48} height={48} priority />
              <span>
                <span className={styles.brandName}>{schoolName}</span>
                <span className={styles.brandLine}>{s.brandLine[lang]}</span>
              </span>
            </Link>
            <LanguageToggle lang={lang} />
          </div>
          <p className={styles.brandBody}>{s.brandBody[lang]}</p>
        </aside>

        <main className={styles.formSide}>
          <div className={styles.card}>
            <h1 className={styles.title}>{s.screenTitle[lang]}</h1>
            <p className={styles.subtitle}>{s.screenSubtitle[lang]}</p>
            <LoginForm lang={lang} />
          </div>

          <div className={styles.help}>
            <p>{s.forgotPassword[lang]}</p>
            <div className={styles.helpLinks}>
              <a href={`tel:${OFFICE_PHONE_E164}`} className={styles.phone}>
                <PhoneIcon size={15} />
                <bdi className={landing.latin}>{OFFICE_PHONE_DISPLAY}</bdi>
              </a>
              <Link href="/">{s.backToSite[lang]}</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
