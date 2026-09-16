---
id: 0048
title: Agent prompt v3 call flow
stage: general
date: 2026-09-16
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhaakhtar257-AI
command: none
labels: ["retell", "prompt", "conversation-flow", "demo"]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - docs/retell-agent-prompt.md
tests:
 - none automated; checked by the next test call and its Supabase logs (expect a content read at the start and a lead with the exact class name)
---

## Prompt

So, well, now, uh, I am telling you what I say and what I can say it'd be. So he say say welcome message and I say what goes around and I'm... मुझे अपनी buddy admission करवाना है. He say, uh, आपने buddy का नाम क्या है? She asks me my daughter name and then my name and then she asks me my number. I'll tell her and after that she asks me to, uh, admission office. She she got her mission to me... to call me, uh, from the admission office, and she show me the number of the admission fee, which is our demo. But the the... this is this is not perfect way what I want. We have to show the demo as like we have a proper content of a demo. Uh, as like a demo, but it should be the perfect life. Uh, if anyone, uh, us, uh, the admission query and process, uh, agent should be properly tell him tell him what what he want, what he want to know. So as like this, If anyone come and start calling, so agent say welcome message and then ask him. How can I... how how can she help him? So the customer or the parents say say her as, like, she want... he want to admit her daughter in the first class. So step by step, agent, talk to him, like, about her previous school and and arts the age. And if... and tell the fees and process what that requirement documents is and many more things, and then ask in the end the number of the parent and the name and the and the student name, then the... tell him the admission office who will call you later. This is the perfect way, but I what I say, this is not perfect. You made it perfect, and you have to think about it, and you have to make it perfect. Think about it and tell in the step by step what to do next.

## Response snapshot

The agent was collecting names and a phone number first and giving information last. The user wants the opposite: help the parent through the admission question first, take contact details at the end.

Rewrote the prompt in `docs/retell-agent-prompt.md` as version 3, built around a fixed 12-step call:
greet and ask what they need → find the class (always ask the child's age) → fresh or transfer, with previous school → monthly and admission fee → admission process → documents on offer → whether admissions are open → any other question, escalation or gap logging → only then child's name, parent's name, phone and consent → read back the two names and number once each → save_lead with the exact class name → close with the office number.

Also added rules for leading the conversation (short answers, offer the next step, never read long lists at once), a "if the parent jumps ahead" rule, and a section describing what a good demo call sounds like, for checking the result.

## Outcome

- ✅ Impact: the demo call should now feel like a real admissions desk, and the lead should carry the class name that matches the published content.
- 🧪 Tests: none automated; the next call's logs are the check.
- 📁 Files: 1 doc file (prompt v3).
- 🔁 Next prompts: user pastes the prompt into Retell, publishes, and makes a demo call; then dashboard auto-refresh.
- 🧠 Reflection: a voice agent needs an explicit ordered script; a list of rules alone let the model choose its own order, which put data capture before help.

## Evaluation notes (flywheel)

- Failure modes observed: information given last, details taken first; no age question; invented class name "5th".
- Graders run and results (PASS/FAIL): none.
- Prompt variant (if applicable): v3 (v1 rules-only, v2 content-first, v3 step-by-step flow).
- Next experiment (smallest change to try): if steps are still skipped, move the enquiry capture into a Retell "state" or second node so the order is enforced by the platform, not only the prompt.
