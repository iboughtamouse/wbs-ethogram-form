# Development Guide

> **Last Updated:** December 24, 2025

Technical documentation for developers working on the WBS Ethogram Form.

> **📖 For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md)**
>
> This document covers practical development workflows. For in-depth architectural decisions, component hierarchy, and design patterns, refer to the architecture documentation.

## ⚙️ Prerequisites

- **Node.js**: >= 18.0.0 (recommended: 24.11.1)
- **npm**: >= 9.0.0 (recommended: 11.6.2)

> **💡 Tip**: Use [nvm](https://github.com/nvm-sh/nvm) to manage Node versions. This project includes an `.nvmrc` file:
>
> ```bash
> nvm use
> ```

## 🏗️ Architecture Overview

This is a client-side single-page application (SPA) built with React and Vite, with a backend API for data persistence.

### Key Design Decisions

- **Backend integrated**: Submissions stored in PostgreSQL, Excel files emailed via Resend (November 2025)
- **Browser-only storage for drafts**: localStorage for autosave (no server persistence until submit)
- **Stream timestamps only**: All observers use video timestamp regardless of mode (December 2025)
- **Flat data structure**: Observation fields are not nested to simplify Excel export
- **Validation-first**: Centralized validation prevents bad data entry

## 🛠️ Tech Stack

- **React 18.2.0** - UI framework with hooks
- **Vite 5.0.8** - Build tool and dev server
- **React Select 5.8.0** - Autocomplete dropdown for locations
- **ExcelJS 4.4.0** - Excel file generation (dynamically imported)
- **Jest + React Testing Library** - Comprehensive test suite (all passing)
- **Native Browser APIs**:
  - `localStorage` - Autosave functionality
  - `navigator.clipboard` - Copy-to-clipboard

## 📁 Project Structure

```
ethogram-form/
├── src/
│   ├── components/
│   │   ├── form/                     # Form field components (8 files)
│   │   │   ├── BehaviorSelect.jsx
│   │   │   ├── LocationInput.jsx
│   │   │   ├── ObjectSelect.jsx
│   │   │   ├── AnimalSelect.jsx
│   │   │   ├── InteractionTypeSelect.jsx
│   │   │   ├── DescriptionField.jsx
│   │   │   ├── NotesField.jsx
│   │   │   └── index.js             # Barrel export
│   │   ├── MetadataSection.jsx       # Observer info, mode selector, time picker
│   │   ├── TimeSlotObservation.jsx   # Time slot container (imports form components)
│   │   ├── PerchDiagramModal.jsx     # Perch map viewer modal
│   │   └── OutputPreview.jsx         # JSON output display with copy button
│   ├── hooks/
│   │   ├── useFormValidation.js      # Centralized validation logic (302 lines)
│   │   └── __tests__/
│   │       └── useFormValidation.test.js
│   ├── utils/
│   │   ├── timeUtils.js              # Time rounding, generation, formatting
│   │   ├── timezoneUtils.js          # [Deprecated Dec 2025] WBS_TIMEZONE constant only
│   │   ├── localStorageUtils.js      # Autosave/draft management
│   │   ├── observationUtils.js       # Observation data utilities
│   │   ├── validators/               # Pure validator functions
│   │   │   ├── locationValidator.js  # Location validation logic (29 lines)
│   │   │   └── index.js              # Barrel export
│   │   └── __tests__/                # Utility test suites
│   ├── constants/                    # Domain-specific constant modules
│   │   ├── behaviors.js              # BEHAVIORS array + helper functions (136 lines)
│   │   ├── locations.js              # VALID_PERCHES, TIME_SLOTS (46 lines)
│   │   ├── interactions.js           # Objects, animals, interaction types (51 lines)
│   │   └── index.js                  # Barrel export (18 lines)
│   ├── App.jsx                       # Main orchestrator, state management (396 lines)
│   ├── App.css                       # Component-specific styles
│   ├── index.css                     # Global styles
│   └── main.jsx                      # React entry point
├── docs/
│   ├── interaction-subfields-design.md  # Design decisions for sub-fields
│   ├── refactoring-history.md           # Completed refactoring phases (historical)
│   └── testing-checklist.md             # Comprehensive QA checklist
├── .github/
│   └── copilot-instructions.md       # AI coding assistant guidance
├── tests/                            # Jest test suites (comprehensive coverage)
│   ├── integration/                  # E2E integration tests
│   └── copyToNextSlot.test.js
├── scripts/                      # Build and utility scripts
│   └── convert-images-to-webp.js # PNG to WebP conversion
├── index.html                        # HTML entry point
├── vite.config.js                    # Vite configuration (with chunk splitting & compression)
├── jest.config.js                    # Jest configuration
├── package.json                      # Dependencies and scripts
├── README.md                         # User-facing documentation
├── ARCHITECTURE.md                   # Detailed architecture documentation
├── CONTRIBUTING.md                   # Contribution guidelines
└── DEVELOPMENT.md                    # This file
```

## 🧩 Component Architecture

### State Management

All state lives in `App.jsx`:

```javascript
// Metadata state
const [metadata, setMetadata] = useState({
  observerName: '',
  date: today,
  startTime: '',
  endTime: '',
  aviary: "Sayyida's Cove",
  patient: 'Sayyida',
});

// Observations state (object keyed by time strings)
const [observations, setObservations] = useState({});
// Example: { "15:05": { behavior: '', location: '', notes: '', ... }, ... }

// Validation errors
const [fieldErrors, setFieldErrors] = useState({});
```

### Data Flow

1. **App.jsx** generates time slots based on start/end time
2. **App.jsx** initializes empty observation objects for each slot
3. **MetadataSection** and **TimeSlotObservation** are controlled components
4. **onChange handlers** update App state
5. **onValidate handlers** trigger validation in `useFormValidation` hook
6. **Validation errors** flow back down as props
7. **OutputPreview** reads final state and formats JSON

### Component Responsibilities

| Component                         | Responsibility                                                                    |
| --------------------------------- | --------------------------------------------------------------------------------- |
| `App.jsx`                         | State orchestration, time slot generation, form submission                        |
| `MetadataSection.jsx`             | Observer info inputs, mode selector, time range picker                            |
| `TimeSlotObservation.jsx`         | Time slot container, coordinates form field components and conditional visibility |
| `form/BehaviorSelect.jsx`         | Behavior dropdown field                                                           |
| `form/LocationInput.jsx`          | Location select with perch diagram map button + modal state                       |
| `form/ObjectSelect.jsx`           | Object dropdown with conditional "other" text field                               |
| `form/AnimalSelect.jsx`           | Animal dropdown with conditional "other" text field                               |
| `form/InteractionTypeSelect.jsx`  | Interaction type dropdown with conditional "other" text field                     |
| `form/DescriptionField.jsx`       | Description text input field                                                      |
| `form/NotesField.jsx`             | Notes textarea field                                                              |
| `PerchDiagramModal.jsx`           | Perch map viewer with NE/SW tabs                                                  |
| `OutputPreview.jsx`               | JSON display for debugging/verification                                           |
| `useFormValidation.js`            | Validation logic for all fields, uses helper functions                            |
| `constants/behaviors.js`          | BEHAVIORS array + helper functions (requiresLocation, etc.)                       |
| `constants/locations.js`          | VALID_PERCHES, TIME_SLOTS constants                                               |
| `constants/interactions.js`       | Objects, animals, interaction types constants                                     |
| `validators/locationValidator.js` | Pure location validation function                                                 |
| `timeUtils.js`                    | Time manipulation, rounding, slot generation                                      |
| `timezoneUtils.js`                | [Deprecated] WBS_TIMEZONE constant only (conversion removed Dec 2025)             |
| `localStorageUtils.js`            | Save/load/clear draft data                                                        |

## 🔄 Key Workflows

### Time Slot Generation

```javascript
// From timeUtils.js
generateTimeSlots(startTime, endTime);
// Returns: ["15:00", "15:05", "15:10", ...]
// - Rounds start to nearest 5 minutes
// - Generates slots in 5-minute increments
// - End is exclusive (15:00-15:30 generates 15:00, 15:05, 15:10, 15:15, 15:20, 15:25)
```

### Stream Timestamps (All Modes)

```javascript
// As of December 2025: No timezone conversion
// All observers use video timestamp (top-left corner) regardless of mode

// Times stored as 24-hour strings ("15:00")
// User enters stream time: "14:05"
// Stored as-is: "14:05" (WBS time)
// No conversion on output

// timezoneUtils.js kept only for WBS_TIMEZONE constant reference
const WBS_TIMEZONE = 'America/Chicago'; // For documentation purposes
```

### Validation Flow

```javascript
// User tabs away from field (onBlur)
→ Component calls onValidate(time, field, currentValue)
→ App.jsx calls validateSingleObservationField(time, field, observations, currentValue)
→ useFormValidation extracts observation, checks requirements using helper functions
→ Returns error string or null
→ setFieldErrors updates error state
→ Error flows back down as prop
→ Component displays error message
```

**Behavior Helper Functions** (from `constants/behaviors.js`):

```javascript
// Helper functions for checking behavior requirements
requiresLocation(behaviorValue); // → boolean
requiresObject(behaviorValue); // → boolean
requiresAnimal(behaviorValue); // → boolean
requiresObjectInteraction(behaviorValue); // → boolean
requiresAnimalInteraction(behaviorValue); // → boolean
requiresDescription(behaviorValue); // → boolean
getBehaviorByValue(value); // → behavior object or undefined

// Example usage in validation:
if (requiresLocation(behavior) && !location) {
  return 'Location is required for this behavior';
}
```

**Pure Validator Functions** (from `utils/validators/`):

```javascript
// Pure function for location validation
validateLocation(value); // → { valid: boolean, error: string | null }

// Example:
const { valid, error } = validateLocation('12');
if (!valid) {
  return error; // "Location must be a valid perch number (1-31)..."
}

// Note: "Ground" is a special case validated separately (not in VALID_PERCHES constant)
// It's added dynamically in TimeSlotObservation.jsx's perchOptions
```

### Autosave Flow

```javascript
// Every 5 seconds (useEffect in App.jsx)
→ Check if form has data
→ Call saveDraft(metadata, observations)
→ localStorage.setItem('ethogram-draft', JSON.stringify(draft))

// On mount
→ Call loadDraft()
→ Parse localStorage data
→ Set state if valid draft found
→ Show recovery notification
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Organization

```
tests/
├── timeUtils.test.js         # Time manipulation
├── validation.test.js        # Form validation
└── localStorageUtils.test.js # Autosave logic
```

### Testing Patterns

```javascript
// Time utilities - pure functions, easy to test
test('rounds 15:03 down to 15:00', () => {
  expect(roundToNearestFiveMinutes('15:03')).toBe('15:00');
});

// Validation - test all branches
test('requires location when behavior requires it', () => {
  const error = validateObservationField(...);
  expect(error).toBe('Location is required for this behavior');
});

// localStorage - mock browser APIs
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});
```

## 📊 Data Structure

The observation/domain model is **not** restated here — it drifts. Read the canonical sources:

- **Per-slot observation shape:** `createEmptyObservation()` in `src/services/formStateManager.js` (includes the split `objectInteractionType` / `animalInteractionType` (+ `*Other`) fields).
- **Behaviors + `requires*` flags:** `src/constants/behaviors.js`.
- **Objects, animal types, and object/animal interaction types:** `src/constants/interactions.js` (`INANIMATE_OBJECTS`, `ANIMAL_TYPES`, `OBJECT_INTERACTION_TYPES`, `ANIMAL_INTERACTION_TYPES`).
- **Valid locations/perches:** `src/constants/locations.js`.
- **Backend wire contract:** the Zod `observationSchema` in `ethogram-api/src/routes/observations.ts`.

Conditional fields are driven by helper functions (`requiresLocation`, `requiresObject`, `requiresAnimal`, `requiresObjectInteraction`, `requiresAnimalInteraction`, `requiresDescription`) exported from `constants/behaviors.js` — use those, never a hardcoded behavior lookup.

## 🔧 Configuration

### Vite Configuration

The Vite configuration (`vite.config.js`) includes sophisticated optimizations for production builds:

**Key Features**:

- **Compression plugins**: Gzip + Brotli pre-compression
- **Manual chunk splitting**: Separate vendor chunks for optimal caching
  - `vendor-react`: React + ReactDOM (195 KB)
  - `vendor-react-select`: React Select (57 KB, isolated)
  - `vendor-exceljs`: ExcelJS (930 KB, lazy-loaded)
  - `vendor`: Other dependencies (30 KB)
- **Modern browser targets**: ES2020+ (Chrome 87+, Firefox 78+, Safari 14+)
- **esbuild minification**: Removes console.log, debugger; faster than terser
- **Hidden source maps**: For production debugging without exposing to users
- **Asset organization**: Organized folder structure for images, CSS, JS

**ExcelJS Dynamic Import**:

- Not included in initial bundle
- Prefetched when OutputPreview mounts (after form completion)
- Provides instant download experience without bloating initial load
- See `src/components/OutputPreview.jsx` for implementation

**Bundle Size**: 84 KB gzipped initial load (76.5% reduction from 358 KB)

For full configuration details and comments, see `vite.config.js`

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};
```

## 🚀 Build & Deployment

### Local Development

```bash
npm run dev
# Runs on http://localhost:5173
# Hot module replacement enabled
# Source maps enabled
```

### Production Build

```bash
npm run build
# Creates optimized bundle in dist/
# - Minifies JS/CSS with esbuild (removes console.log)
# - Tree-shakes unused code
# - Generates hidden source maps
# - Manual chunk splitting for optimal caching
# - Gzip + Brotli pre-compression
# - Outputs: 84 KB gzipped initial bundle
```

### Image Conversion (Development Only)

If you need to add or update perch diagram images:

```bash
node scripts/convert-images-to-webp.js
# Converts PNG images in public/images/ to WebP format
# Requires: sharp package (already in devDependencies)
# Output: Optimized .webp files with ~86% size reduction
```

### Preview Production Build

```bash
npm run preview
# Serves production build locally
# Test before deploying
```

### Deployment (Vercel)

This project auto-deploys to Vercel:

1. Push to `main` branch
2. Vercel detects changes
3. Runs `npm run build`
4. Deploys to https://wbs-ethogram-form.vercel.app/

**Vercel Configuration** (auto-detected):

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`
- Framework: Vite

## 🐛 Debugging

### Common Issues

**Time slots not generating:**

- Check that start < end
- Check that times are in 24-hour format ("HH:MM")
- Verify time range is ≤ 60 minutes

**Validation errors not clearing:**

- Check that onChange is calling with `shouldValidate: false`
- Verify onBlur is passing current value directly

**localStorage not working:**

- Check browser privacy settings
- Verify localStorage is not disabled
- Check for quota exceeded errors

### Debug Tools

```javascript
// In App.jsx, add:
useEffect(() => {
  console.log('Metadata:', metadata);
  console.log('Observations:', observations);
  console.log('Errors:', fieldErrors);
}, [metadata, observations, fieldErrors]);
```

## 🎨 Styling

- Global styles in `index.css`
- Component styles in `App.css`
- No CSS framework (keeps bundle small)
- Mobile-first responsive design
- CSS Grid for layouts

### Key CSS Classes

- `.section` - Major form sections
- `.metadata-grid` - 2-column metadata layout
- `.form-group` - Individual form fields
- `.field-error` - Validation error messages
- `.error` - Input error state (red border)
- `.mode-selector` - Radio button card layout

## 📝 Adding New Features

### Adding a New Behavior

1. Update `src/constants/behaviors.js`:

   ```javascript
   // Add to BEHAVIORS array
   export const BEHAVIORS = [
     // ... existing behaviors
     {
       value: 'new_behavior',
       label: 'New Behavior',
       requiresLocation: true,
       // Add only the flags a behavior needs (omitted = false): requiresObject +
       // requiresObjectInteraction, requiresAnimal + requiresAnimalInteraction, requiresDescription
     },
   ];
   ```

2. No other changes needed! Helper functions and validation automatically adapt.

3. If the behavior needs special location codes, add them to `src/constants/locations.js`:
   ```javascript
   export const VALID_PERCHES = [
     // ... existing perches
     'NEW_CODE', // Add your new special location code
   ];
   ```

### Adding a New Observation Field

1. Update observation initialization in `App.jsx`
2. Add field to `TimeSlotObservation.jsx` component
3. Add validation in `useFormValidation.js`
4. Update data structure documentation
5. Add tests for validation logic

## 🔐 Security Considerations

- **No sensitive data**: All data is local to user's browser
- **No authentication**: Anyone can use the form
- **No server**: No attack surface beyond client-side XSS
- **Input validation**: Prevents bad data, not malicious input
- **localStorage**: User can view/modify their own data

## 📅 Recent Changes

### November 2025: Comprehensive Refactoring

**Phase 0 - Documentation:**

- Created `ARCHITECTURE.md` (649 lines) with detailed component hierarchy and data flow diagrams
- Updated `copilot-instructions.md` with current patterns
- Fixed README accuracy for perch diagram feature
- Created comprehensive `testing-checklist.md`
- Added `refactoring-history.md` documenting phased approach (now complete)

**Phase 1 - PropTypes & Type Safety:**

- Added PropTypes to all 4 main components for runtime type validation
- Improved PropTypes specificity (objectOf, shape) per code review feedback
- All tests passing

**Phase 2 - Component Extraction:**

- Extracted 7 form field components from TimeSlotObservation into `src/components/form/`
- Reduced TimeSlotObservation from 417 to 257 lines (~38% reduction)
- Components: BehaviorSelect, LocationInput, ObjectSelect, AnimalSelect, InteractionTypeSelect, DescriptionField, NotesField
- Added barrel export (`form/index.js`) for clean imports
- LocationInput now owns modal state (moved from TimeSlotObservation)
- All components include PropTypes for type safety
- Consistent patterns across similar field types

**Interaction Subfields Feature (Earlier):**

- Added structured interaction subfields:
  - Object dropdown for "Interacting with Inanimate Object" behavior
  - Animal + Interaction Type dropdowns for "Interacting with Other Animal" behavior
  - "Other" text inputs for all dropdown options
  - Description field for behaviors requiring detail
- Added PerchDiagramModal component with NE/SW tab navigation
- Debounced validation for text inputs (200ms delay to prevent flickering)
- Enter key now validates field without submitting form (mobile UX improvement)

**Architecture:**

- Flat observation structure with conditional fields (see `docs/interaction-subfields-design.md`)
- BEHAVIORS includes feature flags: `requiresObject`, `requiresObjectInteraction`, `requiresAnimal`, `requiresAnimalInteraction`, `requiresDescription`
- Constants: `INANIMATE_OBJECTS`, `ANIMAL_TYPES`, `OBJECT_INTERACTION_TYPES`, `ANIMAL_INTERACTION_TYPES`
- Validation timing: onChange for dropdowns, debounced for text inputs
- Conditional field clearing when behavior changes (prevents orphaned data)
- Component composition pattern with form field components

**Testing:**

- Comprehensive test coverage
- All tests passing
- Integration tests cover extracted components

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Getting Help

- Check the [README](README.md) for user-facing info
- Check [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines
- Open a GitHub Discussion for questions
- Review existing issues and PRs for similar problems
- Check `.github/copilot-instructions.md` for AI assistant context
