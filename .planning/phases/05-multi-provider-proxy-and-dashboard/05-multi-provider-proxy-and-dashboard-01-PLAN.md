---
phase: 05-multi-provider-proxy-and-dashboard
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [".planning/ROADMAP.md", "scanner-dashboard.html", "src/proxy/server.ts", ".planning/references/omniroute-summary.md"]
autonomous: true
requirements: ["ROUTE-01", "DOC-01"]
user_setup: []
must_haves:
  truths:
    - "Users can access an enhanced dashboard showing proxy status, providers, and logs"
    - "Dashboard provides visibility into multi-provider routing and health metrics"
    - "UI is inspired by OmniRoute with sections for providers, analytics, settings"
    - "Proxy server serves the dashboard and any dynamic data endpoints"
  artifacts:
    - path: "scanner-dashboard.html"
      provides: "Updated interactive dashboard UI"
      min_lines: 200
    - path: ".planning/references/omniroute-summary.md"
      provides: "Key features and architecture summary from OmniRoute"
    - path: "src/proxy/server.ts"
      provides: "Enhanced static serving for dashboard and API routes for data"
  key_links:
    - from: "scanner-dashboard.html"
      to: "/dashboard"
      via: "static file serving in Hono"
      pattern: "app\.get.*dashboard"
    - from: "src/proxy/server.ts"
      to: "dashboard data"
      via: "JSON endpoints for providers and logs"
      pattern: "providers|logs|health"
prediction: null
---

<objective>
Design and implement enhancements to create a multi-provider proxy dashboard for opencode, drawing core UI and feature patterns from OmniRoute (smart routing visibility, provider management, analytics, health monitoring).

Purpose: Make the proxy more usable and observable for users managing Claude/Grok and future providers, closing the gap with full-featured gateways like OmniRoute while maintaining the project's lightweight architecture.

Output: Enhanced scanner-dashboard.html with new tabs/sections, reference summary in planning, updates to server.ts for serving dashboard data, updated ROADMAP.md.
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
@AGENTS.md
@scanner-dashboard.html
@src/proxy/server.ts
@.planning/references/omniroute-summary.md
</context>

<tasks>

<task type="auto">
  <name>Research and summarize OmniRoute dashboard patterns</name>
  <files>.planning/references/omniroute-summary.md</files>
  <action>Create a concise reference document summarizing key dashboard features from the OmniRoute repo that can be adapted to this proxy: provider list with status, combo/routing management, analytics/logs, health checks, settings. Focus on UI layout (dark theme, tabs, cards, grids), data displayed (status, latency, usage), and how it integrates with the proxy backend. Note what to avoid (complex Next.js full app, heavy deps). Extract only portable patterns for HTML/JS update. Reference the GitHub link and key screenshots descriptions.</action>
  <verify>ls .planning/references/omniroute-summary.md && wc -l .planning/references/omniroute-summary.md | awk '{print $1}'</verify>
  <done>Reference file exists with 100+ lines summarizing adaptable dashboard patterns, no full copy of OmniRoute code.</done>
</task>

<task type="auto">
  <name>Enhance the dashboard HTML with multi-provider sections</name>
  <files>scanner-dashboard.html</files>
  <action>Update scanner-dashboard.html to include new tabs/sections inspired by OmniRoute: Providers (list with status), Routing/Combos, Logs/Analytics, Health. Keep existing gaps scanner. Use the existing dark theme variables. Add cards for key metrics (uptime, requests, providers active). Make it interactive with JS for tab switching and mock data for proxy (providers like claude, grok with status). Ensure mobile friendly grid. Do not add new external dependencies or convert to React/Next - keep as single HTML file. Add a header with proxy name.</action>
  <verify>grep -E "(Providers|Routing|Health|Analytics)" scanner-dashboard.html | wc -l</verify>
  <done>Dashboard has at least 4 new sections with cards and tabs, matches existing style, >200 lines total, JS for interactivity works.</done>
</task>

<task type="auto">
  <name>Integrate dashboard with proxy server</name>
  <files>src/proxy/server.ts</files>
  <action>Add or enhance routes in the Hono server to serve the dashboard at /dashboard (static file) and provide JSON endpoints for /api/providers, /api/logs, /api/health that return mock or real data about configured providers, recent requests, MCP status. Update any existing static serve to include the dashboard. Ensure it works with both internal and passthrough modes. Keep changes minimal and compatible with existing proxy functionality.</action>
  <verify>grep -E "(dashboard|/api/|providers|health)" src/proxy/server.ts | wc -l</verify>
  <done>Server serves dashboard at /dashboard and has at least 2 data APIs, no breakage to existing proxy endpoints.</done>
</task>

</tasks>

<verification>
- Open http://localhost:PORT/dashboard (after running server) and verify all tabs load without errors
- Confirm provider and health data displays correctly
- Check that OmniRoute patterns are adapted without copying code
- Validate all must_haves truths and artifacts
- Update ROADMAP.md with this phase details
</verification>

<success_criteria>
- Dashboard is accessible and shows relevant proxy information with 4+ sections
- Reference document created with actionable insights from OmniRoute
- Server integration complete without regressions (existing proxy tests still pass)
- ROADMAP updated and requirement IDs covered
- Total changes fit within lightweight architecture (no heavy frameworks added)
</success_criteria>

<output>
After completion, create `.planning/phases/05-multi-provider-proxy-and-dashboard/05-multi-provider-proxy-and-dashboard-01-SUMMARY.md` documenting decisions, what was adapted from OmniRoute, and next steps for full implementation if partial.
</output>
