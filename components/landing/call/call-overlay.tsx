"use client";

import { useEffect, useRef } from "react";
import type { Lang } from "@/lib/language";
import { OFFICE_PHONE_DISPLAY, OFFICE_PHONE_E164 } from "@/lib/office";
import { landingStrings as s } from "@/lib/strings/landing";
import { callStrings as c } from "@/lib/strings/landing-call";
import { MicExplainer } from "@/components/voice/mic-explainer";
import { CloseIcon, MicIcon } from "../icons";
import { useCall } from "./call-provider";
import styles from "./call.module.css";

function clock(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * The call pop-up window. Explains the microphone first, then shows the live
 * state, a timer against the call limit, the transcript as chat bubbles, Mute
 * and End Call. The office number is visible at every step (route to a human).
 * A tap outside or Esc closes it only when no call is running.
 */
export function CallOverlay({ lang }: { lang: Lang }) {
  const {
    phase, muted, transcript, fallback, elapsedSeconds, maxSeconds,
    openCall, closeCall, startCall, endCall, toggleMute,
  } = useCall();
  const panelRef = useRef<HTMLDivElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const isOpen = phase !== "closed";
  const inCall = phase === "connecting" || phase === "listening" || phase === "speaking";

  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !inCall) closeCall();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, inCall, closeCall]);

  useEffect(() => {
    const box = transcriptRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [transcript]);

  if (!isOpen) return null;

  const title =
    phase === "explaining" ? c.ready[lang]
    : phase === "connecting" ? s.stateConnecting[lang]
    : phase === "listening" ? s.stateListening[lang]
    : phase === "speaking" ? s.stateSpeaking[lang]
    : c.ended[lang];

  const officeLine = (
    <p className={styles.officeLine}>
      {c.officeLine[lang]}{" "}
      <a href={`tel:${OFFICE_PHONE_E164}`}>{OFFICE_PHONE_DISPLAY}</a>
    </p>
  );

  return (
    <div
      className={styles.backdrop}
      onClick={(event) => {
        if (event.target === event.currentTarget && !inCall) closeCall();
      }}
    >
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="call-window-title"
        tabIndex={-1}
      >
        <div className={styles.head}>
          <div>
            <div id="call-window-title" className={styles.status} role="status">
              {title}
            </div>
            <div className={styles.sub}>{c.windowSub[lang]}</div>
          </div>
          {inCall ? (
            <div className={styles.timer} aria-label={c.timerLabel[lang]}>
              <bdi>
                {clock(elapsedSeconds)}
                {maxSeconds !== null && ` / ${clock(maxSeconds)}`}
              </bdi>
            </div>
          ) : (
            <button type="button" className={styles.close} onClick={closeCall} aria-label={c.close[lang]}>
              <CloseIcon />
            </button>
          )}
        </div>

        {phase === "explaining" && (
          <div className={styles.body}>
            <MicExplainer lang={lang} onContinue={() => void startCall()} />
            {officeLine}
          </div>
        )}

        {inCall && (
          <>
            <div className={styles.body}>
              <div className={`${styles.orbWrap} ${phase === "speaking" ? styles.speaking : ""}`} aria-hidden="true">
                <div className={styles.orb}>
                  <MicIcon size={36} strokeWidth={1.8} />
                </div>
              </div>
              <div ref={transcriptRef} className={styles.transcript}>
                {transcript.length === 0 ? (
                  <p className={styles.empty}>{c.transcriptEmpty[lang]}</p>
                ) : (
                  transcript.map((turn, i) => (
                    // Transcripts mix Urdu script and English; dir="auto" per bubble.
                    <p key={i} dir="auto" className={`${styles.bubble} ${turn.role === "agent" ? styles.agent : styles.user}`}>
                      <span className={styles.who}>{turn.role === "agent" ? c.assistant[lang] : c.you[lang]}</span>
                      {turn.content}
                    </p>
                  ))
                )}
              </div>
              <p className={styles.keepOpen}>{c.keepOpen[lang]}</p>
              {officeLine}
            </div>
            <div className={styles.foot}>
              <button type="button" onClick={toggleMute} aria-pressed={muted} disabled={phase === "connecting"}>
                {muted ? c.unmute[lang] : c.mute[lang]}
              </button>
              <button type="button" className={styles.end} onClick={() => void endCall()}>
                {s.endCall[lang]}
              </button>
            </div>
          </>
        )}

        {phase === "ended" && (
          <>
            <div className={styles.body}>
              {fallback ? (
                <p role="alert" className={styles.fallback}>
                  {fallback[lang]}
                </p>
              ) : (
                <p className={styles.endedText}>{c.endedBody[lang]}</p>
              )}
              {officeLine}
            </div>
            <div className={styles.foot}>
              <button type="button" className={styles.primary} onClick={openCall}>
                {c.talkAgain[lang]}
              </button>
              <button type="button" onClick={closeCall}>
                {c.close[lang]}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
