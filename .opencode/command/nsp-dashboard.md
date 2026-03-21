---
description: Show the recovery-focused dashboard drilldown from the shared resume packet
tools:
  bash: true
  read: true
---
<objective>
Open the operator-facing dashboard drilldown for project resumption.

This surface stays thin on purpose:
- Run `nsp dashboard --markdown`
- Present the resulting markdown drilldown as-is
- Do not add a second recovery or recommendation layer in command content
</objective>

<process>
1. Run `nsp dashboard --markdown`
2. Return the markdown output directly
</process>
