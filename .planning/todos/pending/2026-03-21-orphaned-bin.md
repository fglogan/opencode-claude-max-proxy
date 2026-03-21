---
created: 2026-03-21T00:47:52.051029+00:00
title: "[orphaned] Clean up bin"
area: cleanup
detector: orphaned
tier: 3
finding_count: 2
effort: judgment
files:
  - bin/claude-proxy-supervisor.sh
  - bin/claude-proxy.ts
---

## Problem

The `orphaned` detector found **2** finding(s) across **2** file(s) in `bin`.

| File | Summary | Confidence |
|------|---------|------------|
| `bin/claude-proxy-supervisor.sh` | Orphaned file: 62 lines, not imported by any module | medium |
| `bin/claude-proxy.ts` | Orphaned file: 33 lines, not imported by any module | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Remove orphaned files or wire them into the module graph.
