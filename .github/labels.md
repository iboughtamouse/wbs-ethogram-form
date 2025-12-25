# GitHub Labels

This document defines the repository's label scheme. Labels are organized by category with semantic colors.

## Label Definitions

### Type Labels (Blue/Green - Action-oriented)

| Label     | Color    | Description                                        |
| --------- | -------- | -------------------------------------------------- |
| `docs`    | `0075ca` | Documentation changes (README, CONTRIBUTING, etc.) |
| `release` | `0e8a16` | Release PR (staging → main)                        |

### Automation Labels (Gray/Purple - System-generated)

| Label          | Color    | Description                              |
| -------------- | -------- | ---------------------------------------- |
| `dependencies` | `0366d6` | Dependency updates (npm, GitHub Actions) |
| `automated`    | `8b80f9` | Automated PRs (Dependabot, bots)         |
| `ci`           | `5319e7` | CI/CD related changes                    |
| `automation`   | `ededed` | Automated processes and workflows        |

### Status Labels (Yellow/Orange - Requires action)

| Label             | Color    | Description                           |
| ----------------- | -------- | ------------------------------------- |
| `needs-attention` | `fbca04` | Requires immediate attention          |
| `needs-triage`    | `d93f0b` | New issue/PR requiring initial review |

### Issue Type Labels (Pink/Red)

| Label         | Color    | Description             |
| ------------- | -------- | ----------------------- |
| `bug`         | `d73a4a` | Something isn't working |
| `enhancement` | `a2eeef` | New feature or request  |

### Special Labels (Red - High importance)

| Label                   | Color    | Description                                     |
| ----------------------- | -------- | ----------------------------------------------- |
| `staging-sync-conflict` | `b60205` | Nightly staging sync encountered merge conflict |

## Creating Labels

### Option 1: Manual Creation

1. Go to https://github.com/iboughtamouse/wbs-ethogram-form/labels
2. Click "New label" for each label above
3. Enter name, description, and color (without `#` prefix)

### Option 2: Using GitHub CLI

```bash
# Create all labels at once
gh label create "docs" --color "0075ca" --description "Documentation changes (README, CONTRIBUTING, etc.)"
gh label create "release" --color "0e8a16" --description "Release PR (staging → main)"
gh label create "dependencies" --color "0366d6" --description "Dependency updates (npm, GitHub Actions)"
gh label create "automated" --color "8b80f9" --description "Automated PRs (Dependabot, bots)"
gh label create "ci" --color "5319e7" --description "CI/CD related changes"
gh label create "automation" --color "ededed" --description "Automated processes and workflows"
gh label create "needs-attention" --color "fbca04" --description "Requires immediate attention"
gh label create "needs-triage" --color "d93f0b" --description "New issue/PR requiring initial review"
gh label create "bug" --color "d73a4a" --description "Something isn't working"
gh label create "enhancement" --color "a2eeef" --description "New feature or request"
gh label create "staging-sync-conflict" --color "b60205" --description "Nightly staging sync encountered merge conflict"
```

### Option 3: Using GitHub Actions

You can use the [EndBug/label-sync](https://github.com/EndBug/label-sync) action to sync labels from a YAML file, but this adds complexity and is likely overkill for a solo project.

## Label Usage

### Automated Labels

These are applied automatically by workflows:

- **Dependabot PRs**: `dependencies` + `automated` (npm) or `ci` (GitHub Actions)
- **Nightly sync issues**: `automation` + `staging-sync-conflict` + `needs-attention`
- **Issue templates**: `bug` + `needs-triage` or `enhancement` + `needs-triage`

### Manual Labels

Apply these manually when creating PRs:

- **docs/** branches: `docs`
- **staging → main PRs**: `release`

## Future Labels (Add when needed)

If you find yourself needing these, add them:

**Type labels matching branch conventions:**

- `feature` - New features (feat/ branches)
- `fix` - Bug fixes (fix/ branches)
- `refactor` - Code refactoring
- `test` - Test additions/updates
- `chore` - Maintenance tasks

**Status labels:**

- `wip` - Work in progress
- `blocked` - Blocked by external dependency
- `ready-for-review` - Ready for review

**Priority labels:**

- `priority: high`
- `priority: medium`
- `priority: low`

## Maintenance

- When adding new labels, update this document
- Keep colors consistent within categories
- Prefer descriptive names over abbreviations
- Archive unused labels rather than deleting them
