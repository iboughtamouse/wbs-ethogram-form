# App.jsx Refactoring Plan

**Created:** November 30, 2025  
**Status:** Planning  
**Goal:** Modularize App.jsx to improve maintainability before implementing backend integration

---

## Current State Analysis

**File:** `src/App.jsx`  
**Lines:** 398 lines  
**Issues:**

- Too many responsibilities in one component
- 11+ pieces of local state
- Multiple handler functions mixing concerns
- Will grow significantly with backend integration features
- Hard to test individual pieces
- No TypeScript to help with structure

---

## Proposed Structure

### 1. Extract Submission Logic → `useSubmission` Hook

**Current state in App.jsx:**

```javascript
const [showSubmissionModal, setShowSubmissionModal] = useState(false);
const [submissionState, setSubmissionState] = useState(SUBMISSION_STATES.GENERATING);
const [submissionEmail, setSubmissionEmail] = useState('');
const [emailError, setEmailError] = useState('');
const [submissionError, setSubmissionError] = useState('');
const [isTransientError, setIsTransientError] = useState(false);

const handleGenerateExcel = async () => { ... }
const handleEmailChange = (value) => { ... }
const handleEmailSubmit = async () => { ... }
const handleRetry = () => { ... }
const handleDownload = async () => { ... }
const handleModalClose = () => { ... }
```

**New hook:** `src/hooks/useSubmission.js`

```javascript
export function useSubmission(formData) {
  // All submission-related state
  // All submission-related handlers
  return {
    // State
    showModal,
    submissionState,
    submissionError,
    observationId, // NEW for backend integration

    // Actions
    handleSubmit, // NEW: calls API immediately
    handleDownload, // Download from backend or locally
    handleShare, // NEW: share via email
    handleRetry,
    handleClose,
  };
}
```

**Benefits:**

- Isolates all submission logic
- Easy to test independently
- Clear interface for App.jsx
- Ready for backend integration changes

---

### 2. Extract Form Handlers → `useFormHandlers` Hook

**Current state in App.jsx:**

```javascript
const onMetadataChange = (field, value, shouldValidate) => { ... }
const onObservationChange = (time, field, value) => { ... }
const onObservationValidate = (time, field, currentValue) => { ... }
const onCopyToNext = (time) => { ... }
const handleReset = () => { ... }
```

**New hook:** `src/hooks/useFormHandlers.js`

```javascript
export function useFormHandlers(
  metadata,
  observations,
  handleMetadataChange,
  handleObservationChange,
  handleCopyToNext,
  resetForm,
  validateSingleMetadataField,
  validateSingleObservationField,
  validateObservationSlot,
  clearFieldError,
  clearAllErrors
) {
  return {
    onMetadataChange,
    onObservationChange,
    onObservationValidate,
    onCopyToNext,
    onReset,
  };
}
```

**Benefits:**

- Groups related handlers
- Validation logic stays with handlers
- Reduces App.jsx complexity
- Easy to modify handler behavior

---

### 3. Simplify App.jsx

**New App.jsx structure (~150 lines):**

```javascript
function App() {
  // Core hooks
  const formState = useFormState();
  const formValidation = useFormValidation();
  const autoSave = useAutoSave(formState.metadata, formState.observations, ...);
  const formHandlers = useFormHandlers(formState, formValidation);
  const submission = useSubmission(formState);

  // Minimal local state
  const [showOutput, setShowOutput] = useState(false);

  return (
    <div className="app">
      <header>...</header>
      <main>
        <form onSubmit={submission.handleSubmit}>
          <MetadataSection {...formHandlers} {...formValidation} />

          {formState.timeSlots.map(time => (
            <TimeSlotObservation key={time} {...} />
          ))}

          <OutputPreview {...} />
        </form>
      </main>

      <SubmissionModal {...submission} />
    </div>
  );
}
```

---

## Implementation Steps

### Phase 1: Extract Submission Logic ✅

1. Create `src/hooks/useSubmission.js`
2. Move all submission state and handlers
3. Write tests for the hook
4. Update App.jsx to use the hook
5. Verify existing tests still pass

### Phase 2: Extract Form Handlers ✅

1. Create `src/hooks/useFormHandlers.js`
2. Move handler functions
3. Write tests for the hook
4. Update App.jsx to use the hook
5. Verify existing tests still pass

### Phase 3: Backend Integration 🔄

With cleaner structure, implement:

1. Update `useSubmission` for new flow (submit → API → success modal)
2. Add download functionality
3. Add share functionality
4. Update modal states
5. Write integration tests (properly this time)

---

## Testing Strategy

### Hook Tests

**useSubmission.test.js:**

- Test state transitions (GENERATING → READY → SUCCESS)
- Test error handling (network vs API errors)
- Test retry logic
- Mock API calls

**useFormHandlers.test.js:**

- Test validation timing (onChange vs onBlur)
- Test copy-to-next with validation
- Test error clearing
- Test reset functionality

### Integration Tests

Write AFTER implementation is working:

- Test full submission flow end-to-end
- Test error recovery
- Test download/share functionality

---

## Migration Path

1. **No breaking changes** - Refactor internal structure only
2. **Incremental** - One hook at a time
3. **Test after each step** - Keep tests green
4. **Commit after each phase** - Clear history

---

## Benefits of This Approach

1. **Smaller, focused files** - Easier to understand
2. **Better testability** - Test hooks in isolation
3. **Clearer responsibilities** - Each hook has one job
4. **Easier to modify** - Backend changes isolated to useSubmission
5. **More maintainable** - Reduced complexity
6. **Better for collaboration** - Clear boundaries

---

## Questions to Resolve

1. Should we extract handlers in Phase 2 or just live with them in App.jsx?
2. Do we need a separate `useOutputPreview` hook or keep it simple?
3. Should draft management stay in `useAutoSave` or move to `useFormState`?

---

## Next Steps

1. Review this plan
2. Discuss and refine approach
3. Start with Phase 1 (useSubmission)
4. Write tests as we go (properly, not committing failures)
5. Keep existing functionality working throughout
