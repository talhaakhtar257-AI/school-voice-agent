"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { RetellClient, type WebCallSession } from "retell-client-js-sdk";
import { landingStrings as s } from "@/lib/strings/landing";
import { preCallStrings as p } from "@/lib/strings/pre-call";
import { useWakeLock } from "./use-wake-lock";
import type { ParentDetails } from "./pre-call-form";

/**
 * Save what the parent typed as the lead for this call, the moment it goes
 * live (feature 011). Failure is logged and ignored: the assistant still has
 * the details and saves them with save_lead.
 */
async function saveIntake(callId: string, details: ParentDetails): Promise<void> {
  try {
    const res = await fetch("/api/leads/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callId, ...details }),
    });
    if (!res.ok) console.error(`[call/intake] ${res.status}`);
  } catch (error) {
    console.error(`[call/intake] ${error instanceof Error ? error.message : "network error"}`);
  }
}

export type CallPhase = "closed" | "explaining" | "connecting" | "listening" | "speaking" | "ended";
export type Turn = { role: "agent" | "user"; content: string };
type Bilingual = { en: string; ur: string };

const FALLBACK_MESSAGES: Record<string, Bilingual> = {
  "no-content": s.noContentYet,
  "not-configured": s.assistantUnavailable,
  capped: s.limitReached,
  "retell-error": s.assistantUnavailable,
};

// Pauses before the 2nd and 3rd attempt to reach Retell. A phone on mobile data
// can fail to reach Retell for a few seconds: the owner's Android test on
// 2026-10-11 failed four times in a row and then worked, while the same site
// connected first time from a desktop. Patient retries ride out that blip on
// the same reservation, instead of the parent tapping again and reserving
// another full call's minutes each time.
const CONNECT_RETRY_DELAYS_MS = [1000, 2500];

type CallContextValue = {
  phase: CallPhase;
  muted: boolean;
  transcript: Turn[];
  fallback: Bilingual | null;
  elapsedSeconds: number;
  /** Retell's id for the current or last call, once it is live; the email box needs it. */
  callId: string | null;
  maxSeconds: number | null;
  /** True while the parent has finished speaking and the assistant has not started replying. */
  thinking: boolean;
  /** True while a failed first connection is being retried, so the window can say "Still connecting…". */
  reconnecting: boolean;
  /** What the parent typed before the call, kept for "Talk again" and the WhatsApp button. */
  parentDetails: ParentDetails | null;
  openCall: () => void;
  closeCall: () => void;
  startCall: (details: ParentDetails) => Promise<void>;
  endCall: () => Promise<void>;
  toggleMute: () => void;
};

const CallContext = createContext<CallContextValue | null>(null);

export function useCall(): CallContextValue {
  const value = useContext(CallContext);
  if (!value) throw new Error("useCall must be used inside <CallProvider>.");
  return value;
}

/**
 * The whole voice-call lifecycle, shared by every Talk button on the page so
 * there is only ever one call. Open -> mic explanation (FR-013) -> the gate
 * route POST /api/retell/web-call -> on { ok: true }, connect directly to
 * Retell with the publishable key (research D-001) -> connecting / listening /
 * speaking -> End Call at any moment (FR-007-FR-009). A client timer ends the
 * call at the configured length (T024, FR-030) — a pacing control; the monthly
 * cost cap is enforced server-side before this ever reaches Retell. One
 * multilingual agent serves both languages.
 */
export function CallProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<CallPhase>("closed");
  const [muted, setMuted] = useState(false);
  const [transcript, setTranscript] = useState<Turn[]>([]);
  const [fallback, setFallback] = useState<Bilingual | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [maxSeconds, setMaxSeconds] = useState<number | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [thinking, setThinking] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [parentDetails, setParentDetails] = useState<ParentDetails | null>(null);

  const sessionRef = useRef<WebCallSession | null>(null);
  const thinkingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const limitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Bumped whenever a call is ended or abandoned, so SDK events or a gate
  // response arriving afterwards can tell they belong to a finished call.
  const attemptRef = useRef(0);

  const stopTimers = useCallback(() => {
    if (limitTimerRef.current) clearTimeout(limitTimerRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    limitTimerRef.current = null;
    tickRef.current = null;
  }, []);

  const clearThinking = useCallback(() => {
    if (thinkingTimerRef.current) clearTimeout(thinkingTimerRef.current);
    thinkingTimerRef.current = null;
    setThinking(false);
  }, []);

  const finish = useCallback(
    (message: Bilingual | null) => {
      stopTimers();
      clearThinking();
      sessionRef.current = null;
      setMuted(false);
      setReconnecting(false);
      setFallback(message);
      setPhase("ended");
    },
    [stopTimers, clearThinking],
  );

  const startCall = useCallback(async (details: ParentDetails) => {
    const attempt = ++attemptRef.current;
    const isCurrent = () => attempt === attemptRef.current;
    setParentDetails(details);
    setFallback(null);
    setTranscript([]);
    setElapsedSeconds(0);
    setMaxSeconds(null);
    setCallId(null);
    setReconnecting(false);
    setPhase("connecting");

    let gate: { ok: true; maxCallSeconds: number } | { reason: string };
    try {
      const res = await fetch("/api/retell/web-call", { method: "POST" });
      gate = await res.json();
    } catch {
      if (isCurrent()) finish(s.assistantUnavailable);
      return;
    }
    if (!isCurrent()) return; // the parent ended the call while the gate answered

    if (!("ok" in gate)) {
      finish(FALLBACK_MESSAGES[gate.reason] ?? s.assistantUnavailable);
      return;
    }

    const publicKey = process.env.NEXT_PUBLIC_RETELL_PUBLIC_KEY;
    const agentId = process.env.NEXT_PUBLIC_RETELL_AGENT_ID;
    if (!publicKey || !agentId) {
      finish(s.assistantUnavailable);
      return;
    }

    // Connects to Retell. A connection that fails before the call goes live
    // is tried up to three times in all, with short pauses, on the same
    // reservation (see CONNECT_RETRY_DELAYS_MS).
    const connect = (tryNumber: number) => {
      let wentLive = false;
      let active = true; // false once this session has been replaced by a retry
      const current = () => active && isCurrent();
      // `giveUp` skips the retries when Retell has refused outright (401/403,
      // e.g. "Public key is not allowed for this domain"): that answer will not
      // change in two seconds, so retrying only keeps the parent waiting.
      const failedBeforeLive = (giveUp = false) => {
        if (wentLive) return false;
        active = false;
        const pause = giveUp ? undefined : CONNECT_RETRY_DELAYS_MS[tryNumber];
        if (pause !== undefined) {
          setReconnecting(true);
          // An End Call during the pause bumps attemptRef, so no retry follows it.
          setTimeout(() => {
            if (isCurrent()) connect(tryNumber + 1);
          }, pause);
        } else {
          attemptRef.current += 1;
          finish(p.couldNotConnect);
        }
        return true;
      };

      const session = new RetellClient({ key: publicKey }).createWebCall({
        agent_id: agentId,
        transcript: true,
        // The typed details, so the assistant greets the parent by name and
        // never asks for (or mishears) the name, phone or email.
        retell_llm_dynamic_variables: {
          parent_name: details.name,
          parent_phone: details.phone,
          parent_email: details.email,
        },
        hooks: {
          onStatus: (status) => {
            if (!current()) return;
            if (status === "live") {
              wentLive = true;
              setReconnecting(false);
              setPhase("listening");
              const liveCallId = session.callId ?? null;
              setCallId(liveCallId);
              if (liveCallId) void saveIntake(liveCallId, details);
              const startedAt = Date.now();
              tickRef.current = setInterval(() => {
                setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
              }, 1000);
            }
            if (status === "ended") {
              if (failedBeforeLive()) return;
              attemptRef.current += 1;
              finish(null);
            }
          },
          onAgentStartTalking: () => {
            if (!current()) return;
            clearThinking();
            setPhase("speaking");
          },
          onAgentStopTalking: () => {
            if (current()) setPhase("listening");
          },
          onTranscript: (full) => {
            if (!current()) return;
            const turns = full
              .filter(
                (u): u is Turn & { id: string; time_sec: number } =>
                  "role" in u &&
                  ("role" in u ? u.role === "agent" || u.role === "user" : false) &&
                  "content" in u,
              )
              .map((u) => ({ role: u.role, content: u.content }));
            setTranscript(turns);
            // The parent has spoken and nothing has come back yet: after a
            // short quiet moment, show that the assistant is working on it.
            clearThinking();
            if (turns.at(-1)?.role === "user") {
              thinkingTimerRef.current = setTimeout(() => setThinking(true), 900);
            }
          },
          onEnd: () => {
            if (!current()) return;
            if (failedBeforeLive()) return;
            attemptRef.current += 1;
            finish(null);
          },
          onError: (error) => {
            if (!current()) return;
            // Which try failed and Retell's HTTP status, if it answered at all:
            // "no status" means the request never reached Retell (network).
            const httpStatus = "status" in error ? Number(error.status) : null;
            console.error(`[call/error] try ${tryNumber + 1}/3, ${httpStatus ? `HTTP ${httpStatus}` : "no status"}: ${error.message}`);
            if (failedBeforeLive(httpStatus === 401 || httpStatus === 403)) return;
            attemptRef.current += 1;
            finish(s.assistantUnavailable);
          },
        },
      });
      sessionRef.current = session;
    };

    connect(0);
    setMaxSeconds(gate.maxCallSeconds);

    // Per-call length: a UX pacing timer, not the security boundary (that is
    // the server-side monthly reservation the gate route already applied).
    limitTimerRef.current = setTimeout(() => {
      if (!isCurrent()) return;
      attemptRef.current += 1;
      void sessionRef.current?.end();
      finish(s.callTimeUp);
    }, gate.maxCallSeconds * 1000);
  }, [finish, clearThinking]);

  const endCall = useCallback(async () => {
    attemptRef.current += 1;
    const session = sessionRef.current;
    finish(null);
    try {
      await session?.end();
    } catch (error) {
      console.error(`[call/end] ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [finish]);

  const toggleMute = useCallback(() => {
    const session = sessionRef.current;
    if (!session) return;
    const next = !muted;
    if (next) session.mute();
    else session.unmute();
    setMuted(next);
  }, [muted]);

  const openCall = useCallback(() => {
    if (phase === "closed" || phase === "ended") {
      setFallback(null);
      setPhase("explaining");
    }
  }, [phase]);

  // A live call can only be left with End Call, never by a stray tap.
  const closeCall = useCallback(() => {
    if (phase === "explaining" || phase === "ended") setPhase("closed");
  }, [phase]);

  // Stop the page behind the window from scrolling while it is open.
  useEffect(() => {
    if (phase === "closed") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [phase]);

  useWakeLock(phase === "connecting" || phase === "listening" || phase === "speaking");

  // Leaving the page must never leave a call running.
  useEffect(
    () => () => {
      stopTimers();
      void sessionRef.current?.end();
    },
    [stopTimers],
  );

  const value = useMemo<CallContextValue>(
    () => ({
      phase, muted, transcript, fallback, elapsedSeconds, maxSeconds, callId, thinking, reconnecting, parentDetails,
      openCall, closeCall, startCall, endCall, toggleMute,
    }),
    [phase, muted, transcript, fallback, elapsedSeconds, maxSeconds, callId, thinking, reconnecting, parentDetails, openCall, closeCall, startCall, endCall, toggleMute],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}
