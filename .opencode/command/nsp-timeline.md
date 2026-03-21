---
description: Show the execution-path timeline from the shared resume packet
tools:
  bash: true
  read: true
---
<objective>
Open the operator-facing timeline panel for project resumption.

This surface stays thin on purpose:
- Run `nsp timeline`
- Present the resulting panel as-is
- Do not add a second recovery or recommendation layer in command content
</objective>

<process>
1. Run `nsp timeline`
2. Return the timeline panel directly
</process>
