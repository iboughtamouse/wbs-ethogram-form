import {
  STEP_MINUTES,
  MIN_OBSERVATION_MINUTES,
  MAX_OBSERVATION_MINUTES,
} from '../constants/ui';

/**
 * Convert minutes integer into a human-readable label.
 * - 60 → "1 hour"
 * - 120 → "2 hours"
 * - 5 → "5 minutes"
 */
export const formatMinutesToLabel = (minutes) => {
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} hour${h > 1 ? 's' : ''}`;
  }

  return `${minutes} minutes`;
};

/**
 * Returns a hyphenated interval label for the given number of minutes.
 * Examples:
 * 5 => '5-minute'
 * 60 => '1-hour'
 */
export const formatIntervalLabel = (minutes) => {
  if (minutes % 60 === 0) {
    const hours = minutes / 60;
    return `${hours}-hour`;
  }

  return `${minutes}-minute`;
};

/**
 * Formats a time string to 12-hour format
 * @param {string} timeString - Time in "HH:MM" format
 * @returns {string} - Time in "h:MM AM/PM" format
 */
export const formatTo12Hour = (timeString) => {
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

/**
 * Generates an array of time slots in 5-minute intervals
 * @param {string} startTime - Start time in "HH:MM" format
 * @param {string} endTime - End time in "HH:MM" format
 * @returns {string[]} - Array of time strings in "HH:MM" format
 * @note END-INCLUSIVE: Both start and end times are included in the output
 * @example generateTimeSlots("14:00", "14:15") → ["14:00", "14:05", "14:10", "14:15"]
 * @note Handles times crossing midnight (e.g., 23:55 to 00:15)
 */
export const generateTimeSlots = (startTime, endTime) => {
  if (!startTime || !endTime) return [];

  const slots = [];
  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  // Convert to minutes since midnight for easier calculation
  let startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  // Handle midnight crossing: if end time is less than start time, add 24 hours
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Add 1440 minutes (24 hours)
  }

  // Generate slots every STEP_MINUTES (configurable)
  // Uses <= to include end time (end-inclusive behavior)
  for (
    let minutes = startTotalMinutes;
    minutes <= endTotalMinutes;
    minutes += STEP_MINUTES
  ) {
    const hours = Math.floor(minutes / 60) % 24; // Use modulo to wrap around midnight
    const mins = minutes % 60;
    const timeString = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    slots.push(timeString);
  }

  return slots;
};

/**
 * Validates a time range
 * @param {string} startTime - Start time in "HH:MM" format
 * @param {string} endTime - End time in "HH:MM" format
 * @returns {object} - { valid: boolean, error: string }
 * @note Handles times crossing midnight (e.g., 23:55 to 00:15)
 */
export const validateTimeRange = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return { valid: false, error: 'Both start and end times are required' };
  }

  const [startHours, startMinutes] = startTime.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  let startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  // Handle midnight crossing: if end time is less than start time, add 24 hours
  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60; // Add 1440 minutes (24 hours)
  }

  const durationMinutes = endTotalMinutes - startTotalMinutes;

  if (durationMinutes < MIN_OBSERVATION_MINUTES) {
    return {
      valid: false,
      error: `Time range must be at least ${MIN_OBSERVATION_MINUTES} minutes`,
    };
  }

  if (durationMinutes > MAX_OBSERVATION_MINUTES) {
    // Produce a human-friendly duration string based on the MAX_OBSERVATION_MINUTES constant
    const maxText = formatMinutesToLabel(MAX_OBSERVATION_MINUTES);
    return { valid: false, error: `Time range cannot exceed ${maxText}` };
  }

  return { valid: true, error: null };
};

/**
 * Rounds a time to the nearest 5-minute interval
 * @param {string} timeString - Time in "HH:MM" format
 * @returns {string} - Rounded time in "HH:MM" format
 */
export const roundToNearestFiveMinutes = (timeString) => {
  if (!timeString) return '';

  const [hours, minutes] = timeString.split(':').map(Number);
  const roundedMinutes = Math.round(minutes / STEP_MINUTES) * STEP_MINUTES;

  // Handle case where rounding goes to 60 minutes
  if (roundedMinutes === 60) {
    return `${(hours + 1).toString().padStart(2, '0')}:00`;
  }

  return `${hours.toString().padStart(2, '0')}:${roundedMinutes.toString().padStart(2, '0')}`;
};
