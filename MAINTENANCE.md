# Maintenance Guide for opencode-claude-max-proxy

## Daily Automated Review Process

The proxy must stay current with upstream changes in:
- Anthropic Claude SDK and API
- xAI Grok API and OpenAI compatibility layer
- OpenCode agent SDK and MCP tool forwarding
- Bun runtime and dependency updates

### Automated Steps

1. **Run upstream review**: Use `nsp review-upstream` or the daily CI job to scan for changes in reference/opencode-upstream/ and vendor directories.
2. **Gap detection**: `nsp doctor` and `nsp verify` to identify breaking changes or parity issues.
3. **Auto-patching**: For compatible changes, apply patches using the reapply-patches command or manual edits following the parity hardening patterns from Phase 3.
4. **Test parity**: Run full test suite and proxy tests for both Claude and Grok providers.
5. **Update documentation**: Sync AGENTS.md, ARCHITECTURE.md, and this MAINTENANCE.md with any new patterns.

## Manual Maintenance Tasks

- Monitor GitHub repos for Anthropic, xAI, and OpenCode releases
- Review CHANGELOG.md and update if needed
- Verify MCP tool forwarding (scan_report, etc.) still functions
- Test multi-provider setups with different env vars
- Update model routing if new capabilities added

## Release Policy

- Patch releases for bug fixes and upstream syncs
- Minor versions for new providers or major features
- Always maintain 100% parity with original Claude proxy behavior

## Troubleshooting

- If proxy fails after upstream change: check logs for API shape mismatches, use parity audit in ARCHITECTURE.md
- LSP or type errors: run `bun run typecheck`
- Test failures: `npm test`

Last updated: 2026-03-20
