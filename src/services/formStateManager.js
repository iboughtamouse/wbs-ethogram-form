/**
 * Form State Management Service
 *
 * Pure functions for managing observation state and time slots.
 * Since Phase 2, every time slot holds an ARRAY of per-subject observations
 * ({ subjectType, subjectId, ...fields }) — one card per recorded subject.
 */

/**
 * Creates an empty observation card for one subject
 * @param {string} subjectType - 'foster_parent' | 'juvenile' | 'baby'
 * @param {string} subjectId - The subject's name (P2-D7: names are the ids)
 * @returns {Object} Empty observation with default values
 */
export const createEmptyObservation = (subjectType, subjectId) => ({
  subjectType,
  subjectId,
  behavior: '',
  location: '',
  notes: '',
  description: '',
  object: '',
  objectOther: '',
  objectInteractionType: '',
  objectInteractionTypeOther: '',
  animal: '',
  animalOther: '',
  animalInteractionType: '',
  animalInteractionTypeOther: '',
});

/**
 * Generates observations for given time slots, preserving existing data.
 * New slots start with one card for the default subject (the foster parent,
 * per P2-D2) — additional subjects are added per slot by the observer.
 *
 * @param {string[]} slots - Array of time slot strings (e.g., ['09:00'])
 * @param {Object} existingObservations - Existing observations keyed by time
 * @param {Object|null} defaultSubject - { type, name } for new slots' card
 * @returns {Object} Observations object keyed by time slot
 */
export const generateObservationsForSlots = (
  slots,
  existingObservations,
  defaultSubject = null
) => {
  const newObservations = {};

  slots.forEach((time) => {
    // Keep existing observation cards if present, otherwise create the
    // default subject's card (or an empty slot when no subject is configured)
    newObservations[time] =
      existingObservations[time] ||
      (defaultSubject
        ? [createEmptyObservation(defaultSubject.type, defaultSubject.name)]
        : []);
  });

  return newObservations;
};

/**
 * Updates a single field on one subject's card with conditional logic
 *
 * Handles:
 * - Clearing location when behavior is empty
 * - Clearing all sub-fields when behavior changes
 * - Clearing "other" text fields when dropdown changes away from "other"
 *
 * @param {Object} observations - Current observations object
 * @param {string} time - Time slot key
 * @param {string} subjectId - Which subject's card to update
 * @param {string} field - Field name to update
 * @param {*} value - New value for the field
 * @returns {Object} Updated observations object (immutable)
 */
export const updateObservationField = (
  observations,
  time,
  subjectId,
  field,
  value
) => {
  const slot = observations[time] ?? [];

  const updatedSlot = slot.map((observation) => {
    if (observation.subjectId !== subjectId) return observation;

    const updatedObservation = {
      ...observation,
      [field]: value,
    };

    // Handle behavior field changes with special logic
    if (field === 'behavior') {
      // When behavior is cleared (set to empty), also clear location
      // since most behaviors don't require a location. This provides
      // a cleaner UX when resetting the observation.
      if (!value) {
        updatedObservation.location = '';
      }

      // Always clear interaction-specific sub-fields when behavior changes,
      // regardless of whether it's being set to empty or a different value.
      // This ensures stale interaction data doesn't persist when switching behaviors.
      updatedObservation.description = '';
      updatedObservation.object = '';
      updatedObservation.objectOther = '';
      updatedObservation.objectInteractionType = '';
      updatedObservation.objectInteractionTypeOther = '';
      updatedObservation.animal = '';
      updatedObservation.animalOther = '';
      updatedObservation.animalInteractionType = '';
      updatedObservation.animalInteractionTypeOther = '';
    }

    // Clear "other" text when dropdown changes away from "other"
    if (field === 'object' && value !== 'other') {
      updatedObservation.objectOther = '';
    }
    if (field === 'animal' && value !== 'other') {
      updatedObservation.animalOther = '';
    }
    if (field === 'objectInteractionType' && value !== 'other') {
      updatedObservation.objectInteractionTypeOther = '';
    }
    if (field === 'animalInteractionType' && value !== 'other') {
      updatedObservation.animalInteractionTypeOther = '';
    }

    return updatedObservation;
  });

  return {
    ...observations,
    [time]: updatedSlot,
  };
};

/**
 * Adds an empty card for another subject to a time slot. No-op if the
 * subject already has a card in that slot.
 *
 * @param {Object} observations - Current observations object
 * @param {string} time - Time slot key
 * @param {string} subjectType - The subject's type
 * @param {string} subjectId - The subject's name
 * @returns {Object} Updated observations object (immutable)
 */
export const addSubjectObservation = (
  observations,
  time,
  subjectType,
  subjectId
) => {
  const slot = observations[time] ?? [];
  if (slot.some((observation) => observation.subjectId === subjectId)) {
    return observations;
  }

  return {
    ...observations,
    [time]: [...slot, createEmptyObservation(subjectType, subjectId)],
  };
};

/**
 * Removes one subject's card from a time slot.
 *
 * @param {Object} observations - Current observations object
 * @param {string} time - Time slot key
 * @param {string} subjectId - The subject's name
 * @returns {Object} Updated observations object (immutable)
 */
export const removeSubjectObservation = (observations, time, subjectId) => {
  const slot = observations[time] ?? [];

  return {
    ...observations,
    [time]: slot.filter((observation) => observation.subjectId !== subjectId),
  };
};
