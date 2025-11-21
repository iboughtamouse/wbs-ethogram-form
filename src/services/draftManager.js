/**
 * Draft Management Service
 *
 * Handles logic for determining when to autosave form drafts.
 * Works with localStorageUtils for actual storage operations.
 */

/**
 * Determines if the form has enough data to warrant autosaving
 *
 * Autosaves when:
 * - Observer name is filled
 * - Start or end time is filled
 * - Any observation has behavior, location, or notes
 *
 * @param {Object} metadata - Form metadata
 * @param {Object} observations - Observations object
 * @returns {boolean} True if form should be autosaved
 */
export const shouldAutosave = (metadata, observations) => {
  // Check if metadata has user-entered data
  const hasMetadataData =
    !!metadata.observerName || !!metadata.startTime || !!metadata.endTime;

  // Check if any observation has data
  const hasObservationData = Object.values(observations).some(
    (obs) => obs.behavior || obs.location || obs.notes
  );

  return hasMetadataData || hasObservationData;
};
