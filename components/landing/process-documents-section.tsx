import type { ContentDoc, Facts } from "@/lib/content/schema";
import { downloadStrings as d } from "@/lib/strings/downloads";
import type { Lang } from "@/lib/language";
import { contentStrings as s } from "@/lib/strings/landing-content";
import { AdmissionTimeline } from "./admission-timeline";
import { CallButton } from "./call/call-button";
import { CheckIcon, MicIcon } from "./icons";
import { SectionState } from "./section-state";
import landing from "./landing.module.css";
import styles from "./sections.module.css";

// Staff type one item per line; a leading "1." or "-" they may add is dropped
// because the page draws its own numbers and ticks.
function toLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(\d+[.)]|[-*•])\s*/, "").trim())
    .filter(Boolean);
}

/**
 * How admission works (numbered steps and the dates timeline) beside the
 * documents checklist, school timings and an "ask the assistant" card —
 * exactly as staff published them. No document list is typed into code.
 */
export function ProcessDocumentsSection({
  lang,
  policies,
  admissionDates,
  schoolTimings,
  downloads = [],
  failed,
}: {
  lang: Lang;
  policies: ContentDoc["policies"] | null;
  admissionDates: Facts["admissionDates"];
  schoolTimings: Facts["schoolTimings"];
  /** Published files such as the admission form (feature 011). */
  downloads?: { title: { en: string; ur: string }; url: string }[];
  failed: boolean;
}) {
  const steps = toLines(policies?.admissionProcess[lang] ?? "");
  const documents = toLines(policies?.documentRequirements[lang] ?? "");

  return (
    <section className={`${styles.section} ${styles.sectionAlt}`} id="process">
      <div className={`${landing.wrap} ${styles.split}`}>
        <div>
          <h2 className={styles.sectionTitle}>{s.processTitle[lang]}</h2>
          <p className={styles.sectionLead}>{s.processLead[lang]}</p>
          {failed || steps.length === 0 ? (
            <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.processEmpty} lang={lang} />
          ) : (
            <ol className={styles.stepList}>
              {steps.map((step, i) => (
                <li key={i} className={`${styles.card} ${styles.stepCard}`}>
                  <div className={styles.stepN} aria-hidden="true">
                    {i + 1}
                  </div>
                  <p className={styles.stepText} dir="auto">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          )}
          <AdmissionTimeline lang={lang} admissionDates={admissionDates} failed={failed} />
        </div>

        <div>
          <h2 className={styles.sectionTitle}>{s.documentsTitle[lang]}</h2>
          <p className={styles.sectionLead}>{s.documentsLead[lang]}</p>
          {failed || documents.length === 0 ? (
            <SectionState kind={failed ? "unavailable" : "empty"} emptyMessage={s.documentsEmpty} lang={lang} />
          ) : (
            <ul className={styles.docList}>
              {documents.map((item, i) => (
                <li key={i}>
                  <CheckIcon size={17} strokeWidth={2.6} />
                  <span dir="auto">{item}</span>
                </li>
              ))}
            </ul>
          )}

          {downloads.length > 0 && (
            <div className={`${styles.card} ${styles.timingsCard}`}>
              <h3>{d.landingTitle[lang]}</h3>
              {downloads.map((file, i) => (
                <div key={i} className={styles.timingRow}>
                  <a href={file.url} target="_blank" rel="noopener" dir="auto" style={{ fontWeight: 700 }}>
                    {file.title[lang] || file.title.en || file.title.ur}
                  </a>
                  <span>{d.pdf[lang]}</span>
                </div>
              ))}
            </div>
          )}

          <div className={`${styles.card} ${styles.timingsCard}`}>
            <h3>{s.timingsTitle[lang]}</h3>
            {schoolTimings.length === 0 ? (
              <p>{s.timingsEmpty[lang]}</p>
            ) : (
              schoolTimings.map((timing, i) => (
                <div key={i} className={styles.timingRow}>
                  <span className={styles.timingLabel} dir="auto">
                    {timing.label[lang] || timing.label.en || timing.label.ur}
                  </span>
                  <bdi className={`${styles.timingValue} ${landing.latin}`}>
                    {timing.days} · {timing.starts}–{timing.ends}
                  </bdi>
                </div>
              ))
            )}
          </div>

          <div className={`${styles.card} ${styles.askCard}`}>
            <h3>{s.askCardTitle[lang]}</h3>
            <p>{s.askCardBody[lang]}</p>
            <div className={styles.cardActions}>
              <CallButton className={`${landing.btn} ${landing.btnPrimary} ${landing.btnSm}`}>
                <MicIcon size={16} />
                {s.askCardButton[lang]}
              </CallButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
