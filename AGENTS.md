# Agents.md for opencode-claude-max-proxy

This repo maintains a permanent, global, provider-agnostic Anthropic proxy for OpenCode with full Grok support, daily auto-updates via the maintenance process, NSP integration for spec-driven development, and complete documentation.

## Core Responsibilities
- Proxy Anthropic API calls for Claude Max with full Claude Agent SDK support including PreToolUse hooks.
- Passthrough mode for multi-model agent delegation (Grok, GPT, Gemini, and others via OpenCode routing).
- Session management, streaming responses, and MCP tool forwarding for internal mode.
- Daily automated review of upstream changes (Claude SDK, xAI, OpenCode, Bun) using `npm run maintain` which invokes `nsp review-upstream`.
- Maintainable modular architecture with provider adapters for future extensions (V2.0+).
- Full NSP planning system integration for phases, plans, automated execution, deviation handling, and state management.

## Key Files
- src/proxy/server.ts: core proxy logic, modes, session handling, and provider routing.
- src/mcpTools.ts: MCP tools including file operations, bash execution, and scan_report.
- scanner-dashboard.html: agent dashboard for reports and observability.
- .planning/: NSP planning system with STATE.md, ROADMAP.md, REQUIREMENTS.md, phases, and summaries.
- .opencode/command/: NSP command definitions including nsp-review-upstream.md for maintenance.
- MAINTENANCE.md: Canonical guide for daily automated maintenance process.

## Architecture
- Hono server with Anthropic compatibility layer supporting both internal MCP execution and passthrough delegation.
- Claude Agent SDK integration with PreToolUse hook for precise tool interception.
- Dynamic agent matching, definition extraction from OpenCode Task calls, and fuzzy matching for agent names.
- Global configuration via environment variables, opencode.json, and NSP config.
- Provider adapters for Claude, Grok, and extensible to additional models.
- Integration with NSP executor for atomic task commits, SUMMARY.md generation, and state updates.

See ROADMAP.md for current phases and progress, MAINTENANCE.md for the daily review process, and ARCHITECTURE.md for the full Genesis IT ecosystem map.

## Agent Communication and Behavior
The opencode agent communicates using full sentences and paragraphs to ensure clarity and helpfulness. It avoids overly terse, one-word, or minimalist responses unless the specific query demands extreme brevity for a CLI context. Responses provide context, explanations, and actionable insights.

The agent demonstrates high agency by proactively identifying issues, suggesting improvements, anticipating follow-up needs, and taking initiative to deliver complete solutions. It balances proactivity with respect for user intent, offering options when decisions are required while driving progress forward effectively.

Last updated: 2026-03-20 (updated during Phase 4 for NSP and maintenance integration)
