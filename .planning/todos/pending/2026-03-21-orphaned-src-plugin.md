---
created: 2026-03-21T00:47:52.051029+00:00
title: "[orphaned] Clean up src/plugin"
area: cleanup
detector: orphaned
tier: 3
finding_count: 1
effort: judgment
files:
  - src/plugin/claude-max-headers.ts
---

## Problem

The `orphaned` detector found **1** finding(s) across **1** file(s) in `src/plugin`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/plugin/claude-max-headers.ts` | Orphaned file: 52 lines, not imported by any module | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Remove orphaned files or wire them into the module graph.
