# Data Shape Alignment Analysis

**Created:** November 30, 2025  
**Purpose:** Analyze the impact of aligning frontend data structure with backend expectations

---

## Current Situation

### Frontend Data Structure (Current)
```javascript
// State in useFormState.js
observations: {
  "14:00": {
    behavior: "resting_alert",
    location: "12",
    notes: "Alert",
    object: "",
    objectOther: "",
    animal: "",
    animalOther: "",
    interactionType: "",
    interactionTypeOther: "",
    description: ""
  },
  "14:05": {
    behavior: "preening",
    location: "12",
    notes: "",
    // ... same structure
  }
}
```

### Backend Expects (API Specification)
```javascript
// POST /api/observations/submit
{
  timeSlots: {
    "14:00": [{  // Array of subjects!
      subjectType: "foster_parent",
      subjectId: "Sayyida",
      behavior: "resting_alert",
      location: "12",
      notes: "Alert",
      object: "",
      // ... etc
    }],
    "14:05": [{
      subjectType: "foster_parent",
      subjectId: "Sayyida",
      behavior: "preening",
      // ... etc
    }]
  }
}
```

### Current Workaround
The backend **already handles this mismatch** via `transformObservations()` in `observations.ts`:

```typescript
// Backend transforms flat → array format
function transformObservations(
  flatObservations: Record<string, z.infer<typeof observationSchema>>,
  patient: string
): Record<string, SubjectObservation[]> {
  // Wraps each observation in array with subjectType/subjectId
}
```

**Comment in code says:**
> "TODO: Remove this transformation when frontend sends array format (Phase 4 multi-subject)"

---

## Analysis: Where Observations Are Used

### 1. **State Management** (`useFormState.js`)
- **Current:** `observations` is object keyed by time
- **Access Pattern:** `observations[time]` returns flat object
- **Impact:** Would change to `observations[time][0]` for single subject

### 2. **State Updates** (`formStateManager.js`)
```javascript
// Current
export const updateObservationField = (observations, time, field, value) => {
  const currentObservation = observations[time] || createEmptyObservation();
  // Updates observations[time].behavior = value
}
```
- **Impact:** Would need to update `observations[time][0].behavior = value`

### 3. **Validation** (`useFormValidation.js`)
```javascript
// Current
const observation = observations[time];
const behaviorValue = observation.behavior;
```
- **Impact:** Would change to `observations[time][0].behavior`

### 4. **Display** (`App.jsx`, `TimeSlotObservation.jsx`)
```javascript
// Current
observation={observations[time]}
```
- **Impact:** Would change to `observation={observations[time][0]}`

### 5. **Copy to Next** (`observationUtils.js`)
```javascript
// Current
updatedObservations[nextTime] = { ...observations[currentTime] };
```
- **Impact:** Would change to `updatedObservations[nextTime] = [{ ...observations[currentTime][0] }]`

### 6. **Autosave** (`useAutoSave.js`)
- **Current:** Saves flat structure to localStorage
- **Impact:** Would save array structure instead

### 7. **Form Submission** (`formSubmission.js`)
- **Current:** Sends flat structure, backend transforms
- **Impact:** Would send array structure directly

### 8. **Excel Generation** (`excelGenerator.js`)
- **Current:** Reads flat structure
- **Impact:** Would read array structure `[time][0]`

### 9. **Tests** (All `*.test.js` files)
- **Current:** Mock data uses flat structure
- **Impact:** ALL test fixtures would need updating

---

## Two Possible Approaches

### Option A: Transform at Submission Only (MINIMAL CHANGE)
**What:** Keep internal state flat, transform only when sending to backend

**Changes Required:**
- ✅ Update `formSubmission.js` to wrap observations in arrays with subject info
- ✅ Remove `patient` from metadata (use from transformed observations)
- ✅ Update submission tests

**Pros:**
- ✅ Minimal code changes (~20 lines)
- ✅ No changes to state management, validation, or display
- ✅ Most tests unchanged
- ✅ Autosave structure unchanged (no migration needed)

**Cons:**
- ⚠️ Temporary solution - will need refactor later for multi-subject
- ⚠️ Backend still has transformation code (but marked as TODO)

**Estimated Effort:** 1-2 hours

---

### Option B: Refactor Entire State Shape (COMPREHENSIVE)
**What:** Change internal state to use array structure everywhere

**Changes Required:**
- Update `formStateManager.js` - `createEmptyObservation()` returns array
- Update `useFormState.js` - initialize with array structure
- Update `formStateManager.js` - all updates work on `[time][0]`
- Update `useFormValidation.js` - access `observations[time][0].behavior`
- Update `App.jsx` - pass `observations[time][0]` to components
- Update `observationUtils.js` - copy array structure
- Update `useAutoSave.js` - handle array structure in localStorage
- Update `excelGenerator.js` - read from array structure
- Update `formSubmission.js` - send array structure directly
- Update ALL test fixtures (37 files with observation data)
- Add localStorage migration for existing drafts

**Pros:**
- ✅ Future-proof for Phase 4 multi-subject observations
- ✅ Aligns with backend data model
- ✅ Removes backend transformation code

**Cons:**
- ❌ High risk of bugs (touches ~30 files)
- ❌ Breaks existing autosaved drafts (needs migration)
- ❌ Time-consuming (~8-12 hours)
- ❌ Large test update effort

**Estimated Effort:** 8-12 hours

---

## Impact on Features

### Autosave/Draft Recovery
**Current:** Works with flat structure
**Option A:** No change needed
**Option B:** Needs localStorage migration logic:
```javascript
// Detect old format and convert
if (savedData && !Array.isArray(savedData.observations[firstTime])) {
  // Migrate flat → array
}
```

### Copy to Next
**Current:** Copies flat object
**Option A:** No change needed
**Option B:** Copy array instead of flat object

### Validation
**Current:** Validates flat structure
**Option A:** No change needed
**Option B:** Access `[time][0]` everywhere

---

## Recommendation: **Option A (Transform at Submission)**

### Rationale

1. **Production is Working:** Backend transformation already handles this
2. **Low Risk:** Only touches submission layer
3. **Quick Win:** Can be done in 1-2 hours with tests
4. **Defer Complexity:** Multi-subject is Phase 4+, not needed now
5. **User Impact:** Zero - autosave, validation, UX all unchanged

### When to Do Option B

Wait until:
- Phase 4 actually needs multi-subject observations
- Have more time for comprehensive refactor
- Can do proper QA testing across all features
- Backend removes the transformation (confirming it's truly needed)

---

## Implementation Plan (Option A)

### Step 1: Update `formSubmission.js`
```javascript
export const prepareOutputData = (metadata, observations) => {
  // ... existing timezone conversion ...
  
  // Transform flat observations to array format
  const timeSlots = {};
  Object.entries(outputObservations).forEach(([time, obs]) => {
    timeSlots[time] = [{
      subjectType: 'foster_parent',
      subjectId: metadata.patient,  // Use from metadata
      ...obs  // Spread all existing fields
    }];
  });
  
  return {
    metadata: {
      ...outputMetadata,
      // Note: Keep patient in metadata for now, backend needs it
    },
    timeSlots,  // Changed from observations
    submittedAt: new Date().toISOString(),
  };
};
```

### Step 2: Update Submission Tests
- Update `useSubmission.test.js` to expect array format
- Update `downloadService.test.js` if needed
- Update integration tests in `tests/integration/`

### Step 3: Manual Testing
- Submit observation → verify in database
- Check Excel generation still works
- Test email delivery
- Verify download fallback

### Step 4: Deploy
- Merge to main
- Deploy frontend
- Verify production still works
- Backend can eventually remove transformation

---

## Open Questions

1. **Should we remove `patient` from metadata entirely?**
   - Backend uses it for transformation
   - But it's redundant (also in each time slot)
   - **Decision:** Keep for now, remove in Phase 4 refactor

2. **What about existing autosaved drafts?**
   - Option A: No impact (internal structure unchanged)
   - **Decision:** No migration needed

3. **Should we rename `observations` → `timeSlots` in internal state?**
   - For consistency with backend
   - **Decision:** No, keep as-is. Internal naming is fine.

---

## Risks & Mitigation

### Risk: Backend expects different format than documented
**Mitigation:** Check actual backend code (observations.ts) - already verified ✅

### Risk: Excel generation breaks
**Mitigation:** Backend generates Excel from database, not frontend data ✅

### Risk: Tests fail
**Mitigation:** Update test fixtures to match new submission format

### Risk: Email sending breaks
**Mitigation:** Backend handles email, just needs correct data structure ✅

---

## Success Criteria

- ✅ Frontend sends array format matching API spec
- ✅ All 561 tests passing
- ✅ Production submission works end-to-end
- ✅ Excel files generated correctly
- ✅ Emails delivered successfully
- ✅ Autosave/recovery still works
- ✅ No user-facing changes or regressions

---

## Timeline Estimate

**Option A (Recommended):**
- Code changes: 30 minutes
- Test updates: 30 minutes
- Manual testing: 30 minutes
- **Total: 1.5-2 hours**

**Option B (Comprehensive):**
- State refactor: 3-4 hours
- Validation updates: 1-2 hours
- Test updates: 2-3 hours
- Manual testing: 1 hour
- Bug fixes: 1-2 hours
- **Total: 8-12 hours**

---

## Next Steps

1. Get approval for Option A approach
2. Create branch `feat/align-submission-data-shape`
3. Update `formSubmission.js` with transformation
4. Update submission tests
5. Manual testing in dev
6. PR → Review → Merge → Deploy
7. Verify production
8. Document in backend TODO to remove transformation later
