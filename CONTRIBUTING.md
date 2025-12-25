# Contributing to WBS Ethogram Form

Thank you for your interest in contributing! This document outlines the process and guidelines for contributing to this project.

## 🌳 Branching Strategy

We use a **staging-based workflow** to ensure stability and quality:

### Branch Structure

- **`main`** - Production-ready code, always stable
- **`staging`** - Integration branch for testing features before release
- **Feature branches** - Development of new features or fixes

### Workflow

1. **Feature development** → All feature/fix/refactor/test/chore branches target `staging`
2. **Testing in staging** → Features are tested together in the `staging` branch
3. **Release to production** → Only `staging` can merge to `main` (when stable)
4. **Nightly sync** → `staging` automatically pulls latest from `main` at 2 AM UTC

### Exceptions

- `docs/` branches can target `main` directly (documentation-only changes)
- Emergency hotfixes labeled `hotfix` can bypass `staging` (critical production issues only)

> 📚 For detailed workflow walkthrough, see [BRANCHING.md](BRANCHING.md)

## 🤝 How to Contribute

### Reporting Issues

- Check existing issues before creating a new one
- Use clear, descriptive titles
- Include steps to reproduce bugs
- Add screenshots if applicable
- Mention your browser/OS if relevant

### Suggesting Features

- Search existing issues/PRs first
- Explain the use case and benefits
- Consider if it aligns with the project goals (citizen science data collection)
- Be open to discussion and feedback

### Contributing Code

1. **Fork the repository** and clone it locally
2. **Create a feature branch** from `staging` (not `main`!)
3. **Make your changes** following our code style
4. **Write/update tests** if applicable
5. **Test thoroughly** in your browser
6. **Commit with conventional commits** (see below)
7. **Push to your fork** and create a pull request to `staging`

> ⚠️ **Important:** Feature branches must target `staging`, not `main`. See [Branching Strategy](#-branching-strategy) above.

## 🌿 Branch Naming Convention

Use descriptive branch names with prefixes:

- `feat/` - New features (e.g., `feat/excel-export`)
- `fix/` - Bug fixes (e.g., `fix/timezone-conversion`)
- `docs/` - Documentation changes (e.g., `docs/update-readme`)
- `test/` - Adding/updating tests (e.g., `test/validation-suite`)
- `refactor/` - Code refactoring (e.g., `refactor/validation-hook`)
- `chore/` - Maintenance tasks (e.g., `chore/update-dependencies`)

## 💬 Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for clear, standardized commit messages:

```
<type>: <description>

[optional body]

[optional footer]
```

### Types

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Adding or updating tests
- `refactor:` - Code refactoring without changing functionality
- `style:` - Code style changes (formatting, missing semicolons, etc.)
- `chore:` - Maintenance tasks, dependency updates

### Examples

```bash
feat: add Excel export functionality

Implements xlsx library to generate downloadable Excel files
from observation data. Includes proper formatting and column headers.

Closes #42
```

```bash
fix: correct timezone conversion for observation timestamps

Observation keys were not being converted to WBS timezone in live mode,
causing data to appear outside the selected time range.
```

```bash
docs: reorganize documentation into separate files

Splits README into user-facing, development, and contribution docs
for better organization and clarity.
```

## 🧪 Testing

- Run existing tests: `npm test`
- Add tests for new features when possible
- We use Jest and React Testing Library
- Comprehensive test coverage including:
  - E2E integration tests (full app workflows)
  - Unit tests for hooks (useFormState, useFormValidation, useAutoSave)
  - Service tests (formStateManager, formSubmission, draftManager, excelGenerator)
  - Utility tests (timeUtils, timezoneUtils, localStorageUtils)
  - Component tests (LoadingOverlay, LoadingSpinner, OutputPreview)
  - Feature tests (copy-to-next validation)

## 📝 Code Style

### JavaScript/React

- Use modern ES6+ syntax
- Prefer functional components with hooks
- Use meaningful variable and function names
- Add comments for complex logic
- Keep components focused and single-purpose

### File Organization

```
src/
├── components/        # React components
├── hooks/            # Custom React hooks
├── utils/            # Utility functions
├── constants.js      # Shared constants/config
└── App.jsx          # Main app component
```

### React Patterns We Follow

- **Controlled components** - Form inputs managed by React state
- **Props down, events up** - Pass data down, callbacks up
- **Single source of truth** - Centralized state in App.jsx
- **Hooks for logic** - Extract complex logic into custom hooks

## 🔍 Pull Request Process

1. **Ensure correct base branch** - Feature branches must target `staging` (not `main`)
2. **Update documentation** if you're changing functionality
3. **Add tests** if you're adding features
4. **Ensure all tests pass** (`npm test`)
5. **Check for console errors** (`npm run dev`)
6. **Fill out the PR template** with clear description
7. **Link related issues** (e.g., "Closes #42")
8. **Request review** when ready
9. **Address feedback** promptly and professionally

### PR Guidelines

- Keep PRs focused on a single feature/fix
- Write clear descriptions of what changed and why
- Include screenshots for UI changes
- Update relevant documentation
- Maintain or improve test coverage
- **Verify base branch** - Use `staging` for feature/fix/refactor/test/chore branches

> 💡 **Tip:** The PR Base Branch Check workflow will automatically validate your PR's base branch and leave a comment if it needs correction.

## 🚀 Development Workflow

### Setting Up

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/wbs-ethogram-form.git
cd wbs-ethogram-form

# Add upstream remote
git remote add upstream https://github.com/iboughtamouse/wbs-ethogram-form.git

# Install dependencies
npm install
```

### Working on a Feature

```bash
# Make sure you're on staging and up to date
git checkout staging
git pull upstream staging

# Create your feature branch
git checkout -b feat/your-feature-name

# Make changes, commit often
git add .
git commit -m "feat: describe your changes"

# Push to your fork
git push origin feat/your-feature-name

# Create PR on GitHub targeting 'staging'
```

### Keeping Your Fork Updated

```bash
# Fetch and merge upstream changes
git checkout staging
git pull upstream staging
git push origin staging

# Rebase your feature branch if needed
git checkout feat/your-feature-name
git rebase staging
```

## 🎯 Project Goals & Priorities

When contributing, keep these project goals in mind:

1. **Data quality** - Validation and error prevention are critical
2. **User experience** - Citizen scientists should find it easy to use
3. **Reliability** - Autosave, error handling, edge cases matter
4. **Accessibility** - Support for screen readers and keyboard navigation
5. **Performance** - Keep it fast and responsive
6. **Maintainability** - Clear code is better than clever code

## 💡 Good First Issues

Look for issues labeled:

- `good first issue` - Great for newcomers
- `help wanted` - We'd love contributions here
- `documentation` - Improve our docs

## 🤔 Questions?

- Open a GitHub Discussion for general questions
- Comment on relevant issues for specific questions
- Check existing documentation first (README, DEVELOPMENT.md)

## 🙏 Thank You!

Every contribution, no matter how small, helps make this tool better for the World Bird Sanctuary community. We appreciate your time and effort!
