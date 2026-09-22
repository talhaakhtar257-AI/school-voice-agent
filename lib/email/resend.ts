/**
 * Send one email through Resend's web API (research R-010) — a plain fetch,
 * no package. Never throws: a failed email must not stop the call record or
 * the lead from being saved (FR-024), so the caller gets a result to record.
 */
export type SendResult = { ok: true } | { ok: false; error: string };

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);
}

export async function sendEmail(message: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<SendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { ok: false, error: "email not configured" };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [message.to], subject: message.subject, html: message.html, text: message.text }),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return { ok: true };
    // Resend's error body names the problem (e.g. an unverified domain); it
    // never contains the recipient, so it is safe to store.
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, error: `Resend ${res.status}: ${body?.message ?? "error"}`.slice(0, 300) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "network error" };
  }
}
