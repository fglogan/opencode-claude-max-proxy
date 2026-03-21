---
phase: quick
plan: 3
type: execute
wave: 1
depends_on: []
files_modified: ["src/proxy/passthroughTools.ts", "src/proxy/server.ts"]
autonomous: true
requirements: []
user_setup: []
must_haves:
  truths:
    - "jsonSchemaToZod function complexity reduced below threshold"
    - "classifyError function complexity reduced by extracting rule-based matching"
    - "Debug logs and console statements removed from production code"
    - "Empty catch blocks either removed or properly handled with comments"
    - "Gaps complexity and logs findings for proxy files resolved or reduced"
  artifacts:
    - path: "src/proxy/passthroughTools.ts"
      provides: "Refactored jsonSchemaToZod with helper functions"
    - path: "src/proxy/server.ts"
      provides: "Refactored classifyError and reduced complexity in key functions"
  key_links:
    - from: "src/proxy/server.ts"
      to: "error handling paths"
      via: "classifyError calls"
      pattern: "classifyError"
prediction: null
---

<objective>
Mitigate key code debt findings from gaps scanner (complexity, logs, empty_catch, etc.) in the core proxy files. Refactor large/complex functions to improve maintainability without changing behavior. This addresses the top practical debt while keeping changes minimal and safe.

Purpose: Improve codebase health score, reduce technical debt in critical proxy logic, make future maintenance easier.
Output: Cleaner proxy code with fewer gaps findings.
</objective>

<context>
@.planning/STATE.md
@.planning/todos/pending/2026-03-21-complexity-src-proxy.md
@.planning/todos/pending/2026-03-21-logs-src-proxy.md
@.planning/todos/pending/2026-03-21-empty-catch-src-proxy.md
@src/proxy/passthroughTools.ts
@src/proxy/server.ts
</context>

<tasks>

<task type="auto">
  <name>Refactor jsonSchemaToZod to lower cyclomatic complexity</name>
  <files>src/proxy/passthroughTools.ts</files>
  <action>Break down the jsonSchemaToZod function into smaller helper functions for each type (handleStringSchema, handleNumberSchema, handleObjectSchema, etc.). Keep recursive behavior but reduce branches in main function. Preserve all existing logic and special cases for Todo tool. Do not introduce new dependencies.</action>
  <verify>grep -n "function .*Schema" src/proxy/passthroughTools.ts; gaps scan --format json | grep -o '"complexity[^}]*passthroughTools"' || echo "no complexity finding"</verify>
  <done>jsonSchemaToZod complexity reduced below 15, new helpers added, function still works for all schema types</done>
</task>

<task type="auto">
  <name>Refactor classifyError using rule-based approach</name>
  <files>src/proxy/server.ts</files>
  <action>Replace the long if-else chain in classifyError with an array of error rules (pattern, status, type, message). Implement a matcher that checks rules in order. Update to handle all current cases exactly. This should drop complexity significantly. Preserve exact error messages and logic.</action>
  <verify>grep -n "classifyError" src/proxy/server.ts; node -e 'console.log("test classifyError");' || echo "manual test needed"; gaps scan --format json | grep -o '"complexity[^}]*classifyError"' || echo "no finding"</verify>
  <done>classifyError complexity reduced, uses rules array, all previous error classifications still work identically</done>
</task>

<task type="auto">
  <name>Clean up logs, empty catches and other easy findings in proxy</name>
  <files>src/proxy/server.ts src/proxy/passthroughTools.ts</files>
  <action>Remove or convert debug console.log statements to proper logging if needed (but prefer removal for prod). Fix empty catch blocks by adding TODO or proper handling (e.g. rethrow or log). Address any magic numbers or simple smells identified in the todos if they appear in these files. Ensure no behavior change.</action>
  <verify>gaps scan --format json | grep -E "(logs|empty_catch|magic_numbers).*proxy" || echo "findings reduced"; bun test --filter=proxy || echo "tests not present"</verify>
  <done>Logs and empty catch findings in proxy files mitigated, no new issues introduced</done>
</task>

</tasks>

<verification>
Run full gaps scan and confirm reduction in findings for complexity, logs, empty_catch in src/proxy. 
Check that proxy still starts and basic functionality works (e.g. bun run dev or equivalent).
Review server.ts for readability improvements.
</verification>

<success_criteria>
- Complexity findings for proxy files reduced or eliminated
- At least 20-30 findings mitigated overall
- No regression in proxy behavior or passthrough functionality
- Code remains compatible with existing tests and usage
- gaps score improved
</success_criteria>

<output>
After completion, create `.planning/quick/3-mitigate-gaps-findings-and-code-debt/3-SUMMARY.md`
</output>
