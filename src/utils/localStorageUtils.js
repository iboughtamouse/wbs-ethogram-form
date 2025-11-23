/**
 * localStorage utilities for autosaving ethogram drafts
 * Prevents data loss from accidental page refresh/close during observation sessions
 */

const DRAFT_KEY = 'wbs-ethogram-draft';
const OBSERVER_NAME_KEY = 'wbs-ethogram-observer-name';

/**
 * Save current form state to localStorage
 * @param {Object} metadata - The metadata object (observerName, date, startTime, endTime, aviary, patient, mode)
 * @param {Object} observations - The observations object keyed by time strings
 * @returns {boolean} - True if save succeeded, false otherwise
 */
export function saveDraft(metadata, observations) {
  try {
    const draft = {
      metadata,
      observations,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error('Failed to save draft to localStorage:', error);
    return false;
  }
}

/**
 * Load saved draft from localStorage
 * @returns {Object|null} - Draft object with metadata, observations, and savedAt, or null if none exists
 */
export function loadDraft() {
  try {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    if (!draftJson) {
      return null;
    }
    const draft = JSON.parse(draftJson);
    return draft;
  } catch (error) {
    console.error('Failed to load draft from localStorage:', error);
    return null;
  }
}

/**
 * Clear saved draft from localStorage
 * @returns {boolean} - True if clear succeeded, false otherwise
 */
export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
    return true;
  } catch (error) {
    console.error('Failed to clear draft from localStorage:', error);
    return false;
  }
}

/**
 * Check if a draft exists in localStorage
 * @returns {boolean} - True if a draft exists, false otherwise
 */
export function hasDraft() {
  try {
    const draftJson = localStorage.getItem(DRAFT_KEY);
    return draftJson !== null && draftJson !== undefined;
  } catch (error) {
    console.error('Failed to check for draft in localStorage:', error);
    return false;
  }
}

/**
 * Save observer name to localStorage for future sessions
 * @param {string} observerName - The observer's name/username
 * @returns {boolean} - True if save succeeded, false otherwise
 */
export function saveObserverName(observerName) {
  try {
    if (!observerName || typeof observerName !== 'string') {
      return false;
    }
    const trimmed = observerName.trim();
    if (trimmed.length === 0) {
      return false;
    }
    localStorage.setItem(OBSERVER_NAME_KEY, trimmed);
    return true;
  } catch (error) {
    console.error('Failed to save observer name to localStorage:', error);
    return false;
  }
}

/**
 * Load saved observer name from localStorage
 * @returns {string|null} - Saved observer name, or null if none exists
 */
export function loadObserverName() {
  try {
    const observerName = localStorage.getItem(OBSERVER_NAME_KEY);
    return observerName || null;
  } catch (error) {
    console.error('Failed to load observer name from localStorage:', error);
    return null;
  }
}
