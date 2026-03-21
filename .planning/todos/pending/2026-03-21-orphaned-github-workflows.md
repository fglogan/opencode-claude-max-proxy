---
created: 2026-03-21T00:47:52.051029+00:00
title: "[orphaned] Clean up .github/workflows"
area: cleanup
detector: orphaned
tier: 3
finding_count: 1
effort: judgment
files:
  - .github/workflows/release-please.yml
---

## Problem

The `orphaned` detector found **1** finding(s) across **1** file(s) in `.github/workflows`.

| File | Summary | Confidence |
|------|---------|------------|
| `.github/workflows/release-please.yml` | Orphaned file: 39 lines, not imported by any module | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Remove orphaned files or wire them into the module graph.
