---
id: 0068
title: Privacy policy spec
stage: spec
date: 2026-10-08
surface: agent
model: claude-opus-5-5
feature: 012-privacy-policy
branch: 012-privacy-policy
user: talhawork257
command: /sp.specify
labels: ["privacy", "policy", "bilingual", "spec", "qa-followup"]
links:
  spec: specs/012-privacy-policy/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/012-privacy-policy/spec.md
  - specs/012-privacy-policy/checklists/requirements.md
  - history/prompts/012-privacy-policy/0068-privacy-policy-spec.spec.prompt.md
tests:
  - spec quality checklist (all items pass, pass 1)
---

## Prompt

set now demo number and create privacy policy

## Response snapshot

**Demo number.** The owner chose to keep the obviously fake placeholder `021-000-000-000` (asked; this follows the memory rule that demo phone numbers stay obviously fake). No change was made.

**Before writing the spec.** I re-checked the auth settings: public sign-up is still enabled (`disable_signup=false`), and I reminded the owner to switch it off.

I gathered facts from the code so the policy describes only real behaviour:
- **Lead fields:** from the leads table.
- **Call records:** the calls table holds the transcript, summary, `visitor_id` and parent email.
- **Cookies:** `lang` and `visitor_id`.
- **Pre-call form:** name, mobile, optional email and consent.
- **The three contradictory sentences:** in `lib/strings/landing.ts`.

**Branch and spec.** Created branch `012-privacy-policy` from `main`. GitHub's main and the old 011 branch had identical content; main only adds merge commits. The number 12 follows the project's global numbering.

Ran `/sp.specify` and wrote the spec. It has three user stories:
1. A parent reads the policy.
2. The call flow becomes consistent and links to the policy.
3. The school approves the draft.

The spec also has 14 functional requirements and 7 success criteria. The assumptions are:
- retention for the current admission session, with deletion by staff by hand on request
- email is optional
- no cookie banner is needed

Two disclosures were added that the original request missed: staff can listen to or join live calls, and some services store data outside Pakistan. The quality checklist passes.

## Outcome

- ✅ Impact: the spec is ready for `/sp.plan`. The QA "Privacy policy" item has a defined path to PASS.
- 🧪 Tests: the spec quality checklist passes; no code changed.
- 📁 Files: `spec.md`, `checklists/requirements.md`, this PHR.
- 🔁 Next prompts: `/sp.plan` (include the traceability list required by FR-004), then `/sp.tasks`, then `/sp.implement`. The owner still needs to switch off Supabase sign-up.
- 🧠 Reflection: a privacy policy must be derived from the data model and the integrations, not from a feature description. Reading the migrations surfaced the live-listening and outside-Pakistan disclosures.

## Evaluation notes (flywheel)

- Failure modes observed: `.specify/scripts/bash/create-phr.sh` is missing, so the agent-native fallback was used. A grep filter hid local `main`, which caused one failed `git checkout -b`.
- Graders run and results (PASS/FAIL): spec checklist PASS.
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): add the PHR bash script, or point the skill at the PowerShell scripts folder.
