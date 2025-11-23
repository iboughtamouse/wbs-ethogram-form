/**
 * Observer Name Validator
 *
 * Validates observer names with support for Discord and Twitch username patterns.
 * Designed to be permissive while preventing obvious errors.
 */

/**
 * Validate observer name
 *
 * Supports common username patterns:
 * - Discord: 2-32 chars, letters/numbers/underscores/periods
 * - Twitch: 4-25 chars, letters/numbers/underscores
 * - General usernames with spaces, hyphens allowed
 *
 * @param {string} observerName - The observer name to validate
 * @returns {string} - Error message if invalid, empty string if valid
 */
export function validateObserverName(observerName) {
  // Check if empty or not a string
  if (!observerName || typeof observerName !== 'string') {
    return 'Observer name is required';
  }

  const trimmed = observerName.trim();

  // Check minimum length (2 chars to support Discord minimum)
  if (trimmed.length < 2) {
    return 'Observer name must be at least 2 characters';
  }

  // Check maximum length (32 chars to match Discord)
  if (trimmed.length > 32) {
    return 'Observer name must be 32 characters or less';
  }

  // Allow letters (any language), numbers, spaces, and common username symbols
  // This regex supports:
  // - Unicode letters (any language)
  // - Numbers
  // - Spaces (for full names like "John Doe")
  // - Underscores, periods, hyphens (common in usernames)
  const validPattern = /^[\p{L}\p{N}\s._-]+$/u;

  if (!validPattern.test(trimmed)) {
    return 'Observer name can only contain letters, numbers, spaces, and symbols: . _ -';
  }

  // Prevent names that are only symbols and spaces
  const hasLetterOrNumber = /[\p{L}\p{N}]/u.test(trimmed);
  if (!hasLetterOrNumber) {
    return 'Observer name must contain at least one letter or number';
  }

  // Prevent consecutive periods (Discord rule)
  if (trimmed.includes('..')) {
    return 'Observer name cannot contain consecutive periods';
  }

  // Prevent starting/ending with periods (Discord rule)
  if (trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return 'Observer name cannot start or end with a period';
  }

  return '';
}

/**
 * Check if observer name appears to be a Discord username
 * (no spaces, uses underscores/periods as separators)
 *
 * @param {string} observerName - The observer name to check
 * @returns {boolean} - True if it looks like a Discord username
 */
export function looksLikeDiscordUsername(observerName) {
  if (!observerName || typeof observerName !== 'string') {
    return false;
  }

  const trimmed = observerName.trim();

  // Discord usernames don't have spaces
  if (trimmed.includes(' ')) {
    return false;
  }

  // Discord usernames are 2-32 chars
  if (trimmed.length < 2 || trimmed.length > 32) {
    return false;
  }

  // Discord pattern: letters, numbers, underscores, periods
  const discordPattern = /^[a-zA-Z0-9._]+$/;
  return discordPattern.test(trimmed);
}

/**
 * Check if observer name appears to be a Twitch username
 * (4-25 chars, starts with letter, only letters/numbers/underscores)
 *
 * @param {string} observerName - The observer name to check
 * @returns {boolean} - True if it looks like a Twitch username
 */
export function looksLikeTwitchUsername(observerName) {
  if (!observerName || typeof observerName !== 'string') {
    return false;
  }

  const trimmed = observerName.trim();

  // Twitch usernames are 4-25 chars
  if (trimmed.length < 4 || trimmed.length > 25) {
    return false;
  }

  // Twitch pattern: starts with letter, only letters/numbers/underscores
  const twitchPattern = /^[a-zA-Z][a-zA-Z0-9_]*$/;
  return twitchPattern.test(trimmed);
}
