---
id: 0063
title: Prompt v9 language and Urdu script
stage: green
date: 2026-09-30
surface: agent
model: claude-opus-5-5
feature: 011-tester-feedback
branch: 011-tester-feedback
user: talhaakhtar257-AI
command: plan mode, then build
labels: ["retell-prompt", "language", "urdu", "tts"]
links:
  spec: specs/011-tester-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - docs/retell-agent-prompt.md (prompt v9)
 - Retell LLM general_prompt updated and agent published
tests:
 - diff against the live Retell prompt before applying: only the planned sections
 - read-back after publish: live prompt identical to the doc (9,581 chars)
---

## Prompt

1- AI changing  language during answering my question. If i am speaking in english, it first reply in engilsh then suddenly answering me in urdu. and continue speaking urdu throughout call while i am speaking in english. 

2- Sometimes when AI reply, it has some glitch in language which is not understandable however, it writes text perfectly while replying. these are some requirments and issue team find them while testing

## Response snapshot

Read both tester calls of 30 Sept from Retell. In the English call, replies slid into Roman Urdu using the prompt's own example phrases ("Ji, maine yeh tafseelat…", "Maazrat chahti hoon"), mostly after tool calls. Every Urdu reply was written in Roman letters, which ElevenLabs pronounces as English, hence the garbled sound with correct text. Prompt v9: a stricter LANGUAGE rule checked before every reply (tool calls never change the language, no Urdu words in English replies); a new URDU SCRIPT section (Urdu only in Urdu script, numbers and classes as Urdu words); every example turned into a labelled English / Urdu-script pair. Measured cost on both calls: 28.3¢/min (was ~80¢), voice 20¢ of it.

## Outcome

- ✅ Impact: replies should stay in the parent's language and Urdu should be pronounced correctly.
- 🧪 Tests: diff and read-back checks; needs a test call to confirm.
- 📁 Files: docs/retell-agent-prompt.md; Retell LLM.
- 🔁 Next prompts: test call — English throughout, then Urdu, then back to English.
- 🧠 Reflection: example phrases in a prompt are copied literally; they must be labelled per language and written in the script the voice should read.

## Evaluation notes (flywheel)

- Failure modes observed: Roman-Urdu examples leaking into English replies; Roman Urdu mispronounced by TTS.
- Graders run and results (PASS/FAIL): PASS (prompt checks).
- Prompt variant (if applicable): prompt v9.
- Next experiment (smallest change to try): if Urdu script still sounds off, test ElevenLabs Multilingual v2 or a native Urdu voice.
