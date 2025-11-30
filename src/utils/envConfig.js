/**
 * Environment configuration
 * Provides a testable interface for accessing environment variables
 */

/**
 * Get environment variable value
 *
 * Uses Vite's import.meta.env to access environment variables.
 * In tests, this module is globally mocked in jest.setup.js to return
 * test-appropriate values.
 *
 * @param {string} key - Environment variable key
 * @returns {string|undefined} Environment variable value
 */
export function getEnv(key) {
  return import.meta.env[key];
}

/**
 * Get WBS email from environment
 * @returns {string|undefined} WBS email address
 */
export function getWBSEmail() {
  return getEnv('VITE_WBS_EMAIL');
}

/**
 * Get API base URL from environment
 * @returns {string} API base URL (defaults to empty string for relative URLs)
 */
export function getApiBaseUrl() {
  return getEnv('VITE_API_BASE_URL') || '';
}
