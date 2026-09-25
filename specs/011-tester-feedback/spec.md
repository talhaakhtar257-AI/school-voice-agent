# Feature Specification: Tester Feedback Round 2

**Feature Branch**: `011-tester-feedback`
**Created**: 2026-09-25
**Status**: Built
**Input**: The client's testing team's second review: late replies with no sign of activity, 5-minute cut-off, can't call again, name mis-heard, "can't WhatsApp you", form not available as a PDF link, told to call the office although the assistant has the details, and an unsuitable summary email.

## User Stories

1. **P1 — Details typed, not spoken.** A parent types name, mobile and email before the call. The assistant greets them by name and never asks for or reads back these details. The enquiry exists the moment the call connects.
2. **P1 — A responsive call.** Replies arrive quickly, a "thinking…" indicator shows while the assistant prepares a reply, a call can last 10 minutes, and a failed connection retries once and then offers "Talk again".
3. **P1 — Details sent on request.** When the parent asks for details on WhatsApp, by email, or as a PDF, the assistant emails them straight away. The call screen offers "Save these details on WhatsApp". The office number is given only when needed.
4. **P2 — Useful emails.** The parent receives the details they need (fees for their class, documents, process, dates, the form), not a description of the call. The school receives the summary plus the full conversation.
5. **P2 — Admission form download.** Staff upload PDFs such as the admission form. After Publish they appear on the website and in emails, and the assistant can send them.

## Requirements

- **FR-001** The call cannot start until name, a Pakistani mobile number and an email are entered and valid.
- **FR-002** Typed details are passed to the assistant and saved as the call's lead, marked confirmed, as soon as the call is live.
- **FR-003** A connection that fails before going live is retried once on the same reservation.
- **FR-004** The monthly minute budget counts minutes actually used; unused reserved minutes are released once per call.
- **FR-005** A `send_details` tool emails the parent the requested topics during the call, built only from published content.
- **FR-006** The parent's post-call email contains the info pack, never Retell's summary. The school's contains the summary and the full, masked transcript.
- **FR-007** Staff can upload PDFs of up to 4 MB to a public `downloads` store; only signed-in staff can add or remove them; links go through draft and Publish.

## Out of Scope
- Sending WhatsApp messages from the school's own number (WhatsApp Business API) — a later phase.

## Assumptions
- A name and number typed by the parent count as confirmed (constitution V), as for the email box.
- WhatsApp "message yourself" links (`wa.me/<own number>`) are user-initiated and need no school account.
