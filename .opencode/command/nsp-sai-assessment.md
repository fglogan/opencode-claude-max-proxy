---
description: Evaluate NSP deployment against LeCun's 4-component SAI architecture and LAIO maturity levels 1–5
argument-hint: "[--json-only] [--verbose]"
tools:
  read: true
  bash: true
  glob: true
---

<objective>
Assess the current NSP deployment against:

1. **LeCun's 4-Component SAI Architecture** — World Model, Cost Module, Actor, Configurator
2. **LAIO Maturity Levels 1–5** — Basic Automation → Full Autonomy with Governance

Produce machine-readable JSON with component scores and maturity level, plus a human-readable summary with the recommended next advancement action.
</objective>

<execution_flow>

**Step 1 — Gather evidence from NSP runtime:**

Run each of these commands and capture the JSON output. If a command fails, record `null` for that evidence source and continue.

```bash
nsp state-snapshot --raw
```
Extract: `current_phase`, `progress_percent`, `health`, `blockers`, `config.calibration` (if present).

```bash
nsp verify-health --raw
```
Extract: `checks` array — count `status: "pass"` vs `"warn"` vs `"fail"`. A system with >70% passing checks has an active Cost Module.

```bash
nsp calibrate --raw
```
Extract: `usable_observations`, `data_quality`, `sufficient_data`, `metrics.task_count_mae`, `metrics.duration_bias_ratio`. Calibration data indicates a feedback loop (Cost Module + self-improvement).

```bash
nsp config-profile-get --raw
```
Extract: `profile`, `guardrail_mode`, `audit_trail`, `laio_principle6_gate`, `hint_mode`.

```bash
nsp phase list --raw
```
Extract: count of phases in `done` vs total phases — indicates Actor operational history.

**Step 2 — Evaluate LeCun 4-Component scores:**

Score each component as `present`, `partial`, or `absent` using the rubric below.

**World Model:**
- `present`: STATE.md exists with current phase data AND ROADMAP.md has milestone structure AND `state-snapshot` returns structured JSON without errors.
- `partial`: STATE.md exists but health=warn, or ROADMAP.md is missing, or `state-snapshot` returns partial data.
- `absent`: No STATE.md or `state-snapshot` fails entirely.

**Cost Module:**
- `present`: `verify-health` passes with >70% checks passing AND calibration data exists (`usable_observations > 0`) AND `data_quality` is not "insufficient".
- `partial`: `verify-health` runs but <70% checks pass, OR calibration data is present but `data_quality == "insufficient"`.
- `absent`: `verify-health` fails to run or returns no checks.

**Actor:**
- `present`: Phase list shows >2 completed phases AND decomposition is operational (calibrate returns non-null metrics).
- `partial`: Phase list shows 1–2 completed phases, or decomposition data is empty.
- `absent`: No completed phases or phase list fails.

**Configurator:**
- `present`: `config-profile-get` returns a named profile (`edge` or `enterprise`, not `none`) AND calibration thresholds are customized (calibrate data shows `sufficient_data: true`).
- `partial`: Profile is `none` but calibration thresholds exist, OR profile is set but guardrails are not enforced (`laio_principle6_gate: false` and `guardrail_mode: "suggestion"`).
- `absent`: No profile set AND no calibration thresholds AND no guardrail configuration.

**Step 3 — Evaluate LAIO Maturity Level:**

Score using highest level where ALL criteria are met:

- **Level 1** (Basic Automation): `state-snapshot` runs → NSP is installed and operational.
- **Level 2** (Adaptive Behavior): World Model = `present` or `partial` → structured project state exists.
- **Level 3** (Self-Monitoring): Cost Module = `present` or `partial` → health verification + calibration active.
- **Level 4** (Self-Improvement): `calibrate` shows `usable_observations >= 5` AND `sufficient_data: true` — feedback loop with enough data for self-adjustment.
- **Level 5** (Full Autonomy with Governance): Configurator = `present` AND `laio_principle6_gate: true` AND `audit_trail: true` — governance gates enforced.

Assign the highest level where all criteria are satisfied. If Level 1 fails, return level 0 (not deployed).

**Step 4 — Determine next advancement:**

Based on current level, recommend the single highest-leverage action:

| Current Level | Next Action |
|---|---|
| 0 | Install NSP: `nsp setup` |
| 1 | Run `nsp state-snapshot` and ensure STATE.md + ROADMAP.md exist — enables Level 2 |
| 2 | Run `nsp verify-health` and resolve any `fail` checks — enables Level 3 |
| 3 | Execute ≥5 phases and run `nsp calibrate` to accumulate prediction data — enables Level 4 |
| 4 | Run `nsp config-profile-set enterprise` to activate LAIO governance gates — enables Level 5 |
| 5 | System is at full LAIO maturity. Consider: extend World Model with `nsp map-codebase`, deepen Cost Module with additional QA planes |

**Step 5 — Output machine-readable JSON:**

Synthesize all evidence into the following JSON object and print it as a fenced code block labeled `json`:

```json
{
  "assessment_timestamp": "<ISO-8601 timestamp>",
  "nsp_version": "<from nsp --version if available, else null>",
  "component_scores": {
    "world_model": {
      "score": "present|partial|absent",
      "evidence": ["<evidence item 1>", "<evidence item 2>"]
    },
    "cost_module": {
      "score": "present|partial|absent",
      "evidence": ["<evidence item 1>", "<evidence item 2>"]
    },
    "actor": {
      "score": "present|partial|absent",
      "evidence": ["<evidence item 1>", "<evidence item 2>"]
    },
    "configurator": {
      "score": "present|partial|absent",
      "evidence": ["<evidence item 1>", "<evidence item 2>"]
    }
  },
  "laio_level": 0,
  "laio_level_label": "Basic Automation|Adaptive Behavior|Self-Monitoring|Self-Improvement|Full Autonomy with Governance",
  "laio_criteria_met": {
    "level_1": true,
    "level_2": true,
    "level_3": false,
    "level_4": false,
    "level_5": false
  },
  "next_advancement": {
    "target_level": 3,
    "action": "<single recommended action>",
    "command": "<nsp command or slash command to run>",
    "rationale": "<1-2 sentences>"
  },
  "raw_evidence": {
    "state_snapshot_health": "<health value or null>",
    "verify_health_pass_rate": 0.0,
    "calibration_observations": 0,
    "calibration_data_quality": "<string or null>",
    "active_profile": "<string or null>",
    "laio_principle6_gate": null,
    "audit_trail": null,
    "completed_phases": 0
  }
}
```

**Step 6 — Print human-readable summary:**

After the JSON block, print a formatted summary:

```
## NSP SAI Assessment — <date>

### LeCun Component Scores
| Component     | Score   | Key Evidence |
|---------------|---------|--------------|
| World Model   | ✓/~/-   | <1-line summary> |
| Cost Module   | ✓/~/-   | <1-line summary> |
| Actor         | ✓/~/-   | <1-line summary> |
| Configurator  | ✓/~/-   | <1-line summary> |

Legend: ✓ = present, ~ = partial, - = absent

### LAIO Maturity: Level <N> — <label>
<1-2 sentence description of what this means for this deployment>

### Next Advancement
**Target:** Level <N+1> — <label>
**Action:** <command or step>
**Rationale:** <1-2 sentences>
```

If `$ARGUMENTS` contains `--json-only`, skip Step 6 and print only the JSON block.
If `$ARGUMENTS` contains `--verbose`, add a `### Evidence Details` section with the full raw command outputs in collapsed `<details>` blocks.
</execution_flow>

<context>
Arguments: $ARGUMENTS

**LeCun 4-Component SAI Architecture:**
The framework defines minimal sufficient architecture for Superhuman Adaptable Intelligence:
- **World Model**: Predicts future world states from current observations + proposed actions. Enables counterfactual reasoning.
- **Cost Module**: Scalar-valued evaluator of state desirability. Encodes objectives and constraints. Drives optimization.
- **Actor**: Generates action sequences that minimize the Cost Module output over the planning horizon.
- **Configurator**: Sets the goal state and configures the Cost Module. Operates at a higher level than the Actor — it defines *what* is desired; the Actor produces *how* to get there.

**LAIO Maturity Levels:**
- **Level 1 — Basic Automation**: Reactive execution, no self-monitoring.
- **Level 2 — Adaptive Behavior**: Structured state tracking, rule-following, basic error handling.
- **Level 3 — Self-Monitoring**: Performance tracking, health signals, anomaly detection.
- **Level 4 — Self-Improvement**: Parameter self-adjustment from performance data, calibration feedback loops.
- **Level 5 — Full Autonomy with Governance**: Autonomous operation within hard constraints, mandatory governance gates, immutable audit trail.

This assessment maps NSP's current capabilities onto this framework to determine deployment maturity and the single highest-leverage next step.
</context>
