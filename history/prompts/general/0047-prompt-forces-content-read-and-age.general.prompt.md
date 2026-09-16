---
id: 0047
title: Prompt forces content read and age
stage: general
date: 2026-09-16
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhaakhtar257-AI
command: none
labels: ["retell", "prompt", "content", "leads"]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - docs/retell-agent-prompt.md
tests:
 - Supabase: lead at 2026-09-16 11:01 saved with parent name, student name, phone, age 6, class "5th", language ur, consent true
 - Supabase edge logs: no content read during the call (11:00:19 to 11:01:50), so the agent answered without the published content
---

## Prompt

I test the agent, and it is working perfectly. I think it is not saying about... she want to say... but I want that she say because it is working in this way that I talk to him and she ask me my name, my doctor name. And... but there is some missing missing things. She didn't ask me the age of my daughter for the admission. That is not perfect way. and... but there... there is a good thing that he fixed the data and show on the dashboard, but there's problem I have to reload the dashboard, then it show me the new date. And there is some missing and the best... the... you can see the big thing... the big missing is the retail AI prompt is not perfect as per our landing and landing page content and dashboard content, which I published according to the Asia and criteria and fees She is not talking about the landing page.

## Response snapshot

Confirmed from the database and logs: leads now save with real values, but the agent never called `get_school_content` during the call, so it answered from its own guesses — hence "class 5th" for a 6-year-old, which contradicts the published age ranges.

Rewrote `docs/retell-agent-prompt.md`:
- The content read is now the compulsory first action, with an explicit "you have no knowledge of this school other than that result".
- A new section on using the content: exact class names, both fees together, class suggested from the child's age, process and documents read from the content.
- The enquiry order now always includes the child's age as its own question.
- save_lead must send classWanted exactly as in the content, plus retellCallId.
- Tool descriptions strengthened (Retell chooses tools from them), and the Publish-after-changes rule added to the settings table.

## Outcome

- ✅ Impact: once pasted and published in Retell, the agent should quote the published fees, ages and dates instead of inventing them.
- 🧪 Tests: none automated; verified by the next call's logs (expect a content read at the start).
- 📁 Files: 1 doc file.
- 🔁 Next prompts: user pastes the prompt and publishes in Retell, then makes a test call; dashboard auto-refresh offered as a separate change.
- 🧠 Reflection: a tool only runs if the prompt and the tool description both push for it; "answer only from content" was too weak without "you know nothing else".

## Evaluation notes (flywheel)

- Failure modes observed: agent skipped the content tool entirely and improvised class names.
- Graders run and results (PASS/FAIL): none.
- Prompt variant (if applicable): v2 of the agent prompt.
- Next experiment (smallest change to try): if the tool is still skipped, add it as Retell's "begin message" tool call or set the tool as required at conversation start.
