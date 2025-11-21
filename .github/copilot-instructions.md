## Quick orientation for AI coding agents

This is a small Vite + React single-page app for entering ethogram observations in 5-minute intervals.
Keep edits local and minimal: prefer changing the single source of truth files listed below rather than duplicating logic across components.

### Big picture
- Single-page form: `src/App.jsx` orchestrates metadata, generates time slots, and holds `observations` state.
- Time logic lives in `src/utils/timeUtils.js` (rounding, slot generation, validation). Time strings are stored as "HH:MM" (24-hour) and displayed in 12-hour format via `formatTo12Hour`.
- Domain definitions live in `src/constants.js` (`BEHAVIORS`, `VALID_PERCHES`). These drive UI options and validation.
- Validation is centralized in `src/hooks/useFormValidation.js`. It exposes: `validateForm`, `validateSingleMetadataField`, `validateSingleObservationField`, `clearFieldError`, and `clearAllErrors`.
- UI components:
  - `src/components/MetadataSection.jsx` — controlled inputs for metadata (observerName, date, startTime, endTime).
  - `src/components/TimeSlotObservation.jsx` — per-slot container that coordinates form field components; handles conditional visibility based on behavior.
  - `src/components/form/` — extracted form field components (BehaviorSelect, LocationInput, ObjectSelect, AnimalSelect, InteractionTypeSelect, DescriptionField, NotesField).
  - `src/components/PerchDiagramModal.jsx` — modal with tabbed perch diagram images (NE/SW halves) for visual reference.
  - `src/components/OutputPreview.jsx` — JSON preview of submission.

### Data shapes and naming conventions (important)
- `metadata` object keys: `observerName`, `date` (YYYY-MM-DD), `startTime`, `endTime`, `aviary`, `patient`, `mode` ('live' or 'vod').
- `observations` is an object keyed by time strings with flat structure:
  ```
  {
    "15:05": {
      behavior: '',
      location: '',
      notes: '',
      object: '',           // For "interacting_object" behavior
      objectOther: '',      // When object === "other"
      animal: '',           // For "interacting_animal" behavior
      animalOther: '',      // When animal === "other"
      interactionType: '',  // For "interacting_animal" behavior
      interactionTypeOther: '', // When interactionType === "other"
      description: ''       // For behaviors requiring description
    }
  }
  ```
- Validation error keys:
  - Metadata: `observerName`, `date`, `startTime`, `endTime`.
  - Observations: `${time}_behavior`, `${time}_location`, `${time}_object`, `${time}_objectOther`, `${time}_animal`, `${time}_animalOther`, `${time}_interactionType`, `${time}_interactionTypeOther`, `${time}_description` (e.g. `"15:05_behavior"`).

### Project-specific behaviours to respect
- Time granularity: every 5 minutes. `generateTimeSlots(start, end)` generates slots from start inclusive to end exclusive. Rounding is done via `roundToNearestFiveMinutes` and inputs use `step="300"`.
- Maximum duration: 60 minutes (enforced in `validateTimeRange`). Do not change time validation semantics without updating UI hints and tests.
- Location validation accepts numbers (1-31), special codes (`BB1`, `BB2`, `F1`, `F2`, `G`, `W`) and the literal `GROUND` (case-insensitive); the authority for valid values is `VALID_PERCHES` in `src/constants.js`.
- `BEHAVIORS` items include conditional requirement flags — UI and validation rely on these:
  - `requiresLocation`: Shows/requires location field
  - `requiresObject`: Shows/requires object dropdown (for inanimate object interactions)
  - `requiresAnimal`: Shows/requires animal dropdown (for animal interactions)
  - `requiresInteraction`: Shows/requires interaction type dropdown (for animal interactions)
  - `requiresDescription`: Shows/requires description text field (for behaviors needing detail)

### How to make common changes (concrete examples)
- Add a new behavior:
  1. Update `src/constants.js` — add an entry to `BEHAVIORS` with `value`, `label`, and any conditional flags (`requiresLocation`, `requiresObject`, `requiresAnimal`, `requiresInteraction`, `requiresDescription`).
  2. No other files require changes for the option to appear, but if the new behavior needs special location codes, add them to `VALID_PERCHES`.
  3. Validation will pick it up automatically because `useFormValidation` consults `BEHAVIORS`.

- Add new perch labels for the select menu:
  1. Update `VALID_PERCHES` in `src/constants.js`.
  2. Optionally update the grouped `perchOptions` builder in `src/components/TimeSlotObservation.jsx` to control labels or grouping.

### Build / dev / deploy commands
- Install: `npm install`
- Dev server: `npm run dev` (Vite — default port 5173)
- Build: `npm run build` (output -> `dist/`)
- Preview production build: `npm run preview`
- The repository is set up for Vercel auto-deploys. CI/CD is not in-repo; check the Vercel dashboard for build env settings.

### Patterns and gotchas for edits
- **Validation timing**: Most dropdowns validate onChange for immediate feedback. Text fields (objectOther, animalOther, interactionTypeOther, description) use debounced validation (200ms) to avoid flickering while typing. Preserve these patterns when refactoring.
- **Enter key handling**: Text inputs validate on Enter but do NOT submit the form (prevents accidental mobile submissions).
- **Conditional field clearing**: When behavior changes, all conditional fields (object, animal, interactionType, description, etc.) are cleared to prevent orphaned data.
- Time strings are used as keys in state and in error keys — renaming the format will cascade across state, validation, and UI. Avoid changing this unless updating all usages.
- `generateTimeSlots` uses end-exclusive iteration. Tests or UI that assume end-inclusive will break.
- `useFormValidation` uppercases and trims location values when validating — downstream code that reads `observations` may need to handle case differences.

### Files to inspect first for any change
- `src/App.jsx` — state shape and how slots/observations are initialized
- `src/hooks/useFormValidation.js` — validation rules and error key conventions
- `src/utils/timeUtils.js` — time rounding, generation, and range validation
- `src/constants.js` — behaviors and valid location codes
- `src/components/TimeSlotObservation.jsx` — react-select usage and perchOptions grouping

### Testing
- The repo has 208 passing tests using Jest + React Testing Library across 9 test suites
- Test coverage includes:
  - E2E integration tests (`tests/integration/App.test.jsx`, `TimeSlotObservation.test.jsx`, `FormComponents.test.jsx`, `MetadataSection.test.jsx`)
  - Feature tests (`tests/copyToNextSlot.test.js`)
  - Utility tests (`timeUtils.js`, `timezoneUtils.js`, `localStorageUtils.js`)
  - Hook tests (`useFormValidation.js`)
- When adding new features, add corresponding tests in `__tests__` or `tests/integration/` directories
- Use helper functions for test setup (see existing integration tests for patterns)

If anything here is unclear or you'd like me to expand examples (for instance add a small test or a template PR message), tell me which section to expand.
