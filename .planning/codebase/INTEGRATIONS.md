# Integrations

**Project:** opencode-claude-max-proxy  
**Version:** 1.12.0  
**Researched:** 2026-03-21

## Anthropic / Claude

### Claude Code SDK
| Property | Value |
|----------|-------|
| **Package** | @anthropic-ai/claude-agent-sdk |
| **Version** | ^0.2.80 |
| **Purpose** | Agent execution, session management, tool hooks |
| **Key Features** | PreToolUse hooks, MCP tool servers, session resume |

### Claude API
| Property | Value |
|----------|-------|
| **Auth Method** | Claude Code CLI (`claude auth status`) |
| **Requirement** | Claude Max subscription |
| **CLI Dependency** | @anthropic-ai/claude-code installed globally |

The proxy uses the Claude Code CLI executable for authentication and session management. The SDK spawns `cli.js` subprocess for each request.

### Provider Adapter: ClaudeAdapter
- Uses `@anthropic-ai/claude-agent-sdk` `query()` function
- Supports session resume via SDK's `resume` option
- Supports passthrough mode for multi-model delegation
- MCP tools via `opencodeMcpServer`

## xAI / Grok

### Provider Adapter: GrokAdapter
| Property | Value |
|----------|-------|
| **Package** | openai |
| **Version** | ^6.32.0 |
| **API Endpoint** | https://api.x.ai/v1 |
| **Default Model** | grok-beta |
| **Auth Env Var** | XAI_API_KEY or OPENAI_API_KEY |

### Grok Integration Details
- OpenAI-compatible API via `openai` SDK with custom baseURL
- Translation layer converts OpenAI chat completions to Claude SDK message format
- System prompt: "You are Grok, a helpful and maximally truthful AI."
- Limited MCP/tool support (passthrough mode not supported)

## OpenCode

### OpenCode AI Integration
| Property | Value |
|----------|-------|
| **Purpose** | AI coding assistant that proxies to this server |
| **Auth Header** | X-Opencode-Session |
| **Session ID** | X-Claude-Session-ID |

### OpenCode Tool Mapping
The proxy maps OpenCode tools to MCP tools:

| OpenCode Tool | MCP Tool |
|---------------|----------|
| read | mcp__opencode__read |
| write | mcp__opencode__write |
| edit | mcp__opencode__edit |
| bash | mcp__opencode__bash |
| glob | mcp__opencode__glob |
| grep | mcp__opencode__grep |

### Passthrough Mode
When `CLAUDE_PROXY_PASSTHROUGH=1`:
- All Claude tool execution is forwarded to OpenCode
- Enables multi-model delegation (Grok, GPT, Gemini via oh-my-opencode)
- Uses `createPassthroughMcpServer()` to expose OpenCode tools as MCP

## MCP (Model Context Protocol)

### MCP Tool Server
| Property | Value |
|----------|-------|
| **Server Name** | opencode |
| **Version** | 1.0.0 |
| **Creation** | `createSdkMcpServer()` from @anthropic-ai/claude-agent-sdk |

### Available MCP Tools

| Tool | Purpose | Implementation |
|------|---------|----------------|
| read | File content reading | mcpTools.ts - fs.readFile |
| write | File writing with mkdir | mcpTools.ts - fs.writeFile |
| edit | String replacement | mcpTools.ts - content.replace |
| bash | Command execution | mcpTools.ts - child_process.exec |
| glob | Pattern matching | mcpTools.ts - glob library |
| grep | Regex search | mcpTools.ts - grep command |
| scan_report | Code analysis | mcpTools.ts - gaps/genesis-static-analyzer |

### PreToolUse Hooks
The SDK's `PreToolUse` hook system is used for:
1. **Agent name fuzzy matching** - Maps OpenCode agent names to SDK format
2. **Tool interception** - Captures and forwards tools in passthrough mode
3. **Blocked tools** - Prevents SDK built-in tools, uses MCP replacements instead

Blocked SDK built-in tools:
- Read, Write, Edit, MultiEdit, Bash, Glob, Grep, NotebookEdit, WebFetch, WebSearch

## Environment Variables

### Core Configuration
| Variable | Default | Purpose |
|----------|---------|---------|
| CLAUDE_PROXY_PORT | 3456 | Server port |
| CLAUDE_PROXY_HOST | 127.0.0.1 | Server bind address |
| CLAUDE_PROXY_WORKDIR | cwd | Working directory for tool execution |
| CLAUDE_PROXY_IDLE_TIMEOUT_SECONDS | 120 | Keep-alive timeout |
| CLAUDE_PROXY_MAX_CONCURRENT | 10 | Max concurrent sessions |
| CLAUDE_PROXY_PASSTHROUGH | 0 | Enable passthrough mode |

### Provider Configuration
| Variable | Purpose |
|----------|---------|
| XAI_API_KEY | xAI/Grok API key (fallback: OPENAI_API_KEY) |
| ANTHROPIC_API_KEY | Set to `dummy` when using proxy |
| ANTHROPIC_BASE_URL | Override to proxy URL |

### Debugging
| Variable | Purpose |
|----------|---------|
| CLAUDE_PROXY_DEBUG | Enable debug logging |

## Containerization

### Docker
| Property | Value |
|----------|-------|
| **Build Image** | oven/bun:1 |
| **Runtime Image** | node:22-alpine |
| **Health Check** | GET /health |
| **Exposed Port** | 3456 |

### Docker Compose
- Volume `claude-auth` persists Claude authentication
- `init` service fixes volume permissions
- Restart policy: `unless-stopped`

### Docker Entrypoint
- `docker-entrypoint.sh` - Main entrypoint
- `claude-proxy-supervisor.sh` - Process supervisor

## External Tools (Optional)

### Genesis AI Pathology Scanner (gaps)
| Property | Value |
|----------|-------|
| **Purpose** | Code quality scanning |
| **MCP Tool** | scan_report with scanner="gaps" |
| **Command** | gaps scan |

### Genesis Static Analyzer
| Property | Value |
|----------|-------|
| **Purpose** | Static code analysis |
| **MCP Tool** | scan_report with scanner="static" |
| **Command** | genesis-static-analyzer scan |

These tools are invoked via the `scan_report` MCP tool when available.
