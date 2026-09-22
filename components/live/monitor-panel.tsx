"use client";

import { useEffect, useRef, useState } from "react";
import { RetellClient, type MonitorSession, type SessionStatus } from "retell-client-js-sdk";
import type { Lang } from "@/lib/language";
import { liveStrings as s } from "@/lib/strings/live-calls";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./live.module.css";

type Turn = { role: "agent" | "user"; content: string };

/**
 * Watch, listen to, or take over one live call (FR-021a, research R-004),
 * using Retell's browser library that the landing page already ships.
 * Take over asks first, in the page — never window.confirm — because it
 * cannot be undone. If the microphone is refused, Retell leaves the
 * assistant talking, and this panel says so.
 */
export function MonitorPanel({
  lang,
  callId,
  staffKey,
  onClose,
}: {
  lang: Lang;
  callId: string;
  staffKey: string;
  onClose: () => void;
}) {
  const sessionRef = useRef<MonitorSession | null>(null);
  const [status, setStatus] = useState<SessionStatus | "failed">("connecting");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [micRefused, setMicRefused] = useState(false);
  const [busy, setBusy] = useState(false);
  const transcriptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let session: MonitorSession;
    try {
      session = new RetellClient({ key: staffKey }).monitorCall({
        call_id: callId,
        transcript: true,
        hooks: {
          onStatus: (next) => setStatus(next),
          onTranscript: (full, pre) => {
            const all = [...(pre ?? []), ...(full ?? [])];
            setTurns(
              all
                .filter((u): u is typeof u & Turn => "role" in u && (u.role === "agent" || u.role === "user") && "content" in u)
                .map((u) => ({ role: u.role, content: u.content })),
            );
          },
          onEnd: () => setStatus("ended"),
          onError: (error) => {
            console.error(`[live/monitor] ${error.message}`);
            setStatus((current) => (current === "connecting" ? "failed" : current));
          },
        },
      });
    } catch (error) {
      console.error(`[live/monitor] ${error instanceof Error ? error.message : "unknown"}`);
      // Reported on the next tick: setting state synchronously inside an
      // effect would re-render in a loop.
      const timer = setTimeout(() => setStatus("failed"), 0);
      return () => clearTimeout(timer);
    }
    sessionRef.current = session;
    return () => {
      session.disconnect();
      sessionRef.current = null;
    };
  }, [callId, staffKey]);

  useEffect(() => {
    const box = transcriptRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [turns]);

  async function run(action: (session: MonitorSession) => Promise<void> | void) {
    const session = sessionRef.current;
    if (!session) return;
    setBusy(true);
    try {
      await action(session);
    } catch (error) {
      console.error(`[live/monitor] ${error instanceof Error ? error.message : "unknown"}`);
    } finally {
      setBusy(false);
    }
  }

  async function takeOver() {
    setConfirming(false);
    setMicRefused(false);
    await run(async (session) => {
      try {
        await session.takeOver();
      } catch (error) {
        setMicRefused(true);
        throw error;
      }
    });
  }

  const statusText =
    status === "failed" ? s.failed[lang]
    : status === "connecting" ? s.connecting[lang]
    : status === "listening" ? s.listening[lang]
    : status === "taken_over" ? s.takenOver[lang]
    : status === "ended" ? s.ended[lang]
    : s.monitoring[lang];
  const active = status === "monitoring" || status === "listening" || status === "taken_over";

  return (
    <div className={styles.panel}>
      <p className={`${styles.status} ${status === "failed" ? styles.statusBad : ""}`} role="status">
        {statusText}
      </p>

      <div ref={transcriptRef} className={styles.transcript}>
        {turns.length === 0 ? (
          <p className={ui.muted} style={{ margin: 0 }}>{s.waiting[lang]}</p>
        ) : (
          turns.map((turn, i) => (
            <p key={i} dir="auto" className={`${styles.turn} ${turn.role === "agent" ? styles.agent : styles.user}`}>
              <b>{turn.role === "agent" ? (status === "taken_over" ? s.you[lang] : s.assistant[lang]) : s.parentSaid[lang]}</b>
              {turn.content}
            </p>
          ))
        )}
      </div>

      {micRefused && <p className={styles.statusBad} role="alert">{s.micRefused[lang]}</p>}

      {confirming ? (
        <div className={styles.confirm} role="alertdialog" aria-labelledby="takeover-title">
          <b id="takeover-title">{s.confirmTitle[lang]}</b>
          <p>{s.confirmBody[lang]}</p>
          <div className={styles.actions}>
            <button type="button" className={`${ui.btn} ${ui.btnPrimary}`} onClick={() => void takeOver()} disabled={busy}>
              {s.confirmYes[lang]}
            </button>
            <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={() => setConfirming(false)}>
              {s.cancel[lang]}
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.actions}>
          {status === "monitoring" && (
            <button type="button" className={`${ui.btn} ${ui.btnSoft}`} onClick={() => void run((x) => x.listen())} disabled={busy}>
              {s.listen[lang]}
            </button>
          )}
          {status === "listening" && (
            <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={() => void run((x) => x.stopListening())} disabled={busy}>
              {s.stopListening[lang]}
            </button>
          )}
          {(status === "monitoring" || status === "listening") && (
            <button type="button" className={`${ui.btn} ${ui.btnPrimary}`} onClick={() => setConfirming(true)} disabled={busy}>
              {s.takeOver[lang]}
            </button>
          )}
          {status === "taken_over" && (
            <button type="button" className={`${ui.btn} ${ui.btnPrimary}`} onClick={() => void run((x) => x.end())} disabled={busy}>
              {s.endCall[lang]}
            </button>
          )}
          {!(status === "taken_over") && (
            <button type="button" className={`${ui.btn} ${ui.btnGhost}`} onClick={onClose}>
              {s.stopWatching[lang]}
            </button>
          )}
          {active && <span className={ui.muted} style={{ fontSize: "0.8rem" }}>{s.timeLimit[lang]}</span>}
        </div>
      )}
    </div>
  );
}
