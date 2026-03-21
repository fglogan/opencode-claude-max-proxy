---
created: 2026-03-21T00:47:52.051029+00:00
title: "[uncalled] Clean up src/proxy"
area: cleanup
detector: uncalled
tier: 3
finding_count: 2
effort: judgment
files:
  - src/proxy/server.ts
---

## Problem

The `uncalled` detector found **2** finding(s) across **1** file(s) in `src/proxy`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/proxy/server.ts:301` | Function `acquireSession` at line 301 appears uncalled in the scanned codebase | low |
| `src/proxy/server.ts:312` | Function `releaseSession` at line 312 appears uncalled in the scanned codebase | low |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Verify functions are truly unused, then remove or document their entry point.
