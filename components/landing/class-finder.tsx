"use client";

import { useState } from "react";
import type { Facts } from "@/lib/content/schema";
import type { Lang } from "@/lib/language";
import { currentOrNextWindow, formatDateKey, schoolToday } from "@/lib/landing/admissions";
import { ageOnDate, classesForAge, hasAgeRange } from "@/lib/landing/class-finder";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { contentStrings as s } from "@/lib/strings/landing-content";
import { CallButton } from "./call/call-button";
import { CheckIcon, MicIcon, PhoneIcon } from "./icons";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import sections from "./sections.module.css";
import styles from "./features.module.css";

/**
 * "Which class fits my child?" A parent enters a date of birth and sees the
 * published classes whose age range fits. Runs entirely in the browser: no
 * network call, nothing stored, and no birth date ever leaves the page.
 */
export function ClassFinder({
  lang,
  classes,
  ageCriteria,
  admissionDates,
}: {
  lang: Lang;
  classes: string[];
  ageCriteria: Facts["ageCriteriaPerClass"];
  admissionDates: Facts["admissionDates"];
}) {
  const [dateOfBirth, setDateOfBirth] = useState("");
  const usable = classes.filter((name) => hasAgeRange(ageCriteria[name]));

  const today = schoolToday();
  const admission = currentOrNextWindow(admissionDates, today);
  // For an intake that has not opened yet, the age that matters is the age on its start date.
  const referenceDate = admission?.status === "upcoming" ? admission.range.startDate : today;
  const age = dateOfBirth ? ageOnDate(dateOfBirth, referenceDate) : null;
  const matches = age === null ? [] : classesForAge(usable, ageCriteria, age);

  return (
    <section className={sections.section} id="finder">
      <div className={landing.wrap}>
        <h2 className={sections.sectionTitle}>{s.finderTitle[lang]}</h2>
        <p className={sections.sectionLead}>{s.finderLead[lang]}</p>

        {usable.length === 0 ? (
          <SectionState kind="empty" emptyMessage={s.finderEmpty} lang={lang} />
        ) : (
          <div className={styles.finderCard}>
            <form onSubmit={(event) => event.preventDefault()}>
              <label className={styles.finderField}>
                {s.finderDob[lang]}
                <input
                  type="date"
                  className={styles.finderInput}
                  value={dateOfBirth}
                  onChange={(event) => setDateOfBirth(event.target.value)}
                  dir="ltr"
                />
              </label>
            </form>

            {dateOfBirth && age === null && (
              <p role="status" className={`${styles.finderResult} ${styles.finderResultNone}`}>
                {s.finderInvalid[lang]}
              </p>
            )}

            {age !== null && (
              <div role="status" className={`${styles.finderResult} ${matches.length === 0 ? styles.finderResultNone : ""}`}>
                <p className={styles.finderAge}>
                  {s.finderAgeOn[lang]} <bdi>{formatDateKey(referenceDate, lang)}</bdi>:{" "}
                  <bdi className={landing.latin}>{age}</bdi> {s.years[lang]}
                </p>
                {matches.length > 0 ? (
                  <>
                    <p style={{ marginTop: 8 }}>{s.finderMatch[lang]}</p>
                    <ul className={styles.matchList}>
                      {matches.map((name) => (
                        <li key={name} className={styles.match} dir="auto">
                          <CheckIcon size={15} strokeWidth={2.6} />
                          {name}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p style={{ marginTop: 8 }}>{s.finderNone[lang]}</p>
                )}
                <div className={styles.finderActions}>
                  <CallButton className={`${landing.btn} ${landing.btnPrimary} ${landing.btnSm}`}>
                    <MicIcon size={16} />
                    {s.finderAsk[lang]}
                  </CallButton>
                  <a className={`${landing.btn} ${landing.btnGhost} ${landing.btnSm}`} href={`tel:${OFFICE_PHONE_E164}`}>
                    <PhoneIcon size={16} />
                    <bdi className={landing.latin}>{OFFICE_PHONE_DISPLAY}</bdi>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
