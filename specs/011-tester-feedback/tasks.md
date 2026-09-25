# Tasks: Tester Feedback Round 2

## Stage A — faster, longer, reliable calls
- [x] T001 Switch the Retell model to gpt-4.1-mini; make save_lead silent; max call 10 minutes (Retell API)
- [x] T002 Migration `20260925100000_release_voice_minutes.sql`: `calls.usage_released_at` and `release_voice_minutes()`; mark existing calls settled
- [x] T003 `releaseUnusedMinutes()` in `lib/voice/limits.ts`, called from `app/api/retell/webhook/route.ts` on ended calls
- [x] T004 `call-provider.tsx`: retry a connection that fails before going live, once; "couldn't connect" message
- [x] T005 "Assistant is thinking…" indicator from transcript + onAgentStartTalking
- [ ] T006 Maintainer: Vercel `VOICE_MAX_CALL_SECONDS=600`, `VOICE_MAX_CALLS_PER_VISITOR_PER_DAY=10`, Redeploy; check Retell balance and concurrency

## Stage B — pre-call form
- [x] T007 `components/landing/call/pre-call-form.tsx` + `lib/strings/pre-call.ts` (validation, EN/UR)
- [x] T008 Dynamic variables `parent_name/phone/email` passed to Retell; `POST /api/leads/intake` saves the lead on go-live
- [x] T009 Remove the in-call email box; "Save these details on WhatsApp" button after the call

## Stage C — useful emails and send_details
- [x] T010 `lib/email/info-pack.ts` from published content; `parentDetailsEmail`; school email with transcript
- [x] T011 `POST /api/send-details` + `sendDetailsDuringCall`; `send_details` tool added in Retell
- [x] T012 Prompt v6 and office-focused summary wording pushed to Retell; recorded in `docs/retell-agent-prompt.md`

## Stage D — downloads
- [x] T013 Migration `20260925110000_downloads_bucket.sql` (public bucket, staff-only write, PDF ≤ 4 MB)
- [x] T014 `downloads` list in the content schema, diff and public API
- [x] T015 Upload panel on Knowledge (`components/knowledge/downloads-panel.tsx`, `download-actions.ts`)
- [x] T016 Download links on the landing page's documents section and in the info pack

## Verify
- [ ] T017 One test call per stage checklist in plan.md
