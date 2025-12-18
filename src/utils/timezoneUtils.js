/**
 * Timezone constants for WBS Ethogram
 *
 * NOTE: As of December 2025, timezone conversion has been removed.
 * All observers now use stream timestamps directly (WBS time).
 * This file is kept for the WBS_TIMEZONE constant reference.
 */

// WBS is located in St. Louis, Missouri (Central Time)
export const WBS_TIMEZONE = 'America/Chicago';

/**
 * @deprecated As of December 2025, observers use stream timestamps directly.
 * No timezone conversion is performed.
 * @returns {string} WBS_TIMEZONE constant
 */
export const getUserTimezone = () => {
  console.warn(
    'getUserTimezone is deprecated - stream timestamps are used directly'
  );
  return WBS_TIMEZONE;
};

/**
 * @deprecated As of December 2025, observers use stream timestamps directly.
 * No timezone conversion is performed.
 * @param {string} dateString - Date in YYYY-MM-DD format (ignored)
 * @param {string} timeString - Time in HH:MM format
 * @returns {string} Time string unchanged (pass-through)
 */
export const convertToWBSTime = (dateString, timeString) => {
  console.warn(
    'convertToWBSTime is deprecated - stream timestamps are used directly'
  );
  return timeString; // Pass through unchanged
};

/**
 * @deprecated As of December 2025, timezone conversion removed.
 * @returns {boolean} Always returns false
 */
export const isUserInDifferentTimezone = () => {
  console.warn(
    'isUserInDifferentTimezone is deprecated - stream timestamps are used directly'
  );
  return false;
};

/**
 * @deprecated As of December 2025, timezone conversion removed.
 * @param {string} timezone - IANA timezone identifier
 * @returns {string} Input timezone unchanged
 */
export const getTimezoneAbbreviation = (timezone) => {
  console.warn(
    'getTimezoneAbbreviation is deprecated - stream timestamps are used directly'
  );
  return timezone;
};
