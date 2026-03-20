# opencode-claude-max-proxy Requirements

## v1 Requirements for Global Permanent Version

**ANAL-01**: Fully analyze the existing opencode-claude-max-proxy, including codebase review and documentation of basic implementation steps taken (PreToolUse hook, passthrough mode, session management).

**ARCH-01**: Learn the internal IT architecture of the Genesis/Opencode ecosystem, create a complete map, and document it in detail (including agent systems, proxies, MCP tools, NSP planning, Obsidian/CASS integration).

**FRAME-01**: Implement a more permanent, modular, global proxy framework that supports multiple AI providers in a maintainable way (provider adapters, core engine separation).

**DOC-01**: Ensure the global version has complete, up-to-date documentation for setup, extension, architecture, and maintenance.

**MAINT-01**: Set up daily automated tasks to review changes in upstream dependencies (Anthropic SDK, xAI APIs, OpenCode, Bun), detect breaking changes, and auto-implement compatible updates or patches.

**GROK-01**: Enable spinning up additional Grok instances by adding xAI/Grok provider support with similar passthrough and multi-model capabilities.

**PARITY-01**: Maintain 100% functional parity with the existing Claude proxy throughout the migration to global framework (no capability loss).

**ROUTE-01**: Implement dynamic provider selection, model mapping, and cost-aware routing for multi-provider support including Claude and Grok.

Total v1 requirements: 8

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| ANAL-01 | Phase 1 | Completed |
| ARCH-01 | Phase 1 | Completed |
| FRAME-01 | Phase 2 | Complete |
| DOC-01 | Phase 5 | Completed |
| MAINT-01 | Phase 4 | Pending |
| GROK-01 | Phase 3 | Complete |
| PARITY-01 | Phase 3 | Complete |
| ROUTE-01 | Phase 3 | Complete |

Mapped: 7/7 ✓

## Categories
- Analysis: ANAL-01, ARCH-01
- Framework: FRAME-01, DOC-01
- Maintenance: MAINT-01
- Integration: GROK-01, PARITY-01, ROUTE-01
