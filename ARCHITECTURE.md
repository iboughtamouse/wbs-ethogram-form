# Architecture Documentation

> **Last Updated**: November 21, 2025
> **Codebase Size**: 2,012 lines (source) + 3,404 lines (tests)
> **Test Count**: 208 passing tests across 9 test suites
> **Components**: 11 React components (4 main + 7 form fields)

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Component Hierarchy](#component-hierarchy)
3. [Data Flow](#data-flow)
4. [File Organization & Metrics](#file-organization--metrics)
5. [State Management](#state-management)
6. [Validation Architecture](#validation-architecture)
7. [Key Architectural Decisions](#key-architectural-decisions)
8. [Patterns & Conventions](#patterns--conventions)

---

## High-Level Overview

WBS Ethogram Form is a **client-side single-page application** (SPA) with no backend. All state lives in React, with localStorage providing autosave functionality. The architecture prioritizes:

- **Data quality**: Centralized validation prevents bad data entry
- **User experience**: Real-time validation, autosave, mobile-friendly
- **Maintainability**: Clear separation of concerns, testable utilities
- **Simplicity**: No state management library needed, vanilla React state works well

### Tech Stack

- **React 18.2** - UI framework with hooks
- **Vite 5.0** - Build tool and dev server
- **React Select 5.8** - Autocomplete location dropdown
- **Jest + React Testing Library** - Testing framework
- **Native Browser APIs** - localStorage, Intl.DateTimeFormat, navigator.clipboard

---

## Component Hierarchy

### ASCII Tree

```
App.jsx (358 lines) - Root component
│
├── MetadataSection.jsx (159 lines)
│   ├── Observer name input
│   ├── Date picker
│   ├── Mode selector (live/VOD)
│   ├── Start time input
│   └── End time input
│
├── TimeSlotObservation.jsx (311 lines) [×N instances, one per 5-min slot]
│   ├── BehaviorSelect.jsx (35 lines)
│   ├── LocationInput.jsx (79 lines) [conditional]
│   │   ├── React Select dropdown
│   │   ├── Map button
│   │   └── PerchDiagramModal (owned state)
│   ├── ObjectSelect.jsx (68 lines) [conditional]
│   │   ├── Object dropdown
│   │   └── "Other" text input (conditional)
│   ├── AnimalSelect.jsx (68 lines) [conditional]
│   │   ├── Animal dropdown
│   │   └── "Other" text input (conditional)
│   ├── InteractionTypeSelect.jsx (68 lines) [conditional]
│   │   ├── Interaction Type dropdown
│   │   └── "Other" text input (conditional)
│   ├── DescriptionField.jsx (32 lines) [conditional]
│   ├── NotesField.jsx (25 lines)
│   └── "Copy to next" button
│
├── PerchDiagramModal.jsx (83 lines)
│   ├── NE Half tab + image
│   ├── SW Half tab + image
│   └── Close button
│
└── OutputPreview.jsx (15 lines)
    └── JSON display with copy button
```

### Component Responsibilities

| Component | Purpose | State | Props In | Props Out (Callbacks) |
|-----------|---------|-------|----------|----------------------|
| **App** | Orchestrator | All form state | None | None |
| **MetadataSection** | Metadata inputs | None (controlled) | metadata, fieldErrors | onMetadataChange, onMetadataValidate |
| **TimeSlotObservation** | Per-slot container | None (controlled) | time, observation, errors | onChange, onValidate, onCopyToNext |
| **BehaviorSelect** | Behavior dropdown | None (controlled) | value, error | onChange |
| **LocationInput** | Location + map | Modal open state | value, error, behaviorValue, perchOptions | onChange |
| **ObjectSelect** | Object + "other" | None (controlled) | value, otherValue, errors | onChange, onOtherChange |
| **AnimalSelect** | Animal + "other" | None (controlled) | value, otherValue, errors | onChange, onOtherChange |
| **InteractionTypeSelect** | Interaction + "other" | None (controlled) | value, otherValue, errors | onChange, onOtherChange |
| **DescriptionField** | Description input | None (controlled) | value, error | onChange |
| **NotesField** | Notes textarea | None (controlled) | value | onChange |
| **PerchDiagramModal** | Perch map viewer | Active tab | isOpen | onClose |
| **OutputPreview** | JSON display | None | data | None |

---

## Data Flow

### Mermaid Diagram

```mermaid
graph TD
    A[User Input] --> B[Component Event Handler]
    B --> C[App.jsx State Update]
    C --> D{Validation Triggered?}
    D -->|Yes| E[useFormValidation Hook]
    E --> F[Validation Rules in constants.js]
    F --> G[Error State Update]
    G --> H[Component Rerenders with Errors]
    D -->|No| H
    H --> I[localStorage Autosave]

    J[Submit Button] --> K[validateForm]
    K --> L{All Valid?}
    L -->|Yes| M[Generate JSON Output]
    L -->|No| N[Show Errors + Scroll to First Error]

    O[Page Load] --> P[Check localStorage]
    P --> Q{Draft Exists?}
    Q -->|Yes| R[Restore Draft]
    Q -->|No| S[Fresh Form]
```

### State Flow Details

1. **User types/selects** → Component's onChange handler fires
2. **onChange handler** calls `App.setMetadata()` or `App.setObservations()`
3. **State updates** → Component rerenders with new value
4. **Validation triggers** (onChange for dropdowns, debounced for text)
5. **Validation hook** reads BEHAVIORS flags + constants
6. **Error state updates** → Errors display in UI
7. **localStorage saves** → Autosave effect runs after state update

---

## File Organization & Metrics

### Source Files (by size)

| File | Lines | Category | Purpose |
|------|-------|----------|---------|
| `App.jsx` | 358 | Component | Root orchestrator |
| `components/TimeSlotObservation.jsx` | 311 | Component | Per-slot container |
| `hooks/useFormValidation.js` | 246 | Hook | Centralized validation |
| `components/MetadataSection.jsx` | 159 | Component | Metadata inputs |
| `utils/timeUtils.js` | 95 | Utility | Time operations |
| `components/PerchDiagramModal.jsx` | 83 | Component | Perch map modal |
| `utils/timezoneUtils.js` | 82 | Utility | Timezone conversion |
| `constants.js` | 79 | Config | Domain data |
| `utils/localStorageUtils.js` | 73 | Utility | Autosave logic |
| `components/form/LocationInput.jsx` | 79 | Component | Location select + map |
| `components/form/ObjectSelect.jsx` | 68 | Component | Object dropdown + "other" |
| `components/form/AnimalSelect.jsx` | 68 | Component | Animal dropdown + "other" |
| `components/form/InteractionTypeSelect.jsx` | 68 | Component | Interaction dropdown + "other" |
| `utils/observationUtils.js` | 47 | Utility | Observation helpers |
| `components/form/BehaviorSelect.jsx` | 35 | Component | Behavior dropdown |
| `components/form/DescriptionField.jsx` | 32 | Component | Description text input |
| `components/form/NotesField.jsx` | 25 | Component | Notes textarea |
| `utils/debounce.js` | 21 | Utility | Debounce function |
| `components/OutputPreview.jsx` | 15 | Component | JSON display |
| `main.jsx` | 10 | Entry | React mount point |
| `components/form/index.js` | 8 | Export | Barrel export |

**Total Source**: 2,012 lines

### Test Files

| Test Suite | Lines | Coverage |
|------------|-------|----------|
| `tests/integration/App.test.jsx` | 684 | Full app integration & E2E |
| `tests/integration/TimeSlotObservation.test.jsx` | 566 | Time slot component |
| `tests/integration/FormComponents.test.jsx` | 526 | Form field components |
| `tests/integration/MetadataSection.test.jsx` | 394 | Metadata section |
| `hooks/__tests__/useFormValidation.test.js` | 378 | Validation rules |
| `utils/__tests__/localStorageUtils.test.js` | 287 | localStorage |
| `tests/copyToNextSlot.test.js` | 237 | Copy to next feature |
| `utils/__tests__/timeUtils.test.js` | 188 | Time operations |
| `utils/__tests__/timezoneUtils.test.js` | 144 | Timezone logic |

**Total Tests**: 3,404 lines, 208 test cases, 9 test suites

### Directory Structure

```
src/
├── components/          # React components (11 files, 1,011 lines)
│   ├── form/           # Form field components (8 files, 493 lines)
│   │   ├── BehaviorSelect.jsx
│   │   ├── LocationInput.jsx
│   │   ├── ObjectSelect.jsx
│   │   ├── AnimalSelect.jsx
│   │   ├── InteractionTypeSelect.jsx
│   │   ├── DescriptionField.jsx
│   │   ├── NotesField.jsx
│   │   └── index.js
│   ├── MetadataSection.jsx
│   ├── TimeSlotObservation.jsx
│   ├── PerchDiagramModal.jsx
│   └── OutputPreview.jsx
├── hooks/              # Custom hooks (1 file, 246 lines)
├── utils/              # Utilities (6 files, 418 lines)
├── constants.js        # Domain data (79 lines)
├── App.jsx             # Root component (353 lines)
├── App.css             # Component styles
├── index.css           # Global styles
└── main.jsx            # Entry point (10 lines)
```

---

## State Management

### App.jsx State Shape

```javascript
// Metadata state
const [metadata, setMetadata] = useState({
  observerName: '',
  date: today,              // YYYY-MM-DD format
  startTime: '',            // HH:MM (24-hour)
  endTime: '',              // HH:MM (24-hour)
  aviary: "Sayyida's Cove", // Fixed
  patient: 'Sayyida',       // Fixed
  mode: 'live'              // 'live' or 'vod'
});

// Observations state (object keyed by time strings)
const [observations, setObservations] = useState({
  "15:00": {
    behavior: '',
    location: '',
    notes: '',
    object: '',               // For "interacting_object" behavior
    objectOther: '',          // When object === "other"
    animal: '',               // For "interacting_animal" behavior
    animalOther: '',          // When animal === "other"
    interactionType: '',      // For "interacting_animal" behavior
    interactionTypeOther: '', // When interactionType === "other"
    description: ''           // For behaviors requiring description
  },
  "15:05": { /* ... */ },
  // ... one entry per 5-minute slot
});

// Validation errors (flat object with dot-notation keys)
const [fieldErrors, setFieldErrors] = useState({
  observerName: '',        // Metadata errors use field name
  date: '',
  startTime: '',
  endTime: '',
  "15:00_behavior": '',    // Observation errors use time_field format
  "15:00_location": '',
  "15:05_object": '',
  // ... etc
});
```

### Why This Structure?

**Observations keyed by time strings:**
- ✅ Easy lookup: `observations[time]`
- ✅ Natural ordering (time strings sort correctly)
- ✅ Unique keys (no duplicates possible)
- ✅ Simple iteration: `Object.entries(observations)`

**Flat observation structure (not nested):**
- ✅ Simpler Excel export (each field → one column)
- ✅ Easier validation (flat error keys)
- ✅ Consistent with location field pattern
- ❌ More fields at top level (trade-off accepted)

**Error keys with time prefix:**
- ✅ Unique keys per slot and field
- ✅ Easy to clear errors for a specific slot
- ✅ Simple lookup: `fieldErrors[${time}_${field}]`

---

## Validation Architecture

### Centralized Hook: `useFormValidation.js`

The validation hook is the **single source of truth** for all validation rules.

**Exposed Methods:**

```javascript
const {
  validateForm,                    // Validates entire form, returns boolean
  validateSingleMetadataField,     // Validates one metadata field
  validateSingleObservationField,  // Validates one observation field
  clearFieldError,                 // Clears error for one field
  clearAllErrors                   // Clears all errors
} = useFormValidation(metadata, observations, setFieldErrors);
```

### Validation Patterns

**Metadata fields**: Validate on blur or onChange
**Behavior/Location dropdowns**: Validate immediately onChange
**Text inputs** (objectOther, animalOther, description): **Debounced** validation (200ms delay)

### Why Debounced Text Validation?

**Problem**: Validating on every keystroke causes flickering errors while typing
**Solution**: Wait 200ms after user stops typing before validating
**Implementation**: `debounce` utility wraps validation calls in TimeSlotObservation.jsx

### Conditional Validation

Validation rules are **dynamic** based on behavior selection:

```javascript
// In constants.js
BEHAVIORS = [
  {
    value: 'interacting_object',
    label: 'Interacting with Inanimate Object',
    requiresLocation: false,
    requiresObject: true,    // ← Triggers object validation
    requiresAnimal: false
  },
  // ...
]

// In useFormValidation.js
const behaviorDef = BEHAVIORS.find(b => b.value === observation.behavior);

if (behaviorDef?.requiresObject && !observation.object) {
  errors[`${time}_object`] = 'Object is required';
}

if (observation.object === 'other' && !observation.objectOther.trim()) {
  errors[`${time}_objectOther`] = 'Please specify the object';
}
```

### Validation Flow

1. User changes behavior → `onChange` fires
2. Behavior value updates in state
3. `onValidate` called immediately
4. Hook checks `requiresObject` flag from BEHAVIORS
5. If true, validates `object` field
6. If `object === "other"`, validates `objectOther` field
7. Errors set/cleared in `fieldErrors` state
8. Component rerenders with error messages

---

## Key Architectural Decisions

### 1. No Backend / Client-Only

**Decision**: Build as pure client-side SPA, no server required

**Rationale**:
- Reduces hosting costs (static hosting is free/cheap)
- Simplifies deployment (just upload HTML/JS/CSS)
- No backend maintenance burden
- Faster development (no API layer needed)
- Works offline (after initial load)

**Trade-offs**:
- ❌ Can't enforce data validation server-side
- ❌ Can't aggregate/analyze data centrally (yet)
- ❌ User must manually copy/paste JSON output
- ✅ Will add Excel export + email in future (can still be client-side)

### 2. localStorage for Autosave

**Decision**: Use browser localStorage for draft persistence

**Rationale**:
- ✅ No server needed
- ✅ Automatic draft recovery if tab closes
- ✅ Works offline
- ✅ Simple API

**Trade-offs**:
- ❌ Data is device-specific (can't sync across devices)
- ❌ Clearing browser data loses drafts
- ✅ Acceptable for single-session data entry

### 3. Flat Observation Structure

**Decision**: All fields at top level, not nested (see interaction-subfields-design.md)

**Alternative considered**: Nested structure like:
```javascript
{
  behavior: 'interacting_object',
  interaction: {
    object: 'newspaper',
    objectOther: ''
  }
}
```

**Why flat won**:
- Excel export is way simpler (each field = one column)
- Validation logic is simpler (flat error keys)
- Consistent with existing `location` field
- React state updates are simpler

### 4. Controlled Components + Central State

**Decision**: All form state lives in App.jsx, components are fully controlled

**Alternative**: Each TimeSlotObservation manages its own state

**Why centralized won**:
- ✅ Single source of truth
- ✅ Easy to implement "Copy to next" feature
- ✅ Easy to serialize entire form for localStorage
- ✅ Easy to validate entire form at once
- ❌ More prop drilling (acceptable with only 2 levels)

### 5. Custom Validation vs Form Library

**Decision**: Build custom `useFormValidation` hook instead of React Hook Form / Formik

**Rationale**:
- Domain-specific rules (behavior flags, location codes)
- Conditional validation based on behavior selection
- Need tight integration with BEHAVIORS constants
- Learning curve for team not worth it
- Form is simple enough that library overhead not justified

---

## Patterns & Conventions

### 1. Conditional Rendering Pattern

Components check behavior flags to show/hide fields:

```javascript
const behaviorDef = BEHAVIORS.find(b => b.value === observation.behavior);
const requiresObject = behaviorDef?.requiresObject || false;

{requiresObject && (
  <div>
    <label>Object *</label>
    <select value={observation.object} onChange={...}>
      {INANIMATE_OBJECTS.map(...)}
    </select>
  </div>
)}
```

### 2. Field Clearing on Behavior Change

When behavior changes, clear all conditional fields to prevent orphaned data:

```javascript
const handleBehaviorChange = (time, value) => {
  setObservations(prev => ({
    ...prev,
    [time]: {
      ...prev[time],
      behavior: value,
      // Clear all conditional fields
      object: '',
      objectOther: '',
      animal: '',
      animalOther: '',
      interactionType: '',
      interactionTypeOther: '',
      description: ''
    }
  }));
};
```

### 3. Error Key Convention

**Metadata errors**: Just the field name (`observerName`, `date`, etc.)
**Observation errors**: `${time}_${field}` format (`"15:05_behavior"`, `"15:10_location"`)

This allows easy clearing of all errors for a specific slot:

```javascript
// Clear all errors for time slot "15:05"
const newErrors = Object.fromEntries(
  Object.entries(fieldErrors).filter(([key]) => !key.startsWith('15:05_'))
);
```

### 4. Time String Format

**Stored as**: 24-hour "HH:MM" strings (`"15:05"`, `"09:30"`)
**Displayed as**: 12-hour format via `formatTo12Hour()` (`"3:05 PM"`, `"9:30 AM"`)

**Why 24-hour storage?**
- ✅ Natural sorting (Object.keys sort correctly)
- ✅ No AM/PM ambiguity
- ✅ HTML `<input type="time">` uses 24-hour
- ✅ Easy to convert for display

### 5. Constants as Single Source of Truth

Domain data lives in `constants.js`:
- `BEHAVIORS` - List of observable behaviors with feature flags
- `VALID_PERCHES` - Valid location codes
- `INANIMATE_OBJECTS` - Object dropdown options
- `ANIMAL_TYPES` - Animal dropdown options
- `INTERACTION_TYPES` - Interaction type dropdown options

**Pattern**: UI and validation both read from constants, ensuring consistency

### 6. Debounced Text Validation

For text inputs that users type in (not dropdowns):

```javascript
const debouncedValidateRef = useRef(
  debounce((time, field, value) => {
    onValidate(time, field, value);
  }, 200)
);

const handleTextChange = (e) => {
  const value = e.target.value;
  onChange(time, field, value);  // Update state immediately
  debouncedValidateRef.current(time, field, value);  // Validate after 200ms
};
```

**Why?** Prevents flickering error messages while user is still typing.

### 7. Enter Key Handling

Text inputs validate on Enter but **do not submit** the form:

```javascript
const handleKeyDown = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();  // Prevent form submission
    onValidate(time, field, e.target.value);  // Validate this field
  }
};
```

**Why?** Prevents accidental form submission on mobile when user taps "Enter" on keyboard.

---

## Future Architectural Considerations

### When Might We Need State Management Library?

Consider Redux/Zustand if:
- Form becomes multi-page with complex navigation
- Need to share observation data across multiple views
- Need time-travel debugging for complex interactions
- Team grows and needs more structured state

**Current verdict**: Not needed yet, vanilla React is sufficient

### When Might We Need TypeScript?

Consider TypeScript if:
- Team grows beyond 1-2 developers
- Refactoring becomes risky due to prop mismatches
- IDE autocomplete becomes important
- Need compile-time safety for complex data transformations

**Current verdict**: PropTypes (Phase 1) might be sufficient, TypeScript deferred

### When Might We Need Backend?

Consider adding a backend if:
- Need to aggregate data from multiple observers
- Want to provide data analysis dashboard
- Need to enforce server-side validation
- Want to send automated email submissions
- Need multi-device sync

**Current verdict**: Client-side Excel generation + email integration (Phase 6) might be sufficient

---

## Performance Characteristics

### Current Performance (Measured)

- **Initial load**: < 1 second
- **Form renders**: No noticeable lag
- **Validation**: Instantaneous for dropdowns, 200ms for text
- **Time slot generation**: Instantaneous (max 12 slots)
- **localStorage autosave**: < 10ms

### No Performance Issues Because:

- ✅ Only 12 TimeSlotObservation components max (60 min range)
- ✅ No complex computations or large datasets
- ✅ Debouncing prevents excessive validation calls
- ✅ React Select handles large dropdown lists efficiently
- ✅ No unnecessary rerenders (components are well-memoized by React)

### If Performance Becomes an Issue:

- Consider `React.memo()` for TimeSlotObservation
- Consider `useMemo()` for perchOptions generation
- Consider virtualizing long time ranges (if >60 min support added)

**Current verdict**: No optimizations needed, form is performant

---

## Related Documentation

- **[README.md](README.md)** - User-facing documentation
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Developer setup and workflow
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines
- **[docs/interaction-subfields-design.md](docs/interaction-subfields-design.md)** - Design decisions for interaction fields
- **[docs/refactoring-strategy.md](docs/refactoring-strategy.md)** - Refactoring plan
- **[docs/testing-checklist.md](docs/testing-checklist.md)** - QA checklist
- **[.github/copilot-instructions.md](.github/copilot-instructions.md)** - AI assistant quick reference

---

## Maintenance Notes

### Keep This Document Updated When:

- Adding new components
- Changing state structure
- Adding new validation patterns
- Making architectural decisions
- File sizes change significantly (±50 lines)
- Test count changes significantly

### Document Owner

This is a living document. Keep it accurate and up-to-date as the codebase evolves.

**Last audit**: November 21, 2025 (Phase 0 refactoring)
