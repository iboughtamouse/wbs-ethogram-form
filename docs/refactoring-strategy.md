# Refactoring Strategy for WBS Ethogram Form

## Current State Analysis

### File Size Overview
```
Large files (>200 lines):
- App.jsx: 353 lines ⚠️ [Extract business logic]
- TimeSlotObservation.jsx: 257 lines ✅ [Refactored - was 417 lines]
- useFormValidation.js: 246 lines ⚠️ [Could be split]

Medium files (100-200 lines):
- MetadataSection.jsx: 159 lines [Good size, minor cleanup]
- timeUtils.js: 95 lines [Good size]
- PerchDiagramModal.jsx: 83 lines [Good size]

Small files (<100 lines):
- constants.js: 79 lines [Good, could grow with more behaviors]
- timezoneUtils.js: 82 lines [Good size]
- localStorageUtils.js: 73 lines [Good size]
- observationUtils.js: 47 lines [Good size]
- debounce.js: 21 lines [Perfect]
- OutputPreview.jsx: 15 lines [Perfect]
```

### Architecture Strengths
✅ Clear separation of concerns (utils, hooks, components, constants)
✅ Good test coverage (101 tests passing)
✅ Centralized validation logic in custom hook
✅ Single source of truth for domain data (constants.js)
✅ Utilities are focused and testable
✅ Time logic properly abstracted

### Architecture Pain Points
⚠️ **TimeSlotObservation.jsx** is a "mega component" with:
  - Complex conditional rendering logic
  - Multiple state concerns (modal, debouncing, field values)
  - Repeated handler patterns across 8+ fields
  - Mix of behavior, location, object, animal, interaction type logic
  - 400+ lines makes testing and reasoning difficult

⚠️ **App.jsx** mixes concerns:
  - State management (metadata, observations, errors)
  - Business logic (form submission, validation orchestration)
  - Effect management (localStorage autosave, draft restoration)
  - Slot generation and manipulation
  - Renders layout structure
  
⚠️ **useFormValidation.js** does a lot:
  - Validation rules for metadata
  - Validation rules for observations
  - Location validation logic
  - Error state management
  - Could be split into domain-specific validators

⚠️ **Lack of types** - no PropTypes or TypeScript, making refactoring riskier

---

## Refactoring Philosophy

### Guiding Principles
1. **Incremental & testable**: Each refactor should be a separate commit with passing tests
2. **No behavior changes**: Pure structural refactoring - functionality stays identical
3. **Backward compatible**: No breaking changes to public interfaces
4. **Documentation first**: Update docs before/during refactoring, not after
5. **Test everything**: Maintain 100% test pass rate, add tests for new modules

### Anti-patterns to avoid
❌ "Big bang" refactors that touch everything at once
❌ Refactoring + new features in same commit
❌ Breaking existing tests without fixing them
❌ Creating abstractions before you need them (YAGNI)
❌ Over-engineering - keep it simple

---

## Proposed Refactoring Phases

### Phase 0: Documentation & Preparation ✅ COMPLETED
**Goal**: Get documentation to a "ready state" before refactoring begins

**Tasks**:
- [x] Audit existing docs (README.md, CONTRIBUTING.md, DEVELOPMENT.md, copilot-instructions.md)
- [x] Update README with current architecture diagram
- [x] Document component props and responsibilities
- [x] Document utility function signatures and examples
- [x] Create ARCHITECTURE.md describing current state
- [x] Update copilot-instructions.md with any new patterns
- [ ] Create ADR (Architecture Decision Record) template for tracking decisions (deferred)

**Branch**: `claude/phase-0-docs-01HK6Tx1qfosgxAPKUaRpdo9`
**Actual effort**: ~2 hours
**Commits**: 3 documentation commits
**Status**: ✅ Completed and merged

---

### Phase 1: Add PropTypes / Runtime Validation ✅ COMPLETED
**Goal**: Add runtime type checking before structural changes

**Why**: Makes refactoring safer by catching prop mismatches immediately

**Tasks**:
- [x] Install `prop-types` package (already installed)
- [x] Add PropTypes to TimeSlotObservation
- [x] Add PropTypes to MetadataSection
- [x] Add PropTypes to PerchDiagramModal
- [x] Add PropTypes to OutputPreview
- [x] Add PropTypes to App (for any extracted components)
- [x] Document prop types in component docs (via PropTypes themselves)
- [x] Fix timezone test to handle UTC in CI environments
- [x] Improve PropTypes specificity per code review feedback

**Branch**: `claude/phase-1-proptypes-01HK6Tx1qfosgxAPKUaRpdo9`
**Actual effort**: ~1.5 hours
**Tests**: All 101 tests passing, fixed 1 timezone test
**Commits**: 3 commits (PropTypes + test fix + specificity improvements)
**Status**: ✅ Completed and merged

---

### Phase 2: Extract Reusable Form Components from TimeSlotObservation ✅ COMPLETED
**Goal**: Break down the 417-line mega component into composable pieces

**New components extracted**:
```
src/components/form/
  ├── BehaviorSelect.jsx          (37 lines)
  ├── LocationInput.jsx           (69 lines - includes Map button + modal state)
  ├── ObjectSelect.jsx            (71 lines - includes conditional "other" field)
  ├── AnimalSelect.jsx            (71 lines - includes conditional "other" field)
  ├── InteractionTypeSelect.jsx   (71 lines - includes conditional "other" field)
  ├── DescriptionField.jsx        (33 lines)
  ├── NotesField.jsx              (27 lines)
  └── index.js                    (8 lines - barrel export)
```

**TimeSlotObservation.jsx reduced to container** (257 lines, was 417):
- Imports field components via barrel export
- No longer owns modal state (moved to LocationInput)
- Coordinates conditional visibility based on behavior
- Manages handlers for onChange, onValidate, debouncing
- Handles "Copy to next" button
- All PropTypes maintained

**Results**:
- Reduced TimeSlotObservation by 160 lines (~38% reduction)
- All form fields now reusable, composable components
- Each component has PropTypes for type safety
- Consistent patterns across similar fields
- Clearer separation of concerns

**Branch**: `claude/phase-2-extract-components-01HK6Tx1qfosgxAPKUaRpdo9`
**Actual effort**: ~3 hours
**Tests**: All 101 tests passing (no new tests added - existing integration tests cover extracted components)
**Commits**: 7 commits (directory + 5 extractions + AnimalSelect/InteractionTypeSelect pair + barrel export)
**Status**: ✅ Completed - pending review in comprehensive PR

---

### Phase 3: Extract Business Logic from App.jsx
**Goal**: Move business logic out of the main component into focused modules

**New modules**:
```
src/services/
  ├── formStateManager.js    (manage observations state, slot generation)
  ├── formSubmission.js      (validation orchestration, output generation)
  └── draftManager.js        (localStorage save/restore logic)

src/hooks/
  ├── useFormState.js        (encapsulate form state + operations)
  └── useAutoSave.js         (encapsulate autosave effect)
```

**App.jsx becomes a coordinator** (~150 lines):
- Uses custom hooks for state/effects
- Delegates to service modules for operations
- Focuses on rendering layout
- Cleaner component hierarchy

**Benefits**:
- Business logic is testable without rendering React
- Easier to add new submission targets (email, API, etc.)
- State management is encapsulated
- App.jsx is more readable

**Branch**: `refactor/extract-business-logic`
**Estimated effort**: 3-4 hours
**Tests**: 
- Add unit tests for new service modules (3 new test files)
- Add tests for new hooks (2 new test files)
- Ensure existing integration tests still pass
**Commits**: One commit per extracted module/hook (5 commits)

---

### Phase 4: Split useFormValidation Hook
**Goal**: Break validation logic into domain-specific validators

**New structure**:
```
src/hooks/validation/
  ├── useFormValidation.js           (main hook, orchestrates others)
  ├── useMetadataValidation.js       (observer, date, times)
  ├── useBehaviorValidation.js       (behavior-specific rules)
  ├── useLocationValidation.js       (location/perch validation)
  ├── useDescriptionValidation.js    (description requirements)
  └── validators/
      ├── locationValidator.js       (pure function for location logic)
      ├── timeRangeValidator.js      (pure function for time logic)
      └── index.js
```

**Benefits**:
- Each validator is focused and testable
- Easier to add new validation rules
- Clear separation between validation logic and error state management
- Can reuse validators outside React (e.g., server-side)

**Branch**: `refactor/split-validation-logic`
**Estimated effort**: 3-4 hours
**Tests**: 
- Split existing validation tests across new modules
- Add tests for pure validator functions
- Ensure all 101+ tests still pass
**Commits**: One commit per extracted validator (5-6 commits)

---

### Phase 5: Improve Constants Organization
**Goal**: Make constants more maintainable as the behavior list grows

**New structure**:
```
src/constants/
  ├── index.js                      (re-exports everything)
  ├── behaviors.js                  (BEHAVIORS array with metadata)
  ├── locations.js                  (VALID_PERCHES, perch groupings)
  ├── interactions.js               (INANIMATE_OBJECTS, ANIMAL_TYPES, INTERACTION_TYPES)
  └── validation.js                 (validation-related constants)
```

**Add behavior helpers**:
```javascript
// src/constants/behaviorHelpers.js
export const getBehaviorByValue = (value) => ...
export const requiresLocation = (behaviorValue) => ...
export const requiresDescription = (behaviorValue) => ...
export const requiresObject = (behaviorValue) => ...
```

**Benefits**:
- Easier to find and update domain data
- Helpers reduce repeated lookups in components
- Better organization as behavior list grows
- Can add behavior categories/groupings easily

**Branch**: `refactor/organize-constants`
**Estimated effort**: 2 hours
**Tests**: 
- Add tests for behavior helpers
- Update imports across codebase
- Ensure all tests still pass
**Commits**: 2-3 commits (split constants, add helpers, update imports)

---

### Phase 6: Add Form Submission Infrastructure (NEW FEATURE)
**Goal**: Build the submission pipeline (Excel generation + email)

**Note**: This is where refactoring meets new features. By this point, codebase is well-structured.

**New modules**:
```
src/services/export/
  ├── excelGenerator.js          (convert form data → Excel file)
  ├── emailService.js            (send Excel via email)
  └── __tests__/

src/hooks/
  ├── useFormSubmission.js       (handle submit flow: validate → export → email)
```

**Dependencies to add**:
- `xlsx` or `exceljs` for Excel generation
- Email service integration (TBD - maybe Formspree, EmailJS, or backend API)

**Branch**: `feature/form-submission`
**Estimated effort**: 6-8 hours (depends on email service choice)
**Tests**: Comprehensive tests for export and submission
**Commits**: Multiple commits for export, email, integration

---

## Testing Strategy During Refactoring

### Before each refactor phase:
1. ✅ Ensure all tests pass (`npm test`)
2. ✅ Run manual smoke test (fill form, validate, submit)
3. ✅ Create feature branch
4. ✅ Document what you're about to change

### During refactoring:
1. Extract one piece at a time
2. Update tests immediately for extracted code
3. Run tests after each extraction
4. Fix any broken tests before moving on
5. Commit when tests pass

### After each refactor phase:
1. ✅ All tests pass
2. ✅ Manual smoke test passes
3. ✅ No console errors
4. ✅ Update documentation
5. ✅ Create PR with detailed description
6. ✅ Deploy preview and test on mobile
7. ✅ Merge to main

---

## Risk Assessment & Mitigation

### High Risk Areas
🔴 **TimeSlotObservation.jsx refactor**
- Risk: Breaking conditional field visibility logic
- Mitigation: Extract one field at a time, test thoroughly
- Rollback plan: Git revert to before refactor

🔴 **Validation hook split**
- Risk: Breaking existing validation behavior
- Mitigation: Keep existing tests, ensure they all pass
- Rollback plan: Git revert to before refactor

### Medium Risk Areas
🟡 **App.jsx business logic extraction**
- Risk: Breaking state management or autosave
- Mitigation: Extract services first, then hooks, test each step
- Rollback plan: Git revert individual commits

🟡 **PropTypes addition**
- Risk: Discovering prop mismatches that need fixing
- Mitigation: Add PropTypes incrementally, fix issues immediately
- Rollback plan: Easy - just remove PropTypes

### Low Risk Areas
🟢 **Documentation updates** - No code changes
🟢 **Constants reorganization** - Pure data, easy to test
🟢 **New submission feature** - Additive, doesn't change existing code

---

## Decision: Sequential vs Parallel Phases

**Recommendation**: Do phases **sequentially** in order listed.

**Why**:
- Phase 0 (docs) provides foundation for understanding current state
- Phase 1 (PropTypes) makes subsequent refactors safer
- Phase 2 (extract components) is foundation for easier state management
- Phase 3 (business logic) benefits from cleaner component tree
- Phase 4 (validation split) is easier when components are smaller
- Phase 5 (constants) is low-risk cleanup after major changes
- Phase 6 (submission) is new feature on clean foundation

**Timeline estimate**: ~20-25 hours total for phases 0-5, then 6-8 for phase 6

---

## Measuring Success

### Quantitative metrics:
- [ ] Average file size reduces from ~150 lines to ~80 lines
- [ ] TimeSlotObservation.jsx reduces from 417 → ~100 lines
- [ ] App.jsx reduces from 353 → ~150 lines
- [ ] Test count increases from 101 → ~150+ tests
- [ ] Test coverage remains ≥90%
- [ ] No decrease in functionality

### Qualitative metrics:
- [ ] New contributors can understand component responsibilities faster
- [ ] Adding new behaviors requires fewer file changes
- [ ] Bug fixes are more localized (don't require touching multiple files)
- [ ] Form submission feature is easier to add on clean foundation
- [ ] Documentation is comprehensive and up-to-date

---

## Alternative Approaches Considered

### TypeScript Migration
**Pros**: Compile-time type safety, better IDE support, refactoring tools
**Cons**: Significant effort (~40+ hours), learning curve, tooling changes
**Decision**: Deferred - use PropTypes for now, revisit TypeScript later

### State Management Library (Redux/Zustand)
**Pros**: Centralized state, time-travel debugging, clear data flow
**Cons**: Overkill for current scale, adds complexity, more boilerplate
**Decision**: Not needed yet - React state + custom hooks are sufficient

### Form Library (React Hook Form/Formik)
**Pros**: Battle-tested validation, form state management, less code
**Cons**: Would require rewriting validation logic, less control, learning curve
**Decision**: Not worth it - custom validation is working well and domain-specific

### Component Library (MUI/Chakra)
**Pros**: Consistent design, accessibility, less CSS to write
**Cons**: Bundle size, learning curve, less control over styling
**Decision**: Not needed - current CSS approach is working fine

---

## Open Questions & Decisions Needed

1. **Should we add TypeScript after PropTypes phase?**
   - My take: Defer until after Phase 5, then evaluate
   - Alternative: Add TypeScript in Phase 1 instead of PropTypes

2. **Where should Excel generation happen?**
   - Client-side: Simpler, no backend needed, works offline
   - Server-side: More control, can handle large datasets, server validates
   - My take: Start client-side, move to server if needed

3. **Email service choice?**
   - Formspree: Easy, no backend, limited free tier
   - EmailJS: Similar to Formspree, different pricing
   - Custom backend: Most control, more effort
   - My take: Start with Formspree or EmailJS, evaluate after testing

4. **Should we add a component library eventually?**
   - My take: No immediate need, custom components work well
   - Revisit if design requirements become complex

5. **How to handle multiple animals observation?**
   - User flagged this as "needs product discussion"
   - Options: Allow multiple animal selects, free text, separate observation slots
   - Decision: Defer until after Phase 5 refactoring complete

---

## Next Immediate Steps

1. **Review this document** - Does the strategy make sense? Any changes needed?
2. **Start Phase 0** - Audit and update documentation
3. **Create tracking issues** - GitHub issues for each phase?
4. **Set up project board** - Track progress visually?
5. **Schedule refactoring time** - Block out time to focus on this

---

## Notes & Observations

- Current codebase is in good shape - not "broken", just could be more maintainable
- Test suite is excellent foundation for safe refactoring
- No immediate deadline pressure - can take time to do it right
- User values incremental progress and good documentation ✅
- This refactoring will pay off when adding submission feature and beyond
