---
description: Run a structured competitive watch review for GSD-2 and upstream NSP releases
tools:
  bash: true
  read: true
  edit: true
---

<objective>
Conduct a quarterly competitive watch cycle. Tracks major releases from GSD-2 (`gsd-build/gsd-2`)
and upstream NSP (`fglogan/genesis-nsp`), classifies each observable change as
ADOPT/ADAPT/MONITOR/IRRELEVANT, and produces a phase-scoped review artifact + action backlog.

Output artifacts (written to the active phase directory):
- `{phase_dir}/{n}-COMPETITIVE-WATCH.md` — release inventory + decision table
- `{phase_dir}/{n}-COMPETITIVE-ACTIONS.md` — action backlog for ADOPT/ADAPT items
</objective>

<execution_context>
$(nsp content show workflows competitive-watch --raw)
</execution_context>

<process>
Follow the competitive watch workflow from the execution_context above.

Resolve the active phase from STATE.md first, then proceed through all workflow steps in order:
1. Identify competitors and capture current state (release tag or commit-based fallback)
2. Build the complete release inventory before making any classification decisions
3. Classify every row: ADOPT / ADAPT / MONITOR / IRRELEVANT
4. Write COMPETITIVE-WATCH.md (inventory + decision table) and COMPETITIVE-ACTIONS.md (ADOPT/ADAPT only)
5. Update STATE.md with watch date and any ADOPT items

Do not skip the inventory step — unclassified changes must not silently become action items or
be silently dropped. If a competitor has no semver release, use the commit-based baseline fallback.
</process>
