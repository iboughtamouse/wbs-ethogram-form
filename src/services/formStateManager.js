/**
 * Form State Management Service
 *
 * Pure functions for managing observation state and time slots.
 * Handles observation initialization, updates, and conditional field logic.
 */

/**
 * Creates an empty observation object with all required fields
 * @returns {Object} Empty observation with default values
 */
const createEmptyObservation = () => ({
  behavior: '',
  location: '',
  notes: '',
  description: '',
  object: '',
  objectOther: '',
  animal: '',
  animalOther: '',
  interactionType: '',
  interactionTypeOther: '',
});

/**
 * Generates observations for given time slots, preserving existing data
 *
 * @param {string[]} slots - Array of time slot strings (e.g., ['09:00', '09:05'])
 * @param {Object} existingObservations - Existing observations keyed by time
 * @returns {Object} Observations object keyed by time slot
 */
export const generateObservationsForSlots = (slots, existingObservations) => {
  const newObservations = {};

  slots.forEach((time) => {
    // Keep existing observation if it exists, otherwise create new
    newObservations[time] =
      existingObservations[time] || createEmptyObservation();
  });

  return newObservations;
};

/**
 * Updates a single field in an observation with conditional logic
 *
 * Handles:
 * - Clearing location when behavior is empty
 * - Clearing all sub-fields when behavior changes
 * - Clearing "other" text fields when dropdown changes away from "other"
 *
 * @param {Object} observations - Current observations object
 * @param {string} time - Time slot key
 * @param {string} field - Field name to update
 * @param {*} value - New value for the field
 * @returns {Object} Updated observations object (immutable)
 */
export const updateObservationField = (observations, time, field, value) => {
  const currentObservation = observations[time] || createEmptyObservation();

  const updatedObservation = {
    ...currentObservation,
    [field]: value,
  };

  // Clear location if behavior doesn't require it
  if (field === 'behavior' && !value) {
    updatedObservation.location = '';
  }

  // Clear all conditional sub-fields when behavior changes
  if (field === 'behavior') {
    updatedObservation.description = '';
    updatedObservation.object = '';
    updatedObservation.objectOther = '';
    updatedObservation.animal = '';
    updatedObservation.animalOther = '';
    updatedObservation.interactionType = '';
    updatedObservation.interactionTypeOther = '';
  }

  // Clear "other" text when dropdown changes away from "other"
  if (field === 'object' && value !== 'other') {
    updatedObservation.objectOther = '';
  }
  if (field === 'animal' && value !== 'other') {
    updatedObservation.animalOther = '';
  }
  if (field === 'interactionType' && value !== 'other') {
    updatedObservation.interactionTypeOther = '';
  }

  return {
    ...observations,
    [time]: updatedObservation,
  };
};
