"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { heroStrings as h } from "@/lib/strings/landing-hero";
import { useCall } from "./call/call-provider";
import { MicIcon } from "./icons";
import styles from "./landing.module.css";

/**
 * Keeps a Talk control in reach while scrolling. On wide screens a compact
 * card floats at the inline end (right in English, left in Urdu) once the
 * hero's agent card has scrolled away, and hides again as the footer arrives.
 * On phones a floating Talk button does the same job. Visibility comes from
 * IntersectionObserver — no scroll listeners.
 */
export function FloatingTalk({ lang }: { lang: Lang }) {
  const { openCall, phase } = useCall();
  const [heroInView, setHeroInView] = useState(true);
  const [footerInView, setFooterInView] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("hero-agent-card");
    const footer = document.getElementById("site-footer");
    if (!hero || !footer || !("IntersectionObserver" in window)) return;
    const heroObserver = new IntersectionObserver(([entry]) => setHeroInView(entry.isIntersecting));
    const footerObserver = new IntersectionObserver(([entry]) => setFooterInView(entry.isIntersecting));
    heroObserver.observe(hero);
    footerObserver.observe(footer);
    return () => {
      heroObserver.disconnect();
      footerObserver.disconnect();
    };
  }, []);

  const callOpen = phase !== "closed";
  const showCard = !heroInView && !footerInView && !callOpen;
  const hideFab = footerInView || callOpen;

  return (
    <>
      <aside
        className={`${styles.floating} ${showCard ? styles.floatingVisible : ""}`}
        aria-label={h.floatingTitle[lang]}
        inert={!showCard}
      >
        <div className={styles.floatingOrb} aria-hidden="true">
          <MicIcon size={22} />
        </div>
        <p className={styles.floatingTitle}>{h.floatingTitle[lang]}</p>
        <button type="button" className={styles.floatingButton} onClick={openCall} aria-haspopup="dialog">
          <span className={styles.floatingLong}>{h.floatingButton[lang]}</span>
          <span className={styles.floatingShort}>{h.floatingShort[lang]}</span>
        </button>
        <a className={styles.floatingPhone} href={`tel:${OFFICE_PHONE_E164}`}>
          <bdi className={styles.latin}>{OFFICE_PHONE_DISPLAY}</bdi>
        </a>
      </aside>

      <button
        type="button"
        className={`${styles.fab} ${hideFab ? styles.fabHidden : ""}`}
        onClick={openCall}
        aria-haspopup="dialog"
        tabIndex={hideFab ? -1 : 0}
      >
        <MicIcon size={18} />
        {h.fab[lang]}
      </button>
    </>
  );
}
