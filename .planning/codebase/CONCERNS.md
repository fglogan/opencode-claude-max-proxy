# Codebase Concerns

**Analysis Date:** 2026-03-21
**Domain:** Local Anthropic API Proxy for Claude Max + OpenCode
**Confidence:** HIGH

## Summary

The opencode-claude-max-proxy is a transparent proxy that enables Claude Max subscriptions to be used with OpenCode while preserving multi-model agent routing. It bridges the Claude Agent SDK with OpenCode's native tool execution system through a sophisticated PreToolUse hook mechanism. While functional and actively maintained, several architectural, operational, and security considerations warrant attention.

**Primary concerns:** Monolithic server.ts complexity, Bun subprocess segfault issue, session expiry constraints, and credential handling in Docker environments.

---

## Limitations

### Known Bun Runtime Issue (Segfault)

| Property | Value |
|----------|-------|
| Issue | SDK subprocess (`cli.js`) can segfault during stream cleanup |
| Severity | MEDIUM |
| Impact | Crash occurs AFTER response completion — responses are always delivered correctly |
| Mitigation | Supervisor auto-restarts within ~1 second |
| Reference | [oven-sh/bun#17947](https://github.com/oven-sh/bun/issues/17947) |

**Details:** Each SDK query spawns a subprocess (~11MB). The issue manifests when multiple concurrent requests cause stream cleanup contention. The concurrency queue (`MAX_CONCURRENT_SESSIONS`, default: 10) mitigates but does not eliminate this risk.

**Workaround:** The `claude-proxy-supervisor.sh` script detects crashes and auto-restarts the proxy.

### Session Expiry (24-Hour TTL)

| Property | Value |
|----------|-------|
| Issue | Sessions expire after 24 hours of inactivity |
| Location | `src/proxy/server.ts` line 41, `src/proxy/sessionStore.ts` line 24 |
| Impact | Long-running conversations may lose context if idle > 24 hours |
| Mitigation | Fingerprint-based session resume for new sessions; explicit session headers via plugin |

**Details:** Sessions are stored in-memory (Map) and persisted to `~/.cache/opencode-claude-max-proxy/sessions.json` for cross-proxy resume. Both in-memory and file-based sessions are pruned after 24 hours.

### Claude Code-Only Tools

| Property | Value |
|----------|-------|
| Issue | Certain Claude Code SDK tools have no OpenCode equivalent and must be blocked |
| Blocked Tools | `ToolSearch`, `CronCreate`, `CronDelete`, `CronList`, `EnterPlanMode`, `ExitPlanMode`, `EnterWorktree`, `ExitWorktree`, `NotebookEdit` |
| Risk | Claude may attempt to use these tools, causing unexpected behavior |

**Details:** In passthrough mode, these tools are explicitly blocked via `CLAUDE_CODE_ONLY_TOOLS` array. In internal mode, the fuzzy agent matching system may fail if agent names are misspelled or use non-standard capitalization.

### Grok Adapter Limitations

| Property | Value |
|----------|-------|
| Issue | Grok adapter has limited MCP/tool support compared to Claude |
| Location | `src/providers/grok.ts` line 94 |
| Impact | Passthrough mode disabled for Grok provider (`supportsPassthrough()` returns `false`) |
| Implication | Grok provider executes tools internally via SDK, bypassing OpenCode agent routing |

**Details:** The Grok adapter uses OpenAI-compatible API translation but lacks proper tool forwarding support. Multi-model delegation to Grok is therefore limited to basic chat completions.

### Schema-Incompatible Tools

| Property | Value |
|----------|-------|
| Issue | Tools where SDK and OpenCode use different parameter names/schemas |
| Examples | `AskUserQuestion` (SDK) vs `question` (OpenCode), `Agent` vs `delegate_task/task`, `WebSearch` vs `websearch_web_search_exa` |
| Mitigation | Block SDK versions, use OpenCode equivalents via MCP passthrough |

---

## Security

### Local-Only Proxy Design

| Property | Value |
|----------|-------|
| Default Bind | `127.0.0.1:3456` |
| Production Bind | `0.0.0.0:3456` (Docker) |
| Risk | Remote access exposes proxy to network attacks |

**Details:** The proxy authenticates via Claude's `claude login` session tokens, not API keys. However, when bound to `0.0.0.0`, any network client can attempt authentication. The CORS policy allows all origins (`origin: "*"`).

**Recommendations:**
- Use firewall rules or VPN for remote access
- Consider mTLS or API key authentication for production deployments
- Add rate limiting on unauthenticated endpoints

### Credential Handling in Docker

| Property | Value |
|----------|-------|
| Issue | Docker auth requires copying credentials from host |
| Script | `bin/docker-auth.sh` |
| Risk | Credentials written to container filesystem temporarily |
| Platform Issue | macOS Keychain stores scopes differently than Linux file format |

**Details:** The `docker-auth.sh` script reads `~/.claude/.credentials.json`, modifies the scopes format, and pipes it into the container. On failure, credentials may persist in container filesystem.

**Mitigation:** Use volume-mounted credentials on Linux; macOS workaround handles format conversion but introduces complexity.

### Claude Code Process Execution

| Property | Value |
|----------|-------|
| Issue | Proxy spawns Claude Code subprocess with `bypassPermissions` and `allowDangerouslySkipPermissions` |
| Location | `src/proxy/server.ts` lines 641-642, 815-816 |
| Risk | Arbitrary command execution if tools are compromised |

**Details:** The SDK is configured with `permissionMode: "bypassPermissions"` and `allowDangerouslySkipPermissions: true` to enable transparent tool execution. This grants the Claude Code subprocess elevated permissions.

**Recommendations:**
- Run proxy in isolated environments (containers)
- Avoid running with production filesystem access
- Monitor spawned processes

### OpenCode Authentication Override

| Property | Value |
|----------|-------|
| Issue | OpenCode may cache Anthropic API keys that override proxy auth |
| Mitigation | README instructs users to run `opencode auth logout` before using proxy |
| Risk | Proxy bypassed silently, requests go directly to Anthropic API |

**Details:** If OpenCode has a cached API key for Anthropic, it will use that instead of the proxy. Users must explicitly log out of Anthropic auth in OpenCode.

### Sensitive Data in Logs

| Property | Value |
|----------|-------|
| Issue | Debug logging may include request/response data |
| Location | `src/proxy/server.ts` line 1031 |
| Risk | Sensitive content logged if `CLAUDE_PROXY_DEBUG=1` |

**Details:** The response completion logging at line 1031 logs `streamEventsSeen`, `eventsForwarded`, `textEventsForwarded`, `bytesSent`, and `durationMs`. While not explicitly sensitive, the debug logging infrastructure could expose content if enabled.

### CORS Configuration

| Property | Value |
|----------|-------|
| Setting | `origin: "*"`, `allowMethods: ["GET", "POST", "OPTIONS"]` |
| Risk | Any website can make requests to the proxy |
| Context | Acceptable for localhost-only deployment |

**Note:** For production deployments exposed beyond localhost, implement stricter CORS policies.

---

## Performance

### Concurrency Control

| Property | Value |
|----------|-------|
| Default Limit | 10 concurrent SDK sessions (`MAX_CONCURRENT_SESSIONS`) |
| Env Variable | `CLAUDE_PROXY_MAX_CONCURRENT` |
| Risk | Queue buildup under high load |

**Details:** Each request spawns an SDK subprocess (~11MB). To prevent memory exhaustion and subprocess crashes, requests beyond `MAX_CONCURRENT_SESSIONS` are queued. This can cause request backlog during high concurrency.

**Tuning:** Increase `CLAUDE_PROXY_MAX_CONCURRENT` with caution — more concurrency increases segfault risk.

### Memory Usage

| Property | Value |
|----------|-------|
| SDK Subprocess | ~11MB per session |
| Session Cache | In-memory Map + file persistence |
| Session TTL | 24 hours |

**Details:** Memory grows linearly with concurrent sessions. Long-running proxies accumulate sessions until TTL expiration (hourly cleanup interval).

### Session Resume Mechanism

| Property | Value |
|----------|-------|
| Primary Method | Header-based (`X-Opencode-Session`) via plugin |
| Fallback Method | Fingerprint-based (SHA-256 of first user message) |
| Risk | Fingerprint collisions could cause session confusion |

**Details:** Fingerprint fallback hashes `firstUser.content.slice(0, 2000)` — collisions are cryptographically improbable but theoretically possible for similar first messages.

### Idle Timeout

| Property | Value |
|----------|-------|
| Default | 120 seconds |
| Env Variable | `CLAUDE_PROXY_IDLE_TIMEOUT_SECONDS` |
| Applies To | HTTP keep-alive connections |

**Details:** After 120 seconds of inactivity, connections are closed. This may cause issues for long-polling or batch workloads.

### Streaming Overhead

| Property | Value |
|----------|-------|
| Heartbeat Interval | 15 seconds |
| SSE Format | `event: <type>\ndata: <json>\n\n` |

**Details:** SSE heartbeats prevent connection resets but add ~40 bytes/15s overhead per connection.

---

## Future Considerations

### Dependency on Claude Agent SDK

| Property | Value |
|----------|-------|
| Critical Dependency | `@anthropic-ai/claude-agent-sdk` |
| Risk | Upstream changes break proxy functionality |
| Mitigation | Daily maintenance review (`npm run maintain`) |

**Details:** The proxy relies heavily on specific SDK internals (PreToolUse hook, `cli.js` subprocess, message formats). SDK updates could introduce breaking changes.

**Upstream Change Categories:**
- **Adopt:** Compatible bugfixes, new features
- **Adapt:** Changes requiring architectural modifications
- **Reject:** Breaking changes incompatible with proxy goals

### Bun Runtime Dependency

| Property | Value |
|----------|-------|
| Issue | SDK subprocess is compiled with Bun |
| Impact | Runtime segfaults as documented in Bun issue #17947 |
| Future | Docker deployment with Node.js runtime reduces direct Bun dependency |

**Details:** The standalone npm package uses Node.js runtime, but the SDK's internal `cli.js` subprocess is still Bun-compiled. This is an upstream issue beyond the proxy's control.

### Multi-Instance Scaling

| Property | Value |
|----------|-------|
| Current | Single instance with file-based session sharing |
| Limitation | File-based session store not designed for high-frequency writes |
| Production Gap | No Redis or distributed cache |

**Considerations:**
- Add Redis session store for multi-instance deployments
- Implement sticky sessions or session affinity
- Add connection pooling for high-throughput scenarios

### MCP Tool Federation

| Property | Value |
|----------|-------|
| Current | Internal mode uses MCP tools; passthrough mode forwards to OpenCode |
| Gap | No MCP tool schema validation or versioning |

**Future Improvements:**
- Add MCP tool schema validation
- Implement tool version negotiation
- Add tool deprecation warnings

### Observability

| Property | Value |
|----------|-------|
| Current | Structured logging via `src/logger.ts` with AsyncLocalStorage |
| Missing | Distributed tracing, metrics, alerting |

**Recommendations:**
- Add OpenTelemetry or similar for request tracing
- Implement Prometheus metrics endpoint
- Add alerting for error rate thresholds

### Claude Max Terms of Service

| Property | Value |
|----------|-------|
| Disclaimer | Project is unofficial; users responsible for ToS compliance |
| Reference | README.md lines 349-355 |

**Note:** Anthropic's Terms of Service and Authorized Usage Policy may change. Users must monitor compliance independently.

---

## Technical Debt

### Monolithic Server Module

| Property | Value |
|----------|-------|
| File | `src/proxy/server.ts` |
| Size | ~1200 lines |
| Complexity | High cyclomatic complexity in `handleMessages` (~120) |

**Refactoring Recommendations:**
- Extract session management to `session-manager.ts`
- Extract error classification to `error-classifier.ts`
- Extract tool handling to `tool-handler.ts`
- Extract streaming logic to `stream-handler.ts`

### Provider Adapter Pattern Incomplete

| Property | Value |
|----------|-------|
| Issue | `TODO` in `src/providers/claude.ts` line 16 for config merging |
| Impact | Provider-specific settings may not propagate correctly |

**Details:** The Grok adapter lacks proper passthrough support. Adding new providers requires careful adherence to the adapter pattern.

### File-Based Session Store

| Property | Value |
|----------|-------|
| Issue | JSON file with atomic rename for each write |
| Risk | High-frequency reads/writes could cause lock contention |
| Scale Limit | Single-instance or shared filesystem only |

**Improvement:** Consider SQLite or Redis for production workloads.

---

## Dependencies at Risk

| Dependency | Risk Level | Impact | Mitigation |
|------------|------------|--------|------------|
| `@anthropic-ai/claude-agent-sdk` | HIGH | Breaking changes to PreToolUse hook | Daily upstream review |
| `hono` | LOW | Well-maintained, stable API | Standard updates |
| `bun` | MEDIUM | Runtime segfaults in SDK subprocess | Docker/Node fallback |
| `opencode` | MEDIUM | Tool schema changes | Passthrough mode auto-adapts |
| `oh-my-opencode` | LOW | Agent config changes | Dynamic agent definition extraction |

---

*Last updated: 2026-03-21*
