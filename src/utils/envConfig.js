/**
 * Environment configuration
 * Provides a testable interface for accessing environment variables
 */

/**
 * Get environment variable value
 * In production: Uses Vite's import.meta.env
 * In tests: Uses process.env
 *
 * Note: We use eval() to access import.meta to avoid Jest parse errors.
 * Jest cannot parse import.meta syntax, so we evaluate it at runtime
 * when available. In test environments, we fall back to process.env.
 *
 * @param {string} key - Environment variable key
 * @returns {string|undefined} Environment variable value
 */
export function getEnv(key) {
  // Simple and straightforward: use Vite's import.meta.env
  // This file is only imported by services that are mocked in tests,
  // so we don't need to worry about Jest parsing errors
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
