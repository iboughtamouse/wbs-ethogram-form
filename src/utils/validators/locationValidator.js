import { VALID_PERCHES } from '../../constants';

/**
 * Validate a location/perch value
 * @param {string} value - The location value to validate
 * @returns {{ valid: boolean, error: string|null }} - Validation result
 */
export const validateLocation = (value) => {
  if (!value.trim()) {
    return {
      valid: false,
      error: 'Location is required for this behavior',
    };
  }

  const locationValue = value.toUpperCase().trim();
  const isValidPerch = VALID_PERCHES.some(
    (p) => p.toString().toUpperCase() === locationValue
  );

  if (!isValidPerch && locationValue !== 'GROUND') {
    return {
      valid: false,
      error: `Invalid perch number "${value}"`,
    };
  }

  return { valid: true, error: null };
};
