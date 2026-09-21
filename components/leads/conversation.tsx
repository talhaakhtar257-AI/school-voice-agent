import type { Lang } from "@/lib/language";
import type { LeadWithCall } from "@/lib/leads/rows";
import { leadDetailStrings as s } from "@/lib/strings/lead-details";
import { EmptyState } from "@/components/dashboard/empty-state";
import ui from "@/components/dashboard/ui.module.css";
import styles from "./lead-details.module.css";

/**
 * The full conversation as chat bubbles (FR-009). Each line gets dir="auto",
 * because a Karachi call mixes Urdu and English line by line.
 */
export function Conversation({ call, lang }: { call: LeadWithCall["call"]; lang: Lang }) {
  if (!call) return <EmptyState title={s.conversationNone[lang]} />;
  if (!call.transcript || call.transcript.length === 0) {
    return <EmptyState title={call.status === "ongoing" ? s.conversationLive[lang] : s.conversationProcessing[lang]} />;
  }

  return (
    <div className={`${styles.conversation} ${ui.cardBody}`}>
      {call.transcript.map((turn, i) => (
        <p key={i} dir="auto" className={`${styles.turn} ${turn.role === "agent" ? styles.agent : styles.user}`}>
          <b>{turn.role === "agent" ? s.assistant[lang] : s.parent[lang]}</b>
          {turn.content}
        </p>
      ))}
    </div>
  );
}
