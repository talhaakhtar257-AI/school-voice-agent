import { z } from "zod";

/** What Retell's webhook sends. Only the event name and call id are used. */
export const webhookBody = z.object({
  event: z.string().max(100),
  call: z.object({ call_id: z.string().min(1).max(200) }),
});

export const WEBHOOK_EVENTS = ["call_started", "call_ended", "call_analyzed"] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export function isHandledEvent(event: string): event is WebhookEvent {
  return (WEBHOOK_EVENTS as readonly string[]).includes(event);
}

/** The email box on the parent's call screen. */
export const emailBoxBody = z.object({
  callId: z.string().min(1).max(200),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .regex(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "invalid email"),
});
