import { unstable_cache } from "next/cache";
import { readLiveStrict } from "./queries";
import { isEmptyDoc } from "./schema";
import { agentBrief } from "./agent-brief";

/**
 * The agent's school brief, cached.
 *
 * The agent's prompt makes `get_school_content` the first action of every call,
 * so the parent's first answer waits on this. Measured against production from
 * Karachi before this cache existed: 1.53s, 1.11s, 1.07s, 1.14s, 0.67s — every
 * one of them rebuilding the same brief from a fresh database read and a full
 * Zod parse, against a tool timeout of 5s in Retell. That wait was most of the
 * ~1s the first answer carried over later answers (feature 013, D-002).
 *
 * `unstable_cache` is deliberate: it keeps the value in Next's own data cache,
 * which survives across requests and deployments, so a cold function instance
 * serves the brief without touching the database. The modern replacement,
 * `use cache`, needs `cacheComponents: true` across the whole project — a far
 * bigger change than this feature should make (plan.md, Complexity Tracking).
 *
 * Staleness has two bounds: `revalidateTag` on publish clears it at once, and
 * the 60-second window means a missed invalidation delays a published fee
 * change by a minute rather than forever.
 *
 * A failure is never cached. `readLiveStrict` throws rather than reporting
 * emptiness, the throw propagates out of the cache, and the caller routes the
 * parent to the office — the agent must never answer as though the school had
 * no fees because a database was down (Constitution I and VII).
 */

/** Cleared by the publish action. */
export const AGENT_BRIEF_TAG = "agent-brief";

/** Long enough to help a cold start, short enough that a lost tag self-heals. */
const BRIEF_TTL_SECONDS = 60;

export type LiveBrief =
  | { state: "empty" }
  | { state: "published"; publishedAt: string; brief: string };

async function buildBrief(): Promise<LiveBrief> {
  const live = await readLiveStrict();
  if (!live || isEmptyDoc(live.doc)) return { state: "empty" };
  return {
    state: "published",
    publishedAt: live.updatedAt,
    brief: agentBrief(live.doc),
  };
}

/**
 * Throws if the live content cannot be read. Callers must treat that as "I
 * cannot reach the school's information", never as "the school has no answer".
 */
export const readCachedBrief = unstable_cache(buildBrief, ["agent-brief"], {
  tags: [AGENT_BRIEF_TAG],
  revalidate: BRIEF_TTL_SECONDS,
});
