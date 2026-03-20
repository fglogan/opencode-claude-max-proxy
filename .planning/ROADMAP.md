# Roadmap: opencode-claude-max-proxy

## Overview

This roadmap evolves the Claude-specific proxy into a permanent, global, multi-provider framework. It incorporates full analysis of current implementation, internal architecture mapping, modular design for maintainability, Grok support, automated upstream change monitoring, and comprehensive documentation. Parity with existing Claude functionality is explicitly hardened.

## Phases

- [ ] **Phase 1: Analysis and Architecture Mapping** - Fully analyze proxy and map/document internal Genesis IT architecture
- [ ] **Phase 2: Modular Global Framework** - Refactor into extensible provider-agnostic core with Claude adapter
- [ ] **Phase 3: Parity Hardening and Grok Integration** - Ensure no capability loss and add Grok provider support
- [ ] **Phase 4: Automated Maintenance and Documentation** - Implement daily reviews/auto-updates and finalize docs

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
- [ ] 01-analysis-01-PLAN.md — Full analysis of current proxy implementation and creation of Genesis IT architecture map

### Phase 2: Modular Global Framework
**Goal**: A clean, maintainable global proxy framework exists that decouples core proxy logic from specific AI providers.
**Depends on**: Phase 1
**Requirements**: FRAME-01
**Success Criteria** (what must be TRUE):
  1. Users running the existing Claude proxy commands experience no change in behavior or setup.
  2. The codebase structure clearly separates shared proxy server logic, session management, logging from provider-specific SDK integrations.
  3. Adding a new provider requires only implementing a standard adapter interface and configuration.
  4. Basic extension documentation allows developers to understand and extend the framework.
**Plans**: TBD

### Phase 3: Parity Hardening and Grok Integration
**Goal**: Claude functionality is fully preserved (parity) while Grok support is added, allowing users to spin up multiple Grok instances seamlessly.
**Depends on**: Phase 2
**Requirements**: PARITY-01, GROK-01
**Success Criteria** (what must be TRUE):
  1. All original tests pass and users observe identical Claude Max + OpenCode behavior as before the refactor.
  2. Users can start Grok proxies using analogous environment variables and commands, with passthrough agent delegation working for xAI models.
  3. Multi-provider setups (Claude + Grok in same ecosystem) function correctly with OpenCode's model routing.
  4. A parity audit report (including call-graph/API comparison) confirms no regressions in tool forwarding, error handling, streaming, or concurrency.
**Plans**: TBD

### Phase 4: Automated Maintenance and Documentation
**Goal**: The global proxy stays current automatically and is fully documented for long-term maintainability.
**Depends on**: Phase 3
**Requirements**: MAINT-01, DOC-01
**Success Criteria** (what must be TRUE):
  1. A daily automated process (script/CI) reviews upstream changes in Anthropic SDK, xAI APIs, OpenCode, and related deps, flagging or auto-applying compatible updates.
  2. Users and the system have a clear, executable maintenance guide that keeps the proxy working as upstream evolves.
  3. Complete documentation covers architecture, all providers, configuration, troubleshooting, and extension points.
  4. The project is structured for easy ongoing maintenance with clear module boundaries and tests.
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order.

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Analysis and Architecture Mapping | 0/1 | Planning complete | 2026-03-20 |
| 2. Modular Global Framework | 0/1 | Not started | - |
| 3. Parity Hardening and Grok Integration | 0/1 | Not started | - |
| 4. Automated Maintenance and Documentation | 0/1 | Not started | - |

*Last updated: 2026-03-20*

## Coverage

All 7 v1 requirements mapped:
- ANAL-01 → Phase 1
- ARCH-01 → Phase 1
- FRAME-01 → Phase 2
- PARITY-01 → Phase 3
- GROK-01 → Phase 3
- MAINT-01 → Phase 4
- DOC-01 → Phase 4

✓ 100% coverage. No orphans. This is a parity/migration milestone with dedicated hardening in Phase 3.