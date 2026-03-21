# Coding Conventions

**Project:** opencode-claude-max-proxy  
**TypeScript Version:** 5.8.2  
**Runtime:** Bun (Node.js >= 22)  
**Style:** Strict TypeScript with ESNext modules

---

## TypeScript Configuration

**File:** `tsconfig.json`

The project uses strict TypeScript with modern ESNext features:

```json
{
  "compilerOptions": {
    "lib": ["ESNext"],
    "target": "ESNext",
    "module": "Preserve",
    "moduleDetection": "force",
    "strict": true,
    "noEmit": true,
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true
  }
}
```

### Key Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `strict` | `true` | Enable all strict type checking |
| `verbatimModuleSyntax` | `true` | Require `import type` for type-only imports |
| `noUncheckedIndexedAccess` | `true` | Arrays/objects return `T | undefined` |
| `noImplicitOverride` | `true` | Require `override` keyword on method overrides |
| `moduleResolution` | `bundler` | Use bundler-style resolution |

---

## Code Style Guidelines

### File Organization

```
src/
├── proxy/           # Core proxy logic
│   ├── server.ts    # Main Hono server (~1200 lines)
│   ├── types.ts     # Configuration interfaces
│   ├── agentMatch.ts # Fuzzy matching for agent names
│   └── agentDefs.ts # Agent definition extraction
├── providers/       # Provider adapters (Claude, Grok)
├── mcpTools.ts      # MCP tool definitions
└── logger.ts       # Structured logging
```

### Naming Conventions

- **Files:** kebab-case (`proxy-server.ts`, not `proxyServer.ts`)
- **Interfaces:** PascalCase without prefix (`ProxyConfig`, not `IProxyConfig`)
- **Types:** Same as interfaces - use `type` alias for unions
- **Functions:** camelCase (`createProxyServer`, `handleMessages`)
- **Constants:** SCREAMING_SNAKE_CASE for true constants (`MAX_CONCURRENT_SESSIONS`)

### Import Style

```typescript
// Type-only imports (required with verbatimModuleSyntax)
import type { ProxyConfig } from "./types"
import type { ProviderAdapter } from "./base"

// Value imports
import { Hono } from "hono"
import { cors } from "hono/cors"

// Relative paths for internal modules
import { claudeLog, withClaudeLogContext } from "../logger"
```

### Async/Await Patterns

**Always use async/await over raw Promises:**

```typescript
// ✅ Good - async/await with proper error handling
async function handleMessages(c: Context) {
  try {
    const body = await c.req.json()
    const response = queryHandler({ prompt, options })
    
    for await (const message of response) {
      // Process streaming messages
    }
  } catch (error) {
    claudeLog("upstream.failed", {
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
}

// ✅ Good - async generators for streaming
const response = queryHandler({ prompt, options })
for await (const message of response) {
  // Handle each message
}

// ❌ Avoid - then/catch chains
function getData() {
  return fetch(url).then(res => res.json()).catch(err => handle(err))
}
```

### Error Handling Patterns

**1. Classify errors with rule-based approach:**

```typescript
// Rule-based error classification (reduces cyclomatic complexity)
type ErrorRule = {
  test: (lower: string, errMsg: string) => boolean
  getResult: (lower: string, errMsg: string) => { status: number; type: string; message: string }
}

function classifyError(errMsg: string): { status: number; type: string; message: string } {
  const lower = errMsg.toLowerCase()
  
  const rules: ErrorRule[] = [
    {
      test: (l) => l.includes("401") || l.includes("authentication"),
      getResult: () => ({
        status: 401,
        type: "authentication_error",
        message: "Claude authentication expired. Run 'claude login'"
      })
    },
    // ... more rules
  ]
  
  for (const rule of rules) {
    if (rule.test(lower, errMsg)) {
      return rule.getResult(lower, errMsg)
    }
  }
  
  return { status: 500, type: "api_error", message: errMsg }
}
```

**2. Use type guards for error checking:**

```typescript
function isClosedControllerError(error: unknown): boolean {
  if (!(error instanceof Error)) return false
  return error.message.includes("Controller is already closed")
}
```

**3. Always extract error messages safely:**

```typescript
const errMsg = error instanceof Error ? error.message : String(error)
```

### Logging Patterns

**Use structured logging with AsyncLocalStorage for context:**

```typescript
// Context-aware logging
import { claudeLog, withClaudeLogContext } from "../logger"

// Wrap operations in context
return withClaudeLogContext({ requestId, endpoint }, async () => {
  claudeLog("request.received", { model, stream, messageCount })
  
  try {
    const result = await processRequest()
    claudeLog("request.completed", { durationMs: Date.now() - start })
    return result
  } catch (error) {
    claudeLog("request.failed", {
      error: error instanceof Error ? error.message : String(error)
    })
    throw error
  }
})
```

**Redact sensitive fields automatically:**

```typescript
const REDACTED_KEYS = new Set([
  "authorization", "cookie", "x-api-key", "apiKey",
  "prompt", "messages", "content"
])
```

### Type Definitions

**1. Interface definitions for objects:**

```typescript
export interface ProxyConfig {
  port: number
  host: string
  debug: boolean
  idleTimeoutSeconds: number
  provider?: string
}
```

**2. Use `Record<string, unknown>` for dynamic objects:**

```typescript
type LogFields = Record<string, unknown>

const sanitize = (value: unknown): unknown => {
  if (typeof value === "object" && value !== null) {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = sanitize(v)
    }
    return out
  }
  return value
}
```

**3. Avoid `any` - use `unknown` and narrow:**

```typescript
// ❌ Bad - any bypasses type checking
function process(data: any) {
  return data.foo.bar
}

// ✅ Good - unknown with type guard
function process(data: unknown) {
  if (typeof data === "object" && data !== null && "foo" in data) {
    return (data as { foo: { bar: string } }).foo.bar
  }
}
```

### Null/Undefined Handling

**Non-null assertion is acceptable when guaranteed:**

```typescript
// Safe - we know messages exist from prior check
if (messages?.length > 0 && knownCount < messages.length) {
  messagesToConvert = messages.slice(knownCount)
} else {
  messagesToConvert = getLastUserMessage(messages!)
}
```

**Optional chaining for safe access:**

```typescript
const firstUser = messages?.find((m) => m.role === "user")
const text = typeof firstUser?.content === "string" 
  ? firstUser.content 
  : ""
```

### Module Patterns

**Dynamic imports for conditional modules:**

```typescript
// SDK path resolution with fallbacks
function resolveClaudeExecutable(): string {
  // 1. Try the SDK's bundled cli.js
  try {
    const sdkPath = fileURLToPath(import.meta.resolve("@anthropic-ai/claude-agent-sdk"))
    const sdkCliJs = join(dirname(sdkPath), "cli.js")
    if (existsSync(sdkCliJs)) return sdkCliJs
  } catch {
    // ignore and fallback
  }
  
  // 2. Try system-installed binary
  try {
    const claudePath = execSync("which claude", { encoding: "utf-8" }).trim()
    if (claudePath && existsSync(claudePath)) return claudePath
  } catch {
    // ignore
  }
  
  throw new Error("Could not find Claude Code executable...")
}
```

---

## Code Examples

### Streaming Response Handler

```typescript
const encoder = new TextEncoder()
const readable = new ReadableStream({
  async start(controller) {
    try {
      const response = queryHandler({ prompt, options })
      
      for await (const message of response) {
        if (message.type === "stream_event") {
          const event = message.event
          const eventType = event.type
          
          // Forward events to client
          const payload = encoder.encode(
            `event: ${eventType}\ndata: ${JSON.stringify(event)}\n\n`
          )
          controller.enqueue(payload)
        }
      }
      
      controller.close()
    } catch (error) {
      if (isClosedControllerError(error)) {
        return // Client disconnected
      }
      // Handle error...
    }
  }
})
```

### Provider Adapter Pattern

```typescript
import type { ProviderAdapter } from "./base"

export class ClaudeAdapter implements ProviderAdapter {
  name = "claude"

  createQueryHandler(config: ProxyConfig) {
    return (queryArgs: any) => {
      return query(queryArgs)
    }
  }

  supportsPassthrough(): boolean {
    return true
  }

  getMcpServer(tools?: any) {
    if (tools && tools.length > 0) {
      return createPassthroughMcpServer(tools)
    }
    return opencodeMcpServer
  }
}
```

### Session Management Pattern

```typescript
interface SessionState {
  claudeSessionId: string
  lastAccess: number
  messageCount: number
}

const sessionCache = new Map<string, SessionState>()

function lookupSession(
  opencodeSessionId: string | undefined,
  messages: Array<{ role: string; content: any }>
): SessionState | undefined {
  if (opencodeSessionId) {
    return sessionCache.get(opencodeSessionId)
  }
  // Fallback to fingerprint
  const fp = getConversationFingerprint(messages)
  return fp ? sessionCache.get(fp) : undefined
}
```

---

## Common Patterns

### Environment Variable Configuration

```typescript
const finalConfig = { ...DEFAULT_PROXY_CONFIG, ...config }

const port = parseInt(process.env.CLAUDE_PROXY_PORT || "3456", 10)
const host = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1"
```

### Conditional Module Export

```typescript
// Check environment and conditionally include
const { CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS, ...cleanEnv } = process.env
```

### Set-Based Membership Testing

```typescript
const BLOCKED_BUILTIN_TOOLS = [
  "Read", "Write", "Edit", "MultiEdit",
  "Bash", "Glob", "Grep", "NotebookEdit"
]

const MULTIMODAL_TYPES = new Set(["image", "document", "file"])
const hasMultimodal = messages.some((m) =>
  Array.isArray(m.content) && 
  m.content.some((b) => MULTIMODAL_TYPES.has(b.type))
)
```

---

## Anti-Patterns to Avoid

1. **`any` type** - Use `unknown` with type guards
2. **Non-null assertion without context** - Only use `!` when truly guaranteed
3. **Raw Promise chains** - Use async/await
4. **Synchronous file I/O in handlers** - Use async versions
5. **Hardcoded magic numbers** - Extract to named constants
6. **Missing error classification** - Always classify errors for helpful messages
7. **Unchecked indexed access** - Account for `undefined` with `noUncheckedIndexedAccess`
