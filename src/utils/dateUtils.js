/**
 * Date utilities for WBS Ethogram.
 *
 * The form defaults the observation date to "today" in the World Bird Sanctuary's
 * timezone (Central), not the observer's device timezone. Observers record the
 * stream's Central-time timestamps, and computing the default from UTC caused it to
 * roll to tomorrow's date after ~7pm CT (the source of the date-prepopulation bug).
 */

import { WBS_TIMEZONE } from './timezoneUtils';

/**
 * Today's date as `YYYY-MM-DD` in the WBS timezone (America/Chicago), regardless of the
 * observer's device timezone. DST is handled automatically by the Intl API.
 *
 * @returns {string} e.g. "2026-07-05"
 */
export const getTodayWBS = () => {
  // 'en-CA' formats dates as YYYY-MM-DD; `timeZone` pins the calendar day to Central time.
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: WBS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
};
