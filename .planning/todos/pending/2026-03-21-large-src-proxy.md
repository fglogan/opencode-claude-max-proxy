---
created: 2026-03-21T00:47:52.051029+00:00
title: "[large] Clean up src/proxy"
area: cleanup
detector: large
tier: 3
finding_count: 1
effort: judgment
files:
  - src/proxy/server.ts
---

## Problem

The `large` detector found **1** finding(s) across **1** file(s) in `src/proxy`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/proxy/server.ts` | File exceeds large-file threshold | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Break large files into focused modules with clear responsibilities.
