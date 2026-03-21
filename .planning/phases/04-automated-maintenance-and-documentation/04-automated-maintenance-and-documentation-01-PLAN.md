---
phase: 04-automated-maintenance-and-documentation
plan: 01
type: execute
wave: 1
depends_on: ["03-parity-hardening-and-grok-integration-01"]
files_modified: ["MAINTENANCE.md", "package.json", "README.md", "AGENTS.md", ".planning/ROADMAP.md"]
autonomous: true
requirements: ["MAINT-01", "DOC-01"]
user_setup: []
must_haves:
  truths:
    - "A maintain command exists that runs upstream review using nsp review-upstream"
    - "MAINTENANCE.md provides clear, executable daily review process"
    - "All project documentation is synchronized with current implementation (multi-provider, deployment, Grok support)"
    - "Changes in upstream SDKs/APIs can be systematically reviewed and patched"
  artifacts:
    - path: "MAINTENANCE.md"
      provides: "Daily automated maintenance process"
      min_lines: 50
    - path: "package.json"
      provides: "maintain npm script"
    - path: "AGENTS.md"
      provides: "Updated agent communication and behavior guidelines"
  key_links:
    - from: "MAINTENANCE.md"
      to: "nsp review-upstream"
      via: "npm run maintain"
      pattern: "nsp review-upstream"
    - from: "package.json"
      to: "MAINTENANCE.md"
      via: "scripts section"
      pattern: "maintain"

prediction: null
---

<objective>
Implement automated maintenance process for keeping the proxy current with upstream changes and ensure all documentation is complete and consistent.

Purpose: Enable long-term maintainability without manual intervention for every upstream update. Complete DOC-01 and MAINT-01.

Output: Runnable maintenance command, updated MAINTENANCE.md, synchronized docs across AGENTS.md/README/ROADMAP.
</objective>

<execution_context>
$(nsp content show workflows execute-plan --raw)
$(nsp content show templates summary --raw)
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/ARCHITECTURE.md
@MAINTENANCE.md
@AGENTS.md
@src/proxy/server.ts
@package.json
</context>

<tasks>

<task type="auto">
  <name>Implement maintenance command and update MAINTENANCE.md</name>
  <files>package.json, MAINTENANCE.md</files>
  <action>Add "maintain": "nsp review-upstream" to scripts in package.json. Expand MAINTENANCE.md to include exact commands for daily review (nsp doctor, nsp verify, upstream review), how to handle gaps using /nsp:plan-phase --gaps, parity check process, and release policy details. Make it the canonical executable guide. Do not add new dependencies. Reference existing .opencode/command if relevant. Follow project conventions from AGENTS.md for documentation style.</action>
  <verify>npm run | grep maintain; bash -c 'npm run maintain -- --help' || true</verify>
  <done>Maintenance script runs and MAINTENANCE.md has at least 50 lines with clear steps for daily process</done>
</task>

<task type="auto">
  <name>Synchronize and complete all documentation</name>
  <files>AGENTS.md, README.md, .planning/ROADMAP.md</files>
  <action>Update AGENTS.md to reflect current multi-provider status, Grok support, NSP integration and maintenance process. Ensure README.md has sections for deployment (from phase 6), maintenance, providers. Update ROADMAP.md to mark phase 4 complete with accurate plan list and success criteria. Remove any outdated references. Ensure consistency with ARCHITECTURE.md map. Use full sentences as per agent behavior guidelines in AGENTS.md.</action>
  <verify>grep -E "(maintenance|Grok|multi-provider)" README.md; grep -E "MAINT-01|DOC-01" .planning/ROADMAP.md</verify>
  <done>Documentation is complete, consistent, and covers all implemented features including automated maintenance</done>
</task>

</tasks>

<verification>
- Run `npm run maintain` and verify it produces upstream review artifacts
- Check that all requirements MAINT-01 and DOC-01 are satisfied per REQUIREMENTS.md
- Review docs for accuracy against current codebase (providers, proxy server, tests)
- Confirm no capability loss in proxy behavior
</verification>

<success_criteria>
- MAINT-01 and DOC-01 marked complete
- npm run maintain command works
- ROADMAP.md updated with phase 4 complete
- All docs updated and consistent
- STATE.md will be updated by executor with new decisions/learnings
</success_criteria>

<output>
After completion, create `.planning/phases/04-automated-maintenance-and-documentation/04-automated-maintenance-and-documentation-01-SUMMARY.md`
</output>
