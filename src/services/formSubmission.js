/**
 * Form Submission Service
 *
 * Handles output data preparation and timezone conversion for form submission.
 * Prepares data for export/submission with appropriate timezone handling.
 */

import { convertToWBSTime, getUserTimezone } from '../utils/timezoneUtils';

/**
 * Prepares form data for output/submission with timezone conversion
 *
 * For "live" mode:
 * - Converts all times to WBS timezone (America/Chicago)
 * - Includes observer's timezone in metadata
 * - Converts observation timestamps to WBS time
 *
 * For "vod" mode:
 * - Times are already in correct timezone (from video timestamp)
 * - No timezone conversion needed
 *
 * @param {Object} metadata - Form metadata (observer, date, times, etc.)
 * @param {Object} observations - Observations keyed by time slot
 * @returns {Object} Output data with metadata, observations, and timestamp
 */
export const prepareOutputData = (metadata, observations) => {
  // Create copies to avoid mutation
  let outputMetadata = { ...metadata };
  let outputObservations = observations;

  // Apply timezone conversion for live mode
  if (metadata.mode === 'live') {
    // Convert times to WBS timezone
    outputMetadata.startTime = convertToWBSTime(
      metadata.date,
      metadata.startTime
    );
    outputMetadata.endTime = convertToWBSTime(metadata.date, metadata.endTime);
    outputMetadata.observerTimezone = getUserTimezone();

    // Convert observation timestamps to WBS timezone
    outputObservations = {};
    Object.entries(observations).forEach(([localTime, observation]) => {
      const wbsTime = convertToWBSTime(metadata.date, localTime);
      outputObservations[wbsTime] = observation;
    });
  }

  return {
    metadata: outputMetadata,
    observations: outputObservations,
    submittedAt: new Date().toISOString(),
  };
};
