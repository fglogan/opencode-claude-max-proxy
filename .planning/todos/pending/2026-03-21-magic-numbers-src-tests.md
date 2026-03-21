---
created: 2026-03-21T00:47:52.051029+00:00
title: "[magic_numbers] Clean up src/__tests__"
area: cleanup
detector: magic_numbers
tier: 3
finding_count: 14
effort: judgment
files:
  - src/__tests__/helpers.ts
  - src/__tests__/integration.test.ts
  - src/__tests__/proxy-agent-definitions.test.ts
  - src/__tests__/proxy-error-handling.test.ts
  - src/__tests__/proxy-passthrough-concept.test.ts
---

## Problem

The `magic_numbers` detector found **14** finding(s) across **5** file(s) in `src/__tests__`.

| File | Summary | Confidence |
|------|---------|------------|
| `src/__tests__/helpers.ts:106` | Magic number 50 appears in 6 locations — extract to a named constant | high |
| `src/__tests__/helpers.ts:171` | Magic number 7 on line 171 — consider extracting to a named constant | low |
| `src/__tests__/helpers.ts:173` | Magic number 6 appears in 3 locations — extract to a named constant | high |
| `src/__tests__/helpers.ts:86` | Magic number 50 appears in 6 locations — extract to a named constant | high |
| `src/__tests__/integration.test.ts:285` | Magic number 3 appears in 4 locations — extract to a named constant | high |
| `src/__tests__/proxy-agent-definitions.test.ts:153` | Magic number 3 appears in 4 locations — extract to a named constant | high |
| `src/__tests__/proxy-agent-definitions.test.ts:27` | Magic number 6 appears in 3 locations — extract to a named constant | high |
| `src/__tests__/proxy-agent-definitions.test.ts:54` | Magic number 6 appears in 3 locations — extract to a named constant | high |
| `src/__tests__/proxy-error-handling.test.ts:115` | Magic number 402 on line 115 — consider extracting to a named constant | low |
| `src/__tests__/proxy-error-handling.test.ts:30` | Magic number 5 on line 30 — consider extracting to a named constant | low |
| `src/__tests__/proxy-passthrough-concept.test.ts:36` | Magic number 50 appears in 6 locations — extract to a named constant | high |
| `src/__tests__/proxy-passthrough-concept.test.ts:64` | Magic number 50 appears in 6 locations — extract to a named constant | high |
| `src/__tests__/proxy-passthrough-concept.test.ts:80` | Magic number 20 on line 80 — consider extracting to a named constant | low |
| `src/__tests__/proxy-passthrough-concept.test.ts:80` | Magic number 50 appears in 6 locations — extract to a named constant | high |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off.
