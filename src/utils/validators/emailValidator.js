/**
 * Email validation utilities
 *
 * Validates email addresses according to RFC 5322 basic format.
 * Supports single emails and comma-separated lists of emails.
 */

/**
 * Regular expression for basic RFC 5322 email validation
 * This is a simplified version that catches most common issues
 * while avoiding overly complex regex
 *
 * Pattern explanation:
 * - Local part: alphanumeric + allowed special chars (. _ % + -)
 * - @ symbol required
 * - Domain: alphanumeric + hyphens, with dots separating segments
 * - TLD: at least 2 characters
 */
const EMAIL_REGEX = /^[a-zA-Z0-9._+%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validate a single email address
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length === 0) {
    return false;
  }

  // Check length constraints (RFC 5321)
  if (trimmedEmail.length > 254) {
    return false;
  }

  // Check for basic format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return false;
  }

  // Additional validation: no consecutive dots
  if (trimmedEmail.includes('..')) {
    return false;
  }

  // Additional validation: no dot at start or end of local part
  const [localPart] = trimmedEmail.split('@');
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return false;
  }

  return true;
};

/**
 * Parse and validate a single email address
 * Note: Only accepts one email address (comma-separated lists are not supported)
 *
 * @param {string} emailString - Single email address
 * @returns {object} - { valid: boolean, emails: string[], invalidEmails: string[], error: string }
 */
export const parseEmailList = (emailString) => {
  if (!emailString || typeof emailString !== 'string') {
    return {
      valid: false,
      emails: [],
      invalidEmails: [],
      error: 'Email is required',
    };
  }

  const trimmed = emailString.trim();

  if (trimmed.length === 0) {
    return {
      valid: false,
      emails: [],
      invalidEmails: [],
      error: 'Email is required',
    };
  }

  // Validate the single email (comma will naturally fail regex validation)
  if (!isValidEmail(trimmed)) {
    return {
      valid: false,
      emails: [],
      invalidEmails: [trimmed],
      error: `Invalid email format: ${trimmed}`,
    };
  }

  return {
    valid: true,
    emails: [trimmed],
    invalidEmails: [],
    error: '',
  };
};

/**
 * Validate email input for the submission form
 * This is the main validation function used by the UI
 *
 * Note: This function treats email as optional (returns '' for empty input),
 * while parseEmailList treats it as required. This separation of concerns is intentional:
 * - parseEmailList: validates required single email (used when email is provided for sharing)
 * - validateEmailInput: validates optional UI input (handles empty case first)
 *
 * @param {string} emailInput - User's email input (can be empty or single email)
 * @returns {string} - Error message if invalid, empty string if valid
 */
export const validateEmailInput = (emailInput) => {
  // Allow empty input (email is optional for direct download path)
  if (!emailInput || emailInput.trim().length === 0) {
    return '';
  }

  const result = parseEmailList(emailInput);

  return result.error;
};
