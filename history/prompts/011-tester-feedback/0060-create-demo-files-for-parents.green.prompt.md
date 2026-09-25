---
id: 0060
title: Create demo files for parents
stage: green
date: 2026-09-25
surface: agent
model: claude-opus-5-5
feature: 011-tester-feedback
branch: 011-tester-feedback
user: talhaakhtar257-AI
command: plan mode, then build
labels: ["downloads", "pdf", "demo-content", "storage"]
links:
  spec: specs/011-tester-feedback/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - Supabase Storage bucket `downloads`: Al-Noor-Admission-Form-2027-28.pdf, Al-Noor-Fee-Structure-2027-28.pdf, Al-Noor-Documents-Checklist.pdf, Al-Noor-School-Prospectus.pdf
 - content (draft channel): 4 `downloads` items added; live channel unchanged
tests:
 - each public URL returns 200 application/pdf
 - draft has 4 downloads, live has 0 (SQL check)
 - one screenshot of the admission form checked for layout and Urdu shaping
---

## Prompt

Upload the admission form PDF: Knowledge → Files for parents → then Publish on the Content screen. Otherwise the emails have no form link to include. create admission form and files for for patents

## Response snapshot

User chose all four files and to press Publish themselves. Built four A4 print pages from the published demo content (fees, ages, documents, process, dates, programs, timings, profile), printed them to PDF with headless Chrome for correct Nastaliq shaping (no project dependency), each marked "DEMO — sample content" with the placeholder phone. Uploaded them to the public `downloads` bucket with the service-role key and appended four bilingual `downloads` items to the draft content with the same optimistic-concurrency rule as the editor. Generator scripts stay in the scratchpad.

## Outcome

- ✅ Impact: admission form, fee structure, documents checklist and prospectus are ready in the draft; one Publish makes them live on the website, in emails and for the assistant.
- 🧪 Tests: URLs serve PDFs; draft/live counts verified.
- 📁 Files: no repo code changed; 4 storage objects; draft content updated.
- 🔁 Next prompts: user publishes, then a test call asking for the admission form.
- 🧠 Reflection: headless Chrome with a separate --user-data-dir was needed because the user's Chrome was already open.

## Evaluation notes (flywheel)

- Failure modes observed: first headless print silently produced nothing while Chrome was running.
- Graders run and results (PASS/FAIL): PASS.
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
