# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [single/web/mobile - determines source structure]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Answer each against `.specify/memory/constitution.md` v1.1.0. Any unchecked box
blocks the plan until it is fixed or justified in Complexity Tracking below.

- [ ] **I. Honesty** — Every fact the agent states traces to the live `content` table. Questions it cannot answer are recorded in `unanswered_questions` and hand off to the office.
- [ ] **II. No Authority** — Nothing here lets the agent confirm an admission, offer a discount, or promise a seat.
- [ ] **III. Disclosure** — The agent identifies itself as an AI when asked; no flow makes it appear human.
- [ ] **IV. Bilingual Prose** — Every parent-facing sentence exists in Urdu and English, and mixed-language sentences render and process correctly. Language-neutral values (fees, dates, ages, class numbers, phone numbers) are stored once and formatted for display, never duplicated into a column per language.
- [ ] **V. Confirm Before Saving** — Phone and name are read back and confirmed before storage; an unconfirmed field is left empty and the lead still saves.
- [ ] **VI. No Sensitive Data** — No CNIC, B-Form, or payment data is collected, stored, or logged; such fields arriving in a request are dropped.
- [ ] **VII. Human Exit** — The office phone number is reachable without scrolling on every parent-facing screen, throughout a conversation.
- [ ] **VIII. Simple Over Clever** — No new abstraction a learning developer could not follow. New dependencies are well known and were agreed first. No file over ~200 lines.
- [ ] **IX. Testable By A Non-Developer** — Every change is verifiable by clicking. Loading, empty and error states all reachable. Works at 360px.
- [ ] **X. Small Steps** — Broken into changes that each build and run on their own. No unrelated refactoring.
- [ ] **Feature sequencing** — The previous feature is implemented and running. This is judged by looking for its code, not its specification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
