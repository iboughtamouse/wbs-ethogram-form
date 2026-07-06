/**
 * useFormHandlers Hook
 *
 * Manages all form interaction handlers including metadata changes,
 * observation changes, validation triggers, copy-to-next, and form reset.
 * This hook coordinates between state management (useFormState) and
 * validation (useFormValidation).
 */

import { clearDraft } from '../utils/localStorageUtils';
import { observationErrorKey } from '../utils/errorKeys';

/**
 * Hook for managing form interaction handlers
 *
 * @param {Object} metadata - Current metadata state
 * @param {Object} observations - Current observations state
 * @param {Object} fieldErrors - Current validation errors
 * @param {Function} handleMetadataChange - Function to update metadata
 * @param {Function} handleObservationChange - Function to update observation
 * @param {Function} handleCopyToNext - Function to copy observation to next slot
 * @param {Function} resetForm - Function to reset entire form
 * @param {Function} validateSingleMetadataField - Function to validate single metadata field
 * @param {Function} validateSingleObservationField - Function to validate single observation field
 * @param {Function} validateObservationSlot - Function to validate entire observation slot
 * @param {Function} clearFieldError - Function to clear a specific field error
 * @param {Function} clearAllErrors - Function to clear all validation errors
 * @param {Function} setShowOutput - Function to control output preview visibility
 * @returns {Object} Form handler functions
 */
export function useFormHandlers({
  metadata,
  observations,
  fieldErrors,
  handleMetadataChange,
  handleObservationChange,
  handleRemoveSubject,
  handleCopyToNext,
  resetForm,
  validateSingleMetadataField,
  validateSingleObservationField,
  validateObservationSlot,
  clearObservationErrors,
  clearFieldError,
  clearAllErrors,
  setShowOutput,
}) {
  /**
   * Handle metadata field changes with optional validation
   * Clears errors on input, validates on blur
   */
  const onMetadataChange = (field, value, shouldValidate = false) => {
    handleMetadataChange(field, value);

    // Clear error when user starts typing
    if (!shouldValidate && fieldErrors[field]) {
      clearFieldError(field);
    }

    // Validate on blur
    if (shouldValidate) {
      // Need to construct updated metadata for validation
      const updatedMetadata = { ...metadata, [field]: value };
      validateSingleMetadataField(field, value, updatedMetadata);
    }
  };

  /**
   * Handle observation field changes
   * Clears field errors when user starts typing
   */
  const onObservationChange = (time, cardId, field, value) => {
    handleObservationChange(time, cardId, field, value);

    // Clear error when user starts typing
    const errorKey = observationErrorKey(time, cardId, field);
    if (fieldErrors[errorKey]) {
      clearFieldError(errorKey);
    }
  };

  /**
   * Handle observation field validation
   * Triggered on blur or Enter key
   */
  const onObservationValidate = (time, cardId, field, currentValue = null) => {
    validateSingleObservationField(
      time,
      cardId,
      field,
      observations,
      currentValue
    );
  };

  /**
   * Handle subject-card removal
   * Clears the card's validation errors first, so re-adding the same
   * subject never resurrects phantom errors on a pristine card
   */
  const onRemoveSubject = (time, cardId) => {
    clearObservationErrors(time, cardId);
    handleRemoveSubject(time, cardId);
  };

  /**
   * Handle copy-to-next with validation
   * Validates source observation before copying
   * Scrolls to first error if validation fails
   */
  const onCopyToNext = (time) => {
    // Validate the current observation slot before copying
    const validation = validateObservationSlot(time, observations);

    if (!validation.valid) {
      // Validation failed - errors are already set in state
      // Scroll to first error in this time slot (if scrollIntoView is available)
      const firstError = document.querySelector(`[data-time="${time}"] .error`);
      if (firstError && firstError.scrollIntoView) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }

    // Validation passed - proceed with copy
    return handleCopyToNext(time);
  };

  /**
   * Handle form reset
   * Clears form data, validation errors, output preview, and draft
   */
  const onReset = () => {
    resetForm();
    clearAllErrors();
    setShowOutput(false);
    clearDraft();
  };

  return {
    onMetadataChange,
    onObservationChange,
    onObservationValidate,
    onRemoveSubject,
    onCopyToNext,
    onReset,
  };
}
