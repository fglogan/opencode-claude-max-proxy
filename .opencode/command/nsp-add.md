---
description: Scope and route new work using EDGS entropy analysis — shows Phi score, entry point, and recommended next command
argument-hint: "<description of work to assess>"
tools:
  read: true
  bash: true
---

<objective>
Assess the scope of a new work item and route it to the right NSP pipeline entry point.

Run `nsp add` to score the description with EDGS entropy analysis, then present the routing decision clearly so the operator knows exactly what to do next.
</objective>

<execution_flow>

**Step 1 — Run intake routing:**
```bash
nsp add --raw "$ARGUMENTS"
```

Parse the JSON output. Extract: `phi`, `topology`, `entry_point`, `entry_point_label`, `rationale`, `recommended_command`, `task_count_hint`, `confidence`.

**Step 2 — Present the routing decision:**

Show the operator:
- **Phi score** and what it means (the entropy of the work description)
- **Entry point** (which pipeline to use)
- **Topology** (DEEP = sequential, WIDE = parallel, HYBRID = mixed)
- **Recommended command** to run next
- A one-sentence rationale

**Routing table for reference:**

| Phi       | Entry Point         | What it means                              | Next command         |
|-----------|---------------------|--------------------------------------------|----------------------|
| < 3.0     | Inline Task         | Small enough for a single tracked task     | `gt create`          |
| 3.0–8.0  | Single Plan         | One plan, 2–3 tasks, quick execution       | `/nsp:quick`         |
| 8.0–20.0 | Multi-Plan Phase    | Full phase with multiple plans             | `/nsp:plan-phase`    |
| > 20.0    | Milestone Candidate | Multi-phase milestone scope                | `/nsp:new-milestone` |

**Topology modifiers:**
- **WIDE** topology at moderate Phi → consider `/nsp:plan-phase` even in the 3–8 range (tasks can run in parallel waves, not a single sequential chain)
- **HYBRID** → use the recommended entry point but note that parallelism opportunities exist
- **DEEP** → use the recommended entry point as-is (sequential dependencies)

**Step 3 — Offer to proceed:**

Ask the operator: "Ready to proceed with `<recommended_command>`?" and if they confirm, invoke it directly.

If `$ARGUMENTS` is empty or missing, ask: "What work item do you want to scope? Describe it in 1–3 sentences."
</execution_flow>

<context>
Work description: $ARGUMENTS
</context>
