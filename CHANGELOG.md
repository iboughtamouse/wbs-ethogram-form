# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Staging-based branching workflow with automated nightly sync
- PR base branch validation workflow
- Dependabot configuration for automated dependency updates
- Issue templates for bugs and feature requests
- CHANGELOG.md for tracking project changes

## [0.1.0] - 2025-11-20

### Added

- Backend API integration for direct data submission
- Email submission functionality (auto-sends Excel to WBS)
- Share observation via email feature
- Excel file export with proper formatting
- Copy-to-next validation to prevent bad data propagation
- Accessible loading indicators with ARIA labels
- Live stream and VOD observation modes
- Autosave functionality with draft recovery
- Smart validation system with inline error messages
- Interactive perch diagram map
- Structured data entry with autocomplete dropdowns
- Behavior-specific interaction sub-fields
- Time range flexibility (5 minutes to 1 hour)
- WBS timezone handling (America/Chicago)

### Fixed

- Timezone conversion for observation timestamps
- Observer name validation for Discord/Twitch usernames
- Time adjustment data loss issues
- Client-side date validation
- Client-side error handling improvements
- Observer name NaN on Enter key press

### Changed

- Improved error handling with retry functionality
- Enhanced user experience with status tracking
- Reorganized documentation into separate files

## [0.0.1] - 2025-10-15

### Added

- Initial release
- Basic form structure
- Time slot generation
- Behavior selection dropdown
- Local storage autosave
