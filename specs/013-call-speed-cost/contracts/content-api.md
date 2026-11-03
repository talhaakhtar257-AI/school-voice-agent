# Contract change: `GET /api/content`

**Feature**: 013-call-speed-cost | Relates to FR-002, FR-003, FR-004, D-002, D-007

## What does not change

The request, the authentication and the response body are **unchanged**. The
agent's tool definition in Retell needs no edit, which is deliberate: a published
agent is frozen and editing it means a version bump
(`docs/retell-agent-prompt.md`).

| | |
|---|---|
| Method and path | `GET /api/content`, optional `?format=brief` |
| Auth | `X-Agent-Secret` header, checked before anything else; missing or wrong → `401` |
| Response (brief) | the same plain-text brief, byte for byte |
| Retell tool timeout | 5,000ms (unchanged, set on the agent) |

## What changes

The brief is served from a cache instead of being rebuilt per request.

| | Before | After |
|---|---|---|
| Route config | `dynamic = "force-dynamic"` | cached read, `revalidate: 60`, tag `agent-brief` |
| Work per request | read the whole content document + full Zod parse + render | cache hit: none. Miss: as before, once |
| Measured, warm, from Karachi | 0.67-1.53s | expected well under the 5s tool timeout with room to spare |
| Freshness after publish | immediate | immediate via `revalidateTag`, and at most 60s if that is missed |

## Behaviour requirements

1. **The secret is still checked first.** Authentication happens before any
   cache is consulted, so an unauthenticated request can neither read the brief
   nor learn whether one is cached. The cached value must not vary by caller.
2. **A cache hit must be indistinguishable** from a fresh read in the response
   body. No cache headers, timestamps or diagnostics are added to what the agent
   receives.
3. **Retrieval failure is not emptiness** (D-007, Principle I and VII). Three
   outcomes must stay distinct:

   | Situation | Response | Why |
   |---|---|---|
   | Content published and readable | the brief | normal |
   | Published content is genuinely empty | the existing empty-content answer | the agent already handles this |
   | The content could not be read at all | an error the agent treats as "I cannot reach the school's information", routing the parent to the office | the agent must never answer as though the school has no fees or classes |

   A failed read MUST NOT be cached, and MUST be logged.
4. **Publishing invalidates.** A successful publish calls
   `revalidateTag("agent-brief")`. A failed publish must not.
5. **No personal data** enters the cache: the brief is school content only.

## Verification

- Call the endpoint twice with the correct secret; the second is materially
  faster and the bodies are identical.
- Call with a wrong secret: `401`, both before and after a cache is warm.
- Publish a changed fee, then start a call within a minute: the agent says the
  new figure.
- With the database unreachable, the agent offers the office rather than
  answering as though there were no content.
