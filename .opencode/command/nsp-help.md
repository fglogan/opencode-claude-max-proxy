---
description: Show available NSP commands — structured command palette with categories and recommended routes
---
<objective>
Display the NSP command palette organized by operator job. Present categories, brief descriptions, and one recommended route per job. Output ONLY the structured reference below. Do NOT add:
- Project-specific analysis
- Git status or file context
- Commentary beyond this reference
</objective>

<process>
Output the complete structured command palette reference below.
</process>

<reference>
# NSP Command Palette

**NSP** (Neuro-Symbolic Planner) — spec-driven development with multi-agent orchestration.

Use `/nsp:plan` when unsure where to start. Use the palette below when you already know your job.

---

## Scope — Intake and estimate new work

| Job | Command | Description |
|-----|---------|-------------|
| Route a new work item | `nsp add "<description>"` | EDGS entropy analysis + routing decision in one step |
| Estimate complexity | `nsp decompose "<description>"` | Returns entropy score, task count, topology, time band |

**Recommended route:** `nsp add "<what you want to build>"` — routes the item and tells you whether to plan a phase or quick-task it.

---

## Plan — Create structured execution plans

| Job | Command | Description |
|-----|---------|-------------|
| Plan a phase | `/nsp:plan-phase <N>` | Research + write PLAN.md files for phase N |
| Quick single task | `/nsp:quick <description>` | Plan + execute a one-off task without a full phase |
| Start a new project | `/nsp:new-project` | Full project onboarding: roadmap, phases, first plan |

**Recommended route:** `/nsp:plan-phase <N>` — the standard workflow for phase-level work.

---

## Execute — Run planned work

| Job | Command | Description |
|-----|---------|-------------|
| Execute a phase | `/nsp:execute-phase <N>` | Run all PLAN.md files in phase N sequentially |
| Verify after execution | `/nsp:verify-work <N>` | Goal-backward verification of completed phase N |
| Debug a problem | `/nsp:debug` | Scientific method debug cycle with `.planning/debug/` session |

**Recommended route:** `/nsp:execute-phase <N>` — runs all plans in order, handles SUMMARY.md capture.

---

## Review — Quality and health checks

| Job | Command | Description |
|-----|---------|-------------|
| Run QA scan | `nsp qa` | Aggregate nsp verify + gaps findings into normalized issue list |
| Route issues | `nsp qa --route` | Generate gap closure context for critical/high issues |
| Project health | `nsp verify-health` | Run the full verification suite across all checks |

**Recommended route:** `nsp qa` — covers structural issues, plan consistency, and gaps findings in one pass.

---

## Discover — Understand project state

| Job | Command | Description |
|-----|---------|-------------|
| Project dashboard | `nsp dashboard` | Visual HTML dashboard with phase progress, health, milestones |
| Project status | `nsp status` | One-line JSON snapshot: health, current phase, next action |
| Map codebase | `/nsp:map-codebase` | Generate STACK, ARCH, STRUCTURE, CONCERNS maps |

**Recommended route:** `nsp status` — fast one-liner; use `nsp dashboard` for a visual overview.

---

## Configure — Setup and calibration

| Job | Command | Description |
|-----|---------|-------------|
| Setup wizard | `nsp setup` | Interactive onboarding: create `.planning/` and first phase |
| Recalibrate thresholds | `nsp calibrate` | Scan SUMMARY records, compute accuracy metrics, propose adjustments |
| Install MCP + Skill | `nsp install` | Deploy MCP server and Claude Code Skill for agent-native usage |

**Recommended route:** `nsp setup` — first step for any new project.

---

## MCP Tools (Claude Code / OpenCode)

When running inside Claude Code or OpenCode with NSP installed, these tools are available:

| Tool | When to Use |
|------|-------------|
| `nsp_plan` | Session start, "what next?", after completing work |
| `nsp_dashboard` | Project overview, phase progress, blockers |
| `nsp_decompose` | Estimate complexity before planning |
| `nsp_verify` | Health check, post-execution validation |
| `nsp_ingest` | Ingest URLs, PDFs, videos into `.planning/references/` |

---

*Run `nsp control --json` for the machine-readable palette JSON.*
*Run `nsp palette --raw` for palette data suitable for agent consumption.*
</reference>
