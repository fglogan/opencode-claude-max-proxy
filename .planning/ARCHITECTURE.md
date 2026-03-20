# Genesis IT Architecture Map

## Overview

The Genesis ecosystem is a sophisticated AI agent development and operations platform built around **Neuro-Symbolic Planner (NSP)**, **MCP tools/skills**, and multi-model agent delegation. This proxy serves as a critical bridge enabling Claude Max to participate fully in the OpenCode agent ecosystem without losing multi-provider routing capabilities.

## Core Components

### 1. NSP (Neuro-Symbolic Planner)
- Located in `.planning/`
- Manages **phases** and **plans** (e.g. this 01-analysis phase)
- Each plan is a structured markdown with frontmatter, objective, tasks, verification, success_criteria
- Executors like this one parse plans, execute tasks atomically with per-task commits
- Generates SUMMARY.md, updates STATE.md, ROADMAP.md, LEARNINGS.md
- Supports autonomous execution, checkpoints for human verification/decision/action
- Deviation rules for auto-fixing bugs (Rules 1-3), architectural changes require Rule 4 checkpoint

**Key files:**
- STATE.md: current position, session log, metrics, blockers
- ROADMAP.md: phases, progress tracking
- REQUIREMENTS.md: traceable requirements with status
- LEARNINGS.md: activation learnings log
- PLAN.md files with tasks

### 2. MCP Tools & Skills System
- **MCP** = Model Context Protocol?
- Skills defined in `~/.agents/skills/` with SKILL.md
- Tools like `nsp`, `web-design-guidelines`, `genesis-ai-cleanup`, `vercel-react-best-practices`
- `skill` tool loads specialized instructions/workflows
- `scan_report` tool integrates with gaps scanner
- Dynamic tool registration in passthrough mode

See `src/mcpTools.ts` and `src/proxy/passthroughTools.ts`

### 3. OpenCode Agent Routing & Delegation
- oh-my-opencode or custom agent configs provide multi-model routing
- "Task" tool with agent descriptions parsed by proxy (`agentDefs.ts`)
- Agents like: general, oracle, explore, librarian, plan, build, sisyphus-junior, etc.
- Fuzzy matching handles naming variations
- Proxy enables Claude to delegate to other models via passthrough

### 4. Genesis Gaps Scanner (`.genesis-gaps`)
- Technical debt tracking and code quality analysis
- Used in quick tasks and maintenance
- `gaps scan` command integrated via MCP tool
- Detects phantom imports, duplicate code, structural issues

### 5. Obsidian / CASS Memory Protocol
- Genesis Obsidian vault for knowledge management
- CASS = ? (Context Activation Something System)
- Skill: `genesis-obsidian-cass`
- Session governance checks, Vault Query Panel, `cm` memory commands

### 6. The Proxy (This Project)
- **Role**: Bridge for Claude Max → OpenCode
- Intercepts via Claude SDK PreToolUse hook
- Two modes:
  - **Internal**: Uses custom MCP server with read/write/edit/bash/etc.
  - **Passthrough**: Forwards all tools to OpenCode for proper multi-model execution
- Maintains session continuity across requests
- Error handling, streaming, concurrency management
- Key files: `src/proxy/server.ts`, `src/mcpTools.ts`, `src/proxy/*.ts`

### 7. Other Ecosystem Elements
- **CLI commands**: `nsp:*` orchestrator commands, `gaps`, genesis tools
- **scanner-dashboard.html**: Visual reports from scan_report
- **reference/opencode-upstream/**: Cloned upstream for maintenance
- **AGENTS.md**: Project-specific agent instructions
- **Bun runtime** with Hono server
- Daily maintenance scripts (Phase 4)

## Data Flow (Mermaid Diagram)

```mermaid
flowchart TD
    subgraph "OpenCode Client"
        OC[OpenCode / oh-my-opencode]
        TASK[Task Tool with Agent Defs]
    end

    subgraph "Claude Max Proxy"
        PROXY[Proxy Server<br/>Hono + Anthropic Compat]
        SDK[Claude Agent SDK<br/>query() + PreToolUse]
        HOOK[PreToolUse Hook<br/>Block/Capture Tools]
        SESS[Session Cache<br/>Header or Fingerprint]
        PASSTHROUGH[Passthrough MCP<br/>Dynamic Registration]
    end

    subgraph "Claude SDK Backend"
        CLAUDE[Claude Code Process<br/>sonnet/opus/haiku]
    end

    subgraph "Genesis Ecosystem"
        NSP[NSP Planner<br/>Phases/Plans/SUMMARYs]
        SKILLS[Skills/MCP Tools]
        GAPS[Gaps Scanner]
        OBS[Obsidian + CASS Memory]
        AGENTS[Multi-Model Agents<br/>Grok/GPT/Gemini]
    end

    OC --> PROXY
    PROXY --> SDK
    SDK --> HOOK
    HOOK --> PASSTHROUGH
    PASSTHROUGH --> OC
    SDK --> CLAUDE
    CLAUDE --> PROXY
    PROXY --> NSP
    NSP --> SKILLS
    NSP --> GAPS
    NSP --> OBS
    OC --> AGENTS
```

## Design Decisions Catalog

From PROJECT.md and code:

- **Passthrough Delegation**: Critical to preserve OpenCode's model routing instead of SDK flattening to Claude
- **PreToolUse Hook**: Clean, official way to intercept without forking SDK
- **Session Resume**: Dual header + fingerprint for robust conversation continuity
- **Tool Blocking Strategy**: Prefer OpenCode versions with correct schemas/names
- **Dynamic Agent Parsing**: Automatically adapts to user's configured agents
- **Schema Compatibility Fixes**: Special TodoWrite priority field handling (from previous todo-fixes phase)
- **Concurrency Queuing**: Prevents Bun SSE crashes from parallel SDK processes

## How Proxy Integrates with Ecosystem

1. OpenCode sends messages with tools (including Task with agent list) to proxy
2. Proxy converts to SDK query with appropriate MCP servers/hooks
3. SDK calls Claude which generates tool_uses
4. PreToolUse captures them → blocks execution → proxy returns to OpenCode
5. OpenCode executes via correct model/agent, returns results
6. Proxy streams response back with proper formatting
7. NSP plans guide systematic evolution of the proxy itself

This architecture enables the full power of Genesis agent systems while using Claude Max as the frontend reasoning engine.

## Onboarding Quickstart
- Read ANALYSIS.md for proxy mechanics
- This ARCHITECTURE.md for ecosystem context
- Check ROADMAP.md for current phase
- Run `nsp` commands for planning/execution
- Use skills via the skill tool for specialized tasks

Fulfills ARCH-01 and all must_haves truths. Enables quick onboarding to "why" of passthrough for multi-model support.

Last updated: 2026-03-20
