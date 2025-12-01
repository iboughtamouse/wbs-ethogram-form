// UI and application-wide constants
export const SUBMISSION_STATES = {
  SUBMITTING: 'submitting',
  SUCCESS: 'success',
  ERROR: 'error',
};

// Time constants
export const TIME_SLOT_STEP_SECONDS = 300; // 5 minutes
export const MIN_OBSERVATION_MINUTES = 5;
export const MAX_OBSERVATION_MINUTES = 60;

// Filename prefix for offline downloads
export const OFFLINE_FILE_PREFIX = 'offline';

// LocalStorage key for drafts
export const DRAFT_LOCALSTORAGE_KEY = 'wbs-ethogram-draft';

// Excel MIME type
export const EXCEL_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default {
  SUBMISSION_STATES,
  TIME_SLOT_STEP_SECONDS,
  MIN_OBSERVATION_MINUTES,
  MAX_OBSERVATION_MINUTES,
  OFFLINE_FILE_PREFIX,
  DRAFT_LOCALSTORAGE_KEY,
  EXCEL_MIME_TYPE,
};
