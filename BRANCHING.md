# 🌳 Branching Strategy

This document provides comprehensive guidance on our staging-based branching workflow for the WBS Ethogram Form repository.

## Overview

We use a **staging-based workflow** where all feature development flows through a `staging` branch before reaching production (`main`). This ensures that:

- Features are tested together before release
- `main` remains stable and production-ready
- Integration issues are caught early in `staging`
- Releases are intentional and controlled

## Branch Structure

### `main` - Production Branch

- **Purpose:** Production-ready code, always stable
- **Protected:** Yes, requires pull request review
- **Updated by:** Only `staging` branch merges (except `docs/` branches)
- **Deployed to:** Production environment (Vercel)

### `staging` - Integration Branch

- **Purpose:** Integration and testing of features before release
- **Protected:** Yes, requires pull request review
- **Updated by:** Feature branch merges + nightly sync from `main`
- **Deployed to:** Staging environment (preview deployments)

### Feature Branches

- **Purpose:** Development of individual features, fixes, or improvements
- **Created from:** `staging`
- **Merged to:** `staging` (via pull request)
- **Naming conventions:** See [Branch Naming](#branch-naming-conventions)

## Complete Workflow

### 1. Start New Feature

```bash
# Ensure you have the latest staging
git checkout staging
git pull origin staging

# Create your feature branch
git checkout -b feat/your-feature-name
```

### 2. Develop Your Feature

```bash
# Make changes
# ... edit files ...

# Commit with conventional commits
git add .
git commit -m "feat: add new feature"

# Keep your branch updated with staging
git fetch origin staging
git rebase origin/staging
```

### 3. Push Your Branch

```bash
# Push to your fork or the main repo
git push origin feat/your-feature-name
```

### 4. Create Pull Request

- **Base branch:** `staging` (not `main`!)
- **Title:** Use conventional commit format
- **Description:** Follow PR template
- **Reviewers:** Request review from maintainers

> ⚠️ **Important:** If you accidentally target `main`, the PR Base Branch Check workflow will comment with instructions to change it.

### 5. Review & Merge

- Address review feedback
- Ensure CI passes
- Maintainer merges to `staging`
- Your feature is now in the integration environment

### 6. Nightly Sync (Automated)

- Every night at 2 AM UTC, `staging` automatically pulls from `main`
- Ensures `staging` has latest production hotfixes
- Creates GitHub issue if merge conflicts occur

### 7. Release to Production

When `staging` is stable and ready for release:

```bash
# Maintainer creates release PR
git checkout staging
git pull origin staging

# Create PR from staging to main
# Title: "Release: [version or date]"
# This PR is reviewed and merged by maintainers
```

## Branch Naming Conventions

Use descriptive prefixes to categorize your work:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/excel-export` |
| `fix/` | Bug fixes | `fix/timezone-conversion` |
| `refactor/` | Code refactoring | `refactor/validation-hook` |
| `test/` | Adding/updating tests | `test/validation-suite` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `docs/` | Documentation only | `docs/update-readme` |

### Special Case: `docs/` Branches

Documentation-only changes can target `main` directly:

```bash
# Create docs branch
git checkout -b docs/update-contributing

# Make documentation changes
git add CONTRIBUTING.md
git commit -m "docs: update contributing guidelines"

# Create PR targeting main (allowed!)
git push origin docs/update-contributing
```

This exception exists because documentation changes:
- Don't affect application code or behavior
- Should be available in production immediately
- Don't need integration testing

## Automated Checks

### PR Base Branch Validator

**Workflow:** `.github/workflows/pr-base-branch-check.yml`

**Runs on:** Every pull request (opened, reopened, edited, synchronize)

**What it does:**
- ✅ Allows `staging` → `main` PRs
- ✅ Allows `docs/` → `main` PRs
- ✅ Allows feature branches → `staging` PRs
- ❌ Blocks feature branches → `main` PRs (with helpful comment)

**Example comment when base is incorrect:**

```
⚠️ Incorrect Base Branch

This appears to be a feature branch (feat/my-feature) targeting main.

Our branching strategy requires:
- Feature branches (feat/, fix/, refactor/, test/, chore/) → staging
- staging → main (when ready for release)
- docs/ branches → main (documentation only)

Please update the base branch of this PR to staging.
```

### Nightly Staging Sync

**Workflow:** `.github/workflows/nightly-staging-sync.yml`

**Runs:** Every day at 2 AM UTC (or manually via Actions tab)

**What it does:**
1. Checks out `staging` branch
2. Merges `main` into `staging`
3. Pushes changes if successful
4. Creates GitHub issue if merge conflict occurs

**When conflicts occur:**

The workflow creates an issue titled "🚨 Nightly staging sync failed - merge conflict" with:
- Link to compare `staging...main`
- Step-by-step resolution instructions
- Labels: `automation`, `staging-sync-conflict`, `needs-attention`

## Common Scenarios

### Adding a New Feature

```bash
# 1. Start from staging
git checkout staging
git pull origin staging
git checkout -b feat/new-feature

# 2. Develop & commit
git add .
git commit -m "feat: implement new feature"

# 3. Push and create PR to staging
git push origin feat/new-feature
# Open PR: feat/new-feature → staging

# 4. After merge to staging, feature is tested
# 5. When staging is stable, it goes to main
```

### Fixing a Bug

```bash
# Same process as feature, but use fix/ prefix
git checkout staging
git pull origin staging
git checkout -b fix/bug-description

git add .
git commit -m "fix: resolve bug description"

git push origin fix/bug-description
# Open PR: fix/bug-description → staging
```

### Updating Documentation

```bash
# Docs can go directly to main
git checkout main
git pull origin main
git checkout -b docs/update-guide

git add docs/guide.md
git commit -m "docs: update usage guide"

git push origin docs/update-guide
# Open PR: docs/update-guide → main ✅ (allowed!)
```

### Releasing to Production

**Only maintainers perform this:**

```bash
# 1. Ensure staging is stable
# 2. All staging tests pass
# 3. Verify preview deployment works

# 4. Create release PR
git checkout staging
git pull origin staging
# Open PR: staging → main
# Title: "Release: YYYY-MM-DD" or "Release: v1.2.3"

# 5. Review, approve, and merge
# 6. main is now updated
# 7. Production deploys automatically
# 8. Nightly sync will pull this back to staging
```

## Conflict Resolution

### Resolving Nightly Sync Conflicts

If the nightly sync fails, you'll see a GitHub issue. To resolve:

```bash
# 1. Check out staging
git checkout staging
git pull origin staging

# 2. Merge main
git fetch origin main
git merge origin/main

# 3. Resolve conflicts
# Edit conflicting files
# Remove conflict markers (<<<<<<<, =======, >>>>>>>)

# 4. Complete the merge
git add .
git commit -m "chore: resolve merge conflict from main"

# 5. Push
git push origin staging

# 6. Close the GitHub issue
```

### Resolving Feature Branch Conflicts

If your feature branch conflicts with `staging`:

```bash
# 1. Update staging locally
git checkout staging
git pull origin staging

# 2. Switch to your branch
git checkout feat/your-feature

# 3. Rebase onto staging
git rebase staging

# 4. Resolve conflicts in each commit
# Edit files, then:
git add .
git rebase --continue

# 5. Force push (rewrites history)
git push --force origin feat/your-feature
```

> ⚠️ **Warning:** Force push only to your feature branches, never to `staging` or `main`.

## Best Practices

### ✅ Do

- **Always branch from `staging`** (except docs)
- **Keep feature branches focused** - one feature/fix per branch
- **Pull staging regularly** - keep your branch up to date
- **Write descriptive commit messages** - use conventional commits
- **Test locally before pushing** - run `npm test` and `npm run dev`
- **Request reviews promptly** - don't leave PRs stale
- **Update PR descriptions** - keep them accurate if changes occur

### ❌ Don't

- **Don't target main with feature branches** - use `staging` instead
- **Don't force push to staging or main** - only to your feature branches
- **Don't merge without review** - wait for approval
- **Don't ignore CI failures** - fix them before merging
- **Don't commit directly to staging/main** - always use PRs
- **Don't leave conflicts unresolved** - address them promptly

## FAQ

### Q: Why use staging instead of direct-to-main?

**A:** Staging allows us to:
- Test multiple features together before release
- Catch integration issues early
- Keep main stable and production-ready
- Control release timing

### Q: Can I create a PR from main to staging?

**A:** No, the flow is one-way: `staging` → `main`. The nightly sync automatically brings `main` changes back to `staging`.

### Q: What if I accidentally created my branch from main?

**A:** You can either:
1. Recreate the branch from `staging`, or
2. Rebase your branch onto `staging`:
   ```bash
   git checkout your-branch
   git rebase --onto staging main
   git push --force origin your-branch
   ```

### Q: What happens if I forget and target main?

**A:** The PR Base Branch Check workflow will:
- Leave a comment explaining the correct base
- Fail the check (preventing accidental merge)
- You can change the base branch in the PR's web interface

### Q: How do I change a PR's base branch?

**A:** On GitHub:
1. Open your pull request
2. Click "Edit" next to the title
3. Click the base branch dropdown
4. Select `staging`
5. Click "Change base"

### Q: Why does staging get updates from main?

**A:** The nightly sync ensures `staging` has the latest:
- Production hotfixes
- Documentation updates from `docs/` branches
- Any critical changes that went directly to main

This prevents `staging` from falling behind and creating conflicts later.

### Q: Can I manually trigger the nightly sync?

**A:** Yes! Maintainers can go to:
1. Actions tab
2. "Nightly Staging Sync" workflow
3. Click "Run workflow"
4. Select branch (should be `staging`)
5. Click "Run workflow" button

### Q: What if tests fail in staging?

**A:** Fix the issue in your feature branch:
1. Make the fix
2. Push to your branch
3. The PR is automatically updated
4. Tests run again

## Troubleshooting

### "Your branch is behind staging"

```bash
# Update your branch
git checkout your-branch
git fetch origin staging
git rebase origin/staging
git push --force origin your-branch
```

### "PR targets wrong branch"

Change the base branch on GitHub (see FAQ above), or close and recreate the PR.

### "Merge conflict in my PR"

See [Resolving Feature Branch Conflicts](#resolving-feature-branch-conflicts) above.

### "CI is failing"

```bash
# Run tests locally
npm test
npm run lint
npm run format:check
npm run build

# Fix issues, commit, and push
git add .
git commit -m "fix: resolve CI issues"
git push origin your-branch
```

### "Can't push to staging"

You shouldn't push directly to `staging` - always use pull requests. If you're a maintainer resolving a sync conflict, ensure you have write access.

## Quick Reference

```bash
# Start new feature
git checkout staging && git pull origin staging
git checkout -b feat/my-feature

# Update feature branch
git fetch origin staging && git rebase origin/staging

# Create PR
git push origin feat/my-feature
# Open PR: feat/my-feature → staging

# Release (maintainers only)
# Open PR: staging → main
```

---

**Questions?** Check [CONTRIBUTING.md](CONTRIBUTING.md) or open a GitHub Discussion.
