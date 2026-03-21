---
created: 2026-03-21T00:47:52.051029+00:00
title: "[complexity] Clean up src/proxy"
area: cleanup
detector: complexity
tier: 3
finding_count: 5
effort: judgment
files:
  - src/proxy/passthroughTools.ts
  - src/proxy/server.ts
---

## Problem

The `complexity` detector found **5** finding(s) across **2** file(s) in `src/proxy`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/proxy/passthroughTools.ts:23` | Function `jsonSchemaToZod` has cyclomatic complexity 17 (threshold: 15) | medium |
| `src/proxy/server.ts:99` | Function `classifyError` has cyclomatic complexity 26 (threshold: 15) | medium |
| `src/proxy/server.ts:270` | Function `createProxyServer` has cyclomatic complexity 135 (threshold: 15) | high |
| `src/proxy/server.ts:321` | Function `handleMessages` has cyclomatic complexity 124 (threshold: 15) | high |
| `src/proxy/server.ts:635` | Function `start` has cyclomatic complexity 56 (threshold: 15) | high |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Extract complex functions into smaller, well-named helpers.
