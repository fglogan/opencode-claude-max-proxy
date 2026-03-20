# Activation Learnings Log

## 01-todo-fixes-01 (2026-03-20)
- **User interventions/checkpoints:** None (fully autonomous)
- **Errors/warnings encountered:** None; tests passed on first run
- **Mistakes corrected during execution:** Extended unblock to BLOCKED_BUILTIN_TOOLS (Rule 1 auto-fix for bug that would have left tool still blocked)
- **Patterns that worked well:** Special-casing in schema registration for specific tool names; precise grep/edit/commit workflow
- **Change next time:** When plan specifies only one list but both are used for disallow, proactively check both (or clarify in plan). Verify with full `grep -r "TodoWrite"` before committing.

