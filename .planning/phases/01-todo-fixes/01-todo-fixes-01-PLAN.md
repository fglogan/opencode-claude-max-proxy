---
phase: 01-todo-fixes
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: ["src/proxy/server.ts", "src/proxy/passthroughTools.ts"]
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "TodoWrite tool is no longer blocked in CLAUDE_CODE_ONLY_TOOLS"
    - "TodoWrite is mapped to OpenCode's todowrite with priority field support"
    - "Phantom or duplicate tool mappings for todos are removed"
  artifacts:
    - path: "src/proxy/server.ts"
      provides: "Updated tool blocking list and comments"
    - path: "src/proxy/passthroughTools.ts"
      provides: "Schema mapping for TodoWrite priority field"
  key_links:
    - from: "src/proxy/server.ts"
      to: "passthroughTools.ts"
      via: "tool name mapping"
prediction: null
---

<objective>
Fix the TodoWrite tool handling (and related todo issues) to resolve schema incompatibility between Claude's TodoWrite and OpenCode's todowrite.

Purpose: Eliminate the blocking of TodoWrite so users can create todos from Claude via the proxy. Remove any dupe mappings or phantom references in core tool handling code.
Output: Updated tool lists, schema mapper for priority field, and clean imports.
</objective>

<execution_context>
$(nsp content show workflows execute-plan --raw)
$(nsp content show templates summary --raw)
</execution_context>

<context>
@.planning/STATE.md
@src/proxy/server.ts
@src/proxy/passthroughTools.ts
@src/mcpTools.ts
</context>

<tasks>

<task type="auto">
  <name>Update tool blocking list and add TodoWrite mapping</name>
  <files>src/proxy/server.ts</files>
  <action>Remove "TodoWrite" from CLAUDE_CODE_ONLY_TOOLS list since we will support it via mapping. Update comment to explain the mapping to OpenCode's todowrite which requires priority field. Ensure no duplicate entries for todo related tools.</action>
  <verify>grep -n "TodoWrite" src/proxy/server.ts</verify>
  <done>TodoWrite no longer in blocked list, comment updated with mapping details</done>
</task>

<task type="auto">
  <name>Add schema support for TodoWrite priority in passthrough</name>
  <files>src/proxy/passthroughTools.ts</files>
  <action>Update jsonSchemaToZod or the tool registration to handle priority field for todowrite/TodoWrite. Add special case if needed for todo tools to include priority: z.number().optional() or required. Remove any phantom imports if present. Ensure stripMcpPrefix handles todowrite correctly.</action>
  <verify>grep -n "priority|todowrite|TodoWrite" src/proxy/passthroughTools.ts || echo "no matches yet - will add"</verify>
  <done>Schema supports priority field, no unused imports, tool name stripping works for todo tools</done>
</task>

</tasks>

<verification>
Run tests: bun test --filter="proxy.*tool|todo"
Check that TodoWrite is not blocked and tool call succeeds in passthrough mode.
</verification>

<success_criteria>
- No more blocked TodoWrite tool
- Todo creation works through the proxy without schema errors
- No duplicate tool entries or phantom imports in core files
- All tests pass
</success_criteria>

<output>
After completion, create `.planning/phases/01-todo-fixes/01-todo-fixes-01-SUMMARY.md`
</output>
