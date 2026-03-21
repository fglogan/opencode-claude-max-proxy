---
description: Initialize a new project with deep context gathering and PROJECT.md
argument-hint: "[--auto]"
tools:
  read: true
  bash: true
  write: true
  task: true
  question: true
---
<context>
**Flags:**
- `--auto` — Automatic mode. After config questions, runs research → requirements → roadmap without further interaction. Expects idea document via @ reference.
</context>

<objective>
Initialize a new project through unified flow: questioning → research (optional) → requirements → roadmap.

**Creates:**
- `.planning/PROJECT.md` — project context
- `.planning/config.json` — workflow preferences
- `.planning/research/` — domain research (optional)
- `.planning/REQUIREMENTS.md` — scoped requirements
- `.planning/ROADMAP.md` — phase structure
- `.planning/STATE.md` — project memory

**After this command:** Run `/nsp:plan-phase 1` to start execution.
</objective>

<execution_context>
$(nsp content show workflows new-project --raw)
$(nsp content show references questioning --raw)
$(nsp content show references ui-brand --raw)
$(nsp content show references parity-refactor-guidance --raw)
$(nsp content show templates project --raw)
$(nsp content show templates requirements --raw)
</execution_context>

<process>
Execute the new-project workflow from $(nsp content show workflows new-project --raw) end-to-end.
Preserve all workflow gates (validation, approvals, commits, routing).
</process>
