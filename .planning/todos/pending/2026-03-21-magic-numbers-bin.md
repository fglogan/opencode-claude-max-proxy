---
created: 2026-03-21T00:47:52.051029+00:00
title: "[magic_numbers] Clean up bin"
area: cleanup
detector: magic_numbers
tier: 3
finding_count: 2
effort: judgment
files:
  - bin/claude-proxy-supervisor.sh
---

## Problem

The `magic_numbers` detector found **2** finding(s) across **1** file(s) in `bin`.

| File | Summary | Confidence |
|------|---------|------------|
| `bin/claude-proxy-supervisor.sh:19` | Magic number 50 appears in 6 locations — extract to a named constant | high |
| `bin/claude-proxy-supervisor.sh:20` | Magic number 60 appears in 3 locations — extract to a named constant | high |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off.
