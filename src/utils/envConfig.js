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
  // In test environment, use process.env
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
    return process.env[key];
  }

  // In Vite environment, try to use import.meta.env
  // Using eval() to avoid Jest parse errors
  try {
    // eslint-disable-next-line no-eval
    const importMeta = eval('import.meta');
    if (importMeta && importMeta.env) {
      return importMeta.env[key];
    }
  } catch (e) {
    // import.meta not available
    // Fall through to check process.env as backup
  }

  // Fallback to process.env (works in Node.js environments)
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }

  return undefined;
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
