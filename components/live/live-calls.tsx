"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/lib/language";
import type { LiveCall } from "@/lib/calls/live";
import { formatDuration } from "@/lib/dashboard/format";
import { liveStrings as s } from "@/lib/strings/live-calls";
import { updateLeadStatusAction } from "@/app/dashboard/leads/actions";
import { LanguageTag } from "@/components/dashboard/status-tag";
import ui from "@/components/dashboard/ui.module.css";
import { AutoRefresh } from "./auto-refresh";
import { MonitorPanel } from "./monitor-panel";
import styles from "./live.module.css";

/**
 * The calls happening now (FR-019–FR-021b). The list refreshes every 10
 * seconds; the durations tick every second in between. `staffKey` is passed
 * in by the server page only for signed-in staff, never shipped in public code.
 */
export function LiveCalls({ lang, calls, staffKey }: { lang: Lang; calls: LiveCall[]; staffKey: string | null }) {
  const [watching, setWatching] = useState<string | null>(null);
  const [contacted, setContacted] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, []);

  function callParent(leadId: string) {
    void updateLeadStatusAction(leadId, "contacted").then((result) => {
      if (result.ok) setContacted((prev) => new Set(prev).add(leadId));
    });
  }

  return (
    <>
      <AutoRefresh seconds={10} />
      {!staffKey && <p className={`${ui.muted}`} style={{ margin: "0 20px 14px", fontSize: "0.85rem" }}>{s.notConfigured[lang]}</p>}
      <div className={styles.list}>
        {calls.map((call) => {
          const seconds = Math.max(0, (now - new Date(call.startedAt).getTime()) / 1000);
          const lead = call.lead;
          return (
            <div key={call.id} className={styles.call}>
              <div className={styles.callHead}>
                <span className={styles.liveDot}>{s.live[lang]}</span>
                <div className={styles.facts}>
                  <span>
                    {s.parent[lang]}: <b>{lead?.parentName ? <bdi>{lead.parentName}</bdi> : s.notYet[lang]}</b>
                  </span>
                  {lead?.phone && (
                    <span>
                      <bdi dir="ltr"><b>{lead.phone}</b></bdi>
                    </span>
                  )}
                  <span>
                    {s.running[lang]} <b className={ui.num}><bdi dir="ltr">{formatDuration(seconds)}</bdi></b>
                  </span>
                  <LanguageTag language={call.language} lang={lang} />
                </div>
                <div className={styles.actions}>
                  {staffKey && watching !== call.retellCallId && (
                    <button type="button" className={`${ui.btn} ${ui.btnGhost} ${ui.btnSmall}`} onClick={() => setWatching(call.retellCallId)}>
                      {s.watch[lang]}
                    </button>
                  )}
                  {lead?.phone && (
                    <a
                      href={`tel:${lead.phone.replace(/\s/g, "")}`}
                      className={`${ui.btn} ${ui.btnPrimary} ${ui.btnSmall}`}
                      onClick={() => callParent(lead.id)}
                    >
                      {s.callParent[lang]}
                    </a>
                  )}
                  {lead && contacted.has(lead.id) && <span className={ui.muted} style={{ fontSize: "0.8rem" }}>{s.markedContacted[lang]}</span>}
                </div>
              </div>
              {staffKey && watching === call.retellCallId && (
                <MonitorPanel lang={lang} callId={call.retellCallId} staffKey={staffKey} onClose={() => setWatching(null)} />
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
