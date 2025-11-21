# Development Guide

Technical documentation for developers working on the WBS Ethogram Form.

> **📖 For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md)**
>
> This document covers practical development workflows. For in-depth architectural decisions, component hierarchy, and design patterns, refer to the architecture documentation.

## 🏗️ Architecture Overview

This is a client-side single-page application (SPA) built with React and Vite. There is no backend - all data processing happens in the browser, and output is provided as JSON for manual submission.

### Key Design Decisions

- **No backend**: Reduces complexity, hosting costs, and maintenance burden
- **Browser-only storage**: localStorage for autosave (no server persistence)
- **Timezone handling**: Converts local times to WBS timezone (America/Chicago) for live streams
- **Flat data structure**: Observation fields are not nested to simplify Excel export
- **Validation-first**: Centralized validation prevents bad data entry

## 🛠️ Tech Stack

- **React 18.2.0** - UI framework with hooks
- **Vite 5.0.8** - Build tool and dev server
- **React Select 5.8.0** - Autocomplete dropdown for locations
- **Jest + React Testing Library** - Testing (208 tests, 9 test suites)
- **Native Browser APIs**:
  - `Intl.DateTimeFormat` - Timezone conversion
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
│   │   └── useFormValidation.js      # Centralized validation logic
│   ├── utils/
│   │   ├── timeUtils.js              # Time rounding, generation, formatting
│   │   ├── timezoneUtils.js          # Timezone conversion utilities
│   │   └── localStorageUtils.js      # Autosave/draft management
│   ├── constants.js                  # Behaviors, perches, objects, animals
│   ├── App.jsx                       # Main orchestrator, state management
│   ├── App.css                       # Component-specific styles
│   ├── index.css                     # Global styles
│   └── main.jsx                      # React entry point
├── docs/
│   ├── interaction-subfields-design.md  # Design decisions for sub-fields
│   ├── refactoring-strategy.md          # Refactoring plan and phases
│   └── testing-checklist.md             # Comprehensive QA checklist
├── .github/
│   └── copilot-instructions.md       # AI coding assistant guidance
├── tests/                            # Jest test suites
├── index.html                        # HTML entry point
├── vite.config.js                    # Vite configuration
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
  mode: 'live'  // 'live' or 'vod'
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

| Component | Responsibility |
|-----------|---------------|
| `App.jsx` | State orchestration, time slot generation, form submission |
| `MetadataSection.jsx` | Observer info inputs, mode selector, time range picker |
| `TimeSlotObservation.jsx` | Time slot container, coordinates form field components and conditional visibility |
| `form/BehaviorSelect.jsx` | Behavior dropdown field |
| `form/LocationInput.jsx` | Location select with perch diagram map button + modal state |
| `form/ObjectSelect.jsx` | Object dropdown with conditional "other" text field |
| `form/AnimalSelect.jsx` | Animal dropdown with conditional "other" text field |
| `form/InteractionTypeSelect.jsx` | Interaction type dropdown with conditional "other" text field |
| `form/DescriptionField.jsx` | Description text input field |
| `form/NotesField.jsx` | Notes textarea field |
| `PerchDiagramModal.jsx` | Perch map viewer with NE/SW tabs |
| `OutputPreview.jsx` | JSON display, copy-to-clipboard, timezone conversion |
| `useFormValidation.js` | Validation logic for all fields |
| `timeUtils.js` | Time manipulation, rounding, slot generation |
| `timezoneUtils.js` | Convert times between timezones |
| `localStorageUtils.js` | Save/load/clear draft data |

## 🔄 Key Workflows

### Time Slot Generation

```javascript
// From timeUtils.js
generateTimeSlots(startTime, endTime) 
// Returns: ["15:00", "15:05", "15:10", ...]
// - Rounds start to nearest 5 minutes
// - Generates slots in 5-minute increments
// - End is exclusive (15:00-15:30 generates 15:00, 15:05, 15:10, 15:15, 15:20, 15:25)
```

### Timezone Conversion (Live Mode)

```javascript
// From timezoneUtils.js
const WBS_TIMEZONE = 'America/Chicago';

// When mode='live':
// 1. User enters local time (e.g., 3:00 PM PST)
// 2. Times stored as 24-hour strings ("15:00")
// 3. On output, convert observation keys to WBS timezone
// 4. Metadata times remain in local time (for reference)

convertTimeToTimezone(dateStr, timeStr, fromTz, toTz)
// Returns: time string in target timezone
```

### Validation Flow

```javascript
// User tabs away from field (onBlur)
→ Component calls onValidate(time, field, currentValue)
→ App.jsx calls validateSingleObservationField(time, field, observations, currentValue)
→ useFormValidation extracts observation, checks requirements
→ Returns error string or null
→ setFieldErrors updates error state
→ Error flows back down as prop
→ Component displays error message
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
├── timeUtils.test.js         # 49 tests - time manipulation
├── validation.test.js        # 19 tests - form validation
└── localStorageUtils.test.js # 17 tests - autosave logic
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

### Observation Object Schema

Each time slot has this structure:

```javascript
{
  behavior: 'string',              // Required - from BEHAVIORS constant
  location: 'string',              // Required if behavior.requiresLocation
  notes: 'string',                 // Optional
  object: 'string',                // Required if behavior.requiresObject
  objectOther: 'string',           // Required if object === 'other'
  animal: 'string',                // Required if behavior.requiresAnimal
  animalOther: 'string',           // Required if animal === 'other'
  interactionType: 'string',       // Required if behavior.requiresInteraction
  interactionTypeOther: 'string'   // Required if interactionType === 'other'
}
```

### Constants Structure

```javascript
// From constants.js
BEHAVIORS = [
  {
    value: 'perching',
    label: 'Perching',
    requiresLocation: true,
    requiresObject: false,
    requiresAnimal: false,
    requiresInteraction: false
  },
  // ...
]

VALID_PERCHES = ['1', '2', ..., '31', 'BB1', 'F1', 'G', 'W', 'GROUND']

INANIMATE_OBJECTS = [
  { value: 'newspaper', label: 'Newspaper' },
  // ...
]

ANIMAL_TYPES = [
  { value: 'aviary_adult', label: 'Adult aviary occupant' },
  // ...
]

INTERACTION_TYPES = [
  { value: 'watching', label: 'Watching' },
  // ...
]
```

## 🔧 Configuration

### Vite Configuration

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  base: '/',  // Adjust if deploying to subdirectory
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy'
  }
}
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
# Minifies JS/CSS
# Tree-shakes unused code
# Generates source maps
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

**Timezone conversion issues:**
- Check browser timezone (affects `new Date()`)
- Verify mode is set correctly ('live' vs 'vod')
- Check WBS_TIMEZONE constant

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

1. Update `src/constants.js`:
   ```javascript
   BEHAVIORS.push({
     value: 'new_behavior',
     label: 'New Behavior',
     requiresLocation: true,
     requiresObject: false,
     requiresAnimal: false,
     requiresInteraction: false
   });
   ```

2. No other changes needed! Validation and UI automatically adapt.

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
- Added `refactoring-strategy.md` documenting phased approach

**Phase 1 - PropTypes & Type Safety:**
- Added PropTypes to all 4 main components for runtime type validation
- Fixed timezone test to handle UTC format in CI/Docker environments
- Improved PropTypes specificity (objectOf, shape) per code review feedback
- All 101 tests passing

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
- BEHAVIORS includes feature flags: `requiresObject`, `requiresAnimal`, `requiresInteraction`, `requiresDescription`
- Constants expanded: `INANIMATE_OBJECTS`, `ANIMAL_TYPES`, `INTERACTION_TYPES`
- Validation timing: onChange for dropdowns, debounced for text inputs
- Conditional field clearing when behavior changes (prevents orphaned data)
- Component composition pattern with form field components

**Testing:**
- Test count: 101+ tests across 5 test suites
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
