import Image from "next/image";
import Link from "next/link";
import type { Lang } from "@/lib/language";
import { landingStrings } from "@/lib/strings/landing";
import { privacyStrings } from "@/lib/strings/privacy";
import { LanguageToggle } from "@/components/landing/language-toggle";
import landing from "@/components/landing/landing.module.css";
import styles from "./privacy.module.css";

/**
 * The privacy page's header: the landing header's look without its Talk button.
 * That button needs the call machinery, which would load the voice library on a
 * page that is only for reading (spec 012, research D-2).
 */
export function PrivacyHeader({ lang }: { lang: Lang }) {
  return (
    <header className={`${landing.header} ${styles.noPrint}`}>
      <div className={`${landing.wrap} ${landing.nav}`}>
        <Link className={landing.brand} href="/">
          <Image src="/school-logo.svg" alt="" width={42} height={42} priority />
          <span className={landing.brandText}>
            <span className={landing.brandName}>{landingStrings.schoolName[lang]}</span>
          </span>
        </Link>

        <LanguageToggle lang={lang} />

        <Link className={styles.backLink} href="/">
          {privacyStrings.backHome[lang]}
        </Link>
      </div>
    </header>
  );
}
