---
description: Generate a reproducible upstream review matrix and follow-up actions for the active phase
tools:
  bash: true
  read: true
  edit: true
  question: true
---

<objective>
Review the latest upstream delta for the active phase and produce two phase-scoped artifacts:
- `*-UPSTREAM-REVIEW.md` — complete candidate inventory + adopt/adapt/reject review matrix
- `*-UPSTREAM-ACTIONS.md` — tracked follow-up actions for accepted rows

Use one canonical, reproducible path so upstream intake is not ad hoc.
</objective>

<execution_context>
$(nsp content show workflows review-upstream --raw)
</execution_context>

<process>
**Follow the upstream intake workflow** from `$(nsp content show workflows review-upstream --raw)`.

The workflow handles all logic including:
1. Resolving the active phase and output file paths
2. Capturing the upstream baseline and compare range via `gh`
3. Building a deterministic Candidate Inventory
4. Classifying every candidate row as adopt/adapt/reject
5. Generating an actions backlog for accepted rows only
</process>
