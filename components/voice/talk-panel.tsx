"use client";

import { useRef, useState } from "react";
import { RetellClient, type WebCallSession } from "retell-client-js-sdk";
import { MicExplainer } from "./mic-explainer";
import { landingStrings as s } from "@/lib/strings/landing";

type CallState = "idle" | "explaining" | "connecting" | "listening" | "speaking";
type Turn = { role: "agent" | "user"; content: string };
type Bilingual = { en: string; ur: string };

const FALLBACK_MESSAGES: Record<string, Bilingual> = {
  "no-content": s.noContentYet,
  "not-configured": s.assistantUnavailable,
  capped: s.limitReached,
  "retell-error": s.assistantUnavailable,
};

const cell = { minHeight: "44px", padding: "0.5rem 1.25rem", fontSize: "1.1rem", fontWeight: 700 };

/**
 * The whole voice-call lifecycle. Tap -> MicExplainer -> the gate route
 * (POST /api/retell/web-call) -> on { ok: true }, connect directly to Retell
 * with a publishable key (research D-001) -> connecting/listening/speaking ->
 * End Call, at any time, on the first tap (FR-007-FR-009). A client-side timer
 * ends the call at the configured length (T024, FR-030) — a pacing control;
 * the monthly cost cap is enforced server-side, before this component ever
 * gets to call Retell.
 */
export function TalkPanel() {
  const [state, setState] = useState<CallState>("idle");
  const [fallback, setFallback] = useState<Bilingual | null>(null);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const sessionRef = useRef<WebCallSession | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        onContinue={() => {
          setState("idle");
          void startCall();
        }}
      />
    );
  }

  if (state === "idle") {
    return (
      <div dir="auto" style={{ textAlign: "center" }}>
        <button
          type="button"
          style={cell}
          onClick={() => setState("explaining")}
        >
          {s.talkButton.en} · {s.talkButton.ur}
        </button>
        {fallback && (
          <p role="alert" style={{ color: "var(--failure-border)", fontSize: "0.9rem" }}>
            {fallback.en}
            <br />
            {fallback.ur}
          </p>
        )}
      </div>
    );
  }

  // connecting / listening / speaking
  return (
    <div dir="auto" style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      <p role="status" style={{ fontSize: "1.1rem", fontWeight: 600, margin: 0 }}>
        {state === "connecting" && `${s.stateConnecting.en} · ${s.stateConnecting.ur}`}
        {state === "listening" && `${s.stateListening.en} · ${s.stateListening.ur}`}
        {state === "speaking" && `${s.stateSpeaking.en} · ${s.stateSpeaking.ur}`}
      </p>

      <div
        style={{
          maxWidth: "32rem",
          margin: "0 auto",
          maxHeight: "14rem",
          overflowY: "auto",
          textAlign: "start",
          fontSize: "0.9rem",
          border: "1px solid rgba(128,128,128,0.3)",
          borderRadius: "0.5rem",
          padding: "0.6rem",
        }}
      >
        {transcript.map((t, i) => (
          <p key={i} style={{ margin: "0.2rem 0" }}>
            <strong>{t.role === "agent" ? "Assistant" : "You"}:</strong> {t.content}
          </p>
        ))}
      </div>

      <button type="button" style={cell} onClick={() => void endCall()}>
        {s.endCall.en} · {s.endCall.ur}
      </button>
    </div>
  );
}
