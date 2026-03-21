---
description: Update NSP to latest version with changelog display
tools:
  bash: true
  question: true
---

<objective>
Check for NSP updates, route through the configured update source, install if available, and display what changed.

Routes to the update workflow which handles:
- `update.source` routing for `none`, `local`, or `github:owner/repo`
- Installed version detection from the active `nsp` binary
- Latest version checking via GitHub Releases API when applicable
- Changelog fetching and display when applicable
- Canonical release install route: GitHub `install.sh` → `nsp install` → optional `nsp restore-patches`
- Local source-build route: `cargo build --release` → binary copy → `nsp install`
- User confirmation with clean install warning
- Binary + content update execution and cache clearing
- Legacy marker cleanup guidance
- Restart reminder
</objective>

<execution_context>
$(nsp content show workflows update --raw)
</execution_context>

<process>
**Follow the update workflow** from `$(nsp content show workflows update --raw)`.

The workflow handles all logic including:
1. Update-source detection via `nsp config-get update.source --raw`
2. Installed version detection via `nsp version --raw`
3. Branching between disabled, local source-build, and GitHub release flows
4. Latest version checking via GitHub Releases API when needed
5. Version comparison
6. Changelog fetching and extraction when needed
7. Clean install warning display
8. User confirmation
9. Config-aware update/install execution (`cargo build --release` for local, `install.sh` -> `nsp install` -> `nsp restore-patches` for GitHub sources)
10. Cache cleanup and post-update guidance
</process>
