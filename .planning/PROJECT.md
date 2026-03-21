# opencode-claude-max-proxy

## What This Is

A transparent proxy that lets you use your Claude Max subscription with OpenCode — with full multi-model agent delegation. It intercepts tool calls from the Claude Agent SDK using PreToolUse hook and forwards them to OpenCode for execution, preserving multi-provider routing from oh-my-opencode or custom agent configs.

## Core Value

Passthrough delegation of tool calls and Task agents so that OpenCode's multi-model routing and full agent system prompts are respected instead of being flattened to Claude-only execution.

## Requirements

### Validated

- ✓ Transparent proxy for Claude Agent SDK that supports both internal MCP execution and passthrough to OpenCode
- ✓ PreToolUse hook correctly blocks and forwards tool_use payloads
- ✓ Session resume via headers or fingerprint
- ✓ Schema compatibility for todo tools (fixed in v1.0)

### Active

- [ ] Full test coverage for edge cases in concurrent usage
- [ ] Improved error handling and recovery for Bun SSE crashes
- [ ] Documentation updates and example configurations for common setups

### Out of Scope

- Bypassing Anthropic rate limits or terms — proxy respects official SDK and login
- Implementing full Anthropic API compatibility beyond what's needed for OpenCode
- Running in production without supervision (use for local dev)

## Context

This project was built to solve the limitation where Claude Agent SDK forces all agents to Claude models, losing benefits of multi-model setups in OpenCode/oh-my-opencode. Uses official PreToolUse callback for clean interception without monkey patching.

Technical stack: TypeScript, Bun, Anthropic Claude Agent SDK, with comprehensive test suite (106 tests).

## Constraints

- **Tech stack**: Must use official @anthropic-ai/claude-agent-sdk — no forks
- **Compatibility**: Must work with both internal MCP mode and passthrough mode
- **Performance**: Support concurrent OpenCode instances without blocking

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Passthrough mode for OpenCode | Preserve multi-model routing from oh-my-opencode | ✓ Good |
| Use PreToolUse hook + maxTurns:1 | Clean interception without internal tool execution in SDK | ✓ Good |
| Support both modes | Allow simple internal mode for users not using oh-my-opencode | ✓ Good |
| Special casing for TodoWrite | Schema mismatch between SDK and OpenCode todowrite tool | ✓ Good |

---
*Last updated: 2026-03-20 after recovery repair and todo fixes*

## Global Permanent Version (New Milestone)

**Core Value Extension**: Evolve into a documented, maintainable global multi-provider proxy framework (Claude + Grok + future) with automated upstream monitoring and full internal architecture documentation.

See .planning/REQUIREMENTS.md and .planning/ROADMAP.md for v1 global requirements and phases.
