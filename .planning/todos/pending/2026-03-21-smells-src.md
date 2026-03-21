---
created: 2026-03-21T00:47:52.051029+00:00
title: "[smells] Clean up src"
area: cleanup
detector: smells
tier: 3
finding_count: 1
effort: judgment
files:
  - src/logger.ts
---

## Problem

The `smells` detector found **1** finding(s) across **1** file(s) in `src`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/logger.ts:25` | Code smell in function 'sanitize': deep nesting (5 > 4) | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off. Refactor long, deeply nested, or high-arity functions into smaller units.
