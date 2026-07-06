/**
 * Form State Management Service
 *
 * Pure functions for managing observation state and time slots.
 * Since Phase 2, every time slot holds an ARRAY of per-subject observations
 * ({ cardId, subjectType, subjectId, ...fields }) — one card per recorded
 * subject. Cards are keyed by a slot-local cardId, NOT subjectId: generic
 * "Juvenile" cards (P2-D8) may legally duplicate a subjectId within a slot.
 * The backend strips cardId from the payload (unknown keys are dropped).
 */

/** Slot-local card key — unique enough to never collide within a session. */
const newCardId = () =>
  globalThis.crypto?.randomUUID
    ? globalThis.crypto.randomUUID()
    : `card-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * Ensures every card in every slot carries a cardId — drafts saved before
 * cardIds existed (or hand-edited ones) are normalized on restore.
 * @param {Object} observations - Observations keyed by time (arrays of cards)
 * @returns {Object} Observations with a cardId on every card
 */
export const ensureCardIds = (observations) => {
  const normalized = {};
  Object.entries(observations).forEach(([time, slot]) => {
    normalized[time] = slot.map((card) =>
      card.cardId ? card : { ...card, cardId: newCardId() }
    );
  });
  return normalized;
};

/**
 * Creates an empty observation card for one subject
 * @param {string} subjectType - 'foster_parent' | 'juvenile' | 'baby'
 * @param {string} subjectId - The subject's name (P2-D7: names are the ids),
 *   or the generic GENERIC_JUVENILE_ID literal (P2-D8)
 * @returns {Object} Empty observation with default values
 */
export const createEmptyObservation = (subjectType, subjectId) => ({
  cardId: newCardId(),
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
 * Updates a single field on one card with conditional logic
 *
 * Handles:
 * - Clearing location when behavior is empty
 * - Clearing all sub-fields when behavior changes
 * - Clearing "other" text fields when dropdown changes away from "other"
 *
 * @param {Object} observations - Current observations object
 * @param {string} time - Time slot key
 * @param {string} cardId - Which card to update
 * @param {string} field - Field name to update
 * @param {*} value - New value for the field
 * @returns {Object} Updated observations object (immutable)
 */
export const updateObservationField = (
  observations,
  time,
  cardId,
  field,
  value
) => {
  const slot = observations[time] ?? [];

  const updatedSlot = slot.map((observation) => {
    if (observation.cardId !== cardId) return observation;

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
 * Adds an empty card for another subject to a time slot. Named subjects are
 * deduped (no-op if already recorded in the slot); generic cards (P2-D8) set
 * allowDuplicate — several unidentified juveniles can share one slot.
 *
 * @param {Object} observations - Current observations object
 * @param {string} time - Time slot key
 * @param {Object} subject - { type, name, allowDuplicate? }
 * @returns {Object} Updated observations object (immutable)
 */
export const addSubjectObservation = (observations, time, subject) => {
  const slot = observations[time] ?? [];
  if (
    !subject.allowDuplicate &&
    slot.some((observation) => observation.subjectId === subject.name)
  ) {
    return observations;
  }

  return {
    ...observations,
    [time]: [...slot, createEmptyObservation(subject.type, subject.name)],
  };
};

/**
 * Removes one card from a time slot.
 *
 * @param {Object} observations - Current observations object
 * @param {string} time - Time slot key
 * @param {string} cardId - The card to remove
 * @returns {Object} Updated observations object (immutable)
 */
export const removeSubjectObservation = (observations, time, cardId) => {
  const slot = observations[time] ?? [];

  return {
    ...observations,
    [time]: slot.filter((observation) => observation.cardId !== cardId),
  };
};
