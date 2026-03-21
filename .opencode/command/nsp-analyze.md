---
description: Run genesis-superpowers analyzer, ingest findings into .planning/qa/, and route to /nsp:plan-phase --gaps if actionable issues found
argument-hint: "[--profile standard|quick]"
tools:
  read: true
  bash: true
---

<objective>
Run the genesis-superpowers analyzer against the current project, ingest unified findings
into .planning/qa/ as NspIssue records, then present a summary and offer gap-closure routing
if critical or high severity issues were found.
</objective>

<execution_flow>

**Step 1 — Run analyzer:**
```bash
nsp analyze --profile standard --raw
```

Parse the JSON. Extract: `genesis_superpowers_available`, `profile`, `total`, `critical`,
`high`, `low`, `persisted`, `note`.

**Step 2 — Present findings summary:**

If `genesis_superpowers_available` is false:
- Report: "genesis-superpowers is not installed. Analyzer integration requires the binary on PATH."
- Note that `nsp verify-work --with-analyzer` will skip the quality gate gracefully.
- Stop here.

If `genesis_superpowers_available` is true:
- Show: health overview table with total/critical/high/low counts
- Show: persisted path (confirms findings are in .planning/qa/ for `nsp qa --route`)
- Show: profile used

**Step 3 — Route if actionable issues found:**

Compute `actionable = critical + high`.

If `actionable > 0`:
- Inform: "Found N actionable issues (C critical, H high). Routing to gap closure planning."
- Invoke: `/nsp:plan-phase --gaps`

If `actionable == 0`:
- Report: "No critical or high severity issues. Project health is clean."

</execution_flow>

<context>
Profile argument: $ARGUMENTS
</context>
