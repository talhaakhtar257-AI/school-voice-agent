"use client";

import { useRef, useState } from "react";
import { RetellClient, type WebCallSession } from "retell-client-js-sdk";
import { MicExplainer } from "./mic-explainer";
import type { Lang } from "@/lib/language";
import { landingStrings as s } from "@/lib/strings/landing";
import { sectionStrings } from "@/lib/strings/landing-sections";
import styles from "@/components/landing/talk-card.module.css";

type CallState = "idle" | "explaining" | "connecting" | "listening" | "speaking";
type Turn = { role: "agent" | "user"; content: string };
type Bilingual = { en: string; ur: string };

const FALLBACK_MESSAGES: Record<string, Bilingual> = {
  "no-content": s.noContentYet,
  "not-configured": s.assistantUnavailable,
  capped: s.limitReached,
  "retell-error": s.assistantUnavailable,
};

/**
 * The whole voice-call lifecycle. Tap -> MicExplainer -> the gate route
 * (POST /api/retell/web-call) -> on { ok: true }, connect directly to Retell
 * with a publishable key (research D-001) -> connecting/listening/speaking ->
 * End Call, at any time, on the first tap (FR-007-FR-009). A client-side timer
 * ends the call at the configured length (T024, FR-030) — a pacing control;
 * the monthly cost cap is enforced server-side, before this component ever
 * gets to call Retell.
 *
 * One multilingual agent serves both languages; `lang` only changes the words
 * on screen, never which agent is called.
 */
export function TalkPanel({
  lang,
  onSpeakingChange,
}: {
  lang: Lang;
  onSpeakingChange?: (speaking: boolean) => void;
}) {
  const [state, setStateRaw] = useState<CallState>("idle");
  const [fallback, setFallback] = useState<Bilingual | null>(null);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const sessionRef = useRef<WebCallSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Every state change goes through here so the card's orb animation follows it.
  function setState(next: CallState) {
    setStateRaw(next);
    onSpeakingChange?.(next === "speaking");
  }

  function clearTimer() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }

  function reset() {
    clearTimer();
    sessionRef.current = null;
    setState("idle");
    setTranscript([]);
  }

  async function startCall() {
    setFallback(null);
    let gate: { ok: true; maxCallSeconds: number } | { reason: string };
    try {
      const res = await fetch("/api/retell/web-call", { method: "POST" });
      gate = await res.json();
    } catch {
      setFallback(s.assistantUnavailable);
      setState("idle");
      return;
    }

    if (!("ok" in gate)) {
      setFallback(FALLBACK_MESSAGES[gate.reason] ?? s.assistantUnavailable);
      setState("idle");
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY;
    const agentId = process.env.NEXT_PUBLIC_RETELL_AGENT_ID;
    if (!publicKey || !agentId) {
      setFallback(s.assistantUnavailable);
      setState("idle");
      return;
    }

    setState("connecting");

    const client = new RetellClient({ key: publicKey });
    const session = client.createWebCall({
      agent_id: agentId,
      transcript: true,
      hooks: {
        onStatus: (status) => {
          if (status === "live") setState("listening");
          if (status === "ended") reset();
        },
        onAgentStartTalking: () => setState("speaking"),
        onAgentStopTalking: () => setState("listening"),
        onTranscript: (full) => {
          setTranscript(
            full
              .filter(
                (u): u is Turn & { id: string; time_sec: number } =>
                  "role" in u &&
                  ("role" in u ? u.role === "agent" || u.role === "user" : false) &&
                  "content" in u,
              )
              .map((u) => ({ role: u.role, content: u.content })),
          );
        },
        onEnd: () => reset(),
        onError: () => {
          setFallback(s.assistantUnavailable);
          reset();
        },
      },
    });
    sessionRef.current = session;

    // Per-call length: a UX pacing timer, not the security boundary (that is
    // the server-side monthly reservation the gate route already applied).
    timerRef.current = setTimeout(() => {
      setFallback(s.callTimeUp);
      void session.end();
      reset();
    }, gate.maxCallSeconds * 1000);
  }

  async function endCall() {
    await sessionRef.current?.end();
    reset();
  }

  if (state === "explaining") {
    return (
      <MicExplainer
        lang={lang}
        onContinue={() => {
          setState("idle");
          void startCall();
        }}
      />
    );
  }

  if (state === "idle") {
    return (
      <div className={styles.panel}>
        <button type="button" className={styles.talkButton} onClick={() => setState("explaining")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
          </svg>
          {s.talkButton[lang]}
        </button>
        {fallback && (
          <p role="alert" className={styles.fallback}>
            {fallback[lang]}
          </p>
        )}
      </div>
    );
  }

  // connecting / listening / speaking
  return (
    <div className={styles.panel}>
      <p role="status" className={styles.status}>
        {state === "connecting" && s.stateConnecting[lang]}
        {state === "listening" && s.stateListening[lang]}
        {state === "speaking" && s.stateSpeaking[lang]}
      </p>

      <div className={styles.transcript}>
        {transcript.length === 0 ? (
          <p className={styles.transcriptEmpty}>{sectionStrings.transcriptEmpty[lang]}</p>
        ) : (
          transcript.map((t, i) => (
            // Transcripts mix Urdu script and English; dir="auto" per bubble.
            <p key={i} dir="auto" className={`${styles.bubble} ${t.role === "agent" ? styles.bubbleAgent : styles.bubbleUser}`}>
              <strong>
                {t.role === "agent" ? sectionStrings.transcriptAssistant[lang] : sectionStrings.transcriptYou[lang]}:
              </strong>{" "}
              {t.content}
            </p>
          ))
        )}
      </div>

      <button type="button" className={styles.endButton} onClick={() => void endCall()}>
        {s.endCall[lang]}
      </button>
    </div>
  );
}
