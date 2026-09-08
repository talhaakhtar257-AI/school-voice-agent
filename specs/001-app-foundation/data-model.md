# Phase 1 Data Model: Application Foundation

**Feature**: 001-app-foundation | **Date**: 2026-09-09

## This feature stores nothing

No tables are created. No rows are written. No entity is defined.

That is not an oversight, and this file is not a placeholder — it is the record of
a deliberate decision, kept so that a later reader does not assume the data model
was forgotten.

**Why there is nothing here:**

- The specification defines no entity. Its Assumptions section states outright that
  no tables are created by this feature.
- `.claude/rules/database.md` requires the maintainer's agreement before any table
  is added, and lists the five tables planned for this phase — `leads`, `calls`,
  `content`, `content_history`, `unanswered_questions`. None of them is needed to
  prove that the application can reach the database.
- FR-009 requires the health check to succeed against a database with no tables,
  which would be impossible to satisfy if this feature created one.

## What the health check touches instead

The reachability check queries no table. It makes an authenticated request to the
database's REST root, which answers without reference to any schema object. See
[research.md](./research.md), Decision 3, and
[contracts/health-check.md](./contracts/health-check.md).

## What comes next

The five tables above arrive with the features that need them, each with its own
specification, its own migration written as a reviewable SQL file, and the
maintainer's agreement first. Every one of them will carry `id`, `created_at` and
`updated_at`, with row level security enabled, per `database.md`.

Nothing in this feature constrains that work or presumes its shape.
