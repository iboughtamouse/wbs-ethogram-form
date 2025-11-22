# CLAUDE.md - AI Assistant Guide

> **Purpose**: This document provides AI coding assistants (like Claude) with essential context about the WBS Ethogram Form codebase, its architecture, conventions, and development workflows.
>
> **Last Updated**: November 22, 2025
> **Codebase Version**: Post-Phase 6 + Loading Indicators
> **Status**: Production-ready, actively maintained

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start for AI Assistants](#quick-start-for-ai-assistants)
3. [Architecture at a Glance](#architecture-at-a-glance)
4. [Codebase Organization](#codebase-organization)
5. [Key Patterns & Conventions](#key-patterns--conventions)
6. [Development Workflows](#development-workflows)
7. [Testing Strategy](#testing-strategy)
8. [Common Tasks](#common-tasks)
9. [Things to Avoid](#things-to-avoid)
10. [Where to Find Information](#where-to-find-information)

---

## Project Overview

### What This Is

The **WBS Ethogram Form** is a client-side single-page React application for recording behavioral observations of Sayyida, a barred owl at the World Bird Sanctuary. Citizen scientists use this form during live Twitch streams or when reviewing recorded videos (VODs) to log bird behaviors in 5-minute intervals.

### Key Characteristics

- **Client-side only**: No backend, all processing happens in the browser
- **Data output**: JSON and Excel file downloads (manual submission to WBS)
- **Autosave**: Browser localStorage prevents data loss
- **Mobile-first**: Responsive design for desktop and mobile observers
- **Well-tested**: Comprehensive test suite with all tests passing
- **Clean architecture**: Result of 6 refactoring phases (Phase 0-6 complete)
- **Accessibility-first**: WCAG-compliant loading indicators with screen reader support

### Tech Stack

| Category              | Technology              | Version        | Purpose                        |
| --------------------- | ----------------------- | -------------- | ------------------------------ |
| **Framework**         | React                   | 18.2.0         | UI rendering                   |
| **Build Tool**        | Vite                    | 5.0.8          | Dev server & bundler           |
| **Testing**           | Jest + RTL              | 30.x + 16.x    | Unit & integration tests       |
| **Validation**        | Custom hook             | N/A            | Form validation logic          |
| **Styling**           | Plain CSS               | N/A            | Minimal styling                |
| **Dropdowns**         | react-select            | 5.8.0          | Location autocomplete          |
| **Excel Export**      | exceljs                 | 4.4.0          | Client-side .xlsx generation   |
| **Linting**           | ESLint + Prettier       | 8.57.0 + 3.2.5 | Code quality                   |
| **Git Hooks**         | Husky + lint-staged     | 9.x + 15.x     | Pre-commit checks              |
| **Build Compression** | vite-plugin-compression | 0.5.1 (dev)    | Gzip/Brotli compression        |
| **Minification**      | esbuild                 | (built-in)     | Fast, reliable JS minification |
| **Image Processing**  | sharp                   | 0.34.5 (dev)   | WebP conversion for images     |

---

## Quick Start for AI Assistants

### First-Time Orientation (5 minutes)

If you're working on this codebase for the first time:

1. **Read this document** (you are here)
2. **Scan [ARCHITECTURE.md](ARCHITECTURE.md)** - Understand component hierarchy and data flow
3. **Review [.github/copilot-instructions.md](.github/copilot-instructions.md)** - Quick reference for common patterns
4. **Check [docs/refactoring-history.md](docs/refactoring-history.md)** - Understand the evolution (all phases complete)

### Mental Model (30 seconds)

```
User fills form → Data stored in React state → Validates on change →
Autosaves to localStorage → On submit: generates Excel + JSON →
User downloads file and submits to WBS manually
```

### Development Commands

```bash
# Install dependencies
npm install

# Start dev server (localhost:5173)
npm run dev

# Run all tests (all should pass)
npm test

# Run tests in watch mode
npm run test:watch

# Check code quality
npm run lint
npm run format:check

# Build for production
npm run build
npm run preview
```

### Making Your First Change

1. **Always read files before editing** - Never propose changes to code you haven't read
2. **Run tests first** - Ensure baseline: `npm test`
3. **Create a branch** - Use conventional prefixes: `feat/`, `fix/`, `docs/`, `test/`, `refactor/`, `chore/`
4. **Make focused changes** - One logical change per commit
5. **Test immediately** - Run tests after each change
6. **Update docs** - If behavior changes, update relevant .md files
7. **Commit with conventional commits** - Format: `type: description` (e.g., `feat: add new behavior option`)

---

## Architecture at a Glance

### Component Hierarchy

```
App.jsx
├── Uses hooks:
│   ├── useFormState (state + operations)
│   ├── useAutoSave (draft management)
│   └── useFormValidation (validation rules)
│
├── MetadataSection
│   └── Observer info, date, mode selector, time range
│
├── TimeSlotObservation [×N instances per time slot]
│   ├── Imports from components/form/:
│   ├── BehaviorSelect
│   ├── LocationInput + PerchDiagramModal
│   ├── ObjectSelect [conditional]
│   ├── AnimalSelect [conditional]
│   ├── InteractionTypeSelect [conditional]
│   ├── DescriptionField [conditional]
│   └── NotesField
│
├── OutputPreview
│   ├── LoadingOverlay [conditional - during Excel generation]
│   ├── Excel download button (with loading state)
│   └── JSON display with copy button
│
├── LoadingOverlay [Reusable component]
│   ├── Full-screen backdrop
│   ├── LoadingSpinner (in presentation mode)
│   └── Body scroll management
│
└── LoadingSpinner [Reusable component]
    ├── Animated spinner
    ├── Loading message
    └── ARIA attributes (role, aria-live, aria-busy)
```

### Services & Utilities

```
src/services/
├── formStateManager.js - Observation state operations
├── formSubmission.js - Output data preparation
├── draftManager.js - Autosave decision logic
└── export/
    └── excelGenerator.js - Excel workbook generation

src/utils/
├── timeUtils.js - Time rounding, slot generation, formatting
├── timezoneUtils.js - Timezone conversion (America/Chicago)
├── localStorageUtils.js - Draft save/load/clear
├── observationUtils.js - Observation helpers
├── debounce.js - Debounce utility (200ms for text inputs)
└── validators/
    └── locationValidator.js - Pure location validation

src/constants/
├── behaviors.js - BEHAVIORS array + helper functions
├── locations.js - VALID_PERCHES, TIME_SLOTS
├── interactions.js - Objects, animals, interaction types
└── index.js - Barrel export
```

### Data Flow

```
User Input
  ↓
Component Event Handler (onChange)
  ↓
useFormState.handleMetadataChange/handleObservationChange
  ↓
formStateManager.updateObservationField (pure function)
  ↓
State Updated → Component Rerenders
  ↓
useFormValidation.validateSingle* (on change/blur)
  ↓
Error State Updated → Errors Display
  ↓
useAutoSave Effect → localStorage.saveDraft (every change)
  ↓
Submit → validateForm → prepareOutputData → generateExcel/JSON
```

---

## Codebase Organization

### Directory Structure

```
wbs-ethogram-form/
├── src/
│   ├── App.jsx                      # Root orchestrator
│   ├── App.css                      # Component styles
│   ├── index.css                    # Global styles
│   ├── main.jsx                     # React entry point
│   │
│   ├── components/                  # React components
│   │   ├── MetadataSection.jsx
│   │   ├── TimeSlotObservation.jsx
│   │   ├── PerchDiagramModal.jsx
│   │   ├── OutputPreview.jsx
│   │   └── form/                    # Extracted form fields
│   │       ├── BehaviorSelect.jsx
│   │       ├── LocationInput.jsx
│   │       ├── ObjectSelect.jsx
│   │       ├── AnimalSelect.jsx
│   │       ├── InteractionTypeSelect.jsx
│   │       ├── DescriptionField.jsx
│   │       ├── NotesField.jsx
│   │       └── index.js             # Barrel export
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useFormState.js          # State management
│   │   ├── useAutoSave.js           # Draft persistence
│   │   ├── useFormValidation.js     # Validation logic
│   │   └── __tests__/               # Hook unit tests
│   │
│   ├── services/                    # Business logic
│   │   ├── formStateManager.js      # Observation operations
│   │   ├── formSubmission.js        # Output prep
│   │   ├── draftManager.js          # Autosave logic
│   │   ├── export/
│   │   │   └── excelGenerator.js    # Excel generation
│   │   └── __tests__/               # Service unit tests
│   │
│   ├── utils/                       # Utility functions
│   │   ├── timeUtils.js             # Time operations
│   │   ├── timezoneUtils.js         # Timezone conversion
│   │   ├── localStorageUtils.js     # Storage operations
│   │   ├── observationUtils.js      # Observation helpers
│   │   ├── debounce.js              # Debounce utility
│   │   ├── validators/              # Pure validator functions
│   │   │   ├── locationValidator.js # Location validation
│   │   │   └── index.js             # Barrel export
│   │   └── __tests__/               # Utility unit tests
│   │
│   └── constants/                   # Domain data
│       ├── behaviors.js             # BEHAVIORS + helpers
│       ├── locations.js             # VALID_PERCHES, TIME_SLOTS
│       ├── interactions.js          # Objects, animals, interactions
│       └── index.js                 # Barrel export
│
├── tests/                           # Integration & E2E tests
│   ├── integration/
│   │   ├── App.test.jsx             # Full app E2E
│   │   ├── TimeSlotObservation.test.jsx # Time slot tests
│   │   ├── FormComponents.test.jsx  # Form field tests
│   │   └── MetadataSection.test.jsx # Metadata tests
│   └── copyToNextSlot.test.js       # Feature tests
│
├── docs/                            # Documentation
│   ├── interaction-subfields-design.md  # Design decisions
│   ├── maintenance-strategy.md          # Dependency maintenance
│   ├── quality-improvements.md          # Future enhancements
│   ├── refactoring-history.md           # Architecture evolution
│   └── testing-checklist.md             # QA checklist
│
├── .github/
│   ├── copilot-instructions.md      # Quick reference for AI
│   ├── pull_request_template.md     # PR template
│   └── workflows/                   # CI/CD (if any)
│
├── ARCHITECTURE.md                  # Detailed architecture docs
├── DEVELOPMENT.md                   # Developer setup & workflows
├── CONTRIBUTING.md                  # Contribution guidelines
├── README.md                        # User-facing documentation
├── CLAUDE.md                        # This file
│
├── package.json                     # Dependencies & scripts
├── vite.config.js                   # Vite configuration
├── jest.config.js                   # Jest configuration
├── babel.config.js                  # Babel configuration
├── commitlint.config.js             # Commit message linting
├── .prettierrc                      # Prettier config
├── .nvmrc                           # Node version (24.11.1)
└── .eslintrc.cjs                    # ESLint configuration
```

### File Naming Conventions

- **Components**: PascalCase with `.jsx` extension (`MetadataSection.jsx`)
- **Hooks**: camelCase starting with `use` (`useFormState.js`)
- **Services**: camelCase (`formStateManager.js`)
- **Utils**: camelCase (`timeUtils.js`)
- **Constants**: camelCase plural (`behaviors.js`)
- **Tests**: Same name as file with `.test.js` or `.test.jsx` suffix
- **Barrel exports**: `index.js` in directories

---

## Key Patterns & Conventions

### 1. State Management

**All state lives in App.jsx and flows down:**

```javascript
// Metadata state
const [metadata, setMetadata] = useState({
  observerName: '',
  date: today, // YYYY-MM-DD
  startTime: '', // HH:MM (24-hour)
  endTime: '', // HH:MM (24-hour)
  aviary: "Sayyida's Cove",
  patient: 'Sayyida',
  mode: 'live', // 'live' or 'vod'
});

// Observations state (keyed by time strings)
const [observations, setObservations] = useState({
  '15:00': {
    behavior: '',
    location: '',
    notes: '',
    description: '', // For behaviors requiring description
    object: '', // For "interacting_object"
    objectOther: '', // When object === "other"
    animal: '', // For "interacting_animal"
    animalOther: '', // When animal === "other"
    interactionType: '', // For "interacting_animal"
    interactionTypeOther: '', // When interactionType === "other"
  },
  // ... one per 5-minute slot
});

// Validation errors (flat object with dot-notation keys)
const [fieldErrors, setFieldErrors] = useState({
  observerName: '', // Metadata errors
  date: '',
  startTime: '',
  '15:00_behavior': '', // Observation errors: ${time}_${field}
  '15:00_location': '',
  // ...
});
```

**Why flat observation structure?**

- ✅ Simpler Excel export (each field = one column)
- ✅ Easier validation (flat error keys)
- ✅ Consistent with existing `location` field
- ✅ Simpler React state updates

### 2. Validation Timing

**Different fields validate at different times:**

```javascript
// Dropdowns: Validate immediately on change
<select onChange={(e) => {
  onChange(time, field, e.target.value);
  onValidate(time, field, e.target.value); // Immediate
}}>

// Text inputs: Debounced validation (200ms)
const debouncedValidate = useRef(
  debounce((time, field, value) => {
    onValidate(time, field, value); // After 200ms
  }, 200)
);

// Enter key: Validate field, don't submit form
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault(); // Prevent form submission
    onValidate(time, field, e.target.value);
  }
};
```

**Why debounce text inputs?**

- Prevents flickering error messages while user is typing
- 200ms is the sweet spot (not too fast, not too slow)
- Dropdowns don't need debouncing (discrete changes)

### 3. Conditional Field Visibility

**Fields appear/disappear based on behavior:**

```javascript
// In constants/behaviors.js
{
  value: 'interacting_object',
  label: 'Interacting with Inanimate Object',
  requiresLocation: false,
  requiresObject: true,        // ← Triggers object field
  requiresAnimal: false,
  requiresInteraction: false,
  requiresDescription: false
}

// In TimeSlotObservation.jsx - use helper functions
import { requiresObject } from '../constants';

const showObject = requiresObject(observation.behavior);

{showObject && <ObjectSelect ... />}

// In services/formStateManager.js - updateObservationField function
// When behavior changes, clear all conditional fields automatically
if (field === 'behavior') {
  // Always clear interaction-specific sub-fields when behavior changes
  updatedObservation.description = '';
  updatedObservation.object = '';
  updatedObservation.objectOther = '';
  updatedObservation.animal = '';
  updatedObservation.animalOther = '';
  updatedObservation.interactionType = '';
  updatedObservation.interactionTypeOther = '';
}
```

**Helper functions in behaviors.js:**

```javascript
export const requiresLocation = (behaviorValue) =>
  getBehaviorByValue(behaviorValue)?.requiresLocation || false;

export const requiresObject = (behaviorValue) =>
  getBehaviorByValue(behaviorValue)?.requiresObject || false;

export const requiresAnimal = (behaviorValue) =>
  getBehaviorByValue(behaviorValue)?.requiresAnimal || false;

export const requiresInteraction = (behaviorValue) =>
  getBehaviorByValue(behaviorValue)?.requiresInteraction || false;

export const requiresDescription = (behaviorValue) =>
  getBehaviorByValue(behaviorValue)?.requiresDescription || false;
```

**Always use helpers instead of direct lookups!**

### 4. Time String Format

**Stored as 24-hour, displayed as 12-hour:**

```javascript
// Internal storage: "HH:MM" (24-hour)
metadata.startTime = "15:00"
observations["15:05"] = { ... }

// Display to user: formatTo12Hour()
formatTo12Hour("15:00") // → "3:00 PM"
formatTo12Hour("09:30") // → "9:30 AM"

// Why?
// ✅ Natural sorting (Object.keys sort correctly)
// ✅ No AM/PM ambiguity
// ✅ HTML <input type="time"> uses 24-hour
// ✅ Easy conversion for display
```

### 5. Error Key Convention

```javascript
// Metadata errors: Just field name
fieldErrors.observerName = 'Observer name is required';
fieldErrors.startTime = 'Start time is required';

// Observation errors: ${time}_${field}
fieldErrors['15:00_behavior'] = 'Behavior is required';
fieldErrors['15:05_location'] = 'Location is required';

// Why?
// ✅ Unique keys per slot and field
// ✅ Easy to clear all errors for a slot
// ✅ Simple lookup pattern
```

### 6. PropTypes for Type Safety

**All components have PropTypes:**

```javascript
import PropTypes from 'prop-types';

BehaviorSelect.propTypes = {
  time: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  error: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
};
```

**Be specific with PropTypes:**

```javascript
// ✅ Good - specific shape
metadata: PropTypes.shape({
  observerName: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  // ...
}).isRequired;

// ❌ Bad - too vague
metadata: PropTypes.object.isRequired;
```

### 7. Pure Functions & Testability

**Services export pure functions:**

```javascript
// src/services/formStateManager.js
/**
 * Generate observation objects for time slots, preserving existing data
 * @param {string[]} timeSlots - Array of time strings
 * @param {Object} existingObservations - Existing observations to preserve
 * @returns {Object} - Observations keyed by time
 */
export function generateObservationsForSlots(timeSlots, existingObservations) {
  const newObservations = {};

  timeSlots.forEach((time) => {
    // Keep existing observation if it exists, otherwise create new
    newObservations[time] = existingObservations[time] || {
      behavior: '',
      location: '',
      notes: '',
      description: '',
      object: '',
      objectOther: '',
      animal: '',
      animalOther: '',
      interactionType: '',
      interactionTypeOther: '',
    };
  });

  return newObservations;
}

// Easy to test!
test('generates empty observations for slots', () => {
  const slots = ['15:00', '15:05'];
  const obs = generateObservationsForSlots(slots, {});
  expect(obs['15:00'].behavior).toBe('');
});
```

### 8. Constants as Single Source of Truth

**Domain data lives in constants/:**

```javascript
// constants/behaviors.js - BEHAVIORS array + helpers
// constants/locations.js - VALID_PERCHES, TIME_SLOTS
// constants/interactions.js - INANIMATE_OBJECTS, ANIMAL_TYPES, INTERACTION_TYPES
// constants/index.js - Barrel export

// Import via barrel:
import { BEHAVIORS, requiresLocation } from '../constants';

// NOT:
import { BEHAVIORS } from '../constants/behaviors';
```

**Note on Ground location:**

- "Ground" is NOT in `VALID_PERCHES` constant
- It's added dynamically in TimeSlotObservation.jsx's perchOptions
- Validated separately in locationValidator.js
- This separates numbered perches/codes from common "Ground" location

---

## Development Workflows

### Adding a New Behavior

**Steps:**

1. Update `src/constants/behaviors.js`:

   ```javascript
   export const BEHAVIORS = [
     // ... existing behaviors
     {
       value: 'new_behavior',
       label: 'New Behavior',
       requiresLocation: true, // or false
       requiresObject: false,
       requiresAnimal: false,
       requiresInteraction: false,
       requiresDescription: false,
     },
   ];
   ```

2. **That's it!** Helper functions and validation automatically work.

3. If needed, add special location codes to `src/constants/locations.js`:

   ```javascript
   export const VALID_PERCHES = [
     1, 2, 3, ..., 31,
     'BB1', 'BB2', 'F1', 'F2', 'G', 'W',
     'NEW_CODE'  // Add here
   ];
   ```

4. Run tests: `npm test`

### Adding a New Object/Animal/Interaction Type

**Steps:**

1. Update appropriate array in `src/constants/interactions.js`:

   ```javascript
   export const INANIMATE_OBJECTS = [
     // ... existing objects
     { value: 'new_object', label: 'New Object' },
   ];
   ```

2. **That's it!** UI dropdowns automatically include it.

3. Run tests: `npm test`

### Making a Git Commit

**Follow conventional commits:**

```bash
# Commit message format
<type>: <description>

# Types
feat:     New feature
fix:      Bug fix
docs:     Documentation changes
test:     Adding or updating tests
refactor: Code refactoring (no behavior change)
style:    Code style changes (formatting, etc.)
chore:    Maintenance (dependencies, config, etc.)

# Examples
feat: add new "hunting" behavior option
fix: correct timezone conversion for DST
docs: update ARCHITECTURE.md with Phase 6 changes
test: add tests for Excel generation
refactor: extract validation logic to pure functions
chore: upgrade React to v19
```

**Pre-commit hooks run automatically:**

- ESLint fixes
- Prettier formatting
- Commit message validation (commitlint)

### Creating a Pull Request

**Use the PR template (.github/pull_request_template.md):**

1. Clear description of changes
2. Link related issues
3. Screenshots for UI changes
4. Test plan
5. Checklist completed

**Branch naming:**

- `feat/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `test/description` - Tests
- `refactor/description` - Refactoring
- `chore/description` - Maintenance

### Running Tests

```bash
# All tests (should see 287 passing)
npm test

# Watch mode (re-runs on file changes)
npm run test:watch

# Changed files only
npm run test:changed

# Since main branch
npm run test:since

# With coverage report
npm run test:coverage
```

**Test organization:**

- **Unit tests**: In `__tests__/` next to source files
- **Integration tests**: In `tests/integration/`
- **Feature tests**: In `tests/` root

---

## Testing Strategy

### Philosophy

- **Comprehensive test suite with full coverage** - All tests passing
- **Comprehensive E2E coverage** - Tests real user workflows
- **Unit tests for business logic** - Services, utils, hooks
- **Integration tests for components** - Full component rendering
- **No mocking unless necessary** - Test real behavior when possible

### Test Patterns

**Integration test setup:**

```javascript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

// Helper functions for cleaner tests
const fillMetadata = async (
  user,
  {
    observerName = 'Test Observer',
    date = '2025-11-21',
    startTime = '15:00',
    endTime = '15:30',
  }
) => {
  await user.type(screen.getByLabelText(/observer name/i), observerName);
  await user.type(screen.getByLabelText(/date/i), date);
  // ...
};

test('submits valid form successfully', async () => {
  const user = userEvent.setup();
  render(<App />);

  await fillMetadata(user);
  await fillTimeSlot(user, '15:00', {
    behavior: 'resting_alert',
    location: '5',
  });

  await user.click(screen.getByRole('button', { name: /validate/i }));

  expect(screen.getByText(/download excel/i)).toBeInTheDocument();
});
```

**Service test (pure functions):**

```javascript
import { generateObservationsForSlots } from '../formStateManager';

test('generates empty observations for time slots', () => {
  const slots = ['15:00', '15:05', '15:10'];
  const observations = generateObservationsForSlots(slots, {});

  expect(Object.keys(observations)).toHaveLength(3);
  expect(observations['15:00'].behavior).toBe('');
  expect(observations['15:00'].location).toBe('');
});
```

**Hook test:**

```javascript
import { renderHook, act } from '@testing-library/react';
import useFormState from '../useFormState';

test('updates metadata field', () => {
  const { result } = renderHook(() => useFormState());

  act(() => {
    result.current.handleMetadataChange('observerName', 'Test User');
  });

  expect(result.current.metadata.observerName).toBe('Test User');
});
```

### What to Test

**✅ DO test:**

- User workflows (E2E integration tests)
- Business logic (service pure functions)
- Validation rules (hook tests)
- Edge cases (null, empty, invalid inputs)
- Error handling (try/catch blocks)

**❌ DON'T test:**

- Implementation details (internal state)
- Third-party libraries (React, exceljs, etc.)
- Styling/CSS (use visual regression instead)

---

## Common Tasks

### Task 1: Debug Validation Not Working

**Checklist:**

1. Is the field conditional? Check behavior flags in `constants/behaviors.js`
2. Is error key correct? Should be `${time}_${field}` for observations
3. Is validation called? Check `onValidate` prop passed correctly
4. Is validation debounced? Text fields wait 200ms
5. Check browser console for PropTypes warnings
6. Read `useFormValidation.js` validation logic for that field

### Task 2: Add New Conditional Field

**Example: Add "duration" field for "sleeping" behavior**

1. Update behavior flag:

   ```javascript
   // constants/behaviors.js
   {
     value: 'sleeping',
     requiresDuration: true  // New flag
   }

   export const requiresDuration = (behaviorValue) =>
     getBehaviorByValue(behaviorValue)?.requiresDuration || false;
   ```

2. Add field to observation initialization:

   ```javascript
   // services/formStateManager.js
   {
     behavior: '',
     // ... existing fields
     duration: ''  // New field
   }
   ```

3. Create component:

   ```javascript
   // components/form/DurationField.jsx
   export default function DurationField({
     time,
     value,
     error,
     onChange,
     onValidate,
   }) {
     // Similar to DescriptionField.jsx
   }
   ```

4. Add to TimeSlotObservation:

   ```javascript
   import { requiresDuration } from '../../constants';

   {requiresDuration(observation.behavior) && (
     <DurationField ... />
   )}
   ```

5. Add validation:

   ```javascript
   // hooks/useFormValidation.js
   if (requiresDuration(observation.behavior) && !observation.duration.trim()) {
     errors[`${time}_duration`] = 'Duration is required';
   }
   ```

6. Clear on behavior change:

   ```javascript
   // services/formStateManager.js - updateObservationField function
   // Add to the behavior change clearing section (around line 78)
   if (field === 'behavior') {
     // ... existing clearing logic
     updatedObservation.duration = ''; // Add to cleared fields
   }
   ```

7. Update Excel export:

   ```javascript
   // services/export/excelGenerator.js
   // Add duration column to worksheet
   ```

8. Write tests!

### Task 3: Fix Timezone Conversion Bug

**Common issues:**

1. **Check timezone constant**: `America/Chicago` in `timezoneUtils.js`
2. **Verify mode**: Conversion only happens in `mode: 'live'`
3. **Check date format**: Must be `YYYY-MM-DD`
4. **Look for DST edge cases**: Spring forward, fall back
5. **Test in CI environment**: Uses UTC, may behave differently

**Debugging:**

```javascript
// Add console.log in timezoneUtils.js
console.log({
  input: { date, time, timezone },
  output: convertedTime,
});
```

### Task 4: Investigate Test Failure

**Steps:**

1. **Read error message carefully** - Jest errors are detailed
2. **Check if all 287 pass** - Or just one suite?
3. **Run single test**: `npm test -- -t "test name"`
4. **Check for timing issues**: Use `waitFor` for async
5. **Mock console if needed**: Tests mock localStorage, may need console
6. **Check PropTypes warnings**: Can cause test failures

**Common causes:**

- Async state updates (use `waitFor`)
- Missing mocks (localStorage, Date)
- PropTypes errors (fix the prop mismatch)
- Snapshot mismatch (update with `-u` flag)

---

## Things to Avoid

### ❌ Don't: Change validation timing without testing

**Why**: Debouncing prevents flickering. Removing it causes bad UX.

```javascript
// ❌ BAD
onChange={(e) => {
  onChange(time, field, e.target.value);
  onValidate(time, field, e.target.value); // Text field - will flicker!
}}

// ✅ GOOD
onChange={(e) => {
  onChange(time, field, e.target.value);
  debouncedValidateRef.current(time, field, e.target.value);
}}
```

### ❌ Don't: Use direct BEHAVIORS lookups

**Why**: Helper functions provide abstraction and safety.

```javascript
// ❌ BAD
const behavior = BEHAVIORS.find(b => b.value === observation.behavior);
if (behavior?.requiresLocation) { ... }

// ✅ GOOD
if (requiresLocation(observation.behavior)) { ... }
```

### ❌ Don't: Forget to clear conditional fields

**Why**: Orphaned data causes validation bugs and bad output.

```javascript
// ❌ BAD - when behavior changes
newObservations[time] = {
  ...prev[time],
  behavior: value,
  // Missing: clear object, animal, etc.
};

// ✅ GOOD
newObservations[time] = {
  ...prev[time],
  behavior: value,
  object: '',
  objectOther: '',
  animal: '',
  animalOther: '',
  interactionType: '',
  interactionTypeOther: '',
  description: '',
};
```

### ❌ Don't: Add features and refactor in same commit

**Why**: Makes PR review harder and rollback risky.

```bash
# ❌ BAD
git commit -m "refactor: extract components + feat: add email submission"

# ✅ GOOD
git commit -m "refactor: extract form components"
# ... test, merge ...
git commit -m "feat: add email submission"
```

### ❌ Don't: Mutate state directly

**Why**: React won't detect changes, UI won't update.

```javascript
// ❌ BAD
observations['15:00'].behavior = 'resting_alert'; // Direct mutation
setObservations(observations);

// ✅ GOOD
setObservations((prev) => ({
  ...prev,
  '15:00': {
    ...prev['15:00'],
    behavior: 'resting_alert',
  },
}));
```

### ❌ Don't: Skip tests when adding features

**Why**: Regression bugs will appear later.

**Always:**

1. Write tests for new services/utils
2. Update integration tests if behavior changes
3. Run full test suite before PR
4. Aim for 100% pass rate

### ❌ Don't: Use setTimeout without cleanup

**Why**: Memory leaks and test failures.

```javascript
// ❌ BAD
useEffect(() => {
  setTimeout(() => { ... }, 1000);
}, []);

// ✅ GOOD
useEffect(() => {
  const timer = setTimeout(() => { ... }, 1000);
  return () => clearTimeout(timer); // Cleanup!
}, []);
```

### ❌ Don't: Hardcode "magic numbers"

**Why**: Use constants for maintainability.

```javascript
// ❌ BAD
if (perch >= 1 && perch <= 31) { ... }

// ✅ GOOD
import { VALID_PERCHES } from '../constants';
const perchNumber = parseInt(value, 10);
if (!isNaN(perchNumber) && VALID_PERCHES.includes(perchNumber)) { ... }
```

---

## Where to Find Information

### Architecture & Design

| Question                            | Document                                                                     |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| How does component hierarchy work?  | [ARCHITECTURE.md](ARCHITECTURE.md)                                           |
| What are the data structures?       | [ARCHITECTURE.md](ARCHITECTURE.md) - State Management section                |
| Why was this designed this way?     | [docs/refactoring-history.md](docs/refactoring-history.md)                   |
| How do interaction sub-fields work? | [docs/interaction-subfields-design.md](docs/interaction-subfields-design.md) |

### Development

| Question                             | Document                                           |
| ------------------------------------ | -------------------------------------------------- |
| How do I set up the dev environment? | [DEVELOPMENT.md](DEVELOPMENT.md)                   |
| How do I run tests?                  | [DEVELOPMENT.md](DEVELOPMENT.md) - Testing section |
| What are the npm scripts?            | `package.json` - scripts section                   |
| How do I add a new behavior?         | This file - Common Tasks section                   |

### Contributing

| Question                          | Document                                                          |
| --------------------------------- | ----------------------------------------------------------------- |
| How do I contribute?              | [CONTRIBUTING.md](CONTRIBUTING.md)                                |
| What's the commit message format? | [CONTRIBUTING.md](CONTRIBUTING.md) - Conventional Commits section |
| What's the PR process?            | [CONTRIBUTING.md](CONTRIBUTING.md) - Pull Request Process         |
| What's the branching strategy?    | [CONTRIBUTING.md](CONTRIBUTING.md) - Branch Naming                |

### Testing

| Question                          | Document                                                      |
| --------------------------------- | ------------------------------------------------------------- |
| What should I test manually?      | [docs/testing-checklist.md](docs/testing-checklist.md)        |
| How do I write integration tests? | `tests/integration/App.test.jsx` - example patterns           |
| How do I test hooks?              | `src/hooks/__tests__/useFormState.test.js` - example patterns |
| What's the test philosophy?       | This file - Testing Strategy section                          |

### Quick Reference for AI

| Question                    | Document                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| TL;DR for AI assistants?    | [.github/copilot-instructions.md](.github/copilot-instructions.md)                       |
| Data shapes and naming?     | [.github/copilot-instructions.md](.github/copilot-instructions.md) - Data shapes section |
| Project-specific behaviors? | [.github/copilot-instructions.md](.github/copilot-instructions.md) - Behaviors section   |

### Maintenance

| Question                               | Document                                                     |
| -------------------------------------- | ------------------------------------------------------------ |
| What dependencies need updating?       | [docs/maintenance-strategy.md](docs/maintenance-strategy.md) |
| What are the security vulnerabilities? | [docs/maintenance-strategy.md](docs/maintenance-strategy.md) |
| What quality improvements are planned? | [docs/quality-improvements.md](docs/quality-improvements.md) |

### User-Facing

| Question                    | Document                                  |
| --------------------------- | ----------------------------------------- |
| How do users use this form? | [README.md](README.md)                    |
| What features exist?        | [README.md](README.md) - Features section |
| What's the roadmap?         | [README.md](README.md) - Roadmap section  |

---

## Final Tips for AI Assistants

### When Starting a New Task

1. **Read before writing** - Always read existing code first
2. **Understand the "why"** - Check refactoring-history.md for context
3. **Run tests first** - Establish baseline (`npm test`)
4. **Make small changes** - One logical change at a time
5. **Test immediately** - Don't batch up changes
6. **Update docs** - Keep documentation in sync

### When Stuck

1. **Check existing patterns** - How is similar code structured?
2. **Read the tests** - Tests show intended behavior
3. **Search codebase** - Use grep/search for similar code
4. **Check documentation** - Answers are usually in docs/
5. **Ask specific questions** - Provide context and what you've tried

### Best Practices

- ✅ **Be specific** - Specific PropTypes, clear function names
- ✅ **Be consistent** - Follow existing patterns
- ✅ **Be tested** - Write or update tests
- ✅ **Be documented** - Update docs when needed
- ✅ **Be minimal** - Don't over-engineer
- ✅ **Be safe** - Don't break existing functionality

### Red Flags 🚩

If you see these, investigate:

- Tests failing
- PropTypes warnings in console
- Direct state mutation
- Missing validation for conditional fields
- Hardcoded "magic" values
- Undocumented breaking changes
- Missing cleanup in useEffect
- Synchronous code in async contexts

---

## Document Maintenance

**Last Updated**: November 22, 2025
**Updated By**: Claude (Anthropic AI)
**Version**: 1.0.0
**Status**: Initial creation

**When to Update This Document:**

- Major architecture changes
- New patterns emerge
- Testing strategy changes
- Common pitfalls discovered
- New team members have questions not answered here

**How to Update:**

1. Edit this file directly
2. Keep sections focused and scannable
3. Add examples where helpful
4. Remove outdated information
5. Update "Last Updated" timestamp
6. Commit with message: `docs: update CLAUDE.md with [changes]`

---

## Quick Reference Card

**Essential Commands:**

```bash
npm install          # Install dependencies
npm run dev          # Start dev server (localhost:5173)
npm test             # Run all tests (287 passing)
npm run lint         # Check code quality
npm run build        # Build for production
```

**Key Files to Know:**

- `src/App.jsx` - Root component
- `src/constants/behaviors.js` - Behavior definitions + helpers
- `src/hooks/useFormValidation.js` - All validation rules
- `src/services/formStateManager.js` - State operations
- `.github/copilot-instructions.md` - Quick AI reference

**Common Patterns:**

- State flows down, callbacks up
- Validate on change (dropdowns) or debounced (text)
- Use helper functions, not direct BEHAVIORS lookups
- Clear conditional fields when behavior changes
- Always test after changes

**Need Help?**

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for deep dive
- Check [docs/refactoring-history.md](docs/refactoring-history.md) for "why"
- Review [.github/copilot-instructions.md](.github/copilot-instructions.md) for patterns
- Look at tests for examples

---

**End of CLAUDE.md**
