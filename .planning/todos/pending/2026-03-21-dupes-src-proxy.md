---
created: 2026-03-21T00:47:52.051029+00:00
title: "[dupes] Clean up src/proxy"
area: cleanup
detector: dupes
tier: 3
finding_count: 1
effort: judgment
files:
  - src/proxy/server.ts
---

## Problem

The `dupes` detector found **1** finding(s) across **1** file(s) in `src/proxy`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/proxy/server.ts` | Near dupe: createProxyServer (src/proxy/server.ts:270) <-> handleMessages (src/proxy/server.ts:321) [90%] | low |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Extract shared logic into a common utility or apply the DRY principle.
