---
id: 0044
title: Diagnose agent leads, latency and repeating
stage: general
date: 2026-09-15
surface: agent
model: claude-opus-5
feature: none
branch: main
user: talhaakhtar257-AI
command: none
labels: ["retell", "leads", "latency", "prompt", "diagnosis"]
links:
  spec: specs/005-voice-landing-page/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - docs/retell-agent-prompt.md
 - history/prompts/general/0044-diagnose-agent-leads-latency-repeating.general.prompt.md
tests:
 - Supabase: 0 leads, 0 gaps; edge logs show no lead/gap writes and no content read during the test call (only the reserve_voice_call gate)
 - curl old -2usd /api/content -> 307 redirect; new domain /api/content -> 401 without secret
 - curl POST /api/unanswered on production with the local secret -> 200 (test row "TEST from Claude - please ignore" created)
---

## Prompt

For so, I trust my agent first first time and it show the call started today. It was five and then it shows six. But it didn't it didn't show the leads, new leads rating, and many more thing it didn't show now. And there is a problem in the agent. It will take some couple of minutes. So couple of seconds for the gap and then answer. And because of this, we are missing our our winners in second and we don't have a Twitter on the papers, and we have a short time and short settings, which are provided by the retail. And if we wait then, we go... we have to move on another retail account. So I don't want to do it. And third thing that if I say if I say the... if I tell the retail his questions answer, so it's he said again to me, uh, is it correct, and he repeat my answer. And it takes many time. What was the solution? Tell me.

## Response snapshot

Diagnosed from Supabase data and logs that Retell never called the website during the call (no content read, no lead, no gap). The website endpoints work: a POST to /api/unanswered with the secret returned 200. The likely cause is Retell tools still pointing at the old -2usd link (it now returns 307), or a wrong or missing X-Agent-Secret header.

Wrote docs/retell-agent-prompt.md with:
- exact tool URLs, headers and JSON parameter schemas;
- speed settings: fast LLM, max responsiveness, Flash voice, no knowledge base or backchannel, content read once with a filler phrase;
- a replacement prompt: short answers, read back only names and phone once, save the lead before goodbye, log gaps, office phone placeholder.

## Outcome

- ✅ Impact: root cause narrowed to Retell configuration; the user has paste-ready tool settings and a prompt.
- 🧪 Tests: DB counts and edge logs inspected; production endpoint returns 200 with the secret; old link returns 307.
- 📁 Files: 1 new doc file (no code, no schema).
- 🔁 Next prompts: user updates Retell tools, settings and prompt, then makes a 1-minute test call; Claude checks the logs; delete the test gap row.
- 🧠 Reflection: renaming the domain silently broke server-to-server tool calls, because redirects work for browsers but not for webhooks.

## Evaluation notes (flywheel)

- Failure modes observed: the domain rename was not propagated to the Retell tool URLs.
- Graders run and results (PASS/FAIL): endpoint curl PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): after the Retell fix, check that the call's edge logs show content, lead and gap requests.
