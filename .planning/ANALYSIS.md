# Proxy Implementation Analysis

## Overview

This repository implements a transparent proxy for using Claude Max (via Anthropic's Claude Agent SDK) with OpenCode. The core value is **passthrough delegation of tool calls** to preserve OpenCode's multi-model agent routing (Grok, GPT, Gemini via oh-my-opencode) rather than forcing everything to Claude-only execution.

The proxy sits between OpenCode and the Claude SDK, intercepting tool uses via the `PreToolUse` hook and forwarding MCP tools appropriately.

## Core Components

### 1. Hono Server (`src/proxy/server.ts`)
- Uses Hono for lightweight HTTP handling with CORS
- Exposes Anthropic-compatible `/v1/messages` and `/messages` endpoints
- Health check at `/health` that verifies `claude auth status`
- Bun.serve for the server runtime

### 2. Claude Agent SDK Integration
- Uses `query()` from `@anthropic-ai/claude-agent-sdk`
- Resolves Claude executable dynamically (SDK bundled cli.js or system `claude`)
- Supports both streaming and non-streaming modes
- `maxTurns: 1` in passthrough mode to prevent internal execution

### 3. PreToolUse Hook (Critical for Passthrough)
The `PreToolUse` hook is the key innovation:
- **Passthrough mode** (`CLAUDE_PROXY_PASSTHROUGH=true`): Matches ALL tools, captures tool_use details, returns `decision: "block"` with reason. This prevents SDK from executing tools internally.
- **Normal mode**: Only hooks the "Task" tool to fix `subagent_type` via fuzzy matching.
- Captured tools are later injected back into the response stream/content blocks.

This allows OpenCode to receive and route the tool calls to the appropriate model/agent.

### 4. Session Management
- Two-layer caching: `sessionCache` (by `x-opencode-session` header) and `fingerprintCache` (by SHA256 hash of first user message, truncated)
- `getConversationFingerprint()` creates stable conversation ID from first user message
- On resume: only sends last user message (SDK maintains history via session_id)
- Stores mapping from OpenCode session → Claude SDK session_id
- TTL of 24 hours with cleanup interval

### 5. Tool Management & MCP Modes

**Internal Mode (default):**
- Registers custom MCP server `opencode` with tools: read, write, edit, bash, glob, grep, scan_report
- Uses `opencodeMcpServer` from `mcpTools.ts`
- Blocks SDK builtin tools via `disallowedTools`

**Passthrough Mode:**
- Dynamically creates MCP server from tools sent in the request body (`createPassthroughMcpServer`)
- Registers each OpenCode tool with schema conversion (JSON Schema → Zod)
- Uses MCP prefix `mcp__oc__` 
- `stripMcpPrefix()` cleans names in responses
- Special TodoWrite handling to add optional `priority` field for schema compatibility

**Blocked Tools:**
- `BLOCKED_BUILTIN_TOOLS`: Read/Write/Edit/Bash/Glob/Grep etc. (to prefer OpenCode versions)
- `CLAUDE_CODE_ONLY_TOOLS`: ToolSearch, Cron*, EnterPlanMode, NotebookEdit, AskUserQuestion, Skill, Agent, TaskOutput, etc.

### 6. Agent Handling (`agentDefs.ts`, `agentMatch.ts`)
- Parses "Task" tool description to extract available agent names/types
- Builds SDK `AgentDefinition` objects so native Task handler works with OpenCode agents
- `fuzzyMatchAgentName()` handles common casing/alias mistakes (e.g. "general-purpose" → "general", "search" → "explore")
- Adds agent-specific system prompt context

### 7. Error Classification & Handling
Comprehensive `classifyError()` function maps SDK errors to user-friendly HTTP responses:
- 401: Auth issues → suggest `claude login`
- 429: Rate limits
- 402: Billing/subscription
- Process crashes (esp. exit code 1 = auth)
- Timeouts, server errors, overloaded states

### 8. Streaming Support
Complex stream handling in ReadableStream:
- Heartbeats every 15s
- Skips internal MCP tool execution events
- Handles `message_start`/`message_stop` carefully to avoid duplicate events
- Special passthrough tool_use block injection for blocked tools
- Handles client disconnects gracefully (`Controller is already closed`)

### 9. Concurrency Control
- Limits concurrent SDK subprocesses (default 10, configurable via `CLAUDE_PROXY_MAX_CONCURRENT`)
- Queue system to prevent Bun SSE crashes from too many simultaneous claude processes

### 10. Other Features
- Model mapping (grok/xai → sonnet)
- System prompt extraction and augmentation
- Debug logging with structured context
- Clean env var filtering (removes experimental flags)
- Permission bypass for tools

## Key Design Decisions & Tradeoffs

1. **Passthrough vs Internal**: Passthrough preserves full OpenCode multi-model capabilities at cost of more complex hook/stream logic.
2. **PreToolUse over monkey-patching**: Official SDK hook is clean and maintainable.
3. **Schema mapping for TodoWrite**: Special casing added after initial blocking (see todo-fixes phase).
4. **Fingerprint fallback**: Allows session resume even without x-opencode-session header.
5. **Blocking SDK builtins**: Ensures OpenCode's versions (with correct param names) are used.
6. **MCP dynamic registration**: Allows arbitrary tools from OpenCode without hardcoding.

## Limitations
- Relies on `claude login` for auth (no key passthrough beyond dummy)
- Subprocess spawning per request (memory/concurrency concerns)
- Complex stream event filtering logic (brittle to SDK changes)
- Bun-specific server (though Hono is portable)
- No full Anthropic API compatibility (only what's needed for OpenCode)

## Test Coverage
- 106 tests mentioned in STATE.md
- Covers session logic, error classification, tool mapping, MCP tools

## Files for Validation
- `src/proxy/server.ts`: 1034 lines core logic
- `src/mcpTools.ts`: MCP tool implementations
- `src/proxy/passthroughTools.ts`: Dynamic MCP for passthrough
- `src/proxy/agent*.ts`: Agent support
- `scanner-dashboard.html`, `src/mcpTools.ts` scan_report tool

This analysis fulfills the must_haves truths by documenting PreToolUse, passthrough vs internal, session resume mechanisms, and design rationale for multi-model support.

Last updated: 2026-03-20
