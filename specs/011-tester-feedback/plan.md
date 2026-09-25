# Tester feedback round 2: pre-call form, faster replies, useful emails, admission form downloads

## Context

The client's team tested the demo again and sent 8 points, plus a complaint about the parent email. I checked their calls in Retell and the database:

| Tester's point | What the data shows | Cause |
|---|---|---|
| Replies very late, no sign it is working | Average reply delay **3.5 s**; the AI model alone took 2 s typically, up to **8 s** | The model on the Retell agent (`gpt-6-astra`) is slow. Also, `save_lead` ran 4 times, each adding a pause |
| Call cut off at 5 minutes | Ended at 4:53 | Our own 5-minute timer (`VOICE_MAX_CALL_SECONDS=300`) |
| Can't call again after one call | The second call failed on Retell's side (`error_retell`, 0 s). That browser also used 4 of its 5 calls for the day | A Retell connection error with no retry and a vague message, plus a low daily limit |
| Half the call spent correcting the name | The lead from that call has **no name**; it was never confirmed | Speech recognition struggles with names |
| "Can't WhatsApp you" / wants the form as a PDF link | — | No way to send the details or a file |
| Keeps saying "call the office" although it has the details | — | Prompt wording |
| Summary email isn't appropriate | The parent got Retell's summary ("the agent could not send WhatsApp…") | Retell writes a summary *about* the call for staff; it was sent to the parent as-is |
| Didn't get the email | That tester didn't type an email | The email box was optional and easy to miss |

**Decisions you made:**
- Calls are allowed **10 minutes**.
- **Name, phone and email are all required** on a short form before the call starts.
- WhatsApp: the assistant **emails the details straight away**, and the call screen gets a **"Send to my WhatsApp"** button. Automatic sending from the school's own WhatsApp stays out of scope for Phase 1.
- **Staff upload the admission form PDF** in a new Downloads section.

---

## Stage A: Faster, longer, reliable calls (mostly settings; small code)

1. **A faster AI model.** Using the Retell API, list the models on the account, switch the agent from `gpt-6-astra` to the fastest one that handles Urdu well (e.g. a "mini" model), and publish. The target is a typical reply delay under 1.5 s, checked on the next call's latency figures.
2. **Fewer pauses from saving.** With the pre-call form (Stage B), `save_lead` only needs to run for class, age and school details, and at the end. Turn off "Talk After Action Completed" on `save_lead` so it saves silently in the background.
3. **10-minute calls.**
   - Retell `max_call_duration_ms` → 600000, done by me through the API.
   - `VOICE_MAX_CALL_SECONDS=600` in Vercel and `.env.local`, done by you.
   - The monthly 500-minute budget currently subtracts the full maximum for every call. With 10 minutes, that would allow only 50 calls. **Change:** when a call ends, the webhook gives back the unused minutes, so the budget counts minutes actually talked.
4. **Calling again.**
   - `VOICE_MAX_CALLS_PER_VISITOR_PER_DAY=10` (set by you).
   - In `components/landing/call/call-provider.tsx`: if Retell fails to connect, retry once automatically.
   - If the retry also fails, show "Couldn't connect — Try again", with a button, instead of "assistant unavailable".
   - A failed call (0 seconds) gives back its daily count and minutes through the webhook.
5. **"Thinking…" indicator.** On the call screen (`call-overlay.tsx`), when the parent has finished speaking and the assistant hasn't started, show animated dots: "Assistant is thinking…" / "اسسٹنٹ سوچ رہا ہے…". This is worked out from the transcript and the existing `onAgentStartTalking` event.
6. **Prompt v6** (`docs/retell-agent-prompt.md`, pushed to Retell by API):
   - Give the office number **only** when handing over, when the parent asks for a person, or once at goodbye. Never after an answer it has already given.
   - Never say "I can't send WhatsApp". Say "I'll send these details to your email now", then call the new `send_details` tool from Stage C.

## Stage B: Pre-call form (name, phone and email typed, never spoken)

- **New `components/landing/call/pre-call-form.tsx`**, shown before the microphone explanation:
  - Name, phone and email, all required, in EN and UR, with 44 px fields.
  - The phone is checked as a Pakistani mobile (`03XXXXXXXXX` or `+923…`), the email with the same pattern as the email box.
  - The office number stays visible.
- **`call-provider.tsx`:** `startCall(details)` passes them to Retell as `retell_llm_dynamic_variables` (`parent_name`, `parent_phone`, `parent_email`). The type already exists in the installed SDK (`CreateWebCallRequest`).
- **New `POST /api/leads/intake`**, following the pattern of `app/api/leads/email/route.ts` (visitor cookie + Retell call check):
  - Once the call is live, the browser sends `{ callId, name, phone, email }`.
  - It creates the lead with `retell_call_id`, **with the name and phone stored as confirmed**, because the parent typed them.
  - It reuses `upsertLeadForCall` in `lib/leads/queries.ts` and `saveParentEmail` in `lib/calls/queries.ts`.
  - **Constitution V note:** typed by the parent counts as confirmed, the same reasoning already used for the email box.
- **Prompt v6:** "The parent's name is {{parent_name}}. You already have their phone number and email — never ask for them or read them back." The email box during the call is removed, since the email is already known.
- **"Send to my WhatsApp" button** on the call-ended screen:
  - A `https://wa.me/<parent's own number>?text=…` link with a short info pack (class, fees, documents, office contacts).
  - It opens WhatsApp's "message yourself" chat. It is user-initiated, with no WhatsApp account or API.

## Stage C: Useful emails, and "send me the details" during the call

- **The parent email is redesigned** (`lib/email/templates.ts`). It **no longer contains Retell's summary**. Instead there is a personal info pack built from the school's published content:
  - "Dear {name}, here are the details you asked for".
  - The class wanted and age, then the monthly and admission fees for that class.
  - The required documents, the admission process steps, and the admission dates.
  - The office hours and number.
  - A download link to the admission form (Stage D).
  - The "not an admission confirmation" line.
  - English, then the same in Urdu.
- **The school email gets more:** the summary, **plus the full conversation transcript** (masked, as stored), plus the parent's typed details and a link to the lead.
- **Retell summary wording**, set through the API: written for the admissions office, factual, never mentioning the assistant's own limitations.
- **New agent tool `send_details`:**
  - **`POST /api/send-details`**, with an `X-Agent-Secret` header, following `app/api/leads/route.ts`. Args: `{ topics: ["fees","documents","process","dates","form"] }`, with the call id taken from Retell's wrapped body.
  - It emails the parent the info pack for those topics right away, and replies `{ sent: true }` so the assistant can say "Sent — check your email".
  - At most 3 sends per call, to stop repeats.
  - The tool definition is added to the Retell agent through the API.

## Stage D: Downloads — staff upload the admission form PDF

- **Database/storage change (plain English, for approval):**
  - A new public file store called `downloads` in Supabase Storage.
  - Only signed-in staff can add or remove files. Anyone with the link can download them.
  - Nothing existing changes.
- **Content gains a "Downloads" list** in `lib/content/schema.ts`: title (EN and UR), file address, size, archived. It follows the `knowledge` pattern added in stage 3, including `parseDoc`, `forPublicApi` and `diff.ts`.
- **Content editor:** a Downloads section to upload a PDF (up to 4 MB, reusing the limits from `lib/knowledge/pdf.ts`), rename it, or remove it. It is drafted and published like everything else.
- **The landing page** shows a Downloads card, e.g. "Admission form (PDF)". The agent's content includes the links, and `send_details` with `form` emails them.

---

## You'll do (about 5 minutes, after Stage A deploys)
- In Vercel, set `VOICE_MAX_CALL_SECONDS=600` and `VOICE_MAX_CALLS_PER_VISITOR_PER_DAY=10`, then Redeploy.
- In Retell → Billing, check the **credit balance** and **concurrency**. A low balance can cause `error_retell` failures.
- Later, upload the demo admission form PDF under Content → Downloads.

## Database changes needing your OK (all additive, no data lost)
1. A small function that gives back unused call minutes (and failed-call counts) when a call ends.
2. The `downloads` file store with staff-only upload.

## Process
- New feature **`011-tester-feedback`**: `/sp.specify` → `/sp.plan` → `/sp.tasks`, then build stages A→D.
- Each stage ends with `npx tsc --noEmit`, lint, build, a merge to main, a deploy and a PHR.
- Retell settings are changed through the API and checked with `check-retell.mjs` afterwards.

## Verification
1. **Stage A:** one test call.
   - Retell's latency figures show e2e p50 under 1.5 s.
   - "Thinking…" appears during pauses.
   - The call runs past 5 minutes.
   - A second and third call in a row both connect.
   - After a call, `voice_usage_monthly` has gone up by the minutes actually used, not 10.
2. **Stage B:**
   - The form refuses a missing or invalid field.
   - The call greets the parent by typed name and never asks for name or phone.
   - The lead shows the name, phone and email **before** the call ends.
   - The WhatsApp button opens WhatsApp with the details.
3. **Stage C:**
   - Ask "email me the documents" during a call: the parent inbox gets the info pack within a minute, and Brevo's log shows Delivered.
   - After the call, the parent email has no "the agent could not…" wording.
   - The school email contains the full conversation.
4. **Stage D:**
   - Upload a PDF, then Publish.
   - The landing page shows the download, and the file opens.
   - Ask for the admission form during a call: the email contains the link.
5. **Every stage:** EN and UR, 360 px width, empty and error states, and the office phone visible.
