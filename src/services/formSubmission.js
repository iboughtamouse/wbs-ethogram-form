/**
 * Form Submission Service
 *
 * Handles output data preparation for form submission.
 * All times are stream timestamps (WBS time) - no conversion needed.
 *
 * As of December 2025, timezone conversion has been removed.
 * Both Live and VOD modes now use stream timestamps directly.
 */

/**
 * Prepares form data for output/submission
 *
 * All observation modes use stream timestamps directly (top-left corner of video).
 * No timezone conversion is performed.
 *
 * @param {Object} metadata - Form metadata (observer, date, times, etc.)
 * @param {Object} observations - Observations keyed by time slot
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
