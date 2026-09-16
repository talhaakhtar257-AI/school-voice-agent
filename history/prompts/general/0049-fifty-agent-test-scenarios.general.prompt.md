---
id: 0049
title: Fifty agent test scenarios
stage: general
date: 2026-09-16
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhaakhtar257-AI
command: none
labels: ["testing", "retell", "demo", "content"]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - docs/agent-test-scenarios.md
tests:
 - Expected answers checked against the live content row (fees, ages, dates, office hours, timings, FAQs, escalation topics, process and documents)
---

## Prompt

make 50 senario asking parents diffirent question which all are related to admission process and queries

## Response snapshot

Wrote `docs/agent-test-scenarios.md`: 50 parent questions in Roman Urdu and English, each with the answer the agent must give, taken from the published content, and a pass mark (answer from content, hand over to the office, log as a gap, or refuse).

Groups: fees (1–8), class and age (9–15), process and documents (16–23), dates and timings (24–29), school and curriculum (30–35), facilities (36–41), money topics that must go to a person (42–45), and rules that must never break, such as never confirming a seat and never taking a B-Form number (46–50).

Three scenarios are deliberately not in the content (yearly fee increase, canteen, hostel) so the gap list fills during the test, which doubles as the best demo moment: answer a gap in the dashboard, publish, ask again.

## Outcome

- ✅ Impact: the user can test the agent methodically instead of ad-hoc, and check answers against real published values.
- 🧪 Tests: expected values verified against the live content row.
- 📁 Files: 1 doc file.
- 🔁 Next prompts: run the scenarios after pasting prompt v3 in Retell; then the dashboard auto-refresh and the real office phone.
- 🧠 Reflection: test cases written from the published data are also a check on the data itself — gaps in the content show up as scenarios with no expected answer.

## Evaluation notes (flywheel)

- Failure modes observed: none new.
- Graders run and results (PASS/FAIL): none automated.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): after a test run, record which scenario numbers failed and feed them back into the agent prompt.
