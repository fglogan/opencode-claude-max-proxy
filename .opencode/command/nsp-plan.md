---
description: Figure out what to do next — reads project state and routes to the right workflow
tools:
  read: true
  bash: true
  glob: true
  grep: true
  task: true
  question: true
---
<objective>
Automatically determine the best next action for the project and route there.

This is the default **"what should I do next?"** entry point. Use one native guidance backend for the recommendation, then guide the user into the matching workflow. Do not maintain a second routing tree in markdown.

The recommendation source of truth is the current-state guidance exposed by `nsp status --raw` (`recommended_command`, `recommended_kind`, `recommended_reason`, plus `next_action` for compatibility).

This command reads project state and routes:

**No project exists:**
- Route to `/nsp:new-project`

**Project exists, no roadmap:**
- Route to `/nsp:new-project` (incomplete initialization)

**Unplanned phases exist:**
- Route to `/nsp:plan-phase` for the next unplanned phase

**All phases planned, unexecuted phases exist:**
- Route to `/nsp:execute-phase` for the next unexecuted phase

**Active phase partially executed:**
- Route to `/nsp:execute-phase` to continue (or `/nsp:execute-phase --gaps-only` if verification failed)

**All phases complete:**
- Route to `/nsp:complete-milestone`

**Milestone complete, no next milestone:**
- Suggest `/nsp:brainstorm` for what's next
</objective>

<execution_context>
$(nsp content show references ui-brand --raw)
</execution_context>

<context>
No arguments needed. This command introspects project state automatically.
</context>

<process>
## Step 1: Check for project

```bash
nsp state load --raw 2>/dev/null
```

If this fails (no `.planning/` directory):
- Output: "No project found. Starting a new one."
- Tell the user to run `/nsp:new-project`
- Stop.

## Step 2: Load current-state guidance

```bash
nsp status --raw
```

Parse the JSON output. Extract:
- `phase` / `phase_name` / `plan`
- `phase_status`
- `recommended_command`
- `recommended_kind`
- `recommended_reason`
- `blockers` / `issues`

Treat this output as the single recommendation backend. Use deeper commands below only when you need extra detail for the response.

## Step 3: Gather supporting context only when needed

```bash
nsp roadmap analyze --raw
```

Use this to explain the recommendation clearly, not to replace it with a second decision tree.

## Step 4: Check for verification gaps

```bash
nsp find-phase --raw 2>/dev/null
```

Look for phases that have VERIFICATION.md with failures when you need to explain a gap-closing recommendation.

## Step 5: Route based on state

Present the assessment clearly:

```
PROJECT STATUS
─────────────
Project: <name>
Active phase: <N> — <name>
Phases: <completed>/<total> complete
```

Then present the native recommendation:

```
Recommended command: <recommended_command>
Why: <recommended_reason>
```

Use `recommended_kind` to decide how to frame the handoff:

### 5a: Verification gaps exist
"Phase <N> has verification failures. Close the gaps first."
→ Recommend: `/nsp:execute-phase <N> --gaps-only`

### 5b: Active phase needs execution
"Phase <N> is planned but not yet executed."
→ Recommend: `/nsp:execute-phase <N>`

### 5c: Next phase needs planning
"Phase <N> is next and needs a plan."
→ Recommend: `/nsp:plan-phase <N>`

### 5d: All phases complete
"All phases are complete. Time to wrap up the milestone."
→ Recommend: `/nsp:complete-milestone <version>`

### 5e: No unfinished work
"Everything is done. What's next?"
→ Recommend: `/nsp:brainstorm` to explore next directions

If `recommended_command` is missing, fall back to `next_action` and explain that the repo needs manual inspection.

## Step 6: Offer to proceed

Ask: "Want me to run this now, or would you like to do something else?"

If the user confirms, load the appropriate workflow and execute it directly.
</process>
