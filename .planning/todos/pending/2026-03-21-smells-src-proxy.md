---
created: 2026-03-21T00:47:52.051029+00:00
title: "[smells] Clean up src/proxy"
area: cleanup
detector: smells
tier: 3
finding_count: 4
effort: judgment
files:
  - src/proxy/server.ts
---

## Problem

The `smells` detector found **4** finding(s) across **1** file(s) in `src/proxy`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/proxy/server.ts:99` | Code smell in function 'classifyError': excessive length (85 > 55) | medium |
| `src/proxy/server.ts:270` | Code smell in function 'createProxyServer': deep nesting (13 > 4), excessive length (785 > 55) | high |
| `src/proxy/server.ts:321` | Code smell in function 'handleMessages': deep nesting (12 > 4), excessive length (651 > 55) | high |
| `src/proxy/server.ts:635` | Code smell in function 'start': deep nesting (8 > 4), excessive length (308 > 55) | high |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Refactor long, deeply nested, or high-arity functions into smaller units.
