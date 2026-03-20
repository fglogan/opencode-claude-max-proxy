---
phase: 03-parity-hardening-and-grok-integration
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: ["src/providers/grok.ts", "src/providers/registry.ts", "src/proxy/server.ts", ".planning/ARCHITECTURE.md", "src/providers/index.ts"]
autonomous: true
requirements: [PARITY-01, GROK-01, ROUTE-01]
user_setup: 
  - service: xai
    why: "Grok API access"
    env_vars:
      - name: XAI_API_KEY
        source: "xAI console dashboard"
must_haves:
  truths:
    - "All existing Claude proxy tests pass with no behavior change"
    - "Grok provider can be selected via env var or config and responds to Anthropic-compatible requests"
    - "Provider registry correctly loads and uses GrokAdapter without breaking Claude"
    - "Model mapping and routing logic supports grok/xai models with cost-optimized selection"
    - "Parity audit report exists documenting zero capability loss"
  artifacts:
    - path: "src/providers/grok.ts"
      provides: "GrokAdapter implementation"
      exports: ["GrokAdapter"]
    - path: "src/providers/registry.ts"
      provides: "Grok registration support"
    - path: "src/proxy/server.ts"
      provides: "Generalized provider handling and parity fixes"
    - path: ".planning/ARCHITECTURE.md"
      provides: "Updated parity matrix and as-built docs"
  key_links:
    - from: "src/providers/grok.ts"
      to: "ProviderAdapter"
      via: "implements interface"
      pattern: "implements ProviderAdapter"
    - from: "server.ts"
      to: "getProviderAdapter"
      via: "dynamic provider selection"
      pattern: "getProviderAdapter"
prediction: null
---

<objective>
Harden parity with original Claude proxy behavior and implement initial Grok provider support using the modular adapter pattern. Integrate basic model routing for xAI/Grok.

Purpose: Ensure zero capability or compatibility loss while expanding to multi-provider (Claude + Grok). This fulfills PARITY-01, GROK-01, ROUTE-01 and prepares for OmniRoute concepts in later phases.
Output: Working GrokAdapter, updated registry/server for provider selection, parity documentation.
</objective>

<execution_context>
$(nsp content show workflows execute-plan --raw)
$(nsp content show templates summary --raw)
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/ARCHITECTURE.md
@.planning/REQUIREMENTS.md
@src/providers/base.ts
@src/providers/claude.ts
@src/providers/registry.ts
@src/proxy/server.ts
@src/mcpTools.ts

<interfaces>
From src/providers/base.ts:
```typescript
export interface ProviderAdapter {
  name: string;
  createQueryHandler(config: ProxyConfig): any;
  supportsPassthrough(): boolean;
  getMcpServer(tools?: any): any;
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Implement GrokAdapter and update registry for Grok support</name>
  <files>src/providers/grok.ts src/providers/registry.ts src/providers/index.ts</files>
  <action>Use the existing ClaudeAdapter as template. Create GrokAdapter that implements ProviderAdapter. For createQueryHandler, use xAI's OpenAI-compatible client (add 'openai' package if needed but prefer fetch for minimal deps - check existing stack). Support XAI_API_KEY env var. Map Grok models. Ensure supportsPassthrough and getMcpServer delegate to shared logic. Update registry to register 'grok' and 'xai'. Note in action: Using X per user decision (research suggested Y). Follow project conventions from AGENTS.md for TypeScript and Bun.</action>
  <verify>npm run typecheck && grep -q "GrokAdapter" src/providers/grok.ts</verify>
  <done>GrokAdapter exists, registered in registry, typechecks cleanly, follows adapter contract exactly</done>
</task>

<task type="auto">
  <name>Task 2: Harden server for parity, generalize provider selection, update docs</name>
  <files>src/proxy/server.ts .planning/ARCHITECTURE.md</files>
  <action>Perform line-by-line review of Claude-specific code in server.ts against parity requirements. Extract any remaining provider-specific logic into adapter where possible. Update mapModelToClaudeModel to better support grok (rename if needed to mapModel). Ensure dynamic adapter usage for queryHandler, hooks, error classification where possible. Add parity matrix to ARCHITECTURE.md documenting divergences (none intentional for core paths). Include structural comparison notes. Do not introduce breaking changes to Claude flow. Use vertical slice for routing integration.</action>
  <verify>npm test -- --grep="proxy" && grep -q "parity" .planning/ARCHITECTURE.md</verify>
  <done>All Claude tests pass, Grok selection works, ARCHITECTURE.md updated with parity audit (zero regressions confirmed), no capability loss</done>
</task>

</tasks>

<verification>
Run full test suite: npm test
Verify Claude proxy still works: curl health check and sample request
Test Grok: set XAI_API_KEY and test with provider=grok
Check parity report in ARCHITECTURE.md
</verification>

<success_criteria>
- All original Claude behaviors preserved (tests pass, session resume, passthrough, MCP forwarding)
- Grok provider selectable and functional for basic proxying with OpenCode
- Model routing supports xAI models
- Parity audit complete with no unaddressed divergences
- Documentation updated
</success_criteria>

<output>
After completion, create `.planning/phases/03-parity-hardening-and-grok-integration/03-parity-hardening-and-grok-integration-01-SUMMARY.md`
</output>
