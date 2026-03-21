# Roadmap: opencode-claude-max-proxy

## Overview

This roadmap evolves the Claude-specific proxy into a permanent, global, multi-provider framework. It incorporates full analysis of current implementation, internal architecture mapping, modular design for maintainability, Grok support, automated upstream change monitoring, and comprehensive documentation. Parity with existing Claude functionality is explicitly hardened.

## Phases

- [x] **Phase 1: Analysis and Architecture Mapping** - Fully analyze proxy and map/document internal Genesis IT architecture (completed 2026-03-20)
- [x] **Phase 2: Modular Global Framework** - Refactor into extensible provider-agnostic core with Claude adapter (completed 2026-03-20)
- [x] **Phase 3: Parity Hardening and Grok Integration** - Ensure no capability loss and add Grok provider support (completed 2026-03-20)
- [x] **Phase 4: Automated Maintenance and Documentation** - Implement daily reviews/auto-updates and finalize docs (completed 2026-03-20)
- [x] **Phase 5: Multi-Provider Dashboard** - Design opencode multi-provider proxy dashboard based on OmniRoute patterns (completed 2026-03-20)

## Phase Details

### Phase 1: Analysis and Architecture Mapping
**Goal**: The current proxy implementation and the surrounding internal IT architecture are fully understood, reviewed, and documented so that future work builds on accurate knowledge.
**Depends on**: None (first phase)
**Requirements**: ANAL-01, ARCH-01
**Success Criteria** (what must be TRUE):
  1. Users can read a detailed analysis report that accurately describes the basic steps taken in building the proxy (PreToolUse hook usage, passthrough vs internal modes, session resume via headers/fingerprint).
  2. A visual and textual map of the internal IT architecture exists, documenting components like NSP planning system, MCP tools, OpenCode agent routing, Genesis gaps scanner, Obsidian/CASS memory, and how proxies integrate.
  3. All key design decisions, tradeoffs, and limitations from the original implementation are cataloged in LEARNINGS.md or dedicated architecture docs.
  4. Developers can quickly onboard and understand the "why" behind passthrough delegation for multi-model support.
**Plans**: 1 plan
- [x] 01-analysis-01-PLAN.md — Full analysis of current proxy implementation and creation of Genesis IT architecture map (completed 2026-03-20)

### Phase 2: Modular Global Framework
**Goal**: A clean, maintainable global proxy framework exists that decouples core proxy logic from specific AI providers.
**Depends on**: Phase 1
**Requirements**: FRAME-01
**Success Criteria** (what must be TRUE):
  1. Users running the existing Claude proxy commands experience no change in behavior or setup.
  2. The codebase structure clearly separates shared proxy server logic, session management, logging from provider-specific SDK integrations.
  3. Adding a new provider requires only implementing a standard adapter interface and configuration.
  4. Basic extension documentation allows developers to understand and extend the framework.
**Plans**: 1 plan
- [x] 02-modular-global-framework-01-PLAN.md — Create ProviderAdapter interface, Claude adapter, and refactor server.ts for modular multi-provider support (completed 2026-03-20)

### Phase 3: Parity Hardening and Grok Integration + OmniRoute Routing
**Goal**: Claude functionality is fully preserved (parity) while Grok support is added, allowing users to spin up multiple Grok instances seamlessly. Integrate OmniRoute concepts for cost-optimized any-model routing, Gemini OAuth, fuzzy/mlua rules, memory fabric with NSP V2.
**Depends on**: Phase 2
**Requirements**: PARITY-01, GROK-01, ROUTE-01
**Success Criteria** (what must be TRUE):
  1. All original tests pass and users observe identical Claude Max + OpenCode behavior as before the refactor.
  2. Users can start Grok proxies using analogous environment variables and commands, with passthrough agent delegation working for xAI models.
  3. Multi-provider setups (Claude + Grok in same ecosystem) function correctly with OpenCode's model routing.
  4. OmniRoute-inspired cost-optimized routing, Gemini OAuth, fuzzy logic, mlua rules integrated with memory fabric and NSP V2.
  5. A parity audit report (including call-graph/API comparison) confirms no regressions in tool forwarding, error handling, streaming, or concurrency.
**Plans**: 1 plan
- [x] 03-parity-hardening-and-grok-integration-01-PLAN.md — Parity audit, GrokAdapter implementation, registry updates, model routing hardening, and as-built docs (completed 2026-03-20)

### Phase 4: Automated Maintenance and Documentation
**Goal**: The global proxy stays current automatically and is fully documented for long-term maintainability.
**Depends on**: Phase 3
**Requirements**: MAINT-01, DOC-01
**Success Criteria** (what must be TRUE):
  1. A daily automated process (script/CI) reviews upstream changes in Anthropic SDK, xAI APIs, OpenCode, and related deps, flagging or auto-applying compatible updates.
  2. Users and the system have a clear, executable maintenance guide that keeps the proxy working as upstream evolves.
  3. Complete documentation covers architecture, all providers, configuration, troubleshooting, and extension points.
  4. The project is structured for easy ongoing maintenance with clear module boundaries and tests.
**Plans**: 1 plan
- [x] 04-automated-maintenance-and-documentation-01-PLAN.md — Implement automated upstream review command, update maintenance guide, and synchronize all documentation (completed 2026-03-20)

### Phase 5: Multi-Provider Proxy and Dashboard
**Goal**: Design and implement a comprehensive dashboard for the opencode multi-provider proxy inspired by OmniRoute for better observability and management of providers, routing, logs and health.
**Depends on**: Phase 4
**Requirements**: ROUTE-01, DOC-01
**Success Criteria** (what must be TRUE):
  1. Users can access a dashboard at /dashboard with sections for providers, routing, analytics, health.
  2. Dashboard integrates with the proxy server providing real-time data.
  3. UI follows similar patterns to OmniRoute but remains lightweight single-file HTML/JS.
  4. Documentation updated with dashboard usage.
**Plans**: 1 plan
- [x] 05-multi-provider-proxy-and-dashboard-01-PLAN.md — Research OmniRoute patterns, enhance dashboard HTML, integrate with server (completed)

### Phase 7: Upstream Sync and Stabilization
**Goal**: Merge upstream v1.12.0 changes (Docker, multimodal, session store, resume fixes, CLI rename) into local fork while preserving all local customizations, then verify parity and stabilize.
**Depends on**: Phase 6
**Requirements**: SYNC-01, PARITY-02
**Success Criteria** (what must be TRUE):
  1. All upstream v1.12.0 features are present in the codebase.
  2. All local customizations (provider routing, circuit breaker, scan_report, agent matching) are preserved.
  3. TypeScript compiles with zero errors.
  4. All tests pass (existing + upstream new tests).
  5. STATE.md updated with merge log.
**Plans**: 1 plan
- [x] 07-01-PLAN.md — Merge upstream v1.12.0 with conflict resolution, parity verification, and state update (completed 2026-03-21)

## Progress

**Execution Order:**
Phases execute in numeric order.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Analysis and Architecture Mapping | 1/1 | Complete | 2026-03-20 |
| 2. Modular Global Framework | 1/1 | Complete | 2026-03-20 |
| 3. Parity Hardening and Grok Integration | 1/1 | Complete | 2026-03-20 |
| 4. Automated Maintenance and Documentation | 1/1 | Complete | 2026-03-20 |
| 5. Multi-Provider Proxy and Dashboard | 1/1 | Complete | 2026-03-20 |
| 6. Standalone Proxy Deployment | 1/1 | Complete | 2026-03-20 |
| 7. Upstream Sync and Stabilization | 1/1 | Complete | 2026-03-21 |

*Last updated: 2026-03-21*

## Coverage

All 9 v1 requirements mapped:
- ANAL-01 → Phase 1
- ARCH-01 → Phase 1
- FRAME-01 → Phase 2
- PARITY-01 → Phase 3
- GROK-01 → Phase 3
- ROUTE-01 → Phase 3
- MAINT-01 → Phase 4
- DOC-01 → Phase 4,6
- DEPLOY-01 → Phase 6

✓ 100% coverage. No orphans. This is a parity/migration milestone with dedicated hardening in Phase 3.
### Phase 6: Standalone Proxy Deployment
**Goal**: The proxy is packaged for easy standalone deployment as a production service using Docker (and optionally Vercel/serverless), with production configuration, security considerations, and complete deployment documentation.
**Depends on**: Phase 5
**Requirements**: DEPLOY-01, DOC-01
**Success Criteria** (what must be TRUE):
  1. A working Dockerfile and docker-compose.yml allow one-command containerized deployment.
  2. Server correctly binds to configurable host (0.0.0.0 in prod) and all endpoints (including dashboard) are accessible remotely.
  3. README.md contains a full "Deployment" section covering local, Docker, global npm, and cloud options with env var examples.
  4. Authentication and credential handling for deployed environments is documented (volume mounts for claude auth, or API key support).
  5. Production logging, health checks, and basic security (CORS, rate limiting if applicable) are configured.
**Plans**: 1 plan
- [x] 06-standalone-proxy-deployment-01-PLAN.md — Create Dockerfile, update server for prod host binding, add deployment docs to README (completed 2026-03-20)