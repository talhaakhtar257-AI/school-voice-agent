---
id: 0061
title: Move agent to new Retell account, cheaper
stage: green
date: 2026-09-28
surface: agent
model: claude-opus-5-5
feature: 011-tester-feedback
branch: 011-tester-feedback
user: talhaakhtar257-AI
command: direct request
labels: ["retell", "cost", "account-move"]
links:
  spec: specs/011-tester-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - Retell (new account) agent agent_63187a7fde30665cf1000cab5e and its LLM: prompt v7, five tools, webhook, voice and settings copied from the old account; published
 - no repository code changed
tests:
 - dry run on the old account: create agent + LLM from the export, then delete (PASS)
 - create-web-call on the new account with the secret key and the public key: both 201
---

## Prompt

our credits reached and don't have to pay now  we will create and set up new account but at this time we do setting of tokens that it will work perfectly and longer then right now account

i changed public key and agent id and call per visitor not secret key but i pasted this key to env.local the real secrect key

## Response snapshot

Exported the old agent and LLM (prompt, tools with the X-Agent-Secret header, webhook, voice, languages, analysis fields) to a scratchpad file. The user had created a blank template agent in the new account and pointed the site at it, so the export was loaded into that agent in place (same id): model gpt-4.1-mini, call-summary model gpt-5.6-terra → gpt-4.1-mini, silence hang-up 60 s → 30 s, max call 10 min, English + Urdu, voice 11labs-Monika (ElevenLabs v3 kept for Urdu quality). Published. The user's ISP DNS could not resolve api.retellai.com, so the scripts used Google DNS; parents and Vercel are unaffected.

## Outcome

- ✅ Impact: the new account runs the same assistant; estimated about 30–35¢/min instead of about 80¢/min.
- 🧪 Tests: both keys start web calls on the new agent.
- 📁 Files: none in the repo.
- 🔁 Next prompts: user sets RETELL_API_KEY (and RETELL_STAFF_PUBLIC_KEY) in Vercel, redeploys, test call, then measure real cost per minute.
- 🧠 Reflection: the blank template carried an expensive model and a 60-minute limit; updating it in place avoided a second agent id change.

## Evaluation notes (flywheel)

- Failure modes observed: local DNS failure (EAI_AGAIN) for api.retellai.com.
- Graders run and results (PASS/FAIL): PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): ElevenLabs Flash v2.5 voice for one Urdu listening test.
