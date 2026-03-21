# Claude Max Proxy - Codebase Structure

**Document Created:** 2026-03-21  
**Domain:** File organization and module structure  
**Confidence:** HIGH

## Summary

The codebase follows a clean modular architecture centered on the proxy server. Core logic lives in `src/proxy/server.ts`, with supporting modules for MCP tools, providers, and utilities. The project uses TypeScript throughout, runs on Bun runtime, and includes comprehensive test coverage in `src/__tests__/`.

---

## Top-Level Structure

```
opencode-claude-max-proxy/
├── bin/                        # Executable scripts and entry points
│   ├── cli.ts                   # CLI entry point
│   ├── oc.sh                    # Per-terminal launcher script
│   ├── docker-entrypoint.sh    # Docker container entrypoint
│   ├── docker-auth.sh          # Auth copy script for Docker
│   └── claude-proxy-supervisor.sh # Auto-restart supervisor
├── src/                        # Main source code
│   ├── proxy/                  # Proxy server core
│   ├── providers/              # Model provider adapters
│   ├── __tests__/              # Test suite
│   ├── logger.ts               # Structured logging
│   ├── mcpTools.ts             # Internal MCP tool definitions
│   └── plugin/                 # OpenCode plugins
├── .planning/                   # NSP planning system
│   └── codebase/               # This documentation
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── bun.lock                    # Bun lock file
├── docker-compose.yml          # Docker orchestration
├── README.md                   # Project documentation
├── EXPLAINER.md                # Technical deep-dive
├── MAINTENANCE.md              # Maintenance procedures
└── CHANGELOG.md                # Version history
```

---

## Source Directory (`src/`)

```
src/
├── proxy/
│   ├── server.ts           # HTTP server, routing, session management (1206 lines)
│   ├── types.ts            # ProxyConfig interface and defaults
│   ├── passthroughTools.ts # Dynamic MCP server for passthrough mode
│   ├── sessionStore.ts     # File-based shared session storage
│   ├── agentDefs.ts        # SDK AgentDefinition extraction from Task tool
│   └── agentMatch.ts       # Fuzzy agent name matching (7-level priority)
│
├── providers/
│   ├── base.ts             # ProviderAdapter interface
│   ├── registry.ts         # Provider registration and lookup
│   ├── claude.ts           # Claude provider adapter
│   ├── grok.ts             # Grok/xAI provider adapter
│   └── index.ts            # Re-exports
│
├── __tests__/
│   ├── proxy-pretooluse-hook.test.ts       # PreToolUse hook behavior
│   ├── proxy-session-resume.test.ts        # Session resumption
│   ├── proxy-passthrough-concept.test.ts   # Passthrough mode logic
│   ├── proxy-transparent-tools.test.ts     # Tool forwarding
│   ├── proxy-tool-forwarding.test.ts       # Tool handling
│   ├── proxy-session-store.test.ts         # Shared session store
│   ├── proxy-streaming-message.test.ts     # SSE streaming
│   ├── proxy-multimodal.test.ts           # Image/document handling
│   ├── proxy-subagent-support.test.ts     # Subagent routing
│   ├── proxy-agent-definitions.test.ts    # Agent definition extraction
│   ├── proxy-agent-fuzzy-match.test.ts    # Fuzzy matching
│   ├── proxy-working-directory.test.ts    # Working directory handling
│   ├── proxy-error-handling.test.ts       # Error classification
│   ├── integration.test.ts                # End-to-end tests
│   └── helpers.ts                        # Test utilities
│
├── plugin/
│   └── claude-max-headers.ts   # OpenCode plugin for session headers
│
├── logger.ts                   # Structured logging with AsyncLocalStorage
└── mcpTools.ts                # Internal MCP tools (read, write, edit, bash, glob, grep, scan_report)
```

---

## Key Files

### `src/proxy/server.ts` (1206 lines)

**Purpose:** Core proxy server implementation

**Sections:**
| Lines | Content |
|-------|---------|
| 1-50 | Imports, session cache, TTL cleanup |
| 51-131 | Session lookup/store functions |
| 133-229 | Error classification rules |
| 230-270 | Tool blocking lists (BLOCKED_BUILTIN_TOOLS, CLAUDE_CODE_ONLY_TOOLS) |
| 271-299 | Claude executable resolution |
| 300-369 | Concurrency control (queue, acquireSession, releaseSession) |
| 370-450 | Request handling, session resume, message processing |
| 451-620 | Tool hook configuration (passthrough vs internal) |
| 621-768 | Non-streaming response handling |
| 769-1100 | Streaming response with SSE, heartbeat, error handling |
| 1101-1172 | Route handlers, health endpoint, server creation |
| 1173-1206 | Server startup, port binding |

**Key Exports:**
```typescript
export function createProxyServer(config?: Partial<ProxyConfig>): { app: Hono, config: ProxyConfig }
export async function startProxyServer(config?: Partial<ProxyConfig>): Promise<Server>
export function clearSessionCache(): void
```

### `src/mcpTools.ts` (216 lines)

**Purpose:** Internal MCP tool definitions for non-passthrough mode

**Tools Defined:**
| Tool | Parameters | Implementation |
|------|------------|----------------|
| `read` | `path`, `encoding?` | `fs.readFile` with path resolution |
| `write` | `path`, `content` | `fs.writeFile` with `mkdir -p` |
| `edit` | `path`, `oldString`, `newString` | `replace()` then write |
| `bash` | `command`, `cwd?` | `child_process.exec` (120s timeout) |
| `glob` | `pattern`, `cwd?` | `glob()` library, excludes node_modules/.git |
| `grep` | `pattern`, `path?`, `include?` | `grep -rn` with 10MB buffer |
| `scan_report` | `scanner?`, `path?`, `profile?`, `format?` | `gaps scan` or `genesis-static-analyzer` |

**Key Export:**
```typescript
export const opencodeMcpServer: McpServer  // Created with createSdkMcpServer()
```

### `src/proxy/passthroughTools.ts` (136 lines)

**Purpose:** Dynamic MCP server creation for passthrough mode

**Key Functions:**
```typescript
export function createPassthroughMcpServer(
  tools: Array<{ name: string; description?: string; input_schema?: any }>
): { server: McpServer, toolNames: string[] }

export function stripMcpPrefix(toolName: string): string
// "mcp__oc__read" → "read"

export const PASSTHROUGH_MCP_NAME = "oc"
export const PASSTHROUGH_MCP_PREFIX = "mcp__oc__"
```

**Schema Conversion:**
- `jsonSchemaToZod()` converts OpenCode JSON Schema to Zod types
- Handles: string, number, boolean, array, object
- Falls back to `z.any()` for complex types

### `src/proxy/sessionStore.ts` (94 lines)

**Purpose:** File-based session storage for cross-proxy resume

**Key Functions:**
```typescript
export function lookupSharedSession(key: string): StoredSession | undefined
export function storeSharedSession(key: string, claudeSessionId: string, messageCount?: number): void
export function clearSharedSessions(): void

interface StoredSession {
  claudeSessionId: string
  createdAt: number
  lastUsedAt: number
  messageCount: number
}
```

**Storage Location:**
- `~/.cache/opencode-claude-max-proxy/sessions.json`
- Override with `CLAUDE_PROXY_SESSION_DIR`

**Format:**
```json
{
  "opencode-session-id-123": {
    "claudeSessionId": "sdk-session-abc",
    "createdAt": 1742568000000,
    "lastUsedAt": 1742580000000,
    "messageCount": 5
  }
}
```

### `src/proxy/agentDefs.ts` (102 lines)

**Purpose:** Extract SDK AgentDefinition objects from OpenCode's Task tool

**Key Functions:**
```typescript
export function parseAgentDescriptions(taskDescription: string): Map<string, string>

export function buildAgentDefinitions(
  taskDescription: string,
  mcpToolNames?: string[]
): Record<string, AgentDefinition>

interface AgentDefinition {
  description: string
  prompt: string
  model?: "sonnet" | "opus" | "haiku" | "inherit"
  tools?: string[]
  disallowedTools?: string[]
}
```

**Parsing Logic:**
- Extracts from Task tool description text
- Format: `- agent-name: Description`
- Returns Map of agent name → description

### `src/proxy/agentMatch.ts` (93 lines)

**Purpose:** Fuzzy matching for agent names in PreToolUse hook

**Key Function:**
```typescript
export function fuzzyMatchAgentName(input: string, validAgents: string[]): string
```

**Matching Priority:**
1. Exact match (case-insensitive)
2. Known aliases table
3. Prefix match
4. Substring match
5. Suffix-stripped match
6. Reverse substring
7. Fallback to lowercased input

### `src/proxy/types.ts` (19 lines)

**Purpose:** Configuration types and defaults

```typescript
export interface ProxyConfig {
  port: number
  host: string
  debug: boolean
  idleTimeoutSeconds: number
  provider?: string
}

export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  port: parseInt(process.env.CLAUDE_PROXY_PORT || "3456", 10),
  host: (() => {
    if (envHost) return envHost
    if (process.env.NODE_ENV === "production") return "0.0.0.0"
    return "127.0.0.1"
  })(),
  debug: process.env.CLAUDE_PROXY_DEBUG === "1",
  idleTimeoutSeconds: parseInt(process.env.CLAUDE_PROXY_IDLE_TIMEOUT_SECONDS || "120", 10)
}
```

### `src/logger.ts` (72 lines)

**Purpose:** Structured logging with context propagation

**Key Functions:**
```typescript
export const withClaudeLogContext = <T>(context: LogFields, fn: () => T): T

export const claudeLog = (event: string, extra?: LogFields): void
```

**Features:**
- AsyncLocalStorage for request context
- Sensitive data redaction (authorization, cookies, apiKey, prompt, messages, content)
- String truncation at 512 chars
- Stream event filtering (requires `OPENCODE_CLAUDE_PROVIDER_STREAM_DEBUG`)

### `src/providers/` (Provider System)

**`base.ts` (12 lines):**
```typescript
export interface ProviderAdapter {
  name: string
  createQueryHandler(config: ProxyConfig): (queryArgs: any) => AsyncIterable<any>
  supportsPassthrough(): boolean
  getMcpServer(tools?: any): any
}
```

**`registry.ts` (41 lines):**
- `registerProvider(name, adapter)`
- `getProviderAdapter(name)` - lazy initialization
- `initializeProviders()` - pre-registers Claude

**`claude.ts` (31 lines):**
- Uses `@anthropic-ai/claude-agent-sdk` `query()`
- Passthrough: supported
- MCP: returns opencodeMcpServer or passthroughMcpServer

**`grok.ts` (107 lines):**
- Uses OpenAI SDK with `baseURL: https://api.x.ai/v1`
- Passthrough: NOT supported (`supportsPassthrough(): false`)
- MCP: basic fallback support
- Translates OpenAI chat completions to SDK message format

### `src/plugin/claude-max-headers.ts`

**Purpose:** OpenCode plugin that injects `X-OpenCode-Session` header

**Usage:** Add to `opencode.json`:
```json
{
  "plugin": [
    "./path/to/opencode-claude-max-proxy/src/plugin/claude-max-headers.ts"
  ]
}
```

---

## Directory Purpose

### `bin/`

| File | Purpose |
|------|---------|
| `cli.ts` | CLI entry point for `claude-max-proxy` command |
| `oc.sh` | Per-terminal launcher - starts proxy on random port, launches OpenCode |
| `docker-entrypoint.sh` | Docker container startup script |
| `docker-auth.sh` | Copies host Claude credentials into container |
| `claude-proxy-supervisor.sh` | Auto-restarts proxy on crash (handles Bun segfault) |

### `src/__tests__/`

Test files use Bun's test framework with mock modules:

```typescript
import { describe, it, expect, mock, beforeEach } from "bun:test"
```

**Test Pattern:**
```typescript
mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  query: (params: any) => { /* mock */ },
  createSdkMcpServer: () => ({ /* mock */ })
}))
```

### `src/proxy/`

Core proxy logic. **Do not add routing handlers here** - they belong in `server.ts`.

---

## Module Organization Principles

1. **Server is the hub:** `server.ts` orchestrates all components
2. **Providers are swappable:** New providers implement `ProviderAdapter`
3. **MCP tools are isolated:** Internal tools in `mcpTools.ts`, passthrough tools created dynamically
4. **No circular dependencies:** Proxy submodules are leaf nodes
5. **Types colocated:** `types.ts` next to the module it describes

---

## Dependencies

### Production

```json
{
  "hono": "^4.0.0",
  "@hono/node-server": "^1.0.0",
  "@anthropic-ai/claude-agent-sdk": "^1.0.0",
  "openai": "^4.0.0",
  "zod": "^3.0.0",
  "glob": "^10.0.0"
}
```

### Development

```json
{
  "bun": "(runtime)",
  "typescript": "^5.0.0",
  "@types/node": "^20.0.0"
}
```

---

## Entry Points

### CLI Entry (`bin/cli.ts`)

```bash
# From package.json scripts
"proxy": "bun run src/proxy/server.ts"
# or
"bun run bin/cli.ts"
```

### Module Entry

```typescript
import { createProxyServer, startProxyServer } from "./src/proxy/server"

// Programmatic use
const { app, config } = createProxyServer({ port: 3456 })
const server = await startProxyServer({ port: 3456 })
```

### Docker Entry

```bash
docker compose up
# Starts container, runs docker-entrypoint.sh
# Runs: bun run bin/cli.ts
```

---

## File Naming Conventions

| Pattern | Example | Purpose |
|---------|---------|---------|
| `*.ts` | `server.ts` | TypeScript source |
| `*.test.ts` | `proxy-session.test.ts` | Test files |
| `index.ts` | `providers/index.ts` | Re-exports |
| `base.ts` | `providers/base.ts` | Interface/base class |
| `types.ts` | `proxy/types.ts` | Type definitions |

---

## Testing Patterns

**Mock Pattern:**
```typescript
mock.module("module-path", () => ({
  exportedName: mockImplementation
}))
```

**Request Testing:**
```typescript
const app = createTestApp()
const response = await app.fetch(new Request("http://localhost/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(requestBody)
}))
```

**Async Iterable Mock:**
```typescript
mock.module("sdk", () => ({
  query: (params: any) => {
    return (async function* () {
      yield* mockMessages
    })()
  }
}))
```

---

## Important Implementation Details

### SDK Executable Resolution (server.ts:280-299)

```typescript
function resolveClaudeExecutable(): string {
  // 1. Try SDK's bundled cli.js
  const sdkCliJs = join(dirname(sdkPath), "cli.js")
  if (existsSync(sdkCliJs)) return sdkCliJs

  // 2. Try system claude binary
  const claudePath = execSync("which claude", { encoding: "utf-8" }).trim()

  // 3. Throw if not found
  throw new Error("Could not find Claude Code executable...")
}
```

### Conversation Fingerprint (server.ts:52-63)

```typescript
function getConversationFingerprint(messages): string {
  const firstUser = messages.find(m => m.role === "user")
  const text = extract text content
  return createHash("sha256")
    .update(text.slice(0, 2000))
    .digest("hex")
    .slice(0, 16)
}
```

### Passthrough Tool Name Stripping (passthroughTools.ts:131-136)

```typescript
export function stripMcpPrefix(toolName: string): string {
  if (toolName.startsWith(PASSTHROUGH_MCP_PREFIX)) {
    return toolName.slice(PASSTHROUGH_MCP_PREFIX.length)
  }
  return toolName
}
// "mcp__oc__todowrite" → "todowrite"
```

### Multimodal Detection (server.ts:454-457)

```typescript
const MULTIMODAL_TYPES = new Set(["image", "document", "file"])
const hasMultimodal = messagesToConvert?.some((m: any) =>
  Array.isArray(m.content) && 
  m.content.some((b: any) => MULTIMODAL_TYPES.has(b.type))
)
```

---

## Git Ignore Patterns

```
node_modules/
.env
*.log
.cache/
dist/
.DS_Store
```

---

## Quick Reference

| Need To... | File(s) to Modify |
|------------|-------------------|
| Add new endpoint | `src/proxy/server.ts` |
| Add new MCP tool | `src/mcpTools.ts` |
| Add new provider | `src/providers/` (new file + registry.ts) |
| Change session behavior | `src/proxy/server.ts` + `sessionStore.ts` |
| Modify agent matching | `src/proxy/agentMatch.ts` |
| Add test | `src/__tests__/` |

---

## Sources

- **File contents:** All files read directly from source
- **Directory structure:** Glob of entire repository
- **Test patterns:** Examined test files for actual usage

