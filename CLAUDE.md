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
- **Domain config**: Vocabularies/aviary data come from `useConfig()` (ConfigContext), never hardcoded
- **Callbacks**: Flow up from child components
- **Validation**: Dropdowns validate onChange, text fields validate onBlur + debounced (200ms)
- **Behaviors**: Use the `requires*` helper functions from `useConfig()`, never direct BEHAVIORS lookups
- **Pure functions**: Services should be pure and testable (config is passed in, never imported)

### 3. Use Helper Functions

```javascript
// ✅ GOOD (components/hooks)
const { requiresLocation } = useConfig();
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
├── config/
│   └── defaultConfig.json          # Bundled config snapshot (generated, never hand-edited)
├── contexts/
│   └── ConfigContext.jsx           # ConfigProvider + useConfig()
├── constants/
│   └── ui.js                       # Presentation constants (steps, caps, storage keys)
└── tests/                          # Integration & E2E tests

**Domain data (behaviors, vocab, perches, aviary) is config-as-data**: the
canonical model lives in the backend DB (`ethogram-api` migrations), served by
`GET /api/config`, adapted by `services/configAdapter.js`, exposed via
`useConfig()`. The bundled snapshot is the offline fallback.
```

---

## Key Patterns

### State Management

- All form state lives in `App.jsx`; domain config comes from `ConfigContext`
  (bundled snapshot at first paint, upgraded from `GET /api/config` at mount)
- Metadata: Observer info, date, time range, mode, aviary **slug** (display
  names resolve from config wherever the aviary is rendered)
- Observations: Keyed by time strings (`"15:00"`, `"15:05"`, etc.); each slot
  is an **array of per-subject cards** (`{ cardId, subjectType, subjectId, ...fields }`).
  Cards are keyed by the slot-local `cardId`, NOT `subjectId` — generic
  `"Juvenile"` cards (P2-D8) may duplicate a subjectId within a slot; the
  backend strips `cardId` from the payload
- Validation errors: Flat object with `${time}_${cardId}_${field}` keys for
  observations — always built via `observationErrorKey()` (`utils/errorKeys.js`),
  never inline templates

### Validation Timing

- **Dropdowns**: Validate immediately onChange
- **Text inputs**: Debounced validation (200ms) + onBlur
- **Enter key**: Validates field, doesn't submit form

### Conditional Fields

- Fields appear/disappear based on behavior flags
- Behavior object has: `requiresLocation`, `requiresObject`, `requiresObjectInteraction`, `requiresAnimal`, `requiresAnimalInteraction`, `requiresDescription` (only the flags a behavior needs are set)
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

### Adding a New Behavior / Object / Animal / Interaction Type

Domain vocabulary lives in the database (config-as-data), not in this repo:

1. Add the catalog row + aviary enablement in `ethogram-api` (SQL until the
   Phase 3 admin dashboard exists), then `npm run config:publish` there
2. Regenerate the bundled snapshot here:
   `npm run config:export > ../wbs-ethogram-form/src/config/defaultConfig.json`
3. Run tests in both repos. Menus, helpers, validation, and both Excel
   generators pick the change up from config automatically.

See the design doc: `ethogram-notes/01-ACTIVE/config-as-data-phase1-design.md`

### Debugging Validation

1. Check if field is conditional (behavior `requires*` flags in the config document)
2. Verify error key format: `${time}_${cardId}_${field}` for observations (`utils/errorKeys.js`)
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

**Behavior/vocabulary changes** (config-as-data):

1. Edit the catalog in the `ethogram-api` database + `config:publish`
2. Regenerate this repo's bundled snapshot via `config:export`
3. No lockstep deploy needed — the form fetches the published config and
   both Excel generators derive their rows from it

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
