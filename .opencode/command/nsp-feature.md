---
description: Add a specific feature to an existing project — assesses scope and routes to quick or phased workflow
argument-hint: "<feature description>"
tools:
  read: true
  write: true
  edit: true
  bash: true
  glob: true
  grep: true
  task: true
  question: true
---
<objective>
Implement a specific feature in an existing project.

This is the specialist **"I want to add X"** entry point. `/nsp:plan` stays the default guided route when the user wants the repo to tell them what comes next. Use this command when the user already knows the feature they want.

When routing after scope assessment, align the recommendation language with the same native guidance backend used by `/nsp:plan` instead of keeping a second markdown-only command tree.

It assesses scope and routes appropriately:

**No project exists:**
- Error: "No `.planning/` directory found. Run `/nsp:brainstorm` or `/nsp:new-project` first."

**Small scope** (single file change, bug fix, minor enhancement, under ~1 hour of work):
- Route to `/nsp:quick` — fast path with NSP guarantees

**Medium scope** (touches multiple files/systems, needs a plan but fits in one phase):
- Add a phase via `nsp phase add` if needed
- Route to `/nsp:plan-phase` + `/nsp:execute-phase`

**Large scope** (multiple phases, architectural changes, new subsystems):
- Recommend `/nsp:brainstorm` to break it down first, or
- Add multiple phases and plan them sequentially
</objective>

<execution_context>
$(nsp content show references ui-brand --raw)
</execution_context>

<context>
$ARGUMENTS

The user should provide a feature description. If they don't, ask: "What feature do you want to add? Describe what it should do."
</context>

<process>
## Step 1: Validate project exists

```bash
nsp state load --raw 2>/dev/null
```

If this fails: output error message and suggest `/nsp:brainstorm` or `/nsp:new-project`. Stop.

If it succeeds: note the current phase, roadmap status, and any active work.

Also load the current recommendation baseline for consistent phrasing:

```bash
nsp status --raw
```

## Step 1.5: Check for reference material

Scan `$ARGUMENTS` for URLs (matching `https?://[^\s]+`).

If URLs are found:

```bash
nsp ingest <detected-urls> --raw
```

Read the ingested summaries to inform your scope assessment. Tell the user: "I've ingested those references into your project — you can view them anytime with `nsp ingest --list`."

If no URLs are found, skip this step silently.

## Step 2: Understand the feature

If $ARGUMENTS contains a feature description, parse it. Ask 1-2 targeted follow-up questions:
- Is there a specific behavior or API you have in mind?
- Are there constraints (performance, compatibility, dependencies)?

If $ARGUMENTS is empty, ask: "What feature do you want to add? Describe what it should do."

Keep this brief — 1-2 rounds max. The user came with intent, not to brainstorm.

## Step 3: Assess scope

Check the codebase to understand impact:

```bash
nsp state-snapshot --raw 2>/dev/null
```

Consider:
- How many files/modules will this touch?
- Does it need new dependencies or architecture changes?
- Is it a contained change or does it cut across the system?
- Can it be done in a single focused session?

Classify as **small**, **medium**, or **large**.

## Step 4: Route based on scope

### 4a: Small scope — Quick mode
Tell the user: "This is a focused task — using quick mode."

Load the quick workflow and execute it:
```bash
nsp content show workflows quick --raw
```

Follow the quick workflow end-to-end, using the refined feature description as the task.

### 4b: Medium scope — New phase
Tell the user: "This needs a plan. Adding a phase for it."

1. Generate a phase name from the feature description
2. Add the phase:
   ```bash
   nsp phase add "phase-name"
   ```
3. Tell the user to run `/nsp:plan-phase <N>` for the new phase number, or offer to continue directly into planning.

### 4c: Large scope — Multiple phases or brainstorm needed
Tell the user: "This is substantial — it needs to be broken down first."

Recommend either:
- `/nsp:brainstorm` to explore and break it into phases
- Or if the breakdown is obvious, propose 2-3 phases and add them via `nsp phase add`

## Step 5: Confirm next action

State clearly:
- What scope classification was chosen and why
- The exact command or workflow being invoked, using canonical guided commands (`/nsp:quick`, `/nsp:plan-phase`, `/nsp:execute-phase`, `/nsp:complete-milestone`) rather than compatibility paths
- What the user should expect

If routing to quick mode (4a), proceed directly into execution.
If routing to plan-phase (4b/4c), output the command for the user to run.
</process>
