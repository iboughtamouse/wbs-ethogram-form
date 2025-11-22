## Quick orientation for AI coding agents

This is a small Vite + React single-page app for entering ethogram observations in 5-minute intervals.
Keep edits local and minimal: prefer changing the single source of truth files listed below rather than duplicating logic across components.

### Big picture

- Single-page form: `src/App.jsx` orchestrates metadata and rendering; uses custom hooks for state management and business logic.
- State management (Phase 3 refactoring):
  - `src/hooks/useFormState.js` — manages metadata, observations, and time slots; delegates operations to service modules.
  - `src/hooks/useAutoSave.js` — handles draft persistence and recovery via localStorage.
  - `src/hooks/useFormValidation.js` — centralized validation; exposes `validateForm`, `validateSingleMetadataField`, `validateSingleObservationField`, `validateObservationSlot` (for copy-to-next), `clearFieldError`, and `clearAllErrors`. Uses shared `validateObservation` helper internally.
- Business logic services (Phase 3 refactoring):
  - `src/services/formStateManager.js` — pure functions for observation state operations (update, copy, clear).
  - `src/services/formSubmission.js` — prepares output data for JSON/Excel export.
  - `src/services/draftManager.js` — autosave decision logic.
  - `src/services/export/excelGenerator.js` — Excel workbook generation (Phase 6).
- Time logic lives in `src/utils/timeUtils.js` (rounding, slot generation, validation). Time strings are stored as "HH:MM" (24-hour) and displayed in 12-hour format via `formatTo12Hour`.
- Domain definitions live in modular `src/constants/` directory (Phase 4/5 refactoring):
  - `behaviors.js` — `BEHAVIORS` array + helper functions (`requiresLocation()`, `requiresObject()`, etc.)
  - `locations.js` — `VALID_PERCHES`, `TIME_SLOTS`
  - `interactions.js` — `INANIMATE_OBJECTS`, `ANIMAL_TYPES`, `INTERACTION_TYPES`
  - `index.js` — barrel export for clean imports
- Pure validators in `src/utils/validators/` — e.g., `locationValidator.js` exports `validateLocation()` function.
- UI components:
  - `src/components/MetadataSection.jsx` — controlled inputs for metadata (observerName, date, startTime, endTime).
  - `src/components/TimeSlotObservation.jsx` — per-slot container that coordinates form field components; handles conditional visibility based on behavior.
  - `src/components/form/` — extracted form field components (BehaviorSelect, LocationInput, ObjectSelect, AnimalSelect, InteractionTypeSelect, DescriptionField, NotesField).
  - `src/components/PerchDiagramModal.jsx` — modal with tabbed perch diagram images (NE/SW halves) for visual reference.
  - `src/components/OutputPreview.jsx` — Excel download button and JSON preview of submission.

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
- Location validation accepts numbers (1-31), special codes (`BB1`, `BB2`, `F1`, `F2`, `G`, `W`) and the literal `GROUND` (case-insensitive); the authority for valid values is `VALID_PERCHES` in `src/constants/locations.js`.
- `BEHAVIORS` items (in `src/constants/behaviors.js`) include conditional requirement flags — UI and validation rely on these:
  - `requiresLocation`: Shows/requires location field
  - `requiresObject`: Shows/requires object dropdown (for inanimate object interactions)
  - `requiresAnimal`: Shows/requires animal dropdown (for animal interactions)
  - `requiresInteraction`: Shows/requires interaction type dropdown (for animal interactions)
  - `requiresDescription`: Shows/requires description text field (for behaviors needing detail)
- Helper functions (from `src/constants/behaviors.js`) check requirements without direct BEHAVIORS lookups:
  - `requiresLocation(behaviorValue)` — returns boolean
  - `requiresObject(behaviorValue)` — returns boolean
  - `requiresAnimal(behaviorValue)` — returns boolean
  - `requiresInteraction(behaviorValue)` — returns boolean
  - `requiresDescription(behaviorValue)` — returns boolean
  - `getBehaviorByValue(value)` — returns behavior object or undefined

### How to make common changes (concrete examples)

- Add a new behavior:
  1. Update `src/constants/behaviors.js` — add an entry to `BEHAVIORS` array with `value`, `label`, and any conditional flags (`requiresLocation`, `requiresObject`, `requiresAnimal`, `requiresInteraction`, `requiresDescription`).
  2. No other files require changes for the option to appear. Helper functions will automatically work with the new behavior.
  3. If the new behavior needs special location codes, add them to `VALID_PERCHES` in `src/constants/locations.js`.
  4. Validation will pick it up automatically because `useFormValidation` uses helper functions that consult `BEHAVIORS`.

- Add new perch labels for the select menu:
  1. Update `VALID_PERCHES` in `src/constants/locations.js`.
  2. Optionally update the grouped `perchOptions` builder in `src/components/TimeSlotObservation.jsx` to control labels or grouping.

- Add new object/animal/interaction types:
  1. Update the appropriate array in `src/constants/interactions.js` (`INANIMATE_OBJECTS`, `ANIMAL_TYPES`, or `INTERACTION_TYPES`).
  2. UI dropdowns will automatically include the new options.

### Copy-to-Next Validation (Important!)

The "Copy to next" button validates the source observation before copying:

- **Implementation**: `src/App.jsx` has `onCopyToNext` wrapper that calls `validateObservationSlot`
- **Behavior**: If validation fails, errors are shown and copy is prevented. If valid, data is copied.
- **What's validated**: All conditionally required fields (behavior, location, object, animal, interactionType, description, and their "other" text fields)
- **Test coverage**: Unit tests in `src/hooks/__tests__/useFormValidation.test.js` + integration tests in `tests/integration/CopyToNextWithValidation.test.jsx`

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

- `src/App.jsx` — orchestration and rendering; uses hooks for state/effects
- `src/hooks/useFormState.js` — state shape and how slots/observations are initialized
- `src/hooks/useAutoSave.js` — draft persistence and recovery logic
- `src/hooks/useFormValidation.js` — validation rules and error key conventions
- `src/services/formStateManager.js` — observation state operations
- `src/services/formSubmission.js` — output data preparation
- `src/services/export/excelGenerator.js` — Excel workbook generation
- `src/utils/timeUtils.js` — time rounding, generation, and range validation
- `src/constants/behaviors.js` — BEHAVIORS array and helper functions
- `src/constants/locations.js` — valid location codes and time slots
- `src/constants/interactions.js` — object, animal, and interaction type options
- `src/utils/validators/locationValidator.js` — pure location validation logic
- `src/components/TimeSlotObservation.jsx` — react-select usage and perchOptions grouping

### Testing

- The repo has 367 passing tests using Jest + React Testing Library across 19 test suites
- Test coverage includes:
  - E2E integration tests (`tests/integration/App.test.jsx`, `TimeSlotObservation.test.jsx`, `FormComponents.test.jsx`, `MetadataSection.test.jsx`)
  - Feature tests (`tests/copyToNextSlot.test.js`)
  - Utility tests (`timeUtils.js`, `timezoneUtils.js`, `localStorageUtils.js`)
  - Hook tests (`useFormValidation.js`, `useFormState.js`, `useAutoSave.js`)
  - Service tests (`formStateManager.js`, `formSubmission.js`, `draftManager.js`, `excelGenerator.js`)
- When adding new features, add corresponding tests in `__tests__` or `tests/integration/` directories
- Use helper functions for test setup (see existing integration tests for patterns)

If anything here is unclear or you'd like me to expand examples (for instance add a small test or a template PR message), tell me which section to expand.
