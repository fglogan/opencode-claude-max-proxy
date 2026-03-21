# OpenCode Agent Definition Format

Last Updated: 2026-03-21

## Frontmatter Schema

Agent markdown files in `~/.config/opencode/agents/` use YAML frontmatter with the following fields:

```yaml
---
description: "One-line description of what this agent does"
mode: subagent
permission:
  edit: allow | deny
  bash:
    "*": allow
  webfetch: allow
---
```

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `description` | string | Short description shown in agent picker and help text |
| `mode` | string | Must be `subagent` for agents spawned via `task` tool |
| `permission` | map | Permission grants for the agent's capabilities |

### Permission Map

| Key | Values | Notes |
|-----|--------|-------|
| `edit` | `allow` \| `deny` | `allow` for executors, `deny` for planners/verifiers/researchers |
| `bash` | `{"*": "allow"}` | Glob pattern for shell access |
| `webfetch` | `allow` | Web access for research agents |

### Deprecated Fields (do NOT use)

| Field | Replacement |
|-------|-------------|
| `tools:` (map of booleans) | `permission:` (map of allow/deny) |
| `color:` | Removed — no longer used |

## Agent Body

After the frontmatter closing `---`, the markdown body contains the agent's system prompt. Use `<role>` tags for identity, and structure with standard markdown headings.

## 4-Agent Architecture

Each prefix (nsp-*, gsd-*) has exactly 4 agent types:

| Type | Track | Permission | Purpose |
|------|-------|------------|---------|
| `executor` | coding | `edit: allow` | Implements plans, writes code, fixes bugs |
| `verifier` | coding | `edit: deny` | Validates execution against requirements |
| `planner` | planning | `edit: deny` | Creates detailed step-by-step plans |
| `researcher` | planning | `edit: deny` | Investigates codebases and gathers context |

The `general` type is available as a fallback when no specialist type is needed.

## File Naming

- Global agents: `~/.config/opencode/agents/{prefix}-{type}.md`
- Project agents: `.opencode/agents/{prefix}-{type}.md`
- Example: `nsp-executor.md`, `gsd-planner.md`, `explore.md`

## Tool Mapping (OpenCode vs Claude Code)

| OpenCode Tool | Claude Code Equivalent | Notes |
|---------------|----------------------|-------|
| `task` | `Agent` | Spawns subagents |
| `question` | `AskUserQuestion` | Prompts user for input |
| `bash` | `Bash` | Shell execution |
| `read` | `Read` | File reading |
| `edit` | `Edit` | File editing |
| `write` | `Write` | File creation |
| `glob` | `Glob` | File pattern matching |
| `grep` | `Grep` | Content search |
| `webfetch` | `WebFetch` | HTTP requests |
| `todowrite` | `TodoWrite` | Task tracking |
| `skill` | `Skill` | Skill invocation |

When writing agent prompts or commands, always use OpenCode tool names (lowercase). The `/agent` command provides backward compatibility for Claude Code's `Agent` tool.
