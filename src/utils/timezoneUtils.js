/**
 * Timezone utilities for handling observer time conversions
 */

// WBS is located in St. Louis, Missouri (Central Time)
export const WBS_TIMEZONE = 'America/Chicago';

/**
 * Get the user's current timezone
 * @returns {string} IANA timezone identifier (e.g., "America/New_York")
 */
export const getUserTimezone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn('Could not detect timezone, defaulting to WBS timezone', error);
    return WBS_TIMEZONE;
  }
};

/**
 * Convert a date and time from user's local timezone to WBS timezone
 * @param {string} dateString - Date in YYYY-MM-DD format
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Time in HH:MM format converted to WBS timezone
 */
export const convertToWBSTime = (dateString, timeString) => {
  if (!dateString || !timeString) {
    return timeString;
  }

  try {
    // Create Date object from user's local time input
    // The Date constructor interprets this as local time
    const localDateTime = new Date(`${dateString}T${timeString}:00`);

    // Format in WBS timezone
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: WBS_TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    const parts = formatter.formatToParts(localDateTime);
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;

    return `${hour}:${minute}`;
  } catch (error) {
    console.error('Error converting timezone:', error);
    return timeString; // Return original on error
  }
};

/**
 * Check if user is in a different timezone than WBS
 * @returns {boolean}
 */
export const isUserInDifferentTimezone = () => {
  return getUserTimezone() !== WBS_TIMEZONE;
};

/**
 * Get a human-readable timezone name
 * @param {string} timezone - IANA timezone identifier
 * @returns {string} Abbreviated timezone name (e.g., "EST", "CST")
 */
export const getTimezoneAbbreviation = (timezone) => {
  try {
    const date = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'short'
    });
    const parts = formatter.formatToParts(date);
    const tzName = parts.find(p => p.type === 'timeZoneName');
    return tzName ? tzName.value : timezone;
  } catch (error) {
    return timezone;
  }
};
