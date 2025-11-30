/**
 * Email submission service
 *
 * Phase 1: Mock implementation for frontend development
 * Phase 2: Real backend integration with API calls
 */

/**
 * @typedef {Object} Metadata
 * @property {string} observerName - Observer's name/username
 * @property {string} date - Observation date (YYYY-MM-DD)
 * @property {string} startTime - Start time in HH:MM format
 * @property {string} endTime - End time in HH:MM format
 * @property {string} aviary - Aviary name
 * @property {string} patient - Patient name
 * @property {'live'|'vod'} mode - Observation mode (live or video-on-demand)
 */

/**
 * @typedef {Object} Observation
 * @property {string} behavior - Behavior value (e.g., 'perching', 'flying')
 * @property {string} location - Location code (e.g., '1-31', 'BB1', 'G', 'GROUND')
 * @property {string} notes - Additional notes
 * @property {string} object - Inanimate object for interaction (when behavior is 'interacting_object')
 * @property {string} objectOther - Custom object description (when object is 'other')
 * @property {string} animal - Animal type for interaction (when behavior is 'interacting_animal')
 * @property {string} animalOther - Custom animal description (when animal is 'other')
 * @property {string} interactionType - Type of animal interaction (when behavior is 'interacting_animal')
 * @property {string} interactionTypeOther - Custom interaction type (when interactionType is 'other')
 * @property {string} description - Detailed description (for behaviors requiring description)
 */

/**
 * @typedef {Object.<string, Observation>} ObservationCollection
 * Collection of observations keyed by time string (e.g., "15:00", "15:05")
 */

/**
 * @typedef {Object} FormData
 * @property {Metadata} metadata - Observation metadata
 * @property {ObservationCollection} observations - Time-keyed observation data
 * @property {string} submittedAt - ISO 8601 timestamp of submission
 */

/**
 * @typedef {Object} SubmissionSuccess
 * @property {true} success - Indicates successful submission
 * @property {string} submissionId - Unique submission identifier
 * @property {string} message - Success message
 * @property {number} emailsSent - Number of emails successfully sent
 */

/**
 * @typedef {Object} SubmissionError
 * @property {false} success - Indicates failed submission
 * @property {string} error - Error type: 'transient', 'permanent', or 'validation'
 * @property {string} message - Error message for display
 * @property {boolean} retryable - Whether the error is retryable
 * @property {Object.<string, string>} [errors] - Field-specific validation errors (validation errors only)
 */

/**
 * @typedef {SubmissionSuccess|SubmissionError} SubmissionResult
 */

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  TRANSIENT: 'transient', // Retryable errors (network, timeouts, 5xx)
  PERMANENT: 'permanent', // Non-retryable errors (validation, quota, 4xx)
  VALIDATION: 'validation', // Form validation errors
};

/**
 * Submit observation data to backend API
 *
 * @param {FormData} formData - Complete form data with metadata and observations
 * @param {string[]} emails - Array of email addresses to send Excel file to
 * @returns {Promise<SubmissionResult>} Submission result with success/error details
 */
export async function submitObservation(formData, emails) {
  try {
    const response = await fetch('/api/observations/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        observation: formData,
        emails,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorObj = data.error || {};
      const errorType = categorizeHttpError(response.status, errorObj);

      return {
        success: false,
        error: errorType,
        message: errorObj.message || 'Submission failed',
        retryable: errorType === ERROR_TYPES.TRANSIENT,
        ...(errorObj.details && { details: errorObj.details }),
      };
    }

    return data;
  } catch (error) {
    // Network error or other unexpected error
    return {
      success: false,
      error: ERROR_TYPES.TRANSIENT,
      message: error.message || 'Network error. Please check your connection.',
      retryable: true,
    };
  }
}

/**
 * Categorize HTTP errors into transient vs permanent
 *
 * @param {number} status - HTTP status code
 * @param {Object} errorObj - Error object from server response
 * @param {string} [errorObj.code] - Error code (e.g., 'VALIDATION_ERROR', 'DATABASE_ERROR')
 * @param {string} [errorObj.message] - Error message
 * @param {Array} [errorObj.details] - Validation error details
 * @returns {'transient'|'permanent'|'validation'} Error type
 */
function categorizeHttpError(status, errorObj) {
  // 5xx errors are server errors (transient)
  if (status >= 500) {
    return ERROR_TYPES.TRANSIENT;
  }

  // 429 Too Many Requests (transient - rate limiting)
  if (status === 429) {
    return ERROR_TYPES.TRANSIENT;
  }

  // Validation errors (400 with VALIDATION_ERROR code)
  if (status === 400 && errorObj.code === 'VALIDATION_ERROR') {
    return ERROR_TYPES.VALIDATION;
  }

  // 4xx errors are client errors (permanent)
  if (status >= 400 && status < 500) {
    return ERROR_TYPES.PERMANENT;
  }

  // Unknown error (treat as permanent)
  return ERROR_TYPES.PERMANENT;
}

/**
 * Check if an error is retryable
 *
 * @param {SubmissionResult} result - Submission result object
 * @returns {boolean} True if error is retryable
 */
export function isRetryableError(result) {
  return !result.success && result.retryable === true;
}

/**
 * Get user-friendly error message
 *
 * @param {SubmissionResult} result - Submission result object
 * @returns {string} User-friendly error message (empty string for success)
 */
export function getErrorMessage(result) {
  if (result.success) {
    return '';
  }

  // Use provided message or default based on error type
  if (result.message) {
    return result.message;
  }

  switch (result.error) {
    case ERROR_TYPES.TRANSIENT:
      return 'Service temporarily unavailable. Please try again.';
    case ERROR_TYPES.PERMANENT:
      return 'Submission failed. Please download the Excel file instead.';
    case ERROR_TYPES.VALIDATION:
      return 'Invalid data. Please check your form and try again.';
    default:
      return 'An unexpected error occurred.';
  }
}
