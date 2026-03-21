---
created: 2026-03-21T00:47:52.051029+00:00
title: "[dep_drift] Clean up .opencode"
area: cleanup
detector: dep_drift
tier: 3
finding_count: 15
effort: judgment
files:
  - .opencode/package.json
---

## Problem

The `dep_drift` detector found **15** finding(s) across **1** file(s) in `.opencode`.

| File | Summary | Confidence |
|------|---------|------------|
| `.opencode/package.json` | npm package 'bun:test' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'child_process' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'crypto' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'fs' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'node:async_hooks' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'node:child_process' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'node:fs' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'node:path' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'node:util' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'path' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'url' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm package 'zod' is imported but not declared in .opencode/package.json | high |
| `.opencode/package.json` | npm dependency '@opencode-ai/plugin' is declared but never imported in source code | medium |
| `.opencode/package.json` | npm dependency '@types/bun' is declared but never imported in source code | medium |
| `.opencode/package.json` | npm dependency 'p-queue' is declared but never imported in source code | medium |

## Solution

Requires human judgment. Evaluate whether each finding represents genuine technical debt or an acceptable trade-off.
