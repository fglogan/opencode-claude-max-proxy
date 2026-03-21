---
phase: quick
plan: 5
type: execute
wave: 1
depends_on: []
files_modified: ["src/mcpTools.ts", "src/providers/index.ts", "src/providers/registry.ts", ".planning/STATE.md", "AGENTS.md"]
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "All uncommitted working changes committed with proper messages"
    - "Untracked planning artifacts tracked in git"
    - "STATE.md session log updated with current session activity"
    - "AGENTS.md key files section reflects actual file structure"
    - "Project health verified after changes"
  artifacts:
    - path: "src/mcpTools.ts"
      provides: "scan_report MCP tool committed"
    - path: "src/providers/registry.ts"
      provides: "Simplified provider loading without require() hacks"
    - path: ".planning/STATE.md"
      provides: "Updated session log"
prediction: null
---

<objective>
Project housekeeping: commit all pending work, track untracked planning artifacts, update STATE.md session log, and verify project health. This addresses staleness and uncommitted work identified during status review.

Purpose: Bring project state into sync with actual codebase state.
Output: Clean working tree, accurate STATE.md, all artifacts tracked.
</objective>

<context>
@.planning/STATE.md
@src/mcpTools.ts
@src/providers/index.ts
@src/providers/registry.ts
</context>

<tasks>

<task type="auto">
  <name>Commit scan_report MCP tool addition</name>
  <files>src/mcpTools.ts</files>
  <action>Stage and commit src/mcpTools.ts with the new scan_report tool that integrates gaps/static-analyzer for dashboard reporting.</action>
  <verify>git log --oneline -1</verify>
  <done>scan_report tool committed with descriptive message</done>
</task>

<task type="auto">
  <name>Commit provider registry simplification</name>
  <files>src/providers/index.ts src/providers/registry.ts</files>
  <action>Stage and commit both provider files. The changes remove require() hacks and lazy-loading singletons in favor of direct imports — a clean simplification.</action>
  <verify>git log --oneline -1</verify>
  <done>Provider simplification committed with descriptive message</done>
</task>

<task type="auto">
  <name>Track untracked planning artifacts</name>
  <files>.planning/</files>
  <action>Add all untracked .planning/ files (MILESTONES.md, PROJECT.md, config.json, phase plans, quick tasks, QA artifacts, codebase maps, etc.) to git and commit as a planning scaffold commit.</action>
  <verify>git status --short .planning/</verify>
  <done>All planning artifacts tracked in git</done>
</task>

<task type="auto">
  <name>Update STATE.md session log</name>
  <files>.planning/STATE.md</files>
  <action>Add session log entry for 2026-03-21 noting: status review completed, uncommitted work committed, planning artifacts tracked. Keep existing entries.</action>
  <verify>cat .planning/STATE.md</verify>
  <done>STATE.md reflects current session activity</done>
</task>

<task type="auto">
  <name>Verify and final commit</name>
  <files></files>
  <action>Run bun build or type check to verify nothing is broken. Commit any remaining changes. Confirm clean working tree.</action>
  <verify>git status --short; bun run build 2>&1 | tail -5 || echo "no build script"</verify>
  <done>Working tree clean, build passes</done>
</task>

</tasks>

<verification>
git status shows clean working tree.
git log --oneline -5 shows atomic commits for each task.
STATE.md session log is current.
</verification>

<success_criteria>
- All 3 modified files committed with descriptive messages
- All untracked planning artifacts tracked
- STATE.md session log reflects 2026-03-21 activity
- Working tree clean
- No build regressions
</success_criteria>

<output>
After completion, create `.planning/quick/5-project-housekeeping/5-SUMMARY.md`
</output>
