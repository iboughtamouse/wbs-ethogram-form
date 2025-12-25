# CLAUDE.md - WBS Ethogram Form Guide

> **Purpose**: Essential context for AI assistants working on this codebase.
> **Last Updated**: December 25, 2025
> **Status**: Production-ready, actively deployed

---

## What This Is

The **WBS Ethogram Form** is a React application for recording behavioral observations of Sayyida, a barred owl at the World Bird Sanctuary. Citizen scientists use this form during live Twitch streams or when reviewing recorded videos (VODs) to log bird behaviors in 5-minute intervals.

**Key Characteristics:**

- Backend integrated (PostgreSQL + email via Resend)
- Autosave to localStorage (prevents data loss)
- Stream timestamps (all modes use video timestamp directly)
- Mobile-first responsive design
- Comprehensive test suite (all tests passing)
- WCAG-compliant accessibility

---

## Tech Stack

- **Framework**: React 18.2.0 + Vite 5.0.8
- **Testing**: Jest 30.x + React Testing Library 16.x
- **Validation**: Custom hooks
- **Excel Export**: exceljs 4.4.0 (client-side generation)
- **Styling**: Plain CSS
- **Code Quality**: ESLint + Prettier + Husky pre-commit hooks

---

## Mental Model

```
User fills form → validates on change → autosaves to localStorage →
submits to backend API → backend stores + emails Excel →
success modal offers download/share
```

**Data Flow:**

```
User Input → Component Event Handler → useFormState hook →
formStateManager.updateObservationField (pure function) →
State Updated → useFormValidation validates →
useAutoSave persists to localStorage
```

---

## Development Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server (localhost:5173)
npm test                 # Run all tests (all should pass)
npm run lint             # Check code quality
npm run build            # Build for production
```

---

## Core Rules

### 1. Always Read Files Before Editing

Never propose changes to code you haven't read. Read the actual implementation, don't guess.

### 2. Follow Existing Patterns

- **State**: Lives in App.jsx, flows down via props
- **Callbacks**: Flow up from child components
- **Validation**: Dropdowns validate onChange, text fields validate onBlur + debounced (200ms)
- **Behaviors**: Use helper functions from `constants/behaviors.js`, never direct BEHAVIORS lookups
- **Pure functions**: Services should be pure and testable

### 3. Use Helper Functions

```javascript
// ✅ GOOD
import { requiresLocation } from '../constants';
if (requiresLocation(observation.behavior)) { ... }

// ❌ BAD
const behavior = BEHAVIORS.find(b => b.value === observation.behavior);
if (behavior?.requiresLocation) { ... }
```

### 4. Clear Conditional Fields

When behavior changes, clear ALL conditional fields (object, animal, interaction, description).
See: `formStateManager.js` → `updateObservationField` function

### 5. Run Tests Before Committing

```bash
npm test                 # All tests must pass
```

### 6. Conventional Commits

```
feat: add new behavior option
fix: correct validation timing
docs: update ARCHITECTURE.md
test: add tests for Excel generation
refactor: extract validation logic
```

---

## File Organization

```
src/
├── App.jsx                         # Root component (state + orchestration)
├── components/                     # UI components
│   ├── MetadataSection.jsx
│   ├── TimeSlotObservation.jsx
│   ├── SubmissionModal.jsx
│   └── form/                       # Form field components
├── hooks/                          # Custom React hooks
│   ├── useFormState.js             # State management
│   ├── useAutoSave.js              # localStorage persistence
│   └── useFormValidation.js        # Validation rules
├── services/                       # Business logic (pure functions)
│   ├── formStateManager.js         # State operations
│   ├── formSubmission.js           # Output preparation
│   └── export/excelGenerator.js    # Excel generation
├── utils/                          # Utility functions
│   ├── timeUtils.js
│   ├── localStorageUtils.js
│   └── validators/                 # Pure validation functions
├── constants/                      # Domain data (single source of truth)
│   ├── behaviors.js                # BEHAVIORS array + helper functions
│   ├── locations.js                # VALID_PERCHES, TIME_SLOTS
│   └── interactions.js             # Objects, animals, interaction types
└── tests/                          # Integration & E2E tests
```

---

## Key Patterns

### State Management

- All state lives in `App.jsx`
- Metadata: Observer info, date, time range, mode
- Observations: Keyed by time strings (`"15:00"`, `"15:05"`, etc.)
- Flat observation structure (one field per observation property)
- Validation errors: Flat object with `${time}_${field}` keys for observations

### Validation Timing

- **Dropdowns**: Validate immediately onChange
- **Text inputs**: Debounced validation (200ms) + onBlur
- **Enter key**: Validates field, doesn't submit form

### Conditional Fields

- Fields appear/disappear based on behavior flags
- Behavior object has: `requiresLocation`, `requiresObject`, `requiresAnimal`, `requiresInteraction`, `requiresDescription`
- Use helper functions: `requiresLocation(behaviorValue)`, `requiresObject(behaviorValue)`, etc.
- When behavior changes, clear ALL conditional fields automatically

### Time Format

- **Stored**: 24-hour format (`"15:00"`)
- **Displayed**: 12-hour format (`"3:00 PM"`)
- **Why**: Natural sorting, no AM/PM ambiguity, HTML input compatibility

### PropTypes

All components use PropTypes for type safety. Be specific with shapes, not vague `PropTypes.object`.

---

## Quick Wins

### Adding a New Behavior

1. Update `src/constants/behaviors.js` with new behavior object
2. Run tests: `npm test`
3. That's it! Helper functions and validation automatically work.

### Adding Object/Animal/Interaction Type

1. Update appropriate array in `src/constants/interactions.js`
2. That's it! UI dropdowns automatically include it.

### Debugging Validation

1. Check if field is conditional (behavior flags in `constants/behaviors.js`)
2. Verify error key format: `${time}_${field}` for observations
3. Check validation is called (onValidate prop)
4. Check debouncing for text fields (200ms delay)
5. Read `useFormValidation.js` for that field's logic

---

## Progressive Disclosure

**Need more detail? Read these:**

### Architecture & Design

- **Component hierarchy**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **State structures**: See [ARCHITECTURE.md](ARCHITECTURE.md) - State Management section
- **Design decisions**: See [docs/refactoring-history.md](docs/refactoring-history.md)
- **Interaction fields**: See [docs/interaction-subfields-design.md](docs/interaction-subfields-design.md)

### Development

- **Setup & workflows**: See [DEVELOPMENT.md](DEVELOPMENT.md)
- **Testing patterns**: See [DEVELOPMENT.md](DEVELOPMENT.md) - Testing section
- **Example tests**: See `tests/integration/App.test.jsx`

### Contributing

- **Git workflow**: See [CONTRIBUTING.md](CONTRIBUTING.md)
- **PR process**: See [CONTRIBUTING.md](CONTRIBUTING.md) - Pull Request Process
- **Branch naming**: See [CONTRIBUTING.md](CONTRIBUTING.md) - Branch Naming

### Domain Knowledge

- **Behavior definitions**: See [../ethogram-notes/00-REFERENCE/behaviors-and-fields.md](../ethogram-notes/00-REFERENCE/behaviors-and-fields.md)
- **Project context**: See [../ethogram-notes/00-REFERENCE/project-context.md](../ethogram-notes/00-REFERENCE/project-context.md)
- **Current work**: See [../ethogram-notes/01-ACTIVE/](../ethogram-notes/01-ACTIVE/)

### Quick Reference

- **Common patterns**: See [.github/copilot-instructions.md](.github/copilot-instructions.md)

---

## Related Repositories

### **ethogram-api** (Backend)

- **Purpose**: Node.js/TypeScript REST API for storing observations and sending emails
- **Tech**: Fastify + PostgreSQL + Resend
- **AI Guide**: [../ethogram-api/CLAUDE.md](../ethogram-api/CLAUDE.md)

### **ethogram-notes** (Documentation)

- **Purpose**: Project documentation, study feedback, improvement roadmap
- **AI Guide**: [../ethogram-notes/README.md](../ethogram-notes/README.md)

### Cross-Repository Coordination

**Behavior changes** (items 5-9 in study feedback):

1. Update `src/constants/behaviors.js` (frontend)
2. Update `src/services/excel.ts` BEHAVIOR_ROW_MAPPING (backend)
3. Coordinate deployment (both must go live together)

**Data shape changes** (Phase 4 multi-subject):

1. Frontend state management refactor
2. Remove transformation in backend `src/routes/observations.ts`
3. Update Excel generation in both repos

---

## When Stuck

1. **Read the actual code** - Don't rely on this doc, read implementations
2. **Check existing patterns** - How is similar code structured?
3. **Read the tests** - Tests show intended behavior
4. **Search the codebase** - Grep for similar examples
5. **Check docs/** - Detailed design docs explain "why"

---

**End of CLAUDE.md**

**Lines**: ~260 (was 1,464)
**Focus**: Essential WHAT/WHY/HOW patterns, progressive disclosure for details
