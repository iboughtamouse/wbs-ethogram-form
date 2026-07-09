/**
 * Form Submission Service
 *
 * Handles output data preparation for form submission.
 * All times are stream timestamps (WBS time) - no conversion needed.
 *
 * As of December 2025, timezone conversion has been removed; times are stored
 * exactly as entered (the video's on-screen timestamp).
 */

/**
 * Prepares form data for output/submission
 *
 * Times are stored exactly as entered (the video's top-left timestamp).
 * No timezone conversion is performed.
 *
 * @param {Object} metadata - Form metadata (observer, date, times, aviary slug)
 * @param {Object} observations - Observations keyed by time slot (arrays of per-subject cards)
 * @returns {Object} Output data with metadata, observations, and timestamp
 */
export const prepareOutputData = (metadata, observations) => {
  // All times are stream timestamps (WBS time) - no conversion needed
  return {
    metadata: { ...metadata },
    observations,
    submittedAt: new Date().toISOString(),
  };
};
