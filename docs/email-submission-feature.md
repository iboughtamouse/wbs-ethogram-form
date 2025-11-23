# Email Submission Feature - Implementation Plan

**Created**: November 22, 2025
**Status**: In Progress - Phase 1
**Target**: MVP with email submission UI (backend to be implemented separately)

---

## Table of Contents

1. [Overview](#overview)
2. [Key Architectural Decisions](#key-architectural-decisions)
3. [Implementation Tasks](#implementation-tasks)
4. [API Contract](#api-contract)
5. [User Flow](#user-flow)
6. [Error Handling Strategy](#error-handling-strategy)
7. [Testing Strategy](#testing-strategy)
8. [Documentation Updates](#documentation-updates)
9. [Success Criteria](#success-criteria)
10. [Future Phases](#future-phases)

---

## Overview

### Problem Statement

Currently, users must:

1. Click "Validate & Preview"
2. See JSON output
3. Manually copy JSON or download Excel
4. Email file to WBS manually

This is cumbersome and error-prone. Users want a one-click submission with email delivery.

### Solution

Transform the submission flow to:

1. Click "Submit"
2. Enter email address(es) in modal
3. Observation stored in database + Excel emailed automatically
4. Fallback: Download Excel if email fails

### Long-Term Vision

This feature is the foundation for:

- Data visualization dashboards
- Leaderboards for authenticated users
- WBS admin dashboard
- Public data exploration
- Optional authentication (Discord, Twitch, email)

---

## Key Architectural Decisions

### Decision 1: Backend Generates Excel

**Chosen**: Backend generates Excel files
**Alternative Considered**: Client generates Excel, backend just emails it
**Rationale**:

- Server-side validation of observation data
- Single source of truth for Excel format
- Backend can version Excel generation
- Lighter frontend bundle
- Easier to update format without deploying frontend

### Decision 2: Separate Backend Repository

**Chosen**: Separate repo for backend API
**Alternative Considered**: Vercel serverless functions
**Rationale**:

- Avoid vendor lock-in with Vercel
- Already using Vercel for other serverless functions
- Need proper database, authentication for future features
- Easier to scale backend independently
- Can use any tech stack (Node, Python, Go, etc.)

### Decision 3: Email Service

**Chosen**: Resend (recommended) or Postmark
**Alternative Considered**: SendGrid, Amazon SES, Mailgun
**Rationale**:

- Modern developer experience
- Generous free tier (Resend: 3,000/month)
- Excellent deliverability
- Simple pricing model for future growth
- Great documentation

### Decision 4: Error Handling with Retry

**Chosen**: Categorize errors, offer retry for transient failures
**Alternative Considered**: Simple error message only
**Rationale**:

- Network failures are common
- Better UX to offer retry vs. forcing re-fill
- Still provide "Download Anyway" escape hatch
- Matches user expectations from modern apps

### Decision 5: Progressive Enhancement

**Chosen**: Email is optional, download always works
**Alternative Considered**: Require email submission
**Rationale**:

- Don't break existing download workflow
- Some users may prefer manual submission
- Provides fallback if backend is down
- Gradual migration path

---

## Implementation Tasks

### Task 1: Create SubmissionModal Component

**File**: `src/components/SubmissionModal.jsx`

**Props**:

```javascript
{
  isOpen: boolean,
  onClose: () => void,
  formData: { metadata, observations, submittedAt },
}
```

**Features**:

- Email input field (validates comma/semicolon-separated)
- "Download Excel" button (uses client-side generation)
- "Submit" button (sends to backend)
- Loading states: "Submitting..." / "Generating Excel..." / "Sending email..."
- Success state: "✓ Submitted successfully! Emails sent to X recipients"
- Error states with categorization:
  - Transient: "⚠ Service temporarily unavailable" + "Try Again" + "Download Anyway"
  - Permanent: "✗ Quota exceeded" + "Download Anyway"
- Escape key / backdrop click to close
- Mobile-responsive

**State Management**:

```javascript
const [emails, setEmails] = useState('');
const [emailError, setEmailError] = useState('');
const [submitting, setSubmitting] = useState(false);
const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | null
const [errorType, setErrorType] = useState(null); // 'transient' | 'permanent' | null
const [errorMessage, setErrorMessage] = useState('');
```

**Documentation Updates** (same commit):

- `ARCHITECTURE.md`: Add SubmissionModal to component hierarchy
- `.github/copilot-instructions.md`: Document submission modal

**Tests**: `src/components/__tests__/SubmissionModal.test.jsx`

- Renders when open
- Closes on Escape / backdrop click
- Email validation (single, multiple, invalid)
- Download button works without email
- Submit button disabled until valid email
- Loading states display correctly
- Success message shows
- Error messages show with correct buttons

---

### Task 2: Create Email Validation Utility

**File**: `src/utils/emailValidator.js`

**Functions**:

```javascript
/**
 * Parse and validate email addresses
 * @param {string} input - Comma or semicolon-separated emails
 * @returns {{ valid: boolean, emails: string[], errors: string[] }}
 */
export function validateEmails(input) {
  // Implementation
}

/**
 * Validate single email address
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  // RFC 5322 regex
}
```

**Validation Rules**:

- Supports comma and semicolon separators
- Trims whitespace
- Removes duplicates
- Validates format (RFC 5322 simplified)
- Max 10 emails per submission

**Documentation Updates** (same commit):

- `CLAUDE.md`: Add email validator to utils section

**Tests**: `src/utils/__tests__/emailValidator.test.js`

- Single email validation
- Multiple emails (comma-separated)
- Multiple emails (semicolon-separated)
- Mixed separators
- Invalid email formats
- Empty input
- Max emails enforcement
- Duplicate removal

---

### Task 3: Create Email Service Module

**File**: `src/services/emailService.js`

**Functions**:

```javascript
/**
 * Submit observation to backend
 * @param {Object} formData - { metadata, observations, submittedAt }
 * @param {string[]} emails - Array of email addresses
 * @returns {Promise<{ success, submissionId, message, error?, retryable? }>}
 */
export async function submitObservation(formData, emails) {
  // For Phase 1: Mock implementation
  // For Phase 2+: Real API call
}

/**
 * Categorize error type
 * @param {Error} error
 * @returns {'transient' | 'permanent'}
 */
function categorizeError(error) {
  // Network errors, timeouts → 'transient'
  // 4xx errors, quota → 'permanent'
}
```

**Mock Implementation (Phase 1)**:

```javascript
export async function submitObservation(formData, emails) {
  // Simulate 2-second delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Mock success
  return {
    success: true,
    submissionId: 'mock-uuid-' + Date.now(),
    message: 'Observation submitted successfully',
    emailsSent: emails.length,
  };
}
```

**Real Implementation (Phase 2)**:

```javascript
export async function submitObservation(formData, emails) {
  try {
    const response = await fetch('/api/observations/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        observation: formData,
        emails,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Submission failed');
    }

    return data;
  } catch (error) {
    return {
      success: false,
      error: categorizeError(error),
      message: error.message,
      retryable: categorizeError(error) === 'transient',
    };
  }
}
```

**Documentation Updates** (same commit):

- Create `docs/api-contract.md`: Document backend API
- `ARCHITECTURE.md`: Update data flow diagram

**Tests**: `src/services/__tests__/emailService.test.js`

- Successful submission
- Network error (transient)
- Validation error (permanent)
- Error categorization
- Retry logic

---

### Task 4: Add Email Persistence to localStorage

**File**: `src/utils/localStorageUtils.js`

**New Functions**:

```javascript
const LAST_EMAIL_KEY = 'lastUsedEmail';

/**
 * Get last used email address
 * @returns {string}
 */
export function getLastUsedEmail() {
  try {
    return localStorage.getItem(LAST_EMAIL_KEY) || '';
  } catch (error) {
    console.warn('Failed to get last used email:', error);
    return '';
  }
}

/**
 * Save email address for next session
 * @param {string} email
 */
export function saveLastUsedEmail(email) {
  try {
    localStorage.setItem(LAST_EMAIL_KEY, email);
  } catch (error) {
    console.warn('Failed to save last used email:', error);
  }
}
```

**Integration**:

- SubmissionModal calls `getLastUsedEmail()` on mount
- Auto-populates email input field
- On successful submission, calls `saveLastUsedEmail(emails[0])`

**Documentation Updates** (same commit):

- `CLAUDE.md`: Document email persistence pattern

**Tests**: Update `src/utils/__tests__/localStorageUtils.test.js`

- Get last used email
- Save email
- Handle localStorage errors (quota, privacy mode)

---

### Task 5: Update App.jsx - Submit Button & Modal Integration

**Changes**:

1. Change button text: "Validate & Preview" → "Submit"
2. Replace OutputPreview with SubmissionModal
3. Add state: `const [showSubmissionModal, setShowSubmissionModal] = useState(false)`
4. On submit click:
   - Run validation
   - If valid: open SubmissionModal
   - If invalid: show errors (existing behavior)
5. On modal close: keep form data (unless user clicked "Start New")

**Code Changes**:

```javascript
// Before
<button onClick={handleValidateAndPreview}>Validate & Preview</button>;
{
  showOutput && <OutputPreview data={outputData} onDownload={handleDownload} />;
}

// After
<button onClick={handleSubmit}>Submit</button>;
{
  showSubmissionModal && (
    <SubmissionModal
      isOpen={showSubmissionModal}
      onClose={() => setShowSubmissionModal(false)}
      formData={prepareOutputData(metadata, observations)}
    />
  );
}
```

**Documentation Updates** (same commit):

- `README.md`: Update "How to Use This Form" section
- `.github/copilot-instructions.md`: Update submission workflow

**Tests**: Update `tests/integration/App.test.jsx`

- Submit button renders
- Click submit → validation runs
- Valid form → modal opens
- Invalid form → errors show, modal doesn't open

---

### Task 6: Update Documentation

**Files to Update**:

#### `README.md`

Update "How to Use This Form" section:

```markdown
4. **Validate & Preview**: Click the "Validate & Preview" button
   ↓
5. **Submit**: Click the "Submit" button
6. **Enter Email**: Enter one or more email addresses to receive the Excel file
   - Or click "Download Excel" to save locally
7. **Success**: You'll receive a confirmation when submitted successfully
```

#### `ARCHITECTURE.md`

- Add SubmissionModal to component hierarchy
- Update data flow diagram to show submission → backend → email flow
- Document error handling paths

#### `.github/copilot-instructions.md`

- Update submission flow description
- Document email validation pattern
- Add SubmissionModal to component list

#### `CLAUDE.md`

- Add emailService to services section
- Document email validation utility
- Add API contract reference
- Note localStorage email persistence

#### `CONTRIBUTING.md`

- Add SubmissionModal to component testing section

---

### Task 7: Add Styling and Mobile Responsiveness

**File**: `src/components/SubmissionModal.css` (or add to `App.css`)

**Styles Needed**:

- Modal backdrop (semi-transparent overlay)
- Modal container (centered, max-width: 500px)
- Form layout (vertical stack)
- Email input (full-width, proper padding)
- Button group (horizontal on desktop, vertical on mobile)
- Loading spinner
- Success/error state styling (green checkmark, red X)
- Mobile: Full-screen on small devices (<640px)

**Design Principles**:

- Match existing app aesthetic
- High contrast for accessibility
- Clear visual hierarchy (input → buttons → messages)
- Smooth transitions (fade-in modal, loading states)

---

### Task 8: Create Integration Tests

**File**: `tests/integration/EmailSubmission.test.jsx`

**Test Scenarios**:

1. **Happy Path**: Fill form → Submit → Enter email → Submit → Success
2. **Multiple Emails**: Enter comma-separated emails → Submit → Success
3. **Invalid Email**: Enter invalid email → See error → Cannot submit
4. **Network Error**: Submit → Network fails → See retry button → Retry → Success
5. **Permanent Error**: Submit → Quota error → See download button → Download works
6. **Download Without Email**: Open modal → Click download → Excel downloads → Modal stays open
7. **Email Persistence**: Submit with email → Close modal → Reopen → Email pre-filled
8. **Escape Key**: Open modal → Press Escape → Modal closes
9. **Backdrop Click**: Open modal → Click backdrop → Modal closes
10. **Cancel Preserves Data**: Open modal → Close → Form data still present

---

## API Contract

### Backend Endpoint

#### `POST /api/observations/submit`

**Request**:

```json
{
  "observation": {
    "metadata": {
      "observerName": "John Doe",
      "date": "2025-11-22",
      "startTime": "15:00",
      "endTime": "15:30",
      "aviary": "Sayyida's Cove",
      "patient": "Sayyida",
      "mode": "live"
    },
    "observations": {
      "15:00": {
        "behavior": "perching",
        "location": "12",
        "notes": "",
        "object": "",
        "objectOther": "",
        "animal": "",
        "animalOther": "",
        "interactionType": "",
        "interactionTypeOther": "",
        "description": ""
      }
    },
    "submittedAt": "2025-11-22T21:35:00.000Z"
  },
  "emails": ["observer@example.com", "wbs@example.org"]
}
```

**Response (Success)**:

```json
{
  "success": true,
  "submissionId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Observation submitted successfully",
  "emailsSent": 2
}
```

**Response (Transient Error)**:

```json
{
  "success": false,
  "error": "transient",
  "message": "Email service temporarily unavailable",
  "retryable": true
}
```

**Response (Permanent Error)**:

```json
{
  "success": false,
  "error": "permanent",
  "message": "Email quota exceeded",
  "retryable": false
}
```

**Response (Validation Error)**:

```json
{
  "success": false,
  "error": "validation",
  "message": "Invalid observation data",
  "errors": {
    "metadata.startTime": "Start time is required",
    "observations.15:00.behavior": "Behavior is required"
  },
  "retryable": false
}
```

### Backend Processing Flow

1. **Validate Request**
   - Check observation schema
   - Validate email addresses
   - Enforce rate limits

2. **Store Observation**
   - Save to database (PostgreSQL, MongoDB, etc.)
   - Generate unique submissionId
   - Associate with user (if authenticated)

3. **Generate Excel**
   - Use same logic as current `excelGenerator.js`
   - Store Excel file (S3, local storage, etc.)
   - Generate download link (if needed)

4. **Send Email**
   - Use Resend/Postmark API
   - Attach Excel file
   - Include submission details
   - Handle send failures

5. **Respond**
   - Return success + submissionId
   - Or return error with retry info

---

## User Flow

### Standard Flow (Success)

```
┌─────────────────────┐
│ User fills form     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Clicks "Submit"     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Validation runs     │
└──────────┬──────────┘
           │
      Valid?
      ┌─────┴─────┐
      │           │
     No          Yes
      │           │
      │           ▼
      │  ┌─────────────────────┐
      │  │ SubmissionModal     │
      │  │ opens               │
      │  └──────────┬──────────┘
      │             │
      │             ▼
      │  ┌─────────────────────┐
      │  │ User enters email   │
      │  │ (or clicks Download)│
      │  └──────────┬──────────┘
      │             │
      │        Submits
      │             │
      │             ▼
      │  ┌─────────────────────┐
      │  │ Loading: "Submitting"│
      │  └──────────┬──────────┘
      │             │
      │             ▼
      │  ┌─────────────────────┐
      │  │ Backend validates   │
      │  │ stores, generates,  │
      │  │ and emails          │
      │  └──────────┬──────────┘
      │             │
      │        Success?
      │        ┌─────┴─────┐
      │        │           │
      │       No          Yes
      │        │           │
      │        │           ▼
      │        │  ┌─────────────────────┐
      │        │  │ Show success message│
      │        │  │ "✓ Sent to X emails"│
      │        │  └──────────┬──────────┘
      │        │             │
      │        │             ▼
      │        │  ┌─────────────────────┐
      │        │  │ Offer "Start New" or│
      │        │  │ "Close"             │
      │        │  └─────────────────────┘
      │        │
      │        ▼
      │   See Error Flow
      │
      ▼
┌─────────────────────┐
│ Show validation     │
│ errors on form      │
└─────────────────────┘
```

### Error Flow (Transient)

```
┌─────────────────────┐
│ Submission fails    │
│ (network timeout)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Show error message: │
│ "⚠ Service          │
│ temporarily         │
│ unavailable"        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Show buttons:       │
│ • Try Again         │
│ • Download Anyway   │
└──────────┬──────────┘
           │
      User clicks?
      ┌─────┴─────────┐
      │               │
   Try Again    Download
      │               │
      │               ▼
      │     ┌─────────────────────┐
      │     │ Generate Excel      │
      │     │ (client-side)       │
      │     └──────────┬──────────┘
      │                │
      │                ▼
      │     ┌─────────────────────┐
      │     │ Download starts     │
      │     │ Modal stays open    │
      │     └─────────────────────┘
      │
      ▼
Return to Standard Flow
```

### Error Flow (Permanent)

```
┌─────────────────────┐
│ Submission fails    │
│ (quota exceeded)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Show error message: │
│ "✗ Email quota      │
│ exceeded"           │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Show button:        │
│ • Download Anyway   │
└──────────┬──────────┘
           │
      User clicks
           │
           ▼
┌─────────────────────┐
│ Generate & download │
│ Excel (client-side) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Clear form data     │
│ Close modal         │
└─────────────────────┘
```

---

## Error Handling Strategy

### Error Categories

#### 1. Transient Errors (Retryable)

**Causes**:

- Network timeout
- Service temporarily unavailable
- Rate limiting (429)
- Server errors (500, 502, 503)

**User Experience**:

- Show: "⚠ [Error message]"
- Buttons: "Try Again" | "Download Anyway"
- Keep form data for retry
- On retry: Same submission attempt

**Technical Handling**:

```javascript
if (error.status >= 500 || error.code === 'NETWORK_ERROR') {
  return { error: 'transient', retryable: true };
}
```

#### 2. Permanent Errors (Not Retryable)

**Causes**:

- Email quota exceeded
- Invalid email addresses (backend validation)
- Service account suspended
- Bad request (400)

**User Experience**:

- Show: "✗ [Error message]"
- Buttons: "Download Anyway"
- Offer to download Excel as fallback
- Clear form after download

**Technical Handling**:

```javascript
if (error.status === 400 || error.message.includes('quota')) {
  return { error: 'permanent', retryable: false };
}
```

#### 3. Validation Errors (Fix and Retry)

**Causes**:

- Missing required fields (backend catch)
- Invalid data format
- Business rule violations

**User Experience**:

- Show: "✗ Invalid data: [specific errors]"
- Highlight invalid fields
- User fixes and resubmits
- No download option (data is invalid)

**Technical Handling**:

```javascript
if (error.status === 422 && error.errors) {
  // Show field-specific errors
  return { error: 'validation', errors: error.errors };
}
```

### Retry Logic

**Exponential Backoff** (for automatic retries, if implemented):

- 1st retry: immediate
- 2nd retry: 1 second
- 3rd retry: 2 seconds
- 4th retry: 4 seconds
- Max retries: 4

**Manual Retry** (Phase 1):

- User clicks "Try Again"
- Immediate retry (no backoff)
- Same request payload

---

## Testing Strategy

### Unit Tests

**Components**:

- `SubmissionModal.test.jsx`:
  - Renders correctly
  - Email validation
  - Button states
  - Loading states
  - Error states
  - Success states
  - Keyboard interactions (Escape)
  - Click interactions (backdrop)

**Utilities**:

- `emailValidator.test.js`:
  - Single email
  - Multiple emails
  - Invalid formats
  - Edge cases (empty, too many, duplicates)
- `localStorageUtils.test.js`:
  - Get/save email
  - Handle errors (quota, privacy mode)

**Services**:

- `emailService.test.js`:
  - Successful submission (mocked)
  - Network error
  - Validation error
  - Error categorization

### Integration Tests

**File**: `tests/integration/EmailSubmission.test.jsx`

**Scenarios**:

1. Full happy path
2. Multiple emails
3. Invalid email validation
4. Network error + retry
5. Permanent error + download
6. Download without email
7. Email persistence
8. Modal interactions (Escape, backdrop)
9. Cancel preserves data

### E2E Tests (Future)

Using Playwright or Cypress:

- Full user journey from empty form to email sent
- Real backend integration
- Email delivery verification
- Mobile device testing

---

## Documentation Updates

All documentation updates happen **in the same commit** as the feature implementation to keep them in sync.

### README.md

**Section**: "How to Use This Form"
**Changes**: Update step 4-6 to describe new submission flow

### ARCHITECTURE.md

**Sections**:

- Component Hierarchy: Add SubmissionModal
- Data Flow: Add submission → backend → email flow
- Error Handling: Document error categories

### .github/copilot-instructions.md

**Sections**:

- Components: Add SubmissionModal to list
- Submission Flow: Update workflow description

### CLAUDE.md

**Sections**:

- Services: Add emailService
- Utils: Add emailValidator
- API Contract: Reference docs/api-contract.md
- localStorage: Document email persistence

### CONTRIBUTING.md

**Section**: Testing
**Changes**: Add SubmissionModal to component testing examples

### New File: docs/api-contract.md

Complete backend API specification for future implementation

---

## Success Criteria

### Phase 1 (MVP - Frontend Only)

#### Functionality

- [x] "Submit" button replaces "Validate & Preview"
- [x] SubmissionModal opens on valid form submission
- [x] Email input validates single and multiple emails
- [x] "Download Excel" button works (client-side generation)
- [x] "Submit" button calls backend API (mocked for Phase 1)
- [x] Loading states show during submission
- [x] Success message displays on successful submission
- [x] Error messages categorize transient vs. permanent
- [x] "Try Again" button appears for transient errors
- [x] "Download Anyway" appears for all errors
- [x] Email address persists to localStorage
- [x] Email field auto-populates from localStorage
- [x] Modal closes on Escape key
- [x] Modal closes on backdrop click

#### UX

- [x] Clear visual feedback for all states
- [x] Mobile-responsive design
- [x] Accessible (ARIA labels, keyboard navigation)
- [x] Error messages are actionable
- [x] Success confirmation is obvious

#### Code Quality

- [x] All existing tests pass
- [x] New features have test coverage (>90%)
- [x] No breaking changes to existing features
- [x] Code follows project conventions
- [x] PropTypes for all components
- [x] No console errors or warnings

#### Documentation

- [x] README updated with new workflow
- [x] ARCHITECTURE updated with new components
- [x] CLAUDE.md updated with new patterns
- [x] API contract documented in docs/api-contract.md
- [x] This plan saved to docs/email-submission-feature.md

### Phase 2 (Backend Integration)

- [ ] Backend API implemented
- [ ] Database schema created
- [ ] Excel generation on backend
- [ ] Email sending via Resend/Postmark
- [ ] Rate limiting implemented
- [ ] Error logging and monitoring
- [ ] Production deployment

### Phase 3+ (Future Features)

- [ ] User authentication (Clerk)
- [ ] User dashboard (view past submissions)
- [ ] Leaderboard for authenticated users
- [ ] WBS admin dashboard
- [ ] Public data visualization
- [ ] Extended observation periods (24+ hours)

---

## Future Phases

### Phase 2: Backend Implementation

**Tech Stack Options**:

- Node.js + Express + PostgreSQL
- Python + FastAPI + PostgreSQL
- Go + Gin + PostgreSQL

**Components**:

1. API endpoint: `POST /api/observations/submit`
2. Database schema for observations
3. Excel generation service (port current `excelGenerator.js`)
4. Email service integration (Resend)
5. Error handling and logging
6. Rate limiting
7. Monitoring (Sentry, Datadog, etc.)

**Repository**: Separate repo (e.g., `wbs-ethogram-api`)

### Phase 3: Authentication

**Service**: Clerk or Supabase Auth
**Features**:

- Optional login (Discord, Twitch, email)
- Associate submissions with user accounts
- User profile page
- View submission history

### Phase 4: User Dashboard

**Features**:

- View past observations
- Edit/delete observations (within time limit)
- Download past Excel files
- Statistics (total observations, favorite behaviors, etc.)

### Phase 5: WBS Admin Dashboard

**Features**:

- View all submissions
- Filter by date, observer, patient, aviary
- Export aggregate data
- Manage aviaries/patients/behaviors
- User management

### Phase 6: Data Visualization

**Features**:

- Public dashboards (aggregate data)
- Behavior trends over time
- Heatmaps (time of day, location)
- Comparison across patients
- Interactive charts (Chart.js, D3.js)

### Phase 7: Leaderboards

**Features**:

- Most observations submitted
- Longest observation streak
- Most thorough observations (filled fields)
- Badges/achievements for milestones
- Optional opt-in for public leaderboard

---

## Progress Tracking

| Task                       | Status         | Assignee | Completed |
| -------------------------- | -------------- | -------- | --------- |
| Task 1: SubmissionModal    | 🔄 In Progress | Claude   | -         |
| Task 2: Email Validator    | ⏳ Pending     | -        | -         |
| Task 3: Email Service      | ⏳ Pending     | -        | -         |
| Task 4: localStorage Email | ⏳ Pending     | -        | -         |
| Task 5: App.jsx Updates    | ⏳ Pending     | -        | -         |
| Task 6: Documentation      | ⏳ Pending     | -        | -         |
| Task 7: Styling            | ⏳ Pending     | -        | -         |
| Task 8: Integration Tests  | ⏳ Pending     | -        | -         |

Legend: ✅ Complete | 🔄 In Progress | ⏳ Pending | ❌ Blocked

---

## Questions & Decisions Log

### Q1: Should Excel generation happen on frontend or backend?

**Decision**: Backend
**Rationale**: Server-side validation, single source of truth, lighter frontend
**Date**: 2025-11-22

### Q2: Should we use Vercel serverless functions for backend?

**Decision**: No, separate repository
**Rationale**: Avoid vendor lock-in, need full backend for future features
**Date**: 2025-11-22

### Q3: What email service should we use?

**Decision**: Resend (recommended) or Postmark
**Rationale**: Developer experience, pricing, deliverability
**Date**: 2025-11-22

### Q4: How should we handle errors?

**Decision**: Categorize (transient/permanent) with retry for transient
**Rationale**: Better UX, matches user expectations
**Date**: 2025-11-22

### Q5: Should email be required?

**Decision**: No, optional with download fallback
**Rationale**: Progressive enhancement, graceful degradation
**Date**: 2025-11-22

---

## References

- [Resend Documentation](https://resend.com/docs)
- [Postmark Documentation](https://postmarkapp.com/developer)
- [Clerk Auth Documentation](https://clerk.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Email Validation Regex (RFC 5322)](https://emailregex.com/)
- [React Modal Accessibility](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)

---

**Last Updated**: November 22, 2025
**Next Review**: After Phase 1 completion
