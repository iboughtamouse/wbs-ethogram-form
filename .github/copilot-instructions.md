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
  - `src/components/TimeSlotObservation.jsx` — per-slot behavior/location/notes; uses `react-select` for location.
  - `src/components/OutputPreview.jsx` — JSON preview of submission.

### Data shapes and naming conventions (important)
- `metadata` object keys: `observerName`, `date` (YYYY-MM-DD), `startTime`, `endTime`, `aviary`, `patient`.
- `observations` is an object keyed by time strings: `{ "15:05": { behavior: '', location: '', notes: '' }, ... }`.
- Validation error keys:
  - Metadata: `observerName`, `date`, `startTime`, `endTime`.
  - Observations: `${time}_behavior` and `${time}_location` (e.g. `"15:05_behavior"`).

### Project-specific behaviours to respect
- Time granularity: every 5 minutes. `generateTimeSlots(start, end)` generates slots from start inclusive to end exclusive. Rounding is done via `roundToNearestFiveMinutes` and inputs use `step="300"`.
- Maximum duration: 60 minutes (enforced in `validateTimeRange`). Do not change time validation semantics without updating UI hints and tests.
- Location validation accepts numbers (1-31), special codes (`BB1`, `F1`, `G`, `W`) and the literal `GROUND` (case-insensitive); the authority for valid values is `VALID_PERCHES` in `src/constants.js`.
- `BEHAVIORS` items include a `requiresLocation` boolean — UI and validation rely on this flag to show/require the location field.

### How to make common changes (concrete examples)
- Add a new behavior:
  1. Update `src/constants.js` — add an entry to `BEHAVIORS` with `value`, `label`, and `requiresLocation`.
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
- Controlled components + onBlur validation: most inputs call `onChange(..., shouldValidate)` or call `validateSingle*` on blur. Preserve this pattern when refactoring.
- Time strings are used as keys in state and in error keys — renaming the format will cascade across state, validation, and UI. Avoid changing this unless updating all usages.
- `generateTimeSlots` uses end-exclusive iteration. Tests or UI that assume end-inclusive will break.
- `useFormValidation` uppercases and trims location values when validating — downstream code that reads `observations` may need to handle case differences.

### Files to inspect first for any change
- `src/App.jsx` — state shape and how slots/observations are initialized
- `src/hooks/useFormValidation.js` — validation rules and error key conventions
- `src/utils/timeUtils.js` — time rounding, generation, and range validation
- `src/constants.js` — behaviors and valid location codes
- `src/components/TimeSlotObservation.jsx` — react-select usage and perchOptions grouping

### Missing / not present
- There are no unit tests in the repo. If you add tests, prefer Jest + React Testing Library and test:
  - `generateTimeSlots` and `validateTimeRange` edge cases
  - `useFormValidation` behavior for location/behavior combos

If anything here is unclear or you'd like me to expand examples (for instance add a small test or a template PR message), tell me which section to expand.
