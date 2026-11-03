# Pending prompt change: send_details is no longer past tense

**Raised**: 2026-11-03, by the feature 013 audit
**Status**: NOT APPLIED. Needs the owner's approval of the Urdu wording, then a
version bump of the published agent (`docs/retell-agent-prompt.md` §2).

## Why

Feature 013 slice B stopped `send_details` blocking the call: the route now
answers Retell and sends the email afterwards. That removed up to eight seconds
of silence mid-conversation, which is what the owner reported on 3 November.

It also broke two lines of prompt v9, which were written when the tool waited
for the email and knew the outcome.

### 1. The agent claims delivery that has not happened

Prompt v9, under `# SENDING DETAILS — never refuse`:

> - Then say politely — English: "I have sent these details to your email."
>   Urdu: "جی، میں نے یہ تفصیلات آپ کی ای میل پر بھیج دی ہیں۔"

Both are past tense and definite. The email is now still in flight when that
sentence is spoken, and if the provider fails the parent has been told something
untrue. Constitution I forbids the agent stating anything that is not so.

The route's `say` field now instructs the agent away from the past tense, which
reduces the risk but does not remove it: the prompt states the sentence
explicitly and the model may prefer it.

### 2. An instruction that can no longer fire

> If send_details reports it could not send, say the admissions office will send
> it when they call.

The tool can no longer report a failure — it returns before the send. A failure
is recorded on `calls.email_error` for staff (FR-006), but the agent never hears
about it, so this line is now dead and the parent is no longer told.

## The change to make

Replace the two bullets with:

```text
- Then say politely — English: "I'm sending these details to your email now."
  Urdu: "میں یہ تفصیلات ابھی آپ کی ای میل پر بھیج رہی ہوں۔"
- If send_details says it could not be sent, or that the details have already
  been sent during this call, say so kindly and give them the office number.
```

**The Urdu needs the owner's eye.** The draft above is the present continuous —
"I am sending these details to your email right now" — to match the English. The
existing line uses "بھیج دی ہیں" (have sent); the draft uses "بھیج رہی ہوں"
(am sending), keeping the feminine verb form the rest of prompt v9 uses for the
assistant.

## Also worth folding into the same version bump

Three items already recorded elsewhere, so one bump covers them all:

1. **The silence timer.** `docs/retell-agent-prompt.md` §2 records 60 seconds as
   decided, with a reason — a 21 September tester was hung up on while fetching
   his sister — and the live agent has always had 30. Never applied.
2. **The three-send cap**, now enforced by the API. Prompt v9's heading says
   "never refuse", which is no longer strictly true after three sends. The
   tool's `say` handles it, but the heading could be softened to
   "never refuse without offering the office".
3. **Boosted keywords.** Retell's own docs say these add transcription delay,
   and the agent has eleven of them. Worth one A/B against the Urdu words
   ("daakhla", "beti") before removing.

## How to apply

A published agent is frozen, so this is a version bump, not an edit
(`docs/retell-agent-prompt.md`):

1. `POST /create-agent-version/{agent_id}` with `{"base_version": 0}`
2. `PATCH /update-agent/{agent_id}?version=<new>` — and the LLM's
   `general_prompt` via `PATCH /update-retell-llm/{llm_id}` on that version
3. `POST /publish-agent-version/{agent_id}` with `{"version": <new>}`
4. Mirror the new wording into `docs/retell-agent-prompt.md` §3

Then one test call: ask for details mid-call and listen for the tense.
