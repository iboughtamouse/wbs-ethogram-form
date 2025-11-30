# Phase A: Backend Integration - Implementation Plan

**Created:** November 30, 2025
**Branch:** `feat/backend-integration`
**Status:** In Progress

---

## Overview

Connect frontend to deployed backend API with new submission flow:

1. Submit → Save to backend immediately (with WBS email)
2. Show success/failure in modal
3. Offer download/share options after successful save

---

## Current State (Branch Status)

✅ **Already completed:**

- Basic `submitObservation()` function calling `/api/observations/submit`
- Error categorization (transient vs permanent vs validation)
- Tests for API contract and error handling

❌ **Still TODO:**

- Environment variable for WBS email
- New submission flow (submit first, then offer options)
- Network error detection → local Excel fallback
- Success modal with download/share options
- Share endpoint integration
- Download endpoint integration

---

## Implementation Steps

### Step 1: Environment Variables ✅

**Files:**

- `.env.example`
- `README.md` (document env vars)

**Variables:**

```bash
VITE_WBS_EMAIL=your-test-email@example.com  # Dev/test
# Production (Vercel): production-recipient@example.org
```

### Step 2: Write Integration Tests 🔄

**File:** `tests/integration/BackendSubmission.test.jsx`

**Test scenarios:**

- ✅ Successful submission → shows success modal with options
- ✅ Network error → offers local Excel generation
- ✅ API validation error → shows error with retry
- ✅ API server error → shows error with retry
- ✅ Download after success → calls correct endpoint
- ✅ Share after success → validates email and calls share endpoint
- ✅ Share rate limit → shows appropriate message
- ✅ Local Excel includes offline notice

### Step 3: Update Submission States 🔄

**File:** `src/components/SubmissionModal.jsx`

**New states:**

```javascript
SUBMISSION_STATES = {
  SUBMITTING: 'submitting', // Calling /api/observations/submit
  SUCCESS: 'success', // Saved! Show download/share options
  NETWORK_ERROR: 'network_error', // Can't reach API, offer local Excel
  API_ERROR: 'api_error', // API returned error, show message + retry
};
```

### Step 4: Add Share API Function 🔄

**File:** `src/services/emailService.js`

**New function:**

```javascript
/**
 * Share observation via email (after successful submission)
 * @param {string} observationId - ID from successful submission
 * @param {string} email - Email address to share with
 * @returns {Promise<{success: boolean, message: string}>}
 */
export async function shareObservation(observationId, email) {
  // Calls POST /api/observations/:id/share
}
```

### Step 5: Add Download Function 🔄

**File:** `src/services/downloadService.js` (new file)

**Functions:**

```javascript
/**
 * Download Excel from backend
 * @param {string} observationId - ID from successful submission
 * @returns {Promise<void>}
 */
export async function downloadFromBackend(observationId) {
  // Calls GET /api/observations/:id/excel
}

/**
 * Generate and download Excel locally (fallback)
 * @param {Object} formData - Observation data
 * @param {boolean} isOffline - Add offline notice?
 * @returns {Promise<void>}
 */
export async function downloadLocally(formData, isOffline = false) {
  // Use existing excelGenerator
  // Add note if isOffline: "Generated offline - not submitted to WBS"
}
```

### Step 6: Update App.jsx Submit Handler 🔄

**File:** `src/App.jsx`

**Changes:**

```javascript
const handleSubmit = async () => {
  // 1. Validate form
  if (!validateForm(...)) return;

  // 2. Prepare data
  const outputData = prepareOutputData(metadata, observations);
  const wbsEmail = import.meta.env.VITE_WBS_EMAIL;

  // 3. Call API
  setSubmissionState(SUBMISSION_STATES.SUBMITTING);
  setShowSubmissionModal(true);

  const result = await submitObservation(outputData, [wbsEmail]);

  // 4. Handle result
  if (result.success) {
    setObservationId(result.id);
    setSubmissionState(SUBMISSION_STATES.SUCCESS);
  } else if (isNetworkError(result)) {
    setSubmissionState(SUBMISSION_STATES.NETWORK_ERROR);
  } else {
    setSubmissionState(SUBMISSION_STATES.API_ERROR);
    setSubmissionError(getErrorMessage(result));
  }
};
```

### Step 7: Update Modal UI 🔄

**File:** `src/components/SubmissionModal.jsx`

**Success state:**

```
✅ Observation saved!

Your observation has been saved and sent to WBS.

[Download Excel]  [Share via Email]

[Close]
```

**Network error state:**

```
❌ Couldn't reach server

Can't connect to the backend. You can download a local copy.

[Download Local Copy]  [Retry]

Note: Local copy will not be submitted to WBS.
```

**API error state:**

```
❌ Submission failed

[Error message from API]

[Retry]  [Download Local Copy]  [Close]
```

### Step 8: Update Tests 🔄

**Files:**

- Update existing tests that assume old flow
- Add tests for new download/share functionality
- Test network error detection
- Test local Excel generation with offline notice

### Step 9: Documentation 🔄

**Files:**

- Update `README.md` with env var instructions
- Update `docs/email-submission-feature.md` with new flow
- Document Vercel env var setup

### Step 10: Manual Testing ✅

- Test dev → local backend
- Test dev → Railway production
- Test Vercel → Railway production
- Test network error scenario (kill backend)
- Test all error states
- Test download functionality
- Test share functionality
- Test rate limiting

---

## Testing Strategy

### Unit Tests

- `emailService.test.js` - API calls, error categorization
- `downloadService.test.js` - Download functions
- `SubmissionModal.test.jsx` - Modal states and rendering

### Integration Tests

- `BackendSubmission.test.jsx` - Full submission flow
- Test all state transitions
- Test error handling
- Mock fetch for different scenarios

### E2E Testing

- Manual testing with real backend
- Test on staging (Vercel preview)
- Test in production

---

## Environment Setup

### Development

```bash
# .env
VITE_WBS_EMAIL=your-test-email@example.com
```

### Vercel Environment Variables

```
VITE_WBS_EMAIL=production-recipient@example.org
```

---

## Success Criteria

- [ ] All tests passing
- [ ] Submit → Backend → Success modal works
- [ ] Download from backend works
- [ ] Share to email works
- [ ] Network error → Local Excel works
- [ ] API errors show appropriate messages
- [ ] Rate limiting handled gracefully
- [ ] Documentation updated
- [ ] Manual e2e testing complete

---

## Notes

- Backend transformation layer stays in place for now (schema alignment is Phase B)
- Local Excel is fallback only, not primary path
- WBS email is hardcoded via env var, not user input
- Share endpoint is rate limited (3/hour per observation)
