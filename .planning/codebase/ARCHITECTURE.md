# Claude Max Proxy - Architecture

**Document Created:** 2026-03-21  
**Domain:** Proxy server for Anthropic Claude API with OpenCode integration  
**Confidence:** HIGH

## Summary

The Claude Max Proxy is a transparent HTTP proxy that bridges OpenCode to Claude Max via Anthropic's Agent SDK. It operates in two distinct modes—**passthrough** (recommended) and **internal**—that determine how tool execution is handled. The proxy uses Hono as its HTTP framework, implements session resumption via fingerprinting and shared file storage, and leverages the SDK's `PreToolUse` hook for precise tool interception.

**Primary recommendation:** Use passthrough mode (`CLAUDE_PROXY_PASSTHROUGH=1`) for full multi-model agent delegation via OpenCode's routing system.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OpenCode                                        │
│                    (Anthropic API Client)                                    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP (Anthropic API format)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Claude Max Proxy                                    │
│                         (Hono HTTP Server)                                  │
│                                                                             │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────────┐   │
│  │   Router    │──│  Session Manager │──│  Provider Adapter (Claude/  │   │
│  │  /v1/messages│  │  - Header lookup │  │         Grok)               │   │
│  │  /health    │  │  - Fingerprint   │  │                             │   │
│  └─────────────┘  └──────────────────┘  └─────────────────────────────┘   │
│                           │                              │                   │
│                           ▼                              ▼                   │
│                   ┌──────────────┐            ┌─────────────────────┐       │
│                   │  In-Memory   │            │  Claude Agent SDK   │       │
│                   │  Session     │            │  query()            │       │
│                   │  Cache       │            │  (cli.js subprocess)│       │
│                   └──────────────┘            └─────────────────────┘       │
│                           │                              │                   │
│                           ▼                              ▼                   │
│                   ┌──────────────────────────┐  ┌─────────────────────┐       │
│                   │  Shared Session Store   │  │  MCP Tools         │       │
│                   │  (~/.cache/opencode-     │  │  (Internal mode)   │       │
│                   │   claude-max-proxy/      │  │  OR                 │       │
│                   │   sessions.json)         │  │  Passthrough mode:  │       │
│                   └──────────────────────────┘  │  Forward to        │       │
│                                                 │  OpenCode          │       │
│                                                 └─────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SDK query()
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Claude Max                                          │
│                    (Anthropic Agent SDK)                                     │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐    │
│  │  PreToolUse     │  │  Session         │  │  Tool Executor         │    │
│  │  Hook           │──│  Management       │──│  (MCP or SDK internal) │    │
│  │  (Interception) │  │                  │  │                         │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. HTTP Server (Hono)

**File:** `src/proxy/server.ts`

The proxy uses [Hono](https://hono.dev/), a lightweight, high-performance web framework for TypeScript. The server exposes:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Health/status check |
| `/v1/messages` | POST | **Primary** - Anthropic API-compatible message endpoint |
| `/messages` | POST | Alias for `/v1/messages` |
| `/health` | GET | Detailed health including auth status and mode |

**CORS Configuration:**
- `origin: *` (allows remote container access)
- `allowMethods: GET, POST, OPTIONS`
- `allowHeaders: Content-Type, Authorization, X-OpenCode-Session, X-Request-ID`

**Server Initialization Flow:**
```typescript
// 1. Merge user config with defaults
const finalConfig = { ...DEFAULT_PROXY_CONFIG, ...config }

// 2. Initialize providers (Claude, Grok)
initializeProviders()

// 3. Get provider adapter (default: Claude)
const adapter = getProviderAdapter(finalConfig.provider || "claude")

// 4. Create query handler from adapter
const queryHandler = adapter.createQueryHandler(finalConfig)

// 5. Create Hono app and register routes
const app = new Hono()
app.post("/v1/messages", handleWithQueue)
app.post("/messages", handleWithQueue)
app.get("/health", healthCheck)

// 6. Start server with @hono/node-server
serve({ fetch: app.fetch, port, hostname })
```

### 2. Provider Adapter System

**Files:**
- `src/providers/base.ts` - Interface definition
- `src/providers/registry.ts` - Adapter registry
- `src/providers/claude.ts` - Claude implementation
- `src/providers/grok.ts` - Grok/xAI implementation

The provider system enables multi-provider support with a common interface:

```typescript
interface ProviderAdapter {
  name: string
  createQueryHandler(config: ProxyConfig): (queryArgs: any) => AsyncIterable<any>
  supportsPassthrough(): boolean
  getMcpServer(tools?: any): any
}
```

**Claude Adapter:**
- Uses `@anthropic-ai/claude-agent-sdk` `query()` function
- Returns an async generator that yields SDK messages
- Supports full SDK features (PreToolUse hooks, agents, session resume)

**Grok Adapter:**
- Uses OpenAI-compatible API (`openai` package with `baseURL: https://api.x.ai/v1`)
- Translates OpenAI-style responses to Claude SDK message shapes
- Returns async generator with typed `assistant` messages
- `supportsPassthrough(): false` (limited MCP/tool support)

### 3. Session Management

**Files:**
- `src/proxy/server.ts` - In-memory cache
- `src/proxy/sessionStore.ts` - Shared file store

**Two-Tier Session Storage:**

```
┌─────────────────────────────────────────────────────────────┐
│                     In-Memory Cache                          │
│  sessionCache: Map<opencodeSessionId, SessionState>         │
│  fingerprintCache: Map<conversationFingerprint, SessionState>│
│                                                              │
│  SessionState {                                             │
│    claudeSessionId: string,                                  │
│    lastAccess: number,                                      │
│    messageCount: number                                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (shared across proxy instances)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Shared File Store                         │
│  ~/.cache/opencode-claude-max-proxy/sessions.json           │
│                                                              │
│  StoredSession {                                            │
│    claudeSessionId: string,                                  │
│    createdAt: number,                                       │
│    lastUsedAt: number,                                      │
│    messageCount: number                                     │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
```

**Session Lookup Priority:**
1. **Header-based** - `X-OpenCode-Session` header (injected by OpenCode plugin)
2. **Fingerprint-based** - SHA-256 hash of first user message (fallback)

**Resume Flow:**
```typescript
// 1. Extract session ID from header or fingerprint
const opencodeSessionId = c.req.header("x-opencode-session")
const cachedSession = lookupSession(opencodeSessionId, body.messages || [])

// 2. If found, pass resume token to SDK
if (cachedSession?.claudeSessionId) {
  // SDK resumes from existing conversation
  options.resume = cachedSession.claudeSessionId
}

// 3. On new session, capture and store
if (message.session_id) {
  storeSession(opencodeSessionId, body.messages || [], message.session_id)
}
```

**Session TTL:** 24 hours (cleaned hourly by interval)

### 4. Concurrency Control

**Problem:** Each SDK query spawns a subprocess (`cli.js`, ~11MB). Multiple simultaneous subprocesses can crash.

**Solution:** Serialized session queue with configurable limit:

```typescript
const MAX_CONCURRENT_SESSIONS = parseInt(
  process.env.CLAUDE_PROXY_MAX_CONCURRENT || "10", 
  10
)

async function acquireSession(): Promise<void> {
  if (activeSessions < MAX_CONCURRENT_SESSIONS) {
    activeSessions++
    return
  }
  return new Promise<void>((resolve) => {
    sessionQueue.push({ resolve })
  })
}

function releaseSession(): void {
  activeSessions--
  const next = sessionQueue.shift()
  if (next) {
    activeSessions++
    next.resolve()
  }
}
```

---

## Proxy Modes

### Internal Mode (Default)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   OpenCode  │────▶│    Proxy     │────▶│ Claude Max  │
│             │◀────│  (Internal)   │◀────│   (SDK)     │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  MCP Tools   │
                    │  (read, write│
                    │   edit, bash)│
                    └──────────────┘
```

**Characteristics:**
- Tools execute inside proxy via MCP
- Subagents run on Claude via SDK's native agent system
- All agents use Claude regardless of OpenCode config
- Simpler setup, no multi-model delegation

**MCP Tools (Internal Mode):**
| Tool | Purpose | Implementation |
|------|---------|----------------|
| `read` | Read file contents | `fs.readFile` with path resolution |
| `write` | Write file with directory creation | `fs.writeFile` with `mkdir -p` |
| `edit` | Replace oldString with newString | `fs.readFile` → `replace` → `write` |
| `bash` | Execute shell commands | `child_process.exec` with 120s timeout |
| `glob` | Find files matching pattern | `glob` library, excludes node_modules/.git |
| `grep` | Regex search in files | `grep -rn` with 10MB buffer |
| `scan_report` | Run gaps/static analyzer | CLI invocation of external scanners |

**Tool Schema Mapping:**
The SDK uses different parameter names than OpenCode:
- SDK: `file_path`, `old_string`
- OpenCode: `path`, `oldString`

Internal MCP tools expose SDK-compatible parameter names.

### Passthrough Mode (Recommended)

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   OpenCode  │────▶│    Proxy     │────▶│ Claude Max  │
│             │     │ (Passthrough)│     │   (SDK)     │
└─────────────┘     └──────────────┘     └─────────────┘
       ▲                   │
       │                   │ PreToolUse hook blocks execution
       │                   │ Captures tool_use blocks
       │                   │
       │                   ▼
       │            ┌──────────────┐
       │            │ Passthrough  │
       │            │ MCP Server   │
       │            │ (no-op tools)│
       │            └──────────────┘
       │                   │
       │                   │ Returns tool_use blocks
       │                   │ to OpenCode as response
       │                   ▼
       │            ┌──────────────┐
       └────────────│   OpenCode   │
         tool_result│ Agent System │──▶ Routes to GPT-5.4, Gemini, etc.
                    └──────────────┘
                           │
                           │ Claude continues
                           ▼
                    ┌──────────────┐
                    │  SDK Session  │
                    │    Resumed    │
                    └──────────────┘
```

**Characteristics:**
- All tool execution forwarded to OpenCode
- Enables multi-model agent delegation (oh-my-opencode)
- Full agent system prompts (not abbreviated descriptions)
- OpenCode manages tools, agents, permissions, lifecycle

**PreToolUse Hook (Passthrough):**
```typescript
{
  matcher: "", // Match ALL tools
  hooks: [async (input: any) => {
    // Capture tool call
    capturedToolUses.push({
      id: input.tool_use_id,
      name: stripMcpPrefix(input.tool_name),  // Remove mcp__oc__ prefix
      input: input.tool_input,
    })
    // Block SDK execution
    return {
      decision: "block" as const,
      reason: "Forwarding to client for execution",
    }
  }]
}
```

**Tool Execution Flow (Passthrough):**
1. Claude generates `tool_use` blocks via SDK
2. PreToolUse hook fires, captures tool calls, blocks execution
3. `maxTurns: 1` ensures SDK stops after blocking
4. Proxy returns tool_use blocks to OpenCode as response
5. OpenCode executes via its agent system (GPT, Gemini, etc.)
6. OpenCode sends `tool_result` to continue SDK session
7. SDK resumes, Claude continues

### Mode Comparison

| Aspect | Passthrough | Internal |
|--------|-------------|----------|
| Tool execution | OpenCode | Proxy (MCP) |
| Agent delegation | OpenCode → multi-model | SDK → Claude only |
| oh-my-opencode models | ✅ Respected | ❌ All Claude |
| Agent system prompts | ✅ Full | ⚠️ Description only |
| Setup complexity | Same | Same |
| PreToolUse hook | Blocks all tools | Fixes Task agent names |

---

## Data Flow

### Streaming Request Flow

```
OpenCode                              Proxy                          Claude SDK
   │                                     │                                │
   │──── POST /v1/messages ─────────────▶│                                │
   │                                     │                                │
   │                                     │── query() ────────────────────▶│
   │                                     │                                │
   │                                     │                           ┌─────┴─────┐
   │                                     │                           │ SDK runs  │
   │                                     │                           │ cli.js    │
   │                                     │                           │ subprocess│
   │                                     │                           └─────┬─────┘
   │                                     │                                │
   │                                     │◀──── SSE stream events ─────────┤
   │                                     │   (content_block_start,        │
   │                                     │    content_block_delta,         │
   │                                     │    message_delta, etc.)        │
   │                                     │                                │
   │                                     │   [PreToolUse intercepts]     │
   │                                     │                                │
   │◀── SSE: tool_use blocks ────────────│                                │
   │   (stop_reason: tool_use)          │                                │
   │                                     │                                │
   │ [OpenCode executes tool]            │                                │
   │                                     │                                │
   │──── tool_result ───────────────────▶│                                │
   │                                     │── resume SDK ──────────────────▶│
   │                                     │                                │
   │◀── SSE: continuation ───────────────│                                │
   │                                     │                                │
   │◀── SSE: message_stop ───────────────│                                │
   │                                     │                                │
```

### Non-Streaming Request Flow

```
OpenCode                              Proxy                          Claude SDK
   │                                     │                                │
   │──── POST /v1/messages ─────────────▶│                                │
   │                                     │── query() ────────────────────▶│
   │                                     │                                │
   │                                     │                           ┌─────┴─────┐
   │                                     │                           │ SDK runs  │
   │                                     │                           │ to        │
   │                                     │                           │ completion│
   │                                     │                           └─────┬─────┘
   │                                     │                                │
   │                                     │◀──── complete response ─────────┤
   │                                     │   (all content blocks)         │
   │                                     │                                │
   │◀── JSON: full response ─────────────│                                │
   │   (content[], stop_reason)         │                                │
   │                                     │                                │
```

---

## PreToolUse Hook System

**Purpose:** Intercept tool calls before SDK execution for modification or blocking.

### Hook Configuration

```typescript
interface PreToolUseHook {
  matcher: string | ""  // "" = all tools, or specific tool name
  hooks: Array<(input: ToolInput, ...args) => HookResult>
}

interface HookResult {
  decision?: "allow" | "block" | "modify"
  reason?: string
  hookSpecificOutput?: {
    hookEventName: "PreToolUse"
    updatedInput?: object  // Modified tool input
  }
}
```

### Internal Mode Hook (Task Agent Name Fix)

```typescript
// When validAgentNames extracted from Task tool:
{
  matcher: "Task",  // Only match Task tool
  hooks: [async (input) => ({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      updatedInput: {
        ...input.tool_input,
        subagent_type: fuzzyMatchAgentName(
          String(input.tool_input?.subagent_type || ""),
          validAgentNames
        )
      }
    }
  })]
}
```

### Passthrough Mode Hook (Block All)

```typescript
// When CLAUDE_PROXY_PASSTHROUGH=1:
{
  matcher: "",  // Match ALL tools
  hooks: [async (input) => {
    // Capture for later replay
    capturedToolUses.push({
      id: input.tool_use_id,
      name: stripMcpPrefix(input.tool_name),
      input: input.tool_input
    })
    // Block execution
    return {
      decision: "block",
      reason: "Forwarding to client for execution"
    }
  }]
}
```

---

## Agent Definition Extraction

**File:** `src/proxy/agentDefs.ts`

OpenCode sends a `Task` tool with agent descriptions in its description text:

```
Available agent types and the tools they have access to:
- build: Default agent
- plan: Plan mode
- oracle: Read-only consultation agent
- explore: Contextual grep for codebases
```

**Extraction Flow:**
```typescript
// 1. Parse from Task tool description
parseAgentDescriptions(taskDescription)
// Returns: Map<"oracle", "Read-only consultation agent">

// 2. Build SDK AgentDefinition objects
buildAgentDefinitions(taskDescription, mcpToolNames)
// Returns: Record<name, { description, prompt, model, tools }>
```

**SDK AgentDefinition Interface:**
```typescript
interface AgentDefinition {
  description: string
  prompt: string
  model?: "sonnet" | "opus" | "haiku" | "inherit"
  tools?: string[]
  disallowedTools?: string[]
}
```

---

## Fuzzy Agent Name Matching

**File:** `src/proxy/agentMatch.ts`

When Claude sends an invalid `subagent_type` (e.g., "Explore" instead of "explore"), the hook rewrites it using 7-level priority matching:

| Priority | Technique | Example |
|----------|-----------|---------|
| 1 | Exact (case-insensitive) | `Explore` → `explore` |
| 2 | Known aliases | `general-purpose` → `general` |
| 3 | Prefix match | `lib` → `librarian` |
| 4 | Substring match | `junior` → `sisyphus-junior` |
| 5 | Suffix-stripped | `explore-agent` → `explore` |
| 6 | Reverse substring | `search` in `librarian-search` |
| 7 | Fallback (lowercase) | `UnknownAgent` → `unknownagent` |

**Known Aliases Table:**
| Invalid | Correct |
|---------|---------|
| `general-purpose`, `default` | `general` |
| `code-reviewer`, `reviewer`, `consultation` | `oracle` |
| `search`, `grep`, `find` | `explore` |
| `research`, `docs` | `librarian` |
| `planner`, `planning` | `plan` |
| `builder`, `coder`, `developer` | `build` |

---

## Error Classification

**File:** `src/proxy/server.ts` (lines 133-229)

The proxy classifies SDK errors into user-friendly messages:

| Condition | Status | Type | Message |
|-----------|--------|------|---------|
| 401, auth keywords | 401 | `authentication_error` | Re-authenticate with `claude login` |
| 429, rate limit | 429 | `rate_limit_error` | Wait and retry |
| 402, billing | 402 | `billing_error` | Check subscription |
| Exit code 1 (auth) | 401 | `authentication_error` | Auth expired |
| Exit code N | 502 | `api_error` | Process crashed |
| Timeout | 504 | `timeout_error` | Try simpler request |
| 500, server error | 502 | `api_error` | Temporary, retry |
| 503, overloaded | 503 | `overloaded_error` | Wait and retry |

---

## Logging System

**File:** `src/logger.ts`

Structured JSON logging with AsyncLocalStorage context:

```typescript
// Context flows through async operations
withClaudeLogContext({ requestId, endpoint }, async () => {
  // All claudeLog() calls within inherit requestId
})

// Log with automatic context
claudeLog("request.received", { model, stream, queueWaitMs })
// Output: { ts, event: "request.received", requestId, endpoint, model, ... }
```

**Features:**
- **Sensitive data redaction:** authorization, cookies, apiKey, prompt, messages, content
- **Truncation:** Strings >512 chars truncated with length marker
- **Stream event filtering:** `OPENCODE_CLAUDE_PROVIDER_STREAM_DEBUG` enables verbose stream logging
- **AsyncLocalStorage:** Request context automatically propagated through async operations

**Key Log Events:**
| Event | When |
|-------|------|
| `request.enter` | Request enters queue |
| `request.received` | Processing begins |
| `upstream.start` | SDK query initiated |
| `upstream.first_chunk` | First response received |
| `upstream.completed` | SDK query finished |
| `stream.heartbeat` | SSE heartbeat (every 15s) |
| `stream.client_closed` | Client disconnected |
| `response.completed` | Full response delivered |
| `error.unhandled` | Unexpected exceptions |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CLAUDE_PROXY_PASSTHROUGH` | (unset) | Enable passthrough mode |
| `CLAUDE_PROXY_PORT` | 3456 | Server port |
| `CLAUDE_PROXY_HOST` | 127.0.0.1 | Server host |
| `CLAUDE_PROXY_WORKDIR` | cwd | Working directory |
| `CLAUDE_PROXY_MAX_CONCURRENT` | 10 | Max concurrent sessions |
| `CLAUDE_PROXY_IDLE_TIMEOUT_SECONDS` | 120 | Connection idle timeout |
| `CLAUDE_PROXY_SESSION_DIR` | ~/.cache/... | Session store directory |
| `CLAUDE_PROXY_DEBUG` | (unset) | Enable debug logging |
| `OPENCODE_CLAUDE_PROVIDER_DEBUG` | (unset) | Enable structured logging |
| `OPENCODE_CLAUDE_PROVIDER_STREAM_DEBUG` | (unset) | Verbose stream events |

---

## OpenCode Plugin (Session Headers)

**File:** `src/plugin/claude-max-headers.ts`

Injects `X-OpenCode-Session` header into OpenCode requests for reliable session resumption.

**Installation in opencode.json:**
```json
{
  "plugin": [
    "./path/to/opencode-claude-max-proxy/src/plugin/claude-max-headers.ts"
  ]
}
```

---

## Architecture Diagrams

### Full Request Lifecycle (Passthrough Mode)

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              OpenCode                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 1. User sends message                                             │   │
│  │ 2. OpenCode formats as Anthropic API request                      │   │
│  │ 3. Includes Task tool with agent descriptions                      │   │
│  │ 4. Adds X-OpenCode-Session header (if plugin installed)           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST /v1/messages
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Claude Max Proxy                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 5. Session lookup (header → cache → fingerprint → shared store)  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 6. Extract agent names from Task tool description                 │   │
│  │    buildAgentDefinitions() → SDK agent definitions               │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 7. Configure PreToolUse hook (matcher: "", block all)            │   │
│  │    Set maxTurns: 1 (stop after blocking)                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 8. Create dynamic MCP server with OpenCode tools                 │   │
│  │    createPassthroughMcpServer(body.tools)                         │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 9. Concurrency queue acquire                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SDK query()
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        Claude Max (SDK)                                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 10. Claude generates tool_use blocks                             │   │
│  │     e.g., mcp__oc__read, mcp__oc__bash, mcp__oc__Task           │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 11. PreToolUse hook fires for each tool                          │   │
│  │     - Captures: { id, name, input }                              │   │
│  │     - Returns: { decision: "block" }                             │   │
│  │     - SDK stops (maxTurns: 1 + blocked tools)                   │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 12. SDK yields accumulated content blocks                        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SSE: tool_use blocks
                                    │ stop_reason: "tool_use"
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Claude Max Proxy                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 13. Strip MCP prefixes from tool names                           │   │
│  │     "mcp__oc__read" → "read"                                     │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                    │                                     │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 14. Return tool_use blocks to OpenCode as HTTP response          │   │
│  │     (SDK already stopped, proxy returns accumulated data)        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP Response (tool_use blocks)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                              OpenCode                                     │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 15. OpenCode receives tool_use blocks                            │   │
│  │ 16. Routes to appropriate agent/model (GPT-5.4, Gemini, etc.)   │   │
│  │ 17. Executes tools                                               │   │
│  │ 18. Formats result as Anthropic tool_result                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTP POST /v1/messages (continue)
                                    │ with tool_result
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          Claude Max Proxy                                │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 19. Pass tool_result to SDK query (resume)                      │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SDK query(resume: sessionId)
                                    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        Claude Max (SDK)                                  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ 20. SDK continues from stored session                            │   │
│  │ 21. Claude generates next response                               │   │
│  │ 22. Returns via SSE                                              │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Security Considerations

1. **Authentication:** Proxied via `claude login` session, not API keys
2. **No API key interception:** `ANTHROPIC_API_KEY=dummy` is accepted but ignored
3. **Local execution:** Tool execution happens on the local machine
4. **CORS open:** Intended for local container access (`0.0.0.0` in production)
5. **Sensitive data redaction:** Logs scrub authorization, content, messages

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `hono` | ^4.x | HTTP framework |
| `@hono/node-server` | ^1.x | Node.js server adapter |
| `@anthropic-ai/claude-agent-sdk` | ^1.x | Claude SDK |
| `openai` | ^4.x | Grok API client |
| `zod` | ^3.x | Schema validation |
| `glob` | ^10.x | File globbing |
| `bun` | (runtime) | JavaScript runtime |

---

## Sources

- **Primary:** `src/proxy/server.ts` - Core proxy logic (1206 lines)
- **Secondary:** `src/mcpTools.ts` - Internal MCP tool definitions
- **Secondary:** `src/providers/` - Provider adapter system
- **Tertiary:** Test files for behavior verification

