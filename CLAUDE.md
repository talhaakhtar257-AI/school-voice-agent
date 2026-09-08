# School Admission Voice Agent

An AI admissions assistant for a school in Karachi. Parents talk to it in Urdu and
English on a web page. It answers admission questions and captures enquiries as
leads for school staff to follow up. It does not approve admissions.

Three parts: a public landing page, an admin dashboard, and an API that receives
data from the voice agent. The voice agent itself lives on Retell and is
configured outside this codebase.

## Commands

```bash
npm run dev          # local development
npm run build        # production build — must pass before any commit
npm run lint         # linting
npx tsc --noEmit     # type check
```

## Stack

- Next.js App Router, TypeScript
- Supabase for database and staff authentication
- Deployed on Vercel
- Charts: Recharts

## Structure

```
app/
  page.tsx              # public landing page
  api/                  # endpoints called by the Retell agent
  dashboard/            # staff screens, login required
lib/
  supabase/             # database client and queries
components/             # shared UI
.claude/rules/          # detailed rules, loaded per file type
```

## Product rules that affect code

These come from the project constitution. Do not write code that breaks them.

- The agent never confirms an admission and never offers a discount.
- The agent answers only from content stored in the `content` table.
- The agent says clearly that it is an AI when asked.
- Every conversation has a route to a human.
- A lead is saved only after the parent has confirmed their phone number. Names
  are confirmed the same way. An unconfirmed name is left empty and the lead is
  still saved.
- An incomplete lead is still saved. Every field except the timestamp may be empty.
- Never store or log CNIC or B-Form numbers anywhere.
- Every parent-facing screen shows the office phone number.

## Working with me

I am not a developer. I am learning while building this with a real client
deadline.

- Explain in plain English before and after you change code.
- Show me your plan before writing code for anything larger than one file.
- When something fails, tell me what broke and what you are doing about it.
- If my instruction is unclear or contradicts a rule here, stop and ask.
- Do not assume I know a term. Name the file and the folder every time.
- Tell me when you think I am making a mistake. I would rather hear it now.

## Code style

- TypeScript everywhere. No `any` unless you explain why in a comment.
- Named exports. No default exports except Next.js pages and layouts.
- Small files. If a file passes about 200 lines, split it.
- Descriptive names over short ones: `leadsWithTranscripts`, not `data2`.
- Handle errors explicitly. Never swallow an error silently.
- Comments explain why, not what.

## Data safety

- Never put secrets in code. Read from environment variables only.
- Never commit `.env.local` or any file holding a real key.
- Never log a parent's phone number in plain text.
- API endpoints called by the voice agent must check a shared secret header and
  reject any request without it.

## Empty states

Every screen that lists data must render a designed empty state when there is no
data. A blank screen looks broken to the client. This is a requirement, not a
nice-to-have.

## Urdu

- All parent-facing text exists in Urdu and English.
- Transcripts contain Urdu script and must render correctly. Never assume
  Latin-only text.
- Do not use fonts or components that break on right-to-left text.

## Don't

- Don't add a dependency without asking me first.
- Don't refactor code I did not ask you to touch.
- Don't invent school data. Fees, dates, ages and documents come from me only.
- Don't build features that are not in the current feature spec.
- Don't create files unless the task needs them.
- Don't use browser localStorage or sessionStorage.
- Don't add authentication to the public landing page. It stays public.
- Don't mark work finished until `npm run build` passes.

## Definition of done

A task is done when all of these are true:

1. `npm run build` passes.
2. `npx tsc --noEmit` reports no errors.
3. I can check it by clicking, without reading code.
4. Empty states and error states both render.
5. It works on a phone screen width.
6. You have told me in one sentence what changed.

## Current phase

Phase 1 demo, web only. Out of scope: phone number integration, WhatsApp,
payments, document upload, parent accounts, multiple campuses.

If I ask for something on that list, remind me it is out of scope before building.

## SDD workflow

This project is built with Spec Kit Plus. Specification-driven development, in
short: agree the spec, then the plan, then the tasks, then write the code.

Where things live:

- `.specify/memory/constitution.md` — the project principles. The product rules
  above come from here.
- `specs/<feature>/spec.md` — what a feature must do.
- `specs/<feature>/plan.md` — how it will be built.
- `specs/<feature>/tasks.md` — the testable steps.
- `history/prompts/` — Prompt History Records (PHRs).
- `history/adr/` — Architecture Decision Records (ADRs).

### Prompt History Records

After every user prompt, write a PHR recording that prompt verbatim — never
truncated, multiline preserved — plus a short summary of what was done.

- Use the template at `.specify/templates/phr-template.prompt.md`.
- Fill every placeholder. A file with `{{THIS}}` left in it is not finished.
- Route it: constitution work to `history/prompts/constitution/`, feature work
  to `history/prompts/<feature-name>/`, anything else to
  `history/prompts/general/`.
- Report the path afterwards. If it fails, say so, but do not block the task.
- Skip it only for `/sp.phr` itself.

### Architecture Decision Records

When a decision has long-term impact, had several viable alternatives, and cuts
across the system, say:

> 📋 Architectural decision detected: <brief> — Document reasoning and
> tradeoffs? Run `/sp.adr <decision-title>`

Then wait. Never create an ADR without being asked.

The full procedure for both is archived in `.claude/rules/sdd-workflow.md`.
