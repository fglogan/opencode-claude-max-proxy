---
description: Restore locally modified NSP files that were backed up during update
tools:
  bash: true
---

<objective>
Re-apply local modifications that were backed up by `nsp install` during an update.

When NSP detects that you've modified installed files (slash commands, agent definitions),
it saves your changes to `nsp-local-patches/` before overwriting with the new version.
This command merges those local changes back into the freshly installed files.

Strategy: three-way merge using the canonical content as base. Your local additions are
appended after the new upstream content. If a conflict is irrecoverable, the backup is
preserved and reported as skipped.
</objective>

<process>
1. Run `nsp restore-patches` to detect and merge backed-up patches:

```bash
nsp restore-patches
```

2. Review the output:
   - **restored**: Files where local modifications were successfully merged back in
   - **skipped**: Files where conflicts prevented automatic merge (backups preserved)

3. If any files were skipped, inform the user:
   - The raw backup is still in `nsp-local-patches/{category}/{filename}`
   - They can manually compare the backup with the installed file
   - Or they can re-apply their changes by hand

4. If no patches are found, inform the user that there are no local modifications to restore.
</process>
