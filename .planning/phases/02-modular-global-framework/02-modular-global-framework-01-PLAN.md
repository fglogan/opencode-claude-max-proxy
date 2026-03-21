---
phase: 02-modular-global-framework
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: ["src/providers/base.ts", "src/providers/claude.ts", "src/providers/registry.ts", "src/proxy/server.ts", "src/proxy/types.ts"]
autonomous: true
requirements: ["FRAME-01"]
user_setup: []
prediction: null
must_haves:
  truths:
    - "Users running the existing Claude proxy commands experience no change in behavior or setup"
    - "The codebase structure clearly separates shared proxy server logic, session management, logging from provider-specific SDK integrations"
    - "Adding a new provider requires only implementing a standard adapter interface and configuration"
    - "Basic extension documentation allows developers to understand and extend the framework"
  artifacts:
    - path: "src/providers/base.ts"
      provides: "ProviderAdapter interface and base types"
    - path: "src/providers/claude.ts"
      provides: "Claude-specific adapter implementation"
      exports: ["ClaudeProvider"]
    - path: "src/providers/registry.ts"
      provides: "Provider registry and factory"
    - path: "src/proxy/server.ts"
      provides: "Updated to use provider adapter with backward compatibility"
  key_links:
    - from: "src/proxy/server.ts"
      to: "src/providers/registry.ts"
      via: "getProviderAdapter factory"
      pattern: "getProviderAdapter"
    - from: "src/providers/claude.ts"
      to: "src/proxy/server.ts"
      via: "PreToolUse hook and query"
      pattern: "query.*PreToolUse"
---

<objective>
Refactor the monolithic proxy into a modular global framework by introducing a ProviderAdapter interface, implementing it for Claude, and updating the core server to use providers. This decouples provider-specific SDK logic from shared proxy concerns.

Purpose: Enable maintainable extension to other providers (e.g. Grok in Phase 3) without duplicating session, streaming, error handling, or MCP logic. Ensures 100% backward compatibility for existing Claude usage.

Output: New providers/ directory with interface + Claude adapter, refactored server.ts, updated types, and extension docs.
</objective>

<execution_context>
$(nsp content show workflows execute-plan --raw)
$(nsp content show templates summary --raw)
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/REQUIREMENTS.md
@.planning/ARCHITECTURE.md
@.planning/ANALYSIS.md
@.planning/LEARNINGS.md
@src/proxy/server.ts
@src/proxy/types.ts
@src/proxy/agentDefs.ts
@src/proxy/passthroughTools.ts
@src/mcpTools.ts
@src/logger.ts

<interfaces>
From src/proxy/types.ts:
```typescript
export interface ProxyConfig {
  port: number;
  host: string;
  debug: boolean;
  idleTimeoutSeconds: number;
}
export const DEFAULT_PROXY_CONFIG: ProxyConfig = { ... };
```

From src/proxy/server.ts:
```typescript
export function createProxyServer(config: Partial<ProxyConfig> = {}): Hono
export function clearSessionCache(): void
```

From src/proxy/agentDefs.ts:
```typescript
export interface AgentDefinition { ... }
export function buildAgentDefinitions(...): AgentDefinition[]
```

Key patterns to preserve:
- Session cache using opencodeSessionId or fingerprint
- PreToolUse hook for passthrough vs internal mode
- Dynamic MCP server creation
- Error classification and streaming handling
- Test compatibility (all 100+ tests must pass)
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create ProviderAdapter interface, registry, and Claude adapter skeleton</name>
  <files>src/providers/base.ts src/providers/registry.ts src/providers/claude.ts src/providers/index.ts</files>
  <action>Create new src/providers/ directory with:
- base.ts: export interface ProviderAdapter { name: string; createQueryHandler(config: ProxyConfig): any; supportsPassthrough(): boolean; getMcpServer(tools?: any): any; } 
- registry.ts: export function getProviderAdapter(name?: string): ProviderAdapter; registerProvider(name: string, adapter: ProviderAdapter): void; default to 'claude'
- claude.ts: export class ClaudeAdapter implements ProviderAdapter { name = 'claude'; ... } that encapsulates the SDK query, PreToolUse logic, agentDefs, passthrough from existing server.ts (move relevant code here, do not duplicate session or error logic)
- index.ts: re-export all
Use existing patterns from ANALYSIS.md and server.ts. Do not change any behavior. Comment all moved logic with "Moved to ClaudeAdapter". Run tsc --noEmit after.
Note: This is interface-first per planning guidelines - contracts defined before implementation.</action>
  <verify>ls src/providers/ && tsc --noEmit && grep -c "ProviderAdapter" src/providers/base.ts</verify>
  <done>ProviderAdapter interface defined and exported, ClaudeAdapter skeleton created that can be instantiated via registry, types compile cleanly, no behavior changes yet</done>
</task>

<task type="auto">
  <name>Task 2: Refactor server.ts to use provider adapter and update entry points</name>
  <files>src/proxy/server.ts src/proxy/types.ts README.md</files>
  <action>Update src/proxy/server.ts to:
- Import from '../providers'
- Use getProviderAdapter(config.provider || 'claude') to get adapter
- Replace direct SDK query and hook setup with adapter.createQueryHandler(...) or equivalent
- Keep all session management, error classification, streaming, MCP prefix logic in server.ts (shared)
- Add provider config option to ProxyConfig (optional, default 'claude')
- Update createProxyServer to accept and pass provider to adapter
- Update bin/claude-proxy.ts if needed for config
- Add comment in README.md section on "Extending with new providers" explaining how to implement ProviderAdapter
Ensure zero capability loss: all existing env vars, endpoints, modes (internal/passthrough), tests continue to work identically. Use grep to find all SDK references and route through adapter. Follow parity hardening: document any divergences from original in comments.</action>
  <verify>tsc --noEmit && bun test --filter=proxy-transparent-tools && echo "Tests pass for key proxy features"</verify>
  <done>Server uses provider adapter for Claude with no behavior change, new provider config supported, README has extension section, all tests passing, parity confirmed via test run</done>
</task>

</tasks>

<verification>
Run full test suite: bun test
Verify backward compatibility: ./bin/claude-proxy.ts --help and health check
Check structure: grep -r "ProviderAdapter" src/
Confirm no regressions in session, streaming, PreToolUse, MCP passthrough
</verification>

<success_criteria>
- [ ] ProviderAdapter interface implemented and used
- [ ] Claude functionality fully preserved (tests pass, same behavior)
- [ ] Code separation achieved (SDK logic in providers/claude.ts)
- [ ] Extension path documented
- [ ] FRAME-01 requirement addressed
- [ ] Parity audit notes added for Phase 3
</success_criteria>

<output>
After completion, create `.planning/phases/02-modular-global-framework/02-modular-global-framework-01-SUMMARY.md`
</output>
