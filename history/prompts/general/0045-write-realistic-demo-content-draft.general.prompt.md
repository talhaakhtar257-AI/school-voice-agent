---
id: 0045
title: Write realistic demo content draft
stage: general
date: 2026-09-16
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhaakhtar257-AI
command: none
labels: ["content", "demo-data", "urdu", "supabase"]
links:
  spec: specs/003-content-system/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - Supabase content table, draft row (doc replaced; live row untouched)
tests:
 - SQL update returned the draft row with 13 classes, 8 FAQs and 4 programs
 - Hand-checked against lib/content/validate.ts block rules (fees > 0, age ranges, dates in order, hours in order, every bilingual field filled, founded year not in the future)
---

## Prompt

Means you have to create it  with perfection we need to create our content not from real content to show the demo

## Response snapshot

The user overrode the "don't invent school data" caution: they want realistic invented content for the client demo. Replaced the SAMPLE placeholder draft with complete bilingual (EN/UR) demo content for Al-Noor Public School, Gulshan-e-Iqbal:
- Profile: tagline, about and address.
- Figures: 1,250 students, 85 teachers, founded 2004.
- 13 classes (Playgroup to Class 10), with monthly fees of Rs 7,500–12,500, admission fees of Rs 20,000–35,000 and age ranges.
- 3 admission date ranges, office hours (Mon–Fri and Sat) and 3 school timings.
- 4 programs, a 5-step admission process and a 5-item document list.
- 8 FAQs and 3 escalation topics (discounts, special cases, special needs).

The sample banner stays on. The office phone stays the obviously fake placeholder. The user must press Publish.

## Outcome

- ✅ Impact: the demo now looks like a real school site, and the agent will quote consistent, realistic answers once published.
- 🧪 Tests: row counts confirmed; publish rules hand-checked.
- 📁 Files: database draft only; no code change.
- 🔁 Next prompts: user reviews and publishes; finish the Retell "Payload: args only" switch; test call; replace the office phone; rotate the secret key.
- 🧠 Reflection: the no-invented-data rule protects real parents, not demos; the user's explicit demo request plus the kept banner resolves it. Memory updated.

## Evaluation notes (flywheel)

- Failure modes observed: the previous reply refused and handed back a data checklist when the user wanted demo content created.
- Graders run and results (PASS/FAIL): none automated.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): after publishing, ask the agent a fee question and check that it quotes Rs 8,500 for Class 1.
