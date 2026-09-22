/**
 * Send one email with a plain fetch — no package. Two providers:
 *
 * - Brevo (used when BREVO_API_KEY is set): sends from a single verified
 *   address such as the school's Gmail, so no domain has to be bought. Free
 *   plan: 300 emails a day.
 * - Resend (fallback, RESEND_API_KEY): needs a verified domain before it can
 *   send to anyone other than the account owner.
 *
 * Never throws: a failed email must not stop the call record or the lead from
 * being saved (FR-024), so the caller gets a result to record.
 */
export type SendResult = { ok: true } | { ok: false; error: string };

type Message = { to: string; subject: string; html: string; text: string };

export function emailConfigured(): boolean {
  return Boolean((process.env.BREVO_API_KEY || process.env.RESEND_API_KEY) && process.env.EMAIL_FROM);
}

/** EMAIL_FROM may be "Name <address>" or just "address". */
function parseFrom(from: string): { name: string; email: string } {
  const match = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return match ? { name: match[1] || "Al-Noor Admissions", email: match[2].trim() } : { name: "Al-Noor Admissions", email: from.trim() };
}

export async function sendEmail(message: Message): Promise<SendResult> {
  const from = process.env.EMAIL_FROM;
  if (!from) return { ok: false, error: "email not configured" };
  if (process.env.BREVO_API_KEY) return sendWithBrevo(process.env.BREVO_API_KEY, from, message);
  if (process.env.RESEND_API_KEY) return sendWithResend(process.env.RESEND_API_KEY, from, message);
  return { ok: false, error: "email not configured" };
}

async function post(url: string, headers: Record<string, string>, body: unknown, provider: string): Promise<SendResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return { ok: true };
    // The provider's error message names the problem (e.g. an unverified
    // sender); it never contains the recipient, so it is safe to store.
    const data = (await res.json().catch(() => null)) as { message?: string } | null;
    return { ok: false, error: `${provider} ${res.status}: ${data?.message ?? "error"}`.slice(0, 300) };
  } catch (error) {
    return { ok: false, error: `${provider}: ${error instanceof Error ? error.message : "network error"}` };
  }
}

function sendWithBrevo(apiKey: string, from: string, m: Message): Promise<SendResult> {
  return post(
    "https://api.brevo.com/v3/smtp/email",
    { "api-key": apiKey },
    { sender: parseFrom(from), to: [{ email: m.to }], subject: m.subject, htmlContent: m.html, textContent: m.text },
    "Brevo",
  );
}

function sendWithResend(apiKey: string, from: string, m: Message): Promise<SendResult> {
  return post(
    "https://api.resend.com/emails",
    { Authorization: `Bearer ${apiKey}` },
    { from, to: [m.to], subject: m.subject, html: m.html, text: m.text },
    "Resend",
  );
}
