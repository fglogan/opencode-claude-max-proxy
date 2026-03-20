---
phase: 06-standalone-proxy-deployment
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: ["src/proxy/types.ts", "src/proxy/server.ts", "Dockerfile", "docker-compose.yml", "README.md", ".planning/ROADMAP.md"]
autonomous: true
requirements: ["DEPLOY-01", "DOC-01"]
user_setup: []
must_haves:
  truths:
    - "Proxy can be built and run successfully in a Docker container"
    - "Server binds to 0.0.0.0 by default in production or when CLAUDE_PROXY_HOST=0.0.0.0"
    - "Deployment documentation clearly explains Docker, npm global install, and cloud setup steps"
    - "Dashboard, health check, and proxy endpoints are accessible from outside the container"
    - "Environment variables control host, port, and mode correctly in deployed environments"
  artifacts:
    - path: "Dockerfile"
      provides: "Container build instructions using Bun"
      min_lines: 25
    - path: "README.md"
      provides: "New Deployment section"
      contains: "Docker deployment"
    - path: "src/proxy/types.ts"
      provides: "Updated DEFAULT_PROXY_CONFIG with env-aware host"
      contains: "CLAUDE_PROXY_HOST"
  key_links:
    - from: "src/proxy/server.ts"
      to: "types.ts"
      via: "createProxyServer and startProxyServer"
      pattern: "finalConfig\.host"
    - from: "Dockerfile"
      to: "src/proxy/server.ts"
      via: "CMD and entrypoint"
      pattern: "bun run"
---

<objective>
Make the proxy deployable as a standalone production service.

Purpose: Allow users to run the proxy in containers or on cloud servers without local dev dependencies, enabling remote/shared use while preserving all functionality including dashboard and multi-provider support.
Output: Dockerfile, updated config for prod hosts, comprehensive deployment docs.
</objective>

<execution_context>
$(nsp content show workflows execute-plan --raw)
$(nsp content show templates summary --raw)
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/ARCHITECTURE.md
@src/proxy/types.ts
@src/proxy/server.ts
@README.md
</context>

<interfaces>
From src/proxy/types.ts:
```typescript
export interface ProxyConfig {
  port: number
  host: string
  debug: boolean
  idleTimeoutSeconds: number
  provider?: string
}

export const DEFAULT_PROXY_CONFIG: ProxyConfig = {
  port: 3456,
  host: "127.0.0.1",
  debug: process.env.CLAUDE_PROXY_DEBUG === "1",
  idleTimeoutSeconds: 120
}
```

From src/proxy/server.ts key exports:
```typescript
export function createProxyServer(config: Partial<ProxyConfig> = {})
export async function startProxyServer(config: Partial<ProxyConfig> = {})
// Uses finalConfig = { ...DEFAULT_PROXY_CONFIG, ...config }
// Listens with Bun.serve({ port, hostname: finalConfig.host })
```
</interfaces>

<tasks>

<task type="auto">
  <name>Task 1: Update configuration defaults for production deployment</name>
  <files>src/proxy/types.ts, src/proxy/server.ts</files>
  <action>Update DEFAULT_PROXY_CONFIG in types.ts to read CLAUDE_PROXY_HOST from env with fallback to "127.0.0.1" (keep current behavior), and make host "0.0.0.0" if NODE_ENV=production or CLAUDE_PROXY_HOST not set to localhost. Update server.ts startProxyServer to log the effective binding address clearly and ensure CORS allows remote origins if needed. Avoid breaking existing local behavior. Reference existing env parsing patterns in server.ts.</action>
  <verify>npm run typecheck && bun test --filter=proxy-working-directory</verify>
  <done>DEFAULT host respects env var and production mode; server starts with correct hostname; tests pass</done>
</task>

<task type="auto">
  <name>Task 2: Add Dockerfile and docker-compose for standalone deployment</name>
  <files>Dockerfile, docker-compose.yml</files>
  <action>Create a minimal multi-stage or single-stage Dockerfile using oven/bun:1 as base, copy package files, install deps, copy src and bin, expose port 3456, set CMD to use supervisor script with passthrough mode. Create docker-compose.yml with env_file support, volume for claude credentials if applicable (/root/.claude or equivalent), and healthcheck. Use production-ready practices: non-root user if possible, but keep simple for Bun. Do not add unnecessary layers.</action>
  <verify>docker build -t opencode-claude-max-proxy . --no-cache | tail -20 && docker run --rm -p 3457:3456 -e CLAUDE_PROXY_PASSTHROUGH=1 --name test-proxy opencode-claude-max-proxy timeout 5s docker logs test-proxy || echo "Build successful (auth expected to fail in CI)"</verify>
  <done>Dockerfile builds without errors, docker-compose.yml present with services and volumes, proxy starts in container</done>
</task>

<task type="auto">
  <name>Task 3: Update documentation and roadmap for deployment</name>
  <files>README.md, .planning/ROADMAP.md</files>
  <action>Add a new "## Deployment" section to README.md after Quick Start, covering: 1. Docker (build/run commands, env vars, volumes for auth), 2. Global npm install for production, 3. Cloud (Vercel notes if applicable, or VPS with systemd), 4. Auth in container (claude login inside container or mount ~/.config/claude). Update any config tables. Mark phase complete in ROADMAP.md and update progress table. Keep docs concise and actionable.</action>
  <verify>grep -A 30 "Deployment" README.md && grep -A 5 "Phase 6" .planning/ROADMAP.md</verify>
  <done>README has complete deployment section with examples; ROADMAP updated with success criteria met; no broken links or outdated info</done>
</task>

</tasks>

<verification>
Run full test suite and manual verification:
- docker build succeeds
- Local proxy still works as before (`bun run proxy`)
- Deployed container serves /health and /dashboard
- Env vars override host/port correctly
</verification>

<success_criteria>
All must_haves truths are observable:
- Container runs proxy on port 3456 accessible externally
- Documentation enables first-time deployers to succeed in <10 minutes
- No regression in local development workflow
- Phase marked complete in ROADMAP and STATE updated
</success_criteria>

<output>
After completion, create `.planning/phases/06-standalone-proxy-deployment/06-standalone-proxy-deployment-01-SUMMARY.md` using the template.
</output>
