# Maintenance Guide for opencode-claude-max-proxy

## Daily Automated Review Process

The proxy maintains a permanent, global, provider-agnostic Anthropic compatibility layer. To keep it current with upstream changes in the Claude Agent SDK, OpenCode, xAI Grok integrations, and related dependencies, run the automated maintenance command daily.

### Primary Command
```bash
npm run maintain
```
This runs `nsp review-upstream` which:
- Identifies the active phase from NSP state
- Generates `*-UPSTREAM-REVIEW.md` with candidate inventory and adopt/adapt/reject matrix
- Produces `*-UPSTREAM-ACTIONS.md` for follow-up work
- References .opencode/command/nsp-review-upstream.md for the full workflow

### Full Daily Review Checklist
1. **Upstream Review**: `npm run maintain` or directly `nsp review-upstream`
2. **Health and Gap Detection**: 
   - `nsp doctor`
   - `nsp verify --target health`
   - `nsp dashboard` to review current phase status
3. **Handle Gaps**: If actionable issues found, run `/nsp:plan-phase --gaps` or `nsp plan-phase --gaps` to generate remediation plans. Follow the gap closure workflow from NSP skill rules.
4. **Parity Check Process**:
   - Run `bun test` and `npm run typecheck`
   - Test both internal and passthrough modes with Claude and Grok providers
   - Verify MCP tool forwarding (read, bash, edit, glob, grep, etc.)
   - Check multi-provider routing and session resume
5. **Documentation Sync**: Update AGENTS.md, README.md, MAINTENANCE.md, ROADMAP.md, and ARCHITECTURE.md to reflect any new patterns or changes.
6. **Commit and Verify**: Use per-task commits following NSP executor conventions. Run `nsp verify` to confirm requirements.

### Handling Upstream Changes
- **Adopt**: Direct integration of compatible changes (e.g. SDK bugfixes)
- **Adapt**: Modify for our passthrough/multi-provider architecture
- **Reject**: Changes incompatible with proxy goals or creating tech debt
- Use the review matrix in generated UPSTREAM-REVIEW.md files located in .planning/phases/

### Gap Closure Protocol
When `nsp_verify` reports `has_actionable: true`:
- Proactively invoke gap closure without waiting for user input
- Critical issues block further execution
- High issues get scheduled before next phase
- Log all to LEARNINGS.md and STATE.md via nsp state commands

## Manual Maintenance Tasks
- Monitor GitHub for releases in Anthropic/claude-agent-sdk, xAI, OpenCode, and Bun
- Review and apply any breaking changes to provider adapters in src/providers/
- Update model mapping and routing logic in server.ts if new capabilities emerge
- Verify scanner-dashboard.html and MCP tools remain functional
- Test deployment scenarios (Docker, npm global, supervisor)

## Release Policy
- **Patch releases** (1.x.y): Bug fixes, upstream syncs, documentation updates, parity fixes
- **Minor releases** (1.y.0): New providers, major features, dashboard enhancements, architecture changes
- **Major releases** (2.0.0): Breaking changes to API or significant refactors
- Always run full test suite and maintain 100% parity with original Claude proxy behavior for passthrough and internal modes
- Update version in package.json and tag releases
- Ensure all docs (AGENTS.md, README.md) reflect current state

## CI/CD Integration
The maintenance process is designed to integrate with GitHub Actions or daily CI jobs that can run `npm run maintain` automatically and create issues for review items.

## Troubleshooting
- Authentication issues with nsp/claude: Run `claude login`
- Upstream review fails: Check for reference/opencode-upstream/ directory and git remotes
- If proxy fails after change: Check logs for API mismatches, consult ARCHITECTURE.md parity audit
- Type/LSP errors: `bun run typecheck` or `npm run typecheck`
- Test failures: `npm test` and review specific test files in __tests__/
- NSP state issues: `nsp doctor --fix` or review STATE.md and ROADMAP.md

## References
- .opencode/command/nsp-review-upstream.md — Canonical upstream review workflow
- .planning/ROADMAP.md — Current phase and progress tracking
- AGENTS.md — Agent behavior and communication standards
- NSP skills for doctor, verify, dashboard commands

Last updated: 2026-03-20
Updated as part of Phase 4 automated maintenance implementation.
