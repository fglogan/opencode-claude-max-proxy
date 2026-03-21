# Technology Stack

**Project:** opencode-claude-max-proxy  
**Version:** 1.12.0  
**Researched:** 2026-03-21

## Runtime

| Property | Value | Notes |
|----------|-------|-------|
| **Runtime** | Node.js 22+ | Specified in `engines.node >= 22` |
| **Package Manager** | Bun 1.3.11 | Specified in `packageManager` field |
| **Module Type** | ES Modules (ESM) | `"type": "module"` |

### Build & Runtime Strategy

- **Build:** Bun build compiles TypeScript to Node.js-compatible JavaScript
- **Runtime:** Node.js 22 (not Bun) for production - see Dockerfile multi-stage build
- **Docker Base:** `node:22-alpine` for runtime, `oven/bun:1` for build

## Web Framework

### Hono.js
| Property | Value |
|----------|-------|
| **Version** | 4.11.4 |
| **Purpose** | Lightweight web framework for proxy server |
| **Adapter** | @hono/node-server 1.19.11 |

**Why Hono:** Fast, lightweight, TypeScript-first web framework with excellent middleware support (CORS, etc.)

## Core SDKs

### @anthropic-ai/claude-agent-sdk
| Property | Value |
|----------|-------|
| **Version** | ^0.2.80 |
| **Purpose** | Claude Code SDK for agent execution, session management, PreToolUse hooks |
| **Key Features** | PreToolUse hooks, MCP tool servers, session resume, streaming |

This is the primary SDK that powers Claude Code integration, providing the `query()` function and `createSdkMcpServer()` for MCP tool creation.

### OpenAI SDK
| Property | Value |
|----------|-------|
| **Version** | ^6.32.0 |
| **Purpose** | xAI/Grok integration via OpenAI-compatible API |
| **Base URL** | https://api.x.ai/v1 |

Used by the Grok adapter to communicate with xAI's API.

## Utilities

### p-queue
| Property | Value |
|----------|-------|
| **Version** | ^8.0.1 |
| **Purpose** | Concurrency control for SDK subprocess spawning |

Note: The codebase implements custom concurrency control in `server.ts` rather than using p-queue directly.

### glob
| Property | Value |
|----------|-------|
| **Version** | ^13.0.0 |
| **Purpose** | File pattern matching for MCP tools (glob search) |

Used in `mcpTools.ts` for the `glob` MCP tool implementation.

### hono (included above)
See Web Framework section.

## Build Tools

### TypeScript
| Property | Value |
|----------|-------|
| **Version** | ^5.8.2 |
| **Purpose** | Type checking and type safety |
| **Config** | `tsconfig.json` with strict mode |

### @types/bun
| Property | Value |
|----------|-------|
| **Version** | ^1.3.11 |
| **Purpose** | TypeScript types for Bun runtime |

### @types/node
| Property | Value |
|----------|-------|
| **Version** | ^22.0.0 |
| **Purpose** | TypeScript types for Node.js |

## Build Process

```bash
# Production build
bun build bin/cli.ts src/proxy/server.ts \
  --outdir dist \
  --target node \
  --splitting \
  --external @anthropic-ai/claude-agent-sdk \
  --entry-naming '[name].js'

# Post-build validation
node --check dist/cli.js && node --check dist/server.js
```

Key points:
- `--external @anthropic-ai/claude-agent-sdk` keeps SDK as external dependency
- `--target node` ensures Node.js compatibility
- `--splitting` enables code splitting

## Testing

| Property | Value |
|----------|-------|
| **Framework** | Bun Test |
| **Command** | `bun test` |
| **Location** | `src/__tests__/` |

Test files cover: proxy session management, streaming, error handling, MCP tool filtering, passthrough mode, agent definitions, and more.
