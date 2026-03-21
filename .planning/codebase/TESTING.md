# Testing Conventions

**Project:** opencode-claude-max-proxy  
**Test Framework:** Bun Test (`bun test`)  
**Test Location:** `src/__tests__/`

---

## Test Infrastructure

### Test Commands

```bash
# Run all tests
bun test

# Run with coverage (if configured)
bun test --coverage

# Run specific test file
bun test src/__tests__/proxy-error-handling.test.ts

# Run tests matching pattern
bun test --pattern "streaming"
```

### Test Configuration

```json
// tsconfig.json includes tests
{
  "include": ["src/**/*", "index.ts", "provider.ts", "tests/**/*"]
}
```

Tests are co-located with source in `src/__tests__/` directory.

---

## Test File Structure

```
src/__tests__/
├── helpers.ts                    # Shared test utilities
├── proxy-error-handling.test.ts  # Error classification tests
├── proxy-streaming-message.test.ts # Streaming behavior tests
├── proxy-session-store.test.ts   # Session persistence tests
├── proxy-agent-fuzzy-match.test.ts # Agent matching tests
├── proxy-pretooluse-hook.test.ts # SDK hook tests
└── integration.test.ts           # Full integration tests
```

### Test File Naming

- Pattern: `proxy-<feature>.test.ts`
- Helper files: `helpers.ts` (no `.test.ts` suffix)

---

## Test Utilities (helpers.ts)

### SDK Message Factories

Create mock SDK messages for testing:

```typescript
import {
  messageStart,
  textBlockStart,
  toolUseBlockStart,
  textDelta,
  inputJsonDelta,
  blockStop,
  messageDelta,
  messageStop,
  parseSSE,
  postStream,
} from "./helpers"

// Example: Create a complete streaming message sequence
const mockMessages = [
  messageStart("msg_turn1"),
  textBlockStart(0),
  textDelta(0, "Let me check."),
  blockStop(0),
  toolUseBlockStart(1, "mcp__opencode__read", "toolu_mcp1"),
  inputJsonDelta(1, '{"path":"README.md"}'),
  blockStop(1),
  messageDelta("tool_use"),
  messageStop(),
]
```

### Request Factories

```typescript
import { makeRequest, makeToolRequest, makeToolResultRequest } from "./helpers"

// Basic request
const req = makeRequest({ model: "sonnet" })

// With tools
const toolReq = makeToolRequest([
  { name: "Read", input_schema: {...} }
])

// With prior tool execution
const resumedReq = makeToolResultRequest(
  "toolu_123",
  "file contents here",
  priorMessages
)
```

### SSE Parsing

```typescript
import { parseSSE, readStreamFull, postStream } from "./helpers"

// Parse SSE response text into events
const events = await postStream(app, "hello")
const textEvents = events.filter(e => e.event === "content_block_delta")

// Access parsed data
const fullText = textEvents
  .map(e => (e.data as any).delta?.text)
  .join("")
```

### Stream Testing Pattern

```typescript
// Helper for streaming requests
export async function postStream(
  app: any, 
  content: string, 
  overrides: Record<string, unknown> = {}
) {
  const req = new Request("http://localhost/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      stream: true,
      messages: [{ role: "user", content }],
      ...overrides,
    }),
  })
  const response = await app.fetch(req)
  const text = await readStreamFull(response)
  return parseSSE(text)
}
```

---

## Test Patterns

### Module Mocking

Mock external dependencies with `mock.module`:

```typescript
import { describe, it, expect, mock, beforeEach } from "bun:test"

// Make SDK throw specific errors
let mockError: Error | null = null

mock.module("@anthropic-ai/claude-agent-sdk", () => ({
  query: () => {
    if (mockError) {
      return (async function* () {
        throw mockError
      })()
    }
    return (async function* () {
      yield { type: "assistant", message: {...} }
    })()
  },
  createSdkMcpServer: () => ({ type: "sdk", name: "test", instance: {} }),
}))

mock.module("../logger", () => ({
  claudeLog: () => {},
  withClaudeLogContext: (_ctx: any, fn: any) => fn(),
}))
```

### Test Structure

```typescript
describe("Error classification", () => {
  beforeEach(() => {
    mockError = null
    clearSessionCache()  // Clean state between tests
  })

  it("should return 401 for authentication errors", async () => {
    mockError = new Error("API Error: 401 authentication_error")
    
    const app = createTestApp()
    const res = await post(app, BASIC_REQUEST)
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error.type).toBe("authentication_error")
    expect(body.error.message).toContain("claude login")
  })

  it("should return 429 for rate limit errors", async () => {
    mockError = new Error("429 Too Many Requests")
    // ...
  })
})
```

### Creating Test Apps

```typescript
function createTestApp() {
  const { app } = createProxyServer({ port: 0, host: "127.0.0.1" })
  return app
}

async function post(app: any, body: any) {
  return app.fetch(new Request("http://localhost/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }))
}
```

### Session Cache Management

Clear caches before each test to ensure isolation:

```typescript
beforeEach(() => {
  clearSessionCache()  // From server.ts
})
```

---

## Test Categories

### 1. Error Handling Tests

**File:** `proxy-error-handling.test.ts`

```typescript
describe("Error classification", () => {
  it("should return 401 for authentication errors")
  it("should return 401 for process exit code 1")
  it("should return 429 for rate limit errors")
  it("should return 402 for billing errors")
  it("should return 503 for overloaded errors")
  it("should return 504 for timeout errors")
  it("should return 500 for unknown errors")
})
```

### 2. Streaming Message Tests

**File:** `proxy-streaming-message.test.ts`

Verifies single-message-per-response behavior:

```typescript
describe("Streaming: single message per response", () => {
  it("should emit exactly one message_start for multi-turn SDK responses")
  it("should include intermediate text from tool-calling turns")
  it("should forward single-turn responses unchanged")
  it("should forward non-MCP tool_use even in multi-turn")
})
```

### 3. Session Store Tests

**File:** `proxy-session-store.test.ts`

Tests session persistence and resume functionality.

### 4. Agent Matching Tests

**File:** `proxy-agent-fuzzy-match.test.ts`

Tests fuzzy matching of agent names and agent definition extraction.

### 5. PreToolUse Hook Tests

**File:** `proxy-pretooluse-hook.test.ts`

Tests SDK hook behavior for tool interception.

---

## Assertion Patterns

### Status Code Assertions

```typescript
expect(res.status).toBe(401)
expect(res.status).toBe(200)
```

### JSON Body Assertions

```typescript
const body = await res.json()
expect(body.error.type).toBe("authentication_error")
expect(body.error.message).toContain("claude login")
```

### SSE Event Assertions

```typescript
const events = await postStream(app, "hello")

// Count specific events
const msgStarts = events.filter(e => e.event === "message_start")
expect(msgStarts.length).toBe(1)

// Extract text content
const textDeltas = events.filter(
  e => e.event === "content_block_delta" && 
       (e.data as any).delta?.type === "text_delta"
)
const fullText = textDeltas.map(e => (e.data as any).delta.text).join("")
expect(fullText).toContain("expected text")
```

### Array/Collection Assertions

```typescript
expect(contentBlocks.some(b => b.type === "tool_use")).toBe(true)
expect(events.filter(e => e.event === "message_stop").length).toBe(1)
```

---

## Test Fixtures

### Standard Request Object

```typescript
const BASIC_REQUEST = {
  model: "claude-sonnet-4-5",
  max_tokens: 1024,
  stream: false,
  messages: [{ role: "user", content: "hello" }],
}
```

### Tool Definitions

```typescript
export const READ_TOOL = {
  name: "Read",
  description: "Read a file",
  input_schema: {
    type: "object",
    properties: { file_path: { type: "string" } },
    required: ["file_path"],
  },
}

export const BASH_TOOL = {
  name: "Bash",
  description: "Run a bash command",
  input_schema: {
    type: "object",
    properties: { command: { type: "string" } },
    required: ["command"],
  },
}
```

---

## Running Tests

### Local Development

```bash
# Run all tests
bun test

# Watch mode (re-runs on file changes)
bun test --watch

# Run specific test
bun test src/__tests__/proxy-error-handling.test.ts

# Run tests matching pattern
bun test --pattern "error"
```

### CI/CD

```bash
# Type check before tests
bun run typecheck

# Run tests
bun test

# Build verification
bun run build
```

---

## Best Practices

1. **Clean state in `beforeEach`** - Clear caches, reset mocks
2. **Use factory functions** - `helpers.ts` provides message builders
3. **Test both streaming and non-streaming** - Cover both code paths
4. **Verify error messages are user-friendly** - Not just status codes
5. **Test edge cases** - Empty messages, multimodal content, session resume
6. **Parse SSE correctly** - Use `parseSSE` helper for event extraction
7. **Assert on actual behavior** - Not implementation details
