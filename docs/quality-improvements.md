# Quality Improvements Roadmap

> **Generated**: November 21, 2025  
> **Complements**: [maintenance-strategy.md](./maintenance-strategy.md)  
> **Focus**: Testing gaps, accessibility, governance, and UX enhancements

---

## Table of Contents

1. [Overview](#overview)
2. [Priority Classification](#priority-classification)
3. [Critical Quality Gaps](#-critical-quality-gaps)
4. [High Priority Improvements](#-high-priority-improvements)
5. [Medium Priority Enhancements](#-medium-priority-enhancements)
6. [Low Priority / Future Considerations](#-low-priority--future-considerations)
7. [Implementation Roadmap](#implementation-roadmap)
8. [Appendix: Code Examples](#appendix-code-examples)

---

## Overview

This document outlines quality improvements that go beyond routine maintenance. While [maintenance-strategy.md](./maintenance-strategy.md) focuses on dependency updates and security vulnerabilities, this document addresses:

- **Testing gaps** - Missing unit tests for utilities and helpers
- **Accessibility** - ARIA attributes, keyboard navigation, screen reader support
- **Governance** - Legal files, security policies, contribution guidelines
- **User Experience** - Loading states, error handling, offline support
- **Developer Experience** - Documentation, tooling, quality gates

### Relationship to Other Documents

| Document                                             | Purpose                              | Audience             | Timeline          |
| ---------------------------------------------------- | ------------------------------------ | -------------------- | ----------------- |
| [maintenance-strategy.md](./maintenance-strategy.md) | Dependency updates, security patches | All developers       | Immediate (weeks) |
| **quality-improvements.md** (this doc)               | Testing, accessibility, governance   | Quality-focused work | Ongoing (months)  |
| [refactoring-history.md](./refactoring-history.md)   | Completed refactoring phases         | Reference only       | ✅ Complete       |

---

## Priority Classification

- 🔴 **Critical**: Blockers for production use, legal issues, or major quality gaps
- 🟡 **High**: Significant quality or usability improvements, affects many users
- 🟢 **Medium**: Nice-to-have enhancements that improve developer or user experience
- 🔵 **Low**: Future considerations, strategic improvements, "when we have time"

**Total Items**: 19 improvements identified

- 🔴 Critical: 3 items
- 🟡 High: 5 items
- 🟢 Medium: 6 items
- 🔵 Low: 5 items

---

## 🔴 Critical Quality Gaps

### 1. Missing Unit Tests for Behavior Helper Functions

**Status**: ❌ Not Tested  
**Location**: `src/constants/behaviors.js`  
**Estimated Effort**: 2-3 hours

#### Problem

The behavior helper functions have **zero dedicated unit tests**:

- `getBehaviorByValue(value)`
- `requiresLocation(behaviorValue)`
- `requiresObject(behaviorValue)`
- `requiresAnimal(behaviorValue)`
- `requiresInteraction(behaviorValue)`
- `requiresDescription(behaviorValue)`

These functions are critical to validation logic throughout the app. They are only tested **indirectly** through integration tests. If the helper logic breaks, it could cause subtle validation bugs.

#### Risk Assessment

- **Likelihood**: Medium (helpers are simple, but bugs could be introduced during refactoring)
- **Impact**: High (affects all form validation)
- **Risk Level**: **High**

#### Recommended Fix

Create `src/constants/__tests__/behaviors.test.js`:

```javascript
import {
  BEHAVIORS,
  getBehaviorByValue,
  requiresLocation,
  requiresObject,
  requiresAnimal,
  requiresInteraction,
  requiresDescription,
} from '../behaviors';

describe('behaviors', () => {
  describe('BEHAVIORS constant', () => {
    it('should export an array of behavior objects', () => {
      expect(Array.isArray(BEHAVIORS)).toBe(true);
      expect(BEHAVIORS.length).toBeGreaterThan(0);
    });

    it('should have consistent structure for all behaviors', () => {
      BEHAVIORS.forEach((behavior) => {
        expect(behavior).toHaveProperty('value');
        expect(behavior).toHaveProperty('label');
        expect(typeof behavior.requiresLocation).toBe('boolean');
      });
    });
  });

  describe('getBehaviorByValue', () => {
    it('should return behavior object for valid value', () => {
      const behavior = getBehaviorByValue('eating_food_platform');
      expect(behavior).toBeDefined();
      expect(behavior.value).toBe('eating_food_platform');
      expect(behavior.label).toBe('Eating - On Food Platform');
    });

    it('should return undefined for invalid value', () => {
      const behavior = getBehaviorByValue('nonexistent_behavior');
      expect(behavior).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      const behavior = getBehaviorByValue('');
      expect(behavior).toBeDefined(); // Empty option exists
      expect(behavior.label).toBe('Select a behavior...');
    });
  });

  describe('requiresLocation', () => {
    it('should return true for behaviors requiring location', () => {
      expect(requiresLocation('eating_elsewhere')).toBe(true);
      expect(requiresLocation('walking_perch')).toBe(true);
      expect(requiresLocation('preening')).toBe(true);
    });

    it('should return false for behaviors not requiring location', () => {
      expect(requiresLocation('eating_food_platform')).toBe(false);
      expect(requiresLocation('flying')).toBe(false);
      expect(requiresLocation('drinking')).toBe(false);
    });

    it('should return false for empty or invalid behavior', () => {
      expect(requiresLocation('')).toBe(false);
      expect(requiresLocation('invalid')).toBe(false);
      expect(requiresLocation(null)).toBe(false);
    });
  });

  describe('requiresObject', () => {
    it('should return true for interacting_object behavior', () => {
      expect(requiresObject('interacting_object')).toBe(true);
    });

    it('should return false for other behaviors', () => {
      expect(requiresObject('eating_food_platform')).toBe(false);
      expect(requiresObject('')).toBe(false);
    });
  });

  describe('requiresAnimal', () => {
    it('should return true for interacting_animal behavior', () => {
      expect(requiresAnimal('interacting_animal')).toBe(true);
    });

    it('should return false for other behaviors', () => {
      expect(requiresAnimal('eating_food_platform')).toBe(false);
      expect(requiresAnimal('')).toBe(false);
    });
  });

  describe('requiresInteraction', () => {
    it('should return true for interacting_animal behavior', () => {
      expect(requiresInteraction('interacting_animal')).toBe(true);
    });

    it('should return false for other behaviors', () => {
      expect(requiresInteraction('interacting_object')).toBe(false);
      expect(requiresInteraction('')).toBe(false);
    });
  });

  describe('requiresDescription', () => {
    it('should return true for behaviors requiring description', () => {
      expect(requiresDescription('other_behavior')).toBe(true);
    });

    it('should return false for behaviors not requiring description', () => {
      expect(requiresDescription('eating_food_platform')).toBe(false);
      expect(requiresDescription('')).toBe(false);
    });
  });
});
```

**Expected Test Count**: ~20 tests  
**Branch**: `test/behavior-helpers-unit-tests`

---

### 2. Missing LICENSE File

**Status**: ❌ Critical Legal Gap  
**Location**: Root directory  
**Estimated Effort**: 15 minutes

#### Problem

README.md states "MIT License" but **no LICENSE file exists**. This creates legal ambiguity:

- Contributors don't know their rights
- Users can't verify license terms
- GitHub shows "No license" badge
- Forks may not properly attribute

#### Risk Assessment

- **Likelihood**: High (already affecting repo)
- **Impact**: High (legal/compliance issue)
- **Risk Level**: **Critical**

#### Recommended Fix

Create `LICENSE` file in root directory:

```text
MIT License

Copyright (c) 2025 [Copyright Holder Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Decision Needed**: Who is the copyright holder?

- "World Bird Sanctuary"
- "WBS Ethogram Contributors"
- Individual name
- Organization name

**Branch**: `docs/add-license-file`  
**Blocks**: Open source contributions

---

### 3. No Unit Tests for Location Validator

**Status**: ❌ Not Tested  
**Location**: `src/utils/validators/locationValidator.js`  
**Estimated Effort**: 1-2 hours

#### Problem

The `validateLocation()` function has complex logic but **no dedicated unit tests**:

- Validates perch numbers (1-31)
- Validates special codes (BB1, BB2, F1, F2, G, W, GROUND)
- Case-insensitive matching
- Error message generation

Only tested indirectly through `useFormValidation` integration tests.

#### Risk Assessment

- **Likelihood**: Medium (logic is straightforward but edge cases exist)
- **Impact**: High (affects all location validation)
- **Risk Level**: **High**

#### Recommended Fix

Create `src/utils/validators/__tests__/locationValidator.test.js`:

```javascript
import { validateLocation } from '../locationValidator';

describe('validateLocation', () => {
  describe('valid perch numbers', () => {
    it('should accept perch numbers 1-31', () => {
      for (let i = 1; i <= 31; i++) {
        const result = validateLocation(String(i));
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
      }
    });

    it('should accept perch numbers with leading/trailing whitespace', () => {
      const result = validateLocation('  12  ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });

  describe('valid special codes', () => {
    const validCodes = ['BB1', 'BB2', 'F1', 'F2', 'G', 'W', 'GROUND'];

    validCodes.forEach((code) => {
      it(`should accept special code: ${code}`, () => {
        const result = validateLocation(code);
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
      });

      it(`should accept ${code} in lowercase`, () => {
        const result = validateLocation(code.toLowerCase());
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
      });

      it(`should accept ${code} in mixed case`, () => {
        const result = validateLocation(
          code.charAt(0) + code.slice(1).toLowerCase()
        );
        expect(result.valid).toBe(true);
        expect(result.error).toBeNull();
      });
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty string', () => {
      const result = validateLocation('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject perch number 0', () => {
      const result = validateLocation('0');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('1-31');
    });

    it('should reject perch number 32', () => {
      const result = validateLocation('32');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('1-31');
    });

    it('should reject negative numbers', () => {
      const result = validateLocation('-5');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject invalid special codes', () => {
      const result = validateLocation('INVALID');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject non-alphanumeric input', () => {
      const result = validateLocation('***');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('edge cases', () => {
    it('should handle null input gracefully', () => {
      const result = validateLocation(null);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should handle undefined input gracefully', () => {
      const result = validateLocation(undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should trim whitespace before validation', () => {
      const result = validateLocation('   GROUND   ');
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });
  });
});
```

**Expected Test Count**: ~25 tests  
**Branch**: `test/location-validator-unit-tests`

---

## 🟡 High Priority Improvements

### 4. Accessibility Enhancements

**Status**: ⚠️ Minimal  
**Current Coverage**: 3 ARIA attributes (modal only)  
**Estimated Effort**: 1-2 weeks

#### Problem

The application has limited accessibility features:

- Only 3 `aria-` attributes (all in PerchDiagramModal)
- No `role` attributes for semantic HTML
- No `aria-describedby` linking errors to fields
- No `aria-live` regions for dynamic updates
- No keyboard navigation testing
- No screen reader testing

**WCAG 2.1 compliance status: Unknown**

#### Risk Assessment

- **Likelihood**: High (screen reader users will encounter issues)
- **Impact**: High (excludes users with disabilities)
- **Risk Level**: **High**
- **Legal Risk**: Potential ADA compliance issues

#### Recommended Improvements

##### 4.1. Error Message Announcements

**Current:**

```jsx
<input value={value} onChange={onChange} className={error ? 'error' : ''} />;
{
  error && <div className="field-error">{error}</div>;
}
```

**Improved:**

```jsx
<input
  value={value}
  onChange={onChange}
  className={error ? 'error' : ''}
  aria-invalid={!!error}
  aria-describedby={error ? `${fieldId}-error` : undefined}
/>;
{
  error && (
    <div id={`${fieldId}-error`} className="field-error" role="alert">
      {error}
    </div>
  );
}
```

##### 4.2. Loading State Announcements

**Current:**

```jsx
<button onClick={handleDownload} disabled={isDownloading}>
  {isDownloading ? 'Generating...' : 'Download Excel'}
</button>
```

**Improved:**

```jsx
<div aria-live="polite" aria-atomic="true">
  <button
    onClick={handleDownload}
    disabled={isDownloading}
    aria-busy={isDownloading}
  >
    {isDownloading ? 'Generating Excel file...' : 'Download Excel File'}
  </button>
  {isDownloading && (
    <span className="sr-only">
      Please wait while we generate your Excel file
    </span>
  )}
</div>
```

##### 4.3. Form Structure and Landmarks

Add semantic HTML and ARIA landmarks:

```jsx
<main role="main" aria-label="Ethogram data entry form">
  <section aria-labelledby="metadata-heading">
    <h2 id="metadata-heading">Observation Details</h2>
    <MetadataSection />
  </section>

  <section aria-labelledby="observations-heading">
    <h2 id="observations-heading">Behavior Observations</h2>
    {timeSlots.map((time) => (
      <TimeSlotObservation key={time} time={time} />
    ))}
  </section>

  <section aria-labelledby="output-heading">
    <h2 id="output-heading">Download Your Data</h2>
    <OutputPreview />
  </section>
</main>
```

##### 4.4. Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

- Tab order follows logical flow
- Escape closes modals
- Enter submits forms (but not individual fields)
- Arrow keys navigate time slots (optional enhancement)

##### 4.5. Screen Reader Testing Checklist

- [ ] Form fields announce their labels
- [ ] Required fields announce "required"
- [ ] Error messages are read when they appear
- [ ] Loading states announce "busy"
- [ ] Modal opens/closes announce correctly
- [ ] Success/failure messages announce
- [ ] Dropdowns announce selected values

**Tools to Use:**

- **macOS**: VoiceOver (Cmd + F5)
- **Windows**: NVDA (free) or JAWS
- **Browser**: axe DevTools extension

**Branch**: `feat/accessibility-improvements`  
**Estimated Impact**: Makes app usable for ~15% of population with disabilities

---

### 5. React Error Boundary

**Status**: ❌ None  
**Location**: Missing component  
**Estimated Effort**: 3-4 hours

#### Problem

If any component crashes (throws an error), the **entire app white-screens**. Users see a blank page with no explanation or recovery option.

Common causes:

- Null reference errors
- Unexpected data shapes
- Network failures in components

#### Risk Assessment

- **Likelihood**: Low (app is stable)
- **Impact**: High (complete app failure)
- **Risk Level**: **Medium-High**

#### Recommended Fix

Create `src/components/ErrorBoundary.jsx`:

```jsx
import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });

    // Log to console in development
    console.error('Error caught by boundary:', error, errorInfo);

    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // if (process.env.NODE_ENV === 'production') {
    //   sendToErrorTracking(error, errorInfo);
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px',
            maxWidth: '600px',
            margin: '0 auto',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <h1>😞 Something went wrong</h1>
          <p style={{ color: '#666', marginBottom: '30px' }}>
            We're sorry, but the app encountered an unexpected error. Your draft
            has been saved and will be restored when you reload.
          </p>

          <button
            onClick={this.handleReset}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload App
          </button>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '30px', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#999' }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  backgroundColor: '#f5f5f5',
                  padding: '15px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                }}
              >
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
```

Wrap App in `src/main.jsx`:

```jsx
import ErrorBoundary from './components/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
```

**Testing:**

```jsx
// Create test component that throws
const ThrowError = () => {
  throw new Error('Test error boundary');
};

// Verify error boundary catches it
render(
  <ErrorBoundary>
    <ThrowError />
  </ErrorBoundary>
);

expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
```

**Branch**: `feat/error-boundary`

---

### 6. Consistent Error Handling

**Status**: ⚠️ Inconsistent  
**Current State**: Some try/catch, some don't  
**Estimated Effort**: 1 week

#### Problem

Error handling is inconsistent across the codebase:

- ✅ `localStorageUtils.js` - Has try/catch
- ✅ `timezoneUtils.js` - Has try/catch
- ✅ `OutputPreview.jsx` - Has try/catch for Excel
- ❌ `excelGenerator.js` - Throws raw errors
- ❌ Most components - No error handling
- ❌ `alert()` used for errors (not user-friendly)

#### Recommended Fix

##### 6.1. Create Error Utility

`src/utils/errorUtils.js`:

```javascript
/**
 * Standard error handling utility
 */

export class AppError extends Error {
  constructor(message, code, originalError = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
  }
}

export const ERROR_CODES = {
  STORAGE_FAILED: 'STORAGE_FAILED',
  EXCEL_GENERATION_FAILED: 'EXCEL_GENERATION_FAILED',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

/**
 * Get user-friendly error message
 */
export function getUserMessage(error) {
  if (error instanceof AppError) {
    return error.message;
  }

  // Default friendly messages
  const defaultMessages = {
    [ERROR_CODES.STORAGE_FAILED]:
      'Unable to save your draft. Please check browser storage settings.',
    [ERROR_CODES.EXCEL_GENERATION_FAILED]:
      'Failed to generate Excel file. Please try again.',
    [ERROR_CODES.VALIDATION_FAILED]: 'Please fix the errors in the form.',
  };

  return (
    defaultMessages[error.code] ||
    'An unexpected error occurred. Please try again.'
  );
}

/**
 * Log error (console in dev, service in production)
 */
export function logError(error, context = {}) {
  console.error('App Error:', {
    message: error.message,
    code: error.code,
    timestamp: error.timestamp,
    context,
    stack: error.stack,
  });

  // TODO: Send to error tracking service in production
  // if (process.env.NODE_ENV === 'production') {
  //   sendToSentry(error, context);
  // }
}
```

##### 6.2. Replace alert() with Toast Component

Create `src/components/Toast.jsx` for better error UX:

```jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const Toast = ({ message, type = 'error', duration = 5000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const colors = {
    error: '#dc3545',
    success: '#28a745',
    warning: '#ffc107',
    info: '#17a2b8',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: colors[type],
        color: 'white',
        padding: '15px 20px',
        borderRadius: '4px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 9999,
        maxWidth: '400px',
      }}
      role="alert"
      aria-live="assertive"
    >
      {message}
      <button
        onClick={onClose}
        style={{
          marginLeft: '15px',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '18px',
        }}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['error', 'success', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func.isRequired,
};

export default Toast;
```

**Branch**: `feat/consistent-error-handling`

---

### 7. Mobile Testing Strategy

**Status**: ❌ None  
**Current Testing**: jsdom only (not real browsers)  
**Estimated Effort**: 2-3 days setup + ongoing

#### Problem

All 287 tests run in jsdom (simulated browser):

- No real device testing
- Touch interactions not tested
- Mobile-specific bugs could slip through
- No responsive design validation

#### Recommended Strategy

##### 7.1. Add Playwright for E2E Tests

Install Playwright:

```bash
npm install -D @playwright/test
```

Create `playwright.config.js`:

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

##### 7.2. Example E2E Test

`tests/e2e/form-submission.spec.js`:

```javascript
import { test, expect } from '@playwright/test';

test.describe('Ethogram Form', () => {
  test('should fill and submit form on mobile', async ({ page }) => {
    await page.goto('/');

    // Fill metadata
    await page.fill('[name="observerName"]', 'Test Observer');
    await page.fill('[type="date"]', '2025-11-21');
    await page.fill('[name="startTime"]', '15:00');
    await page.fill('[name="endTime"]', '15:30');

    // Fill first observation
    await page.selectOption(
      'select[name="behavior-15:00"]',
      'eating_food_platform'
    );

    // Validate form
    await page.click('button:text("Validate & Preview")');

    // Should show output
    await expect(page.locator('.output-preview')).toBeVisible();

    // Should be able to download Excel
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:text("Download Excel")');
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/ethogram.*\.xlsx$/);
  });

  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/');

    // Test touch on dropdown
    await page.tap('select[name="behavior-15:00"]');

    // Test swipe/scroll behavior
    await page.touchscreen.tap(100, 300);
  });
});
```

##### 7.3. Add to CI Pipeline

Update `.github/workflows/ci.yml`:

```yaml
e2e-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run test:e2e
    - uses: actions/upload-artifact@v4
      if: always()
      with:
        name: playwright-report
        path: playwright-report/
```

**Branch**: `test/add-playwright-e2e`  
**Estimated Test Time**: +2-3 minutes per CI run

---

### 8. Environment Configuration

**Status**: ❌ Missing  
**Location**: No `.env.example`  
**Estimated Effort**: 1 hour

#### Problem

No environment variable infrastructure:

- When email integration happens, where do API keys go?
- No `.env.example` to show what's needed
- No documentation of env vars
- Future features will be harder to configure

#### Recommended Fix

Create `.env.example`:

```bash
# WBS Ethogram Form - Environment Configuration
# Copy this file to .env.local and fill in your values

# App Configuration
VITE_APP_NAME=WBS Ethogram Form
VITE_APP_VERSION=0.1.0

# Email Service (future feature)
# Uncomment when implementing email submission
# VITE_FORMSPREE_ENDPOINT=https://formspree.io/f/YOUR_FORM_ID
# VITE_EMAILJS_SERVICE_ID=your_service_id
# VITE_EMAILJS_TEMPLATE_ID=your_template_id
# VITE_EMAILJS_PUBLIC_KEY=your_public_key

# Error Tracking (future feature)
# VITE_SENTRY_DSN=your_sentry_dsn

# Analytics (future feature)
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX

# Feature Flags
VITE_ENABLE_EXCEL_EXPORT=true
# VITE_ENABLE_EMAIL_SUBMISSION=false
# VITE_ENABLE_DISCORD_AUTH=false

# Development
VITE_DEV_MODE=true
```

Update `.gitignore`:

```
# Environment variables
.env
.env.local
.env.production
```

Add to `DEVELOPMENT.md`:

````markdown
## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```
````

See `.env.example` for all available configuration options.

````

**Branch**: `chore/add-env-config`

---

## 🟢 Medium Priority Enhancements

### 9. Visual Regression Testing

**Status**: ❌ None
**Tools**: Percy, Chromatic, or jest-image-snapshot
**Estimated Effort**: 1 week setup

#### Problem

CSS changes could break UI without detection:
- Button styling changes go unnoticed
- Layout shifts on mobile not caught
- Color/spacing regressions possible
- 287 tests but no visual testing

#### Recommended Solution

**Option A: Percy (Easiest)**

```bash
npm install -D @percy/cli @percy/playwright
````

Add to Playwright tests:

```javascript
import percySnapshot from '@percy/playwright';

test('visual regression - form layout', async ({ page }) => {
  await page.goto('/');
  await percySnapshot(page, 'Form - Empty State');

  // Fill form
  await fillFormWithData(page);
  await percySnapshot(page, 'Form - Filled State');

  // Validate
  await page.click('button:text("Validate")');
  await percySnapshot(page, 'Form - Output Preview');
});
```

**Option B: Chromatic (Best UX)**

- Automated via Storybook
- Visual diff interface
- CI/CD integration
- Requires Storybook setup

**Option C: jest-image-snapshot (Free)**

```javascript
import { toMatchImageSnapshot } from 'jest-image-snapshot';

expect.extend({ toMatchImageSnapshot });

test('renders correctly', () => {
  const { container } = render(<App />);
  expect(container).toMatchImageSnapshot();
});
```

**Recommendation**: Start with Percy (free for open source), evaluate Chromatic if budget allows.

**Branch**: `test/visual-regression`

---

### 10. Code Coverage Enforcement

**Status**: ⚠️ No Thresholds  
**Current**: `test:coverage` script exists but not enforced  
**Estimated Effort**: 30 minutes

#### Problem

No coverage thresholds in `jest.config.js`:

- New code could reduce coverage
- No visibility into untested code
- No CI enforcement

#### Recommended Fix

Update `jest.config.js`:

```javascript
export default {
  // ... existing config

  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/main.jsx',
    '!src/**/*.test.{js,jsx}',
    '!src/**/__tests__/**',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 85,
      statements: 85,
    },
    // Stricter for critical files
    './src/services/**/*.js': {
      branches: 90,
      functions: 90,
      lines: 95,
      statements: 95,
    },
    './src/utils/**/*.js': {
      branches: 85,
      functions: 85,
      lines: 90,
      statements: 90,
    },
  },

  coverageReporters: ['text', 'lcov', 'html'],
};
```

Add to CI:

```yaml
- name: Check coverage
  run: npm run test:coverage
```

Add to `package.json`:

```json
{
  "scripts": {
    "test:coverage:check": "jest --coverage --coverageThreshold"
  }
}
```

**Branch**: `test/enforce-coverage-thresholds`

---

### 11. Governance Files

**Status**: ❌ Missing  
**Files Needed**: SECURITY.md, CODE_OF_CONDUCT.md, CHANGELOG.md  
**Estimated Effort**: 2-3 hours

#### 11.1. SECURITY.md

Create `.github/SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via email to: [security@yourdomain.com]

You should receive a response within 48 hours. If for some reason you do not, please follow up via email to ensure we received your original message.

Please include the following information:

- Type of issue (e.g., XSS, CSRF, data exposure)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue

## Disclosure Policy

When we receive a security bug report, we will:

1. Confirm the problem and determine affected versions
2. Audit code to find similar problems
3. Prepare fixes for all supported versions
4. Release new versions as soon as possible

## Comments on this Policy

If you have suggestions on how this process could be improved, please submit a pull request.
```

#### 11.2. CODE_OF_CONDUCT.md

Use Contributor Covenant:

```markdown
# Contributor Covenant Code of Conduct

## Our Pledge

We as members, contributors, and leaders pledge to make participation in our
community a harassment-free experience for everyone...

[Full Contributor Covenant 2.1 text]
```

#### 11.3. CHANGELOG.md

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Quality improvements roadmap document

## [0.1.0] - 2025-11-21

### Added

- Excel file export functionality
- Matrix layout matching original ethogram spreadsheet
- Automatic filename generation
- Loading states for async operations

### Changed

- App.jsx refactored to use service layer (43% size reduction)
- Constants organized into modular structure
- Validation uses helper functions

### Fixed

- Timezone conversion edge cases
- Midnight crossing support for 24/7 observations

## [0.0.1] - 2025-10-01

### Added

- Initial release
- Live stream and VOD observation modes
- 5-minute interval time slots
- Autosave and draft recovery
- Form validation with inline errors
- PropTypes for type safety
- Comprehensive test suite (287 tests)
```

**Branch**: `docs/add-governance-files`

---

### 12. Browser Support Documentation

**Status**: ❌ Undocumented  
**Current**: Uses modern APIs  
**Estimated Effort**: 1-2 hours

#### Problem

No documentation of supported browsers:

- Uses `Intl.DateTimeFormat` (IE11 not supported)
- Uses `localStorage` (private browsing may block)
- Uses async/await (IE11 not supported)
- Users on old browsers get no guidance

#### Recommended Fix

Add to `README.md`:

```markdown
## Browser Support

### Supported Browsers

| Browser             | Minimum Version | Notes                         |
| ------------------- | --------------- | ----------------------------- |
| Chrome              | 90+             | ✅ Fully supported            |
| Firefox             | 88+             | ✅ Fully supported            |
| Safari              | 14+             | ✅ Fully supported            |
| Edge                | 90+             | ✅ Fully supported (Chromium) |
| Mobile Safari (iOS) | 14+             | ✅ Fully supported            |
| Chrome Android      | 90+             | ✅ Fully supported            |

### Not Supported

- ❌ Internet Explorer 11 (uses modern JavaScript features)
- ❌ Safari < 14 (missing Intl APIs)
- ❌ Chrome < 90 (missing Optional Chaining)

### Required Browser Features

- **localStorage**: Required for autosave functionality
- **ES2020**: Optional chaining, nullish coalescing
- **Intl API**: Timezone conversion
- **Async/Await**: Excel generation
- **File Download API**: Excel export

### Testing

If you encounter issues:

1. **Update your browser** to the latest version
2. **Enable localStorage** (may be disabled in private/incognito mode)
3. **Check browser console** for error messages
4. **Try a different browser** from the supported list above
```

Add browserslist to `package.json`:

```json
{
  "browserslist": [
    "Chrome >= 90",
    "Firefox >= 88",
    "Safari >= 14",
    "Edge >= 90",
    "iOS >= 14",
    "ChromeAndroid >= 90"
  ]
}
```

**Branch**: `docs/browser-support`

---

### 13. Internationalization (i18n) Infrastructure

**Status**: ❌ None  
**Current**: All text hardcoded in English  
**Estimated Effort**: 1-2 weeks

#### Problem

All text is hardcoded:

- Citizen scientists could be non-English speakers
- WBS has international audience
- Limits potential user base
- Hard to add translations later

#### Recommended Solution

Use `react-i18next`:

```bash
npm install react-i18next i18next
```

Setup `src/i18n.js`:

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: enTranslations },
    es: { translation: esTranslations },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
```

Example translation file `src/locales/en.json`:

```json
{
  "metadata": {
    "observerName": {
      "label": "Observer Name (Discord Username)",
      "placeholder": "Enter your Discord username",
      "required": "Observer name is required"
    },
    "date": {
      "label": "Date",
      "required": "Date is required"
    }
  },
  "behaviors": {
    "eating_food_platform": "Eating - On Food Platform",
    "eating_elsewhere": "Eating - Elsewhere"
  },
  "buttons": {
    "validate": "Validate & Preview",
    "download": "Download Excel File",
    "copyToNext": "Copy to Next Slot"
  }
}
```

Usage in components:

```jsx
import { useTranslation } from 'react-i18next';

const MetadataSection = () => {
  const { t } = useTranslation();

  return (
    <label>
      {t('metadata.observerName.label')}
      <span className="required">*</span>
    </label>
  );
};
```

**Decision Needed**: Which languages to support initially?

- Spanish (large WBS audience)
- French (Canadian/European audience)
- German

**Branch**: `feat/i18n-infrastructure`

---

### 14. Performance Monitoring

**Status**: ❌ None  
**Metrics**: Bundle size, Core Web Vitals  
**Estimated Effort**: 1 week

#### Problem

No performance tracking:

- Bundle size unknown (5,500 lines + exceljs)
- No Core Web Vitals monitoring
- Could become slow without noticing
- No performance budgets

#### Recommended Solutions

##### 14.1. Bundle Size Analysis

Add to `package.json`:

```json
{
  "scripts": {
    "analyze": "vite build --mode analyze"
  }
}
```

Install analyzer:

```bash
npm install -D rollup-plugin-visualizer
```

Update `vite.config.js`:

```javascript
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          excel: ['exceljs'],
          form: ['react-select'],
        },
      },
    },
  },
});
```

Set bundle size budget:

```json
// package.json
{
  "bundlesize": [
    {
      "path": "./dist/**/*.js",
      "maxSize": "300 kB"
    },
    {
      "path": "./dist/**/*.css",
      "maxSize": "50 kB"
    }
  ]
}
```

##### 14.2. Core Web Vitals

Add `web-vitals`:

```bash
npm install web-vitals
```

Create `src/vitals.js`:

```javascript
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log(metric);
  }

  // Send to analytics in production
  // e.g., Google Analytics, custom endpoint
  if (process.env.NODE_ENV === 'production') {
    // navigator.sendBeacon('/analytics', JSON.stringify(metric));
  }
}

export function reportWebVitals() {
  onCLS(sendToAnalytics);
  onFID(sendToAnalytics);
  onFCP(sendToAnalytics);
  onLCP(sendToAnalytics);
  onTTFB(sendToAnalytics);
}
```

Add to `main.jsx`:

```javascript
import { reportWebVitals } from './vitals';

reportWebVitals();
```

**Branch**: `feat/performance-monitoring`

---

## 🔵 Low Priority / Future Considerations

### 15. Loading States for All Async Actions

**Status**: ⚠️ Partial  
**Current**: Excel download has loading state  
**Estimated Effort**: 1-2 days

#### Problem

Only Excel download shows loading state:

- Form validation could show "Validating..."
- Draft restoration could show "Loading draft..."
- Users may think app is frozen

#### Quick Wins

Add loading indicator to validation:

```jsx
const [isValidating, setIsValidating] = useState(false);

const handleValidate = async () => {
  setIsValidating(true);
  try {
    const errors = validateForm(metadata, observations);
    // ... handle errors
  } finally {
    setIsValidating(false);
  }
};

<button disabled={isValidating}>
  {isValidating ? 'Validating...' : 'Validate & Preview'}
</button>;
```

**Branch**: `feat/loading-states`

---

### 16. Undo/Redo Functionality

**Status**: ❌ None  
**Complexity**: Medium-High  
**Estimated Effort**: 1 week

#### Problem

Users can't undo changes:

- "Copy to next" is permanent
- Field changes can't be undone
- No history management

#### Solution

Use `use-undo` library:

```bash
npm install use-undo
```

```jsx
import useUndo from 'use-undo';

const [observationsState, {
  set: setObservations,
  undo,
  redo,
  canUndo,
  canRedo,
}] = useUndo({});

<button onClick={undo} disabled={!canUndo}>
  Undo
</button>
<button onClick={redo} disabled={!canRedo}>
  Redo
</button>
```

**Branch**: `feat/undo-redo`

---

### 17. Data Export Confirmation

**Status**: ⚠️ Silent  
**Current**: Excel downloads silently  
**Estimated Effort**: 2 hours

#### Solution

Show success toast after download:

```jsx
const [showToast, setShowToast] = useState(null);

const handleDownload = async () => {
  try {
    await downloadExcelFile(data, filename);
    setShowToast({
      type: 'success',
      message: 'Excel file downloaded successfully!',
    });
  } catch (error) {
    setShowToast({
      type: 'error',
      message: 'Failed to download Excel file',
    });
  }
};

{
  showToast && (
    <Toast
      message={showToast.message}
      type={showToast.type}
      onClose={() => setShowToast(null)}
    />
  );
}
```

**Branch**: `feat/download-confirmation`

---

### 18. Offline Support (PWA)

**Status**: ❌ None  
**Complexity**: High  
**Estimated Effort**: 2-3 weeks

#### Problem

Requires internet connection:

- Can't use in field without WiFi
- Draft only saves locally
- No service worker

#### Solution

Use Vite PWA plugin:

```bash
npm install -D vite-plugin-pwa
```

```javascript
// vite.config.js
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'WBS Ethogram Form',
        short_name: 'Ethogram',
        description: 'Ethogram observation data entry form',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
});
```

**Branch**: `feat/pwa-offline-support`

---

### 19. Timezone Handling Edge Cases

**Status**: ⚠️ Basic Testing  
**Coverage**: DST, half-hour timezones  
**Estimated Effort**: 1 week

#### Problem

Tests don't cover all edge cases:

- DST transitions (spring forward, fall back)
- Half-hour timezones (India UTC+5:30, Australia UTC+9:30)
- Date line crossings

#### Recommended Tests

```javascript
describe('timezone edge cases', () => {
  it('should handle DST spring forward', () => {
    // March 10, 2024 2:00 AM → 3:00 AM
    const localTime = '2024-03-10T02:30:00';
    const result = convertToWBSTime(localTime, 'America/New_York');
    // Verify doesn't create invalid time
  });

  it('should handle DST fall back', () => {
    // November 3, 2024 2:00 AM → 1:00 AM
    const localTime = '2024-11-03T01:30:00';
    const result = convertToWBSTime(localTime, 'America/New_York');
    // Verify handles ambiguous time correctly
  });

  it('should handle half-hour timezone (India)', () => {
    const localTime = '2024-11-21T15:30:00';
    const result = convertToWBSTime(localTime, 'Asia/Kolkata'); // UTC+5:30
    // Verify conversion accuracy
  });

  it('should handle 45-minute timezone (Nepal)', () => {
    const localTime = '2024-11-21T15:30:00';
    const result = convertToWBSTime(localTime, 'Asia/Kathmandu'); // UTC+5:45
    // Verify conversion accuracy
  });
});
```

**Branch**: `test/timezone-edge-cases`

---

## Implementation Roadmap

### Phase 1: Critical Fixes (Week 1-2)

**Priority**: Must complete before considering "production-ready"

| Item                                 | Effort    | Impact | Status      |
| ------------------------------------ | --------- | ------ | ----------- |
| 1. Unit tests for behavior helpers   | 2-3 hours | High   | 🔴 Critical |
| 2. Add LICENSE file                  | 15 min    | High   | 🔴 Critical |
| 3. Unit tests for location validator | 1-2 hours | High   | 🔴 Critical |

**Estimated Total**: 4-6 hours

### Phase 2: High Priority (Month 1)

**Priority**: Significantly improves quality and accessibility

| Item                          | Effort    | Impact    | Status  |
| ----------------------------- | --------- | --------- | ------- |
| 4. Accessibility enhancements | 1-2 weeks | Very High | 🟡 High |
| 5. React error boundary       | 3-4 hours | High      | 🟡 High |
| 6. Consistent error handling  | 1 week    | Medium    | 🟡 High |
| 7. Mobile testing strategy    | 2-3 days  | High      | 🟡 High |
| 8. Environment configuration  | 1 hour    | Medium    | 🟡 High |

**Estimated Total**: 3-4 weeks

### Phase 3: Medium Priority (Month 2-3)

**Priority**: Developer experience and quality gates

| Item                         | Effort    | Impact | Status    |
| ---------------------------- | --------- | ------ | --------- |
| 9. Visual regression testing | 1 week    | Medium | 🟢 Medium |
| 10. Coverage enforcement     | 30 min    | Low    | 🟢 Medium |
| 11. Governance files         | 2-3 hours | Medium | 🟢 Medium |
| 12. Browser support docs     | 1-2 hours | Low    | 🟢 Medium |
| 13. i18n infrastructure      | 1-2 weeks | Medium | 🟢 Medium |
| 14. Performance monitoring   | 1 week    | Medium | 🟢 Medium |

**Estimated Total**: 4-5 weeks

### Phase 4: Future Enhancements (Month 4+)

**Priority**: Nice-to-have improvements

| Item                      | Effort    | Impact | Status |
| ------------------------- | --------- | ------ | ------ |
| 15. Loading states        | 1-2 days  | Low    | 🔵 Low |
| 16. Undo/redo             | 1 week    | Low    | 🔵 Low |
| 17. Download confirmation | 2 hours   | Low    | 🔵 Low |
| 18. PWA offline support   | 2-3 weeks | Medium | 🔵 Low |
| 19. Timezone edge cases   | 1 week    | Low    | 🔵 Low |

**Estimated Total**: 5-6 weeks

---

## Appendix: Code Examples

### A. Complete Test File Template

```javascript
/**
 * @jest-environment jsdom
 */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from './Component';

describe('Component', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<Component />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should handle click event', async () => {
      const handleClick = jest.fn();
      render(<Component onClick={handleClick} />);

      await userEvent.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('accessibility', () => {
    it('should have accessible name', () => {
      render(<Component label="Submit" />);
      expect(
        screen.getByRole('button', { name: 'Submit' })
      ).toBeInTheDocument();
    });

    it('should announce errors to screen readers', () => {
      render(<Component error="Invalid input" />);
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid input');
    });
  });

  describe('edge cases', () => {
    it('should handle null values gracefully', () => {
      expect(() => render(<Component value={null} />)).not.toThrow();
    });
  });
});
```

### B. Accessibility Checklist

- [ ] All images have alt text
- [ ] Form inputs have associated labels
- [ ] Error messages use `role="alert"`
- [ ] Loading states use `aria-busy`
- [ ] Modal has `aria-modal="true"` and `aria-labelledby`
- [ ] Buttons have descriptive text (not just icons)
- [ ] Color contrast ratio ≥ 4.5:1 for normal text
- [ ] Color contrast ratio ≥ 3:1 for large text
- [ ] Focus indicators are visible
- [ ] Keyboard navigation works for all interactions
- [ ] Skip links for keyboard users
- [ ] ARIA landmarks (main, nav, section)
- [ ] Dynamic content changes announced

### C. Error Handling Pattern

```javascript
// Standard pattern for all async operations
async function performAction(data) {
  try {
    // Attempt operation
    const result = await riskyOperation(data);

    // Log success
    logInfo('Operation succeeded', { data, result });

    return { success: true, result };
  } catch (error) {
    // Log error with context
    logError(error, { context: 'performAction', data });

    // Return user-friendly error
    return {
      success: false,
      error: getUserMessage(error),
      code: error.code || ERROR_CODES.UNKNOWN_ERROR,
    };
  }
}
```

---

## Summary

This document identifies **19 quality improvements** across testing, accessibility, governance, and user experience. Priority breakdown:

- **🔴 Critical (3)**: Must fix for production-readiness (~5 hours)
- **🟡 High (5)**: Significant quality improvements (~4 weeks)
- **🟢 Medium (6)**: Developer experience enhancements (~5 weeks)
- **🔵 Low (5)**: Future considerations (~6 weeks)

**Total estimated effort**: 15-20 weeks of focused work, can be done incrementally.

**Recommended approach**: Complete Critical fixes first (Week 1), then work through High priority items based on user needs and team capacity.

This roadmap complements [maintenance-strategy.md](./maintenance-strategy.md) - work on both simultaneously for a comprehensive quality improvement plan.

---

**Next Steps:**

1. Review and prioritize items with team
2. Create GitHub issues for each item
3. Assign to sprints based on priority
4. Track progress in project board
5. Update this document as items are completed
