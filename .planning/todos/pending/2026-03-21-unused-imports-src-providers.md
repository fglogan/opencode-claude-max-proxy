---
created: 2026-03-21T00:47:52.051029+00:00
title: "[unused_imports] Clean up src/providers"
area: cleanup
detector: unused_imports
tier: 3
finding_count: 2
effort: judgment
files:
  - src/providers/claude.ts
  - src/providers/registry.ts
---

## Problem

The `unused_imports` detector found **2** finding(s) across **2** file(s) in `src/providers`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/providers/claude.ts:4` | Imported symbol 'buildAgentDefinitions' is never used | medium |
| `src/providers/registry.ts:2` | Imported symbol 'ProxyConfig' is never used | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off.
