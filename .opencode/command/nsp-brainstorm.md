---
description: Explore a vague idea through structured questioning — routes to the right workflow automatically
argument-hint: "[idea description]"
tools:
  read: true
  bash: true
  write: true
  task: true
  question: true
  webfetch: true
---
<objective>
Help the user explore and refine a vague idea into something actionable.

This is the specialist **"I have an idea but I'm not sure what it looks like"** entry point. `/nsp:plan` remains the default guided route when the user mainly wants to know what to do next. Use this command when the user explicitly wants idea exploration.

After the idea is clarified, route through the same native current-state guidance backend used by `/nsp:plan` instead of inventing a separate markdown-only routing tree.

It assesses project state and routes appropriately:

**No project exists** (no `.planning/` directory):
- Route to `/nsp:new-project` — the deep questioning phase IS brainstorming

**Project exists but idea is for a new direction/milestone:**
- Discuss the idea using the questioning framework
- If it warrants new phases: add them to ROADMAP.md via `nsp phase add`
- If it warrants a new milestone: route to `/nsp:complete-milestone` first, then `/nsp:new-project` for the next milestone

**Project exists and idea fits within current scope:**
- Use discuss-phase questioning to explore the idea
- Capture decisions and constraints
- Route to `/nsp:plan-phase` or `/nsp:quick` depending on scope
</objective>

<execution_context>
$(nsp content show references questioning --raw)
$(nsp content show references ui-brand --raw)
</execution_context>

<context>
$ARGUMENTS

The user may provide a vague idea description as an argument, or may just invoke the command with no arguments to start an open-ended exploration.
</context>

<process>
## Step 1: Assess project state

```bash
nsp state load --raw 2>/dev/null
```

If this fails (no `.planning/` directory), the project is greenfield. Skip to Step 3a.

If it succeeds, read the output to understand current project context (active phase, roadmap status, etc.).

Also load the native guidance recommendation for consistent handoff language:

```bash
nsp status --raw
```

## Step 1.5: Check for reference material

Scan `$ARGUMENTS` for URLs (matching `https?://[^\s]+`).

If URLs are found:

```bash
nsp ingest <detected-urls> --raw
```

Read the ingested summaries to inform your analysis. Tell the user: "I've ingested those references into your project — you can view them anytime with `nsp ingest --list`."

If no URLs are found, skip this step silently.

## Step 2: Understand the idea

If the user provided an idea description in $ARGUMENTS, acknowledge it and ask 2-3 clarifying questions to understand scope and intent.

If no arguments, ask: "What are you thinking about? Describe the idea, problem, or direction — as vague as you like."

Use the questioning framework from the execution context. Focus on:
- What problem does this solve?
- Who is it for?
- What does success look like?
- How does it relate to the current project (if one exists)?

Aim for 3-5 rounds of questions maximum. The goal is clarity, not exhaustiveness.

## Step 3: Route to the right workflow

### 3a: No project exists
Tell the user: "This sounds like a new project. Let me set it up properly."
Instruct them to run `/nsp:new-project` — or if the brainstorming has produced enough clarity, offer to transition directly into the new-project workflow (load it via `nsp content show workflows new-project --raw` and continue from the requirements step, carrying forward what was discussed).

### 3b: Project exists — idea is a small task
If the idea is concrete and small (a single feature, fix, or improvement that fits in one plan):
Tell the user: "This is small enough for quick mode."
Instruct them to run `/nsp:quick` with the refined task description.

### 3c: Project exists — idea needs a new phase
If the idea is substantial but fits within the current milestone:
1. Propose a phase name and goal
2. Add it via `nsp phase add "phase-name"`
3. Tell the user to run `/nsp:plan-phase <N>` for the new phase

### 3d: Project exists — idea is a new milestone/direction
If the idea represents a significant pivot or new version:
Tell the user this warrants a new milestone. Recommend:
1. `/nsp:complete-milestone` (if current milestone is near done)
2. Then `/nsp:new-project` to set up the new direction

## Step 4: Summarize

Output a clear summary of:
- What the idea is (refined from the discussion)
- What the recommended next step is, using the same command naming the native guidance backend would promote (`/nsp:plan`, `/nsp:quick`, `/nsp:plan-phase`, `/nsp:execute-phase`, or `/nsp:complete-milestone`)
- The exact command to run next
</process>
