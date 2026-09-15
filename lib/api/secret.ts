import { timingSafeEqual } from "node:crypto";

/**
 * Checks the voice agent's X-Agent-Secret header against RETELL_WEBHOOK_SECRET
 * (`.claude/rules/api.md`). A plain `!==` stops at the first different
 * character, so response timing can leak how much of a guess was right;
 * timingSafeEqual always compares every byte.
 *
 * An unset secret rejects everything: an unconfigured deployment must never
 * mean "no password".
 */
export function hasValidAgentSecret(request: Request): boolean {
  const expected = process.env.RETELL_WEBHOOK_SECRET;
  const provided = request.headers.get("x-agent-secret");
  if (!expected || !provided) return false;

  const providedBytes = Buffer.from(provided);
  const expectedBytes = Buffer.from(expected);
  // timingSafeEqual needs equal lengths; checking length first reveals only the length.
  return providedBytes.length === expectedBytes.length && timingSafeEqual(providedBytes, expectedBytes);
}
