# Quickstart: 010 Client Feedback Round

## Settings the maintainer adds (Vercel → Settings → Environment Variables, and `.env.local`)

| Name | Stage | Where to get it |
|---|---|---|
| `RETELL_API_KEY` | 2 | Retell → Settings → API Keys (secret, never `NEXT_PUBLIC_`) |
| `RETELL_STAFF_PUBLIC_KEY` | 4 | Retell → a **second** public key, allowed domain `alnoor-school-admissions.vercel.app`, with call monitoring allowed |
| `BREVO_API_KEY` | 5 | brevo.com → SMTP & API → API Keys. No domain needed: verify one sender address (e.g. the school Gmail) under Senders. Chosen over Resend on 2026-09-22 because Resend without a domain only delivers to the account owner |
| `RESEND_API_KEY` | 5 | Optional fallback, used only if `BREVO_API_KEY` is empty; needs a verified domain |
| `EMAIL_FROM` | 5 | e.g. `Al-Noor Admissions <onboarding@resend.dev>` for the demo |
| `SCHOOL_NOTIFY_EMAIL` | 5 | the school's admissions inbox |

Redeploy after adding them.

## Retell changes

1. **Agent → Webhook URL:** `https://alnoor-school-admissions.vercel.app/api/retell/webhook?secret=<RETELL_WEBHOOK_SECRET>`. Tick the events call started, call ended and call analyzed.
2. **`save_lead` tool:** turn **Payload: args only OFF**, so the website receives the real call id.
3. **Prompt v5:** step 3 calls `save_lead` right after the phone is confirmed, and step 12 calls it again with everything. The website updates the same lead.
   - The prompt also says: "If you'd like a summary by email, type your email in the box on your screen."
4. **Post-call analysis:** make sure "Call summary" is on. It is Retell's default.
5. Press **Publish**.

## Checking each stage by clicking

**Stage 2**
1. Make a call. Give a name and phone, confirm both, and type an email in the box.
2. The Leads screen shows the lead with Name, Contact and Email **during** the call (refresh).
3. After hanging up, wait about 1 minute and refresh. The Summary column is filled.
4. Open the lead:
   - the summary is at the top;
   - the full conversation is below, with Urdu lines right to left.
5. The Overview shows Today and This week numbers, and the last 10 leads.

**Stage 3**
1. The menu shows **Knowledge**. The old `/dashboard/unanswered` address opens Knowledge.
2. Open a question, write an answer, and save. It shows as answered, and the draft FAQs gain it.
3. Add from PDF: a small text PDF becomes a document page.
4. Add from website: a URL becomes a document page with up to 10 pages of text.
5. Publish. A call asking about something only in that document gets the answer.

**Stage 4**
1. Start a call on a phone. On the laptop, the dashboard shows **1 live** within 10 seconds.
2. Watch: the live conversation appears. Listen: you hear it. Take over: after confirming, you talk and the AI goes silent.
3. Hang up. The count returns to 0.

**Stage 5**
1. A call with an email typed → both inboxes receive one email.
2. A call without an email → only the school receives one.
