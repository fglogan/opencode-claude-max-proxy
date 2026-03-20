# Activation Learnings Log

## 01-todo-fixes-01 (2026-03-20)
- **User interventions/checkpoints:** None (fully autonomous)
- **Errors/warnings encountered:** None; tests passed on first run
- **Mistakes corrected during execution:** Extended unblock to BLOCKED_BUILTIN_TOOLS (Rule 1 auto-fix for bug that would have left tool still blocked)
- **Patterns that worked well:** Special-casing in schema registration for specific tool names; precise grep/edit/commit workflow
- **Change next time:** When plan specifies only one list but both are used for disallow, proactively check both (or clarify in plan). Verify with full `grep -r "TodoWrite"` before committing.

## quick-1 (2026-03-20)
- **User interventions/checkpoints:** None
- **Errors/warnings encountered:** LSP import conflicts during edits (resolved by removing duplicate local functions)
- **Mistakes corrected during execution:** None
- **Patterns that worked well:** Using gaps scanner to target real structural debt (dupes + unused_imports); centralizing test helpers
- **Change next time:** Run full gaps scan after edits to verify findings are cleared from state; consider adding Response type import if needed for helpers.ts

## 01-analysis-01 (2026-03-20)
- **User interventions/checkpoints:** None (fully autonomous execution)
- **Errors/warnings encountered:** None
- **Mistakes corrected during execution:** None
- **Patterns that worked well:** Loading all context files (PROJECT.md, source files, AGENTS.md) before writing analysis docs; comprehensive coverage of PreToolUse and MCP patterns; Mermaid diagrams for architecture
- **Change next time:** Pre-compute line counts or include grep verification output directly in SUMMARY.md for better metrics tracking

## 02-modular-global-framework-01 (2026-03-20)
- **User interventions/checkpoints:** None (autonomous execution, no checkpoints)
- **Errors/warnings encountered:** LSP diagnostics on new provider modules and import resolution (resolved automatically)
- **Mistakes corrected during execution:** Registry recursion bug in getProviderAdapter; incorrect function call on mcpServer const; query import removal handled via adapter wrapper
- **Patterns that worked well:** Task-by-task atomic commits, running full test suite after refactor, using deviation rules for minor TS fixes without user input
- **Change next time:** Include providers/ in tsconfig include explicitly if new dirs cause module resolution issues; run nsp phase complete immediately after SUMMARY creation

## quick-2 (2026-03-20)
- **User interventions/checkpoints:** None
- **Errors/warnings encountered:** None (pure research task)
- **Mistakes corrected during execution:** None
- **Patterns that worked well:** Quick webfetch + roadmap comparison for rapid external project evaluation; clear decision criteria based on tech stack and phase alignment
- **Change next time:** When investigating similar proxy projects, also check their handling of streaming edge cases and MCP/tool forwarding compatibility specifically

