# Codebase Concerns

**Analysis Date:** 2026-03-21

## Tech Debt

**Monolithic Core Handler:**
- Issue: `src/proxy/server.ts` is 1109 lines with extreme cyclomatic complexity in key functions (createProxyServer: 134, handleMessages: 123, start: 56, classifyError: 21-26)
- Files: `src/proxy/server.ts`, `src/proxy/passthroughTools.ts`
- Impact: Difficult to maintain, test, debug or extend. High risk of regressions when modifying proxy logic, session handling or tool forwarding.
- Fix approach: Refactor into smaller modules (e.g. `session-manager.ts`, `error-classifier.ts`, `tool-handler.ts`, `provider-router.ts`). Extract methods and use composition. Target complexity <15 per function.

**Dependency Drift:**
- Issue: Multiple undeclared imports for Node builtins and test deps in `.opencode/package.json`; some unused deps declared.
- Files: `.opencode/package.json`
- Impact: Potential runtime issues in sub-project or test environment, inconsistent dependency management between main and .opencode.
- Fix approach: Update `.opencode/package.json` to properly declare all used modules (fs, path, child_process, etc as "dependencies" or use "bun" types). Remove unused. Run `bun install` in subdir if applicable.

**Large File & Flat Structure:**
- Issue: Core logic concentrated in few large files instead of well-layered modules.
- Files: `src/proxy/server.ts` (1109 LOC), `src/mcpTools.ts`
- Impact: Poor modularity, violates separation of concerns.
- Fix approach: Follow existing provider pattern (`src/providers/`) to split proxy concerns. Create dedicated directories like `src/proxy/handlers/`, `src/proxy/middleware/`.

## Known Bugs

**None critical detected:** Recent phases addressed TodoWrite schema issues and tool blocking. Tests passing.

## Security Considerations

**Environment & Keys:**
- Risk: Proxy handles API keys for multiple providers (Anthropic, OpenAI/xAI).
- Files: `src/providers/*.ts`, `src/proxy/server.ts`
- Current mitigation: Relies on env vars (not hardcoded). No secrets in committed code.
- Recommendations: Add input sanitization for tool calls, rate limiting on proxy endpoints, audit logging without sensitive data. Consider secret scanning in CI.

**Tool Passthrough:**
- Risk: Arbitrary tool execution via MCP passthrough.
- Files: `src/proxy/passthroughTools.ts`, `src/mcpTools.ts`
- Current mitigation: Dynamic registration and filtering.
- Recommendations: Ensure strict allow-list for sensitive tools, validate schemas thoroughly.

## Performance Bottlenecks

**Complexity & Session Management:**
- Problem: High complexity functions and Map-based session cache.
- Files: `src/proxy/server.ts`
- Cause: Single large handler processing all requests, complex error classification and message handling.
- Improvement path: Refactor, add caching optimizations, consider connection pooling if scaling.

## Fragile Areas

**Core Proxy Logic:**
- Files: `src/proxy/server.ts`, `src/proxy/agentMatch.ts`, `src/proxy/agentDefs.ts`
- Why fragile: High complexity, many conditionals for different providers, session resume logic (header vs fingerprint), tool name mapping/stripping.
- Safe modification: Use existing tests (`src/__tests__/proxy-*.test.ts`), make small incremental changes, run full test suite after edits.
- Test coverage: Good unit tests for specific features but integration may miss edge cases in high-complexity paths.

**Provider Adapters:**
- Files: `src/providers/claude.ts`, `src/providers/grok.ts`, `src/providers/base.ts`
- Why fragile: TODO for config merging in claude.ts. Translation layers for non-Claude providers.
- Safe modification: Extend base adapter pattern.

## Scaling Limits

**Session Cache:**
- Current capacity: In-memory Map, no persistence.
- Limit: Memory growth with many concurrent sessions, no cleanup beyond TTL.
- Scaling path: Add Redis or persistent store for production multi-instance deployment. Current Docker setup exists.

## Dependencies at Risk

**@anthropic-ai/claude-agent-sdk:**
- Risk: Heavy reliance on specific SDK version and PreToolUse hook behavior.
- Impact: Upstream changes could break proxy (as seen in maintenance phases).
- Migration plan: The `maintain` script (`npm run maintain`) and NSP review-upstream handle this. Monitor SDK updates.

**Hono & Bun:**
- Risk: Bun-specific APIs.
- Impact: Limits deployment options.
- Migration plan: Docker + standalone mode in Phase 6 addresses some concerns.

## Missing Critical Features

**Comprehensive Logging:**
- Problem: Some console.logs or insufficient structured logging in complex paths.
- Blocks: Observability in production proxy usage.

**Full E2E Tests for Multi-Provider:**
- Some tests exist but gaps in full passthrough scenarios for Grok.

## Test Coverage Gaps

**High Complexity Paths:**
- What's not tested: All branches in the 100+ complexity functions.
- Files: `src/proxy/server.ts`
- Risk: Regressions in session resume, error handling, tool forwarding.
- Priority: High

**Production Deployment Scenarios:**
- Untested: Multi-instance scaling, high concurrency without queue.

---

*Concerns audit: 2026-03-21*
