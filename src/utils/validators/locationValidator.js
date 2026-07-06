/**
 * Validate a location/perch value against the aviary's perch list
 * @param {string} value - The location value to validate
 * @param {Array<string|number>} validPerches - Valid perch values (from config)
 * @returns {{ valid: boolean, error: string|null }} - Validation result
 */
export const validateLocation = (value, validPerches) => {
  if (!value.trim()) {
    return {
      valid: false,
      error: 'Location is required for this behavior',
    };
  }

  const locationValue = value.toUpperCase().trim();
  const isValidPerch = validPerches.some(
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
