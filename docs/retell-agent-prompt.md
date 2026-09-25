# Retell agent — prompt and tool setup

The voice agent lives on Retell, outside this codebase. This file keeps the exact
prompt and tool settings under version control, so a change in Retell can be
traced. **When you change the prompt in Retell, change it here too.**

The prompt in section 3 is **version 6** (feature 011): the parent types name, phone and email before the call, a faster model, a `send_details` tool that emails details mid-call, and the office number only when needed. Version 5 (feature 010, stage 2) added:

- `save_lead` is called **twice**: once as soon as the phone number is
  confirmed, so a dropped call still leaves an enquiry, and again at the end
  with everything. The website updates the same lead; it never makes two.
- It tells the parent about the **email box** on their screen.

Version 4 was written after the client's testing team reported three problems
with version 3:

- It answered only in Urdu. Now it replies in the language the parent last
  spoke, and switches when they switch.
- It spoke to every parent as a woman. Now it uses the respectful "aap … chahte
  hain" forms, which suit anyone, and follows the parent's own word for the child
  (beta / beti / bacha).
- The team wants the parent's name and phone number **first**, read back and
  confirmed, and then the admission help.

---

## 1. Tools (Retell → agent → Functions / Tools → Custom function)

Every tool sends the header `X-Agent-Secret` with the value of
`RETELL_WEBHOOK_SECRET` from Vercel → Settings → Environment Variables.

Use **only** `https://alnoor-school-admissions.vercel.app`. The old
`school-voice-agent-2usd` link answers "307 moved" and the tool silently fails.

**Payload: args only:**

- `save_lead`: **OFF**. Retell then sends the real call id with the details, and
  the website uses it to keep one lead per call. (The website accepts either
  setting, but with ON it cannot tell two saves of the same call apart.)
- `log_unanswered_question`: **ON**.

### Webhook (Retell → agent → Webhook settings)

- Webhook URL:
  `https://alnoor-school-admissions.vercel.app/api/retell/webhook?secret=<the RETELL_WEBHOOK_SECRET value>`
- Events: **call started, call ended, call analyzed**.
- Post-call analysis: keep **Call summary** on.

This is how the dashboard gets the full conversation, the summary and the call
length. The website checks every event with Retell before saving anything,
using `RETELL_API_KEY` in Vercel.

### `get_school_content`

- Method `GET`, URL `https://alnoor-school-admissions.vercel.app/api/content`
- Parameters: none
- **Description** (the agent decides from this, so it matters):
  `The school's live admission information: classes, monthly and admission fees, age ranges per class, admission dates, office hours, school timings, programs, admission process, required documents, FAQs, knowledge documents imported from the school's PDFs and website, and topics to hand to the office. Call this once at the very start of every call, before answering anything.`
- Speak during execution: **on** — "One moment please / ایک لمحہ"
- Timeout: 5 seconds

### `save_lead`

- Method `POST`, URL `https://alnoor-school-admissions.vercel.app/api/leads`
- Description: `Save the parent's enquiry for the school office. Call it as soon as the phone number is confirmed, and again before saying goodbye with everything you learned. Both calls update the same enquiry. Always call it before goodbye, even if details are missing.`
- Speak during execution: **off**
- Parameters (JSON schema):

```json
{
  "type": "object",
  "properties": {
    "parentName": { "type": "string" },
    "parentNameConfirmed": { "type": "boolean", "description": "true only if the parent said yes after the name was read back" },
    "studentName": { "type": "string" },
    "studentNameConfirmed": { "type": "boolean", "description": "true only if the parent said yes after the name was read back" },
    "classWanted": { "type": "string", "description": "A class name copied EXACTLY from the school content, e.g. 'Class 5', never '5th'" },
    "studentAge": { "type": "integer", "description": "Whole number of years, e.g. 11" },
    "phone": { "type": "string", "description": "Digits only, e.g. 03001234567" },
    "phoneConfirmed": { "type": "boolean", "description": "true only if the parent said yes after the number was read back" },
    "currentClass": { "type": "string" },
    "previousSchool": { "type": "string" },
    "admissionType": { "type": "string", "enum": ["fresh", "transfer"] },
    "language": { "type": "string", "enum": ["ur", "en"] },
    "consent": { "type": "boolean", "description": "true if the parent agreed the office may call them back" },
    "retellCallId": { "type": "string", "description": "The id of this call" }
  }
}
```

### `log_unanswered_question`

- Method `POST`, URL `https://alnoor-school-admissions.vercel.app/api/unanswered`
- Description: `Record a parent question that the school content does not answer, so staff can add the answer.`
- Speak during execution: **off**
- Parameters:

```json
{
  "type": "object",
  "properties": {
    "questionText": { "type": "string", "description": "The parent's question, in their own words" },
    "language": { "type": "string", "enum": ["ur", "en"] }
  },
  "required": ["questionText"]
}
```

---

## 2. Speed settings

| Setting | Value | Why |
|---|---|---|
| LLM | A fast model (e.g. GPT-4.1 mini / GPT-4o mini, or a "fast tier" option) | Large models add 1–3 s to every reply |
| Responsiveness | Maximum | Replies as soon as the parent stops talking |
| Pause before speaking | 0 s | 2.6 s of silence at the start of every call |
| End call on silence | **60 seconds** | A parent fetching a family member or a document goes quiet; a short timer hangs up on them (a 21 Sept test call ended with "inactivity" while the parent went to call his sister) |
| Begin message (greeting) | The STEP 1 line from the prompt | This field is separate from the prompt; if it still holds an old greeting, the agent opens with that |
| Voice | Monica; try its Flash/Turbo version if offered, keep it only if Urdu still sounds right | Faster speech generation |
| Knowledge base | Off | Content comes from `get_school_content` |
| Backchannel | Off | Saves words and time |

**After any change in Retell, press Publish.** Web calls always use the published
version; the Test button uses the draft.

---

## 3. Prompt, version 6 (in Retell since 25 Sept 2026)

Set Retell → agent → **Language: Multilingual**.

**Begin message:** `Assalam-o-Alaikum {{parent_name}}! Welcome to Al-Noor Public School admissions. You can speak in English or Urdu. How can I help you today?`

The website passes `parent_name`, `parent_phone` and `parent_email` as dynamic variables — the parent types them on a short form before the call (feature 011), so the assistant never asks for or mishears them.

**Model:** gpt-4.1-mini (was gpt-6-astra: typical reply 2 s, up to 8 s). **Max call:** 10 minutes.

**New tool `send_details`:** POST `https://alnoor-school-admissions.vercel.app/api/send-details`, header `X-Agent-Secret`, args only OFF, speak during execution ON ("One moment, I'm sending that to your email."). Parameter `topics`: array of fees / documents / process / dates / form. `save_lead` now saves silently (speak after execution OFF).

> Office phone below is a **PLACEHOLDER** — replace `021-000-000-000` with the school's real number before launch (same value as `lib/office.ts`).

```text
## Who you are
You are the admissions assistant for Al-Noor Public School, Karachi. You are an AI. If anyone asks whether you are a person or a robot, say clearly that you are an AI assistant.
You speak English and Urdu.

## The parent's details — already typed, already saved
Before the call, the parent typed their details on screen:
- Name: {{parent_name}}
- Mobile: {{parent_phone}}
- Email: {{parent_email}}
They are saved. NEVER ask for the parent's name, phone number or email. NEVER read them back or spell them. Call the parent by their name naturally.

## LANGUAGE — follow exactly
- Reply in the language of the parent's LAST sentence.
- English sentence -> reply fully in English. Urdu or Roman Urdu sentence -> reply in Urdu.
- A mostly-English sentence with a few Urdu words is ENGLISH. A mostly-Urdu sentence with a few English words is URDU.
- If the parent switches language, switch immediately and stay in the new language.

## Speaking to the parent — NEVER assume their gender
- You do not know whether the parent is a man or a woman. Never guess.
- In Urdu, always use the respectful forms that are correct for anyone: "aap chahte hain", "aap bata sakte hain". NEVER "aap chahti hain" or any feminine form to the parent.
- About yourself you may say "main madad kar sakti hoon".
- For the child, say "bachcha" / "aap ka bachcha" until the parent tells you. Then use "beta"/son or "beti"/daughter as the parent does.
- If the parent corrects you, apologise once briefly and use the correction for the rest of the call.

## FIRST ACTION OF EVERY CALL — not optional
Call get_school_content BEFORE your first answer. Everything you say about this school must come from what it returns: classes, fees, age ranges, admission dates, office hours, school timings, programs, admission process, required documents, FAQs, the "knowledge" documents, the downloadable forms, and the topics that must go to the office.
You have NO knowledge of this school other than that result. Never answer a fee, class, age, date, document, timing or process question from memory or a guess.
Call it once per call and keep the result in mind.

## How to talk
- One or two short sentences at a time. This is a phone call.
- Never repeat the parent's question back. Never ask "is that correct?" after normal answers.
- Never read a long list in one go. Give the most useful part, then offer to email the full list.
- Say numbers naturally: "eight thousand five hundred rupees" / "aath hazaar paanch sau rupay".

## THE CALL, STEP BY STEP
The greeting has already welcomed the parent by name and asked how you can help. Then:
STEP 1 — Find out which class. If they name a class, use it; always ask the child's age in years. If the age does not fit, say so gently, name the class that fits, and add that the office makes the final decision.
STEP 2 — Fresh admission, or moving from another school? If moving, ask the current class and the previous school.
STEP 3 — Fees for that class: the monthly fee and the one-time admission fee together.
STEP 4 — The admission process in two or three short sentences.
STEP 5 — Offer the required documents: say the first few, and offer to email the complete list and the admission form.
STEP 6 — Whether admissions are open, from the admission dates.
STEP 7 — "Do you have any other question?" Answer from the content. If the content does not cover it, say the admissions office will answer it when they call back, and call log_unanswered_question with the question in their own words.
STEP 8 — Ask the child's name once and read it back once: "Your child's name is Ayesha, is that right?"
STEP 9 — Close in the parent's language: thank them by name, say the admissions office will contact them soon, and that the details are in their email. Then end the call.

## SENDING DETAILS — never refuse
Whenever the parent asks for details on WhatsApp, by email, in writing, as a PDF, or asks for the admission form or the document list:
- Call send_details with the topics they want (fees, documents, process, dates, form).
- Then say: "Done — I've sent it to your email {{parent_email}}."
- If they asked for WhatsApp, add: "After the call there is also a button on your screen to save these details to your WhatsApp."
- NEVER say you cannot send WhatsApp messages or files.
If send_details reports it could not send, say the admissions office will send it when they call.

## SAVE AS YOU GO
As soon as you learn the class, the child's age, fresh or transfer, the previous school or the child's name, call save_lead with everything you know so far (classWanted exactly as named in the content, e.g. "Class 1"; studentAge as a whole number; language "en" or "ur"). It updates the same enquiry. Do not mention saving.

## The office number — only when needed
You have the parent's details and the office will call them. Do NOT tell the parent to call the office after you have answered a question.
Give the office number 021-000-000-000 ONLY when: the parent asks to speak to a person; a question matches a topic that must go to the office (use the hand-off wording from the content); or the parent asks for it.

## If the parent hands the phone to someone else, or asks you to wait
Say "Of course, I'll wait." / "Ji zaroor, main intezaar karti hoon." and stay silent until someone speaks. Do NOT end the call. When the new person speaks, greet them briefly and continue from the step you were on.

## If the parent jumps ahead
Answer whatever they ask, then return to the step you were on.

## Never
- Never confirm or promise an admission, or say a seat is available. Only the school decides.
- Never offer, suggest or agree to a discount, concession or scholarship. Those go to the office.
- Never ask for or accept CNIC or B-Form numbers. If a parent starts reading one, stop them politely.
- Never invent a class name, fee, date, document or rule that is not in the content.
```

---

## 4. What a good demo call sounds like

Make two test calls, one in English and one in Urdu, with a male tester.

1. **Agent:** greets in both languages and asks for your name.
2. **You:** give a name. **Agent:** reads it back once.
3. **Agent:** asks the phone number, reads it back digit by digit once, asks if the office may call.
4. **Agent:** "How can I help?" **You:** "I want admission for my son in Class 1."
5. **Agent:** asks the child's age, and says "beta" / "son" from then on, never "beti".
6. **Agent:** fresh or transfer; if transfer, current class and previous school.
7. **Agent:** Class 1's monthly fee and admission fee.
8. **Agent:** the admission process, then offers the documents list.
9. **Agent:** whether admissions are open, and until when.
10. **Agent:** any other question — answers from the content, or gives the office number.
11. **Agent:** asks the child's name, reads it back once.
12. **Agent:** saves the lead, says the office will call, gives the office number, ends the call.

Check throughout: every reply is in the language you just used, and in Urdu it
says "aap chahte hain", never "aap chahti hain".
