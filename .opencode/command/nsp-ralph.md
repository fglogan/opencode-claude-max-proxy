---
description: Autonomous plan→execute→verify loop without human checkpoints
argument-hint: "<phase-number> [--plan-only] [--max-plans N]"
tools:
  read: true
  write: true
  edit: true
  glob: true
  grep: true
  bash: true
  task: true
---

<objective>
Run phase {ARGUMENTS} in fully autonomous ralph mode: plan→execute→verify with
zero human checkpoints. Guardrails prevent runaway execution.
</objective>

<execution_context>
$(nsp content show workflows ralph --raw)
</execution_context>

<context>
Phase: $ARGUMENTS
</context>

<process>
Execute the ralph workflow from execution_context end-to-end.
Respect all guardrails: max_duration_minutes, max_plans, min_confidence, stop_on_human_action.
Write telemetry events at each step using: nsp ralph-run append --run-id $RUN_ID --event-type <type> [options]
</process>
