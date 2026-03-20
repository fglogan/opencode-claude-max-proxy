---
phase: quick
plan: 1
type: quick
autonomous: true
wave: 1
depends_on: []
files_modified: ["src/__tests__/helpers.ts", "src/__tests__/proxy-*.test.ts"]
must_haves:
  truths:
    - "Duplicated readStreamFull and postStream helper functions centralized in helpers.ts"
    - "All test files import helpers instead of redefining duplicate functions"
    - "Unused imports removed from test files to eliminate phantom imports"
  artifacts:
    - path: "src/__tests__/helpers.ts"
      provides: "Common test streaming helper functions"
    - path: "src/__tests__/proxy-tool-forwarding.test.ts"
      provides: "Updated to import from helpers, removed local dupe"
  key_links:
    - from: "src/__tests__/helpers.ts"
      to: "multiple test files"
      via: "shared test utilities"
prediction: null
---

<objective>
Improve Dominant TS codebase health by addressing real structural debt: phantom/unused imports and code duplication (dupes detector). 

Focus on test files where duplicate helper functions like readStreamFull and postStream are repeated, and clean up unused imports. This should meaningfully improve the gaps score.
</objective>

<context>
@.planning/STATE.md
@src/__tests__/helpers.ts
@src/proxy/server.ts
@src/__tests__/proxy-streaming-message.test.ts
@src/__tests__/proxy-tool-forwarding.test.ts
@src/__tests__/proxy-subagent-support.test.ts
@src/__tests__/proxy-session-resume.test.ts
@src/__tests__/proxy-mcp-filtering.test.ts
</context>

<tasks>
<task type="auto" tdd="false">
  <name>Centralize duplicated test helper functions</name>
  <files>src/__tests__/helpers.ts</files>
  <action>Add readStreamFull and postStream (standardized) helper functions to helpers.ts. Make them reusable and consistent. Update any slight variations.</action>
  <verify>grep -n "readStreamFull|postStream" src/__tests__/helpers.ts</verify>
  <done>Helpers.ts contains the shared streaming helpers without duplication in tests</done>
</task>

<task type="auto" tdd="false">
  <name>Update test files to use shared helpers and remove dupes</name>
  <files>src/__tests__/proxy-*.test.ts</files>
  <action>Import readStreamFull and postStream from helpers in test files that duplicate them. Remove the local function definitions. Update calls if needed. Fix any import issues.</action>
  <verify>grep -n "readStreamFull|postStream|from ['\"].*helpers" src/__tests__/proxy-*.test.ts || echo "no matches"</verify>
  <done>Duplicate functions removed from test files, imports added from helpers.ts</done>
</task>

<task type="auto" tdd="false">
  <name>Clean up phantom/unused imports in test files</name>
  <files>src/__tests__/*.test.ts</files>
  <action>Remove unused imported symbols like unused beforeEach, mock, blockStop, message* helpers etc from import statements in test files. Ensure tests still pass.</action>
  <verify>grep -n "unused_imports" /tmp/gaps-scan.json || echo "check manually"; bun test --filter="proxy" --bail 2>&1 | tail -10</verify>
  <done>No more phantom imports in test files for the targeted ones, tests pass</done>
</task>
</tasks>

<verification>
Run gaps scan again to check improved score and fewer findings for dupes/unused_imports.
bun test --filter="proxy" to ensure tests still pass.
</verification>

<success_criteria>
- Dupe findings for readStreamFull/postStream resolved
- Unused import findings reduced
- Score improves (target >85)
- All tests pass
- No new errors or broken imports
</success_criteria>
