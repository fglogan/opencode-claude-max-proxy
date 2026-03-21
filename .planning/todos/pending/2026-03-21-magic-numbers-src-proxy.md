---
created: 2026-03-21T00:47:52.051029+00:00
title: "[magic_numbers] Clean up src/proxy"
area: cleanup
detector: magic_numbers
tier: 3
finding_count: 12
effort: judgment
files:
  - src/proxy/server.ts
---

## Problem

The `magic_numbers` detector found **12** finding(s) across **1** file(s) in `src/proxy`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/proxy/server.ts:1023` | Magic number 145 on line 1023 — consider extracting to a named constant | medium |
| `src/proxy/server.ts:1024` | Magic number 87 on line 1024 — consider extracting to a named constant | medium |
| `src/proxy/server.ts:1025` | Magic number 210 on line 1025 — consider extracting to a named constant | medium |
| `src/proxy/server.ts:1028` | Magic number 3 appears in 4 locations — extract to a named constant | high |
| `src/proxy/server.ts:1038` | Magic number 42 on line 1038 — consider extracting to a named constant | medium |
| `src/proxy/server.ts:1045` | Magic number 3 appears in 4 locations — extract to a named constant | high |
| `src/proxy/server.ts:123` | Magic number 402 on line 123 — consider extracting to a named constant | medium |
| `src/proxy/server.ts:46` | Magic number 60 appears in 3 locations — extract to a named constant | high |
| `src/proxy/server.ts:46` | Magic number 60 appears in 3 locations — extract to a named constant | high |
| `src/proxy/server.ts:58` | Magic number 2000 on line 58 — consider extracting to a named constant | medium |
| `src/proxy/server.ts:709` | Magic number 5 on line 709 — consider extracting to a named constant | medium |
| `src/proxy/server.ts:719` | Magic number 15_000 on line 719 — consider extracting to a named constant | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off.
