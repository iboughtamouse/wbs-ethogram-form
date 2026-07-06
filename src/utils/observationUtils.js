import { GENERIC_JUVENILE_ID } from '../constants/ui';
import { withNewCardId } from '../services/formStateManager';

/**
 * Get the next time slot in the sequence
 * @param {string[]} timeSlots - Array of time slot strings
 * @param {string} currentTime - Current time slot
 * @returns {string|null} - Next time slot or null if at end
 */
export const getNextTimeSlot = (timeSlots, currentTime) => {
  const currentIndex = timeSlots.indexOf(currentTime);

  // Not found or last slot
  if (currentIndex === -1 || currentIndex === timeSlots.length - 1) {
    return null;
  }

  return timeSlots[currentIndex + 1];
};

/**
 * Copy a time slot's observations to the next slot. Copies the whole card
 * set — every recorded subject — per Phase 2 P2-D2.
 *
 * Merge semantics: a copied NAMED card replaces the target's card for the
 * same subject (the P2-D2 overwrite intent); target-only named subjects are
 * kept. GENERIC "Juvenile" cards (P2-D8) have no identity, so they merge
 * POSITIONALLY: the copy replaces the target's first N generic cards (N =
 * generic cards in the source) and any extra target generic cards survive —
 * copying must never silently destroy a distinct unidentified bird's
 * already-entered data. Positional replacement keeps the copy idempotent
 * (clicking twice doesn't pile up duplicates). Copied cards get fresh
 * cardIds, so stale target error keys can never attach to the fresh data.
 *
 * @param {Object} observations - Current observations object
 * @param {string[]} timeSlots - Array of time slot strings
 * @param {string} currentTime - Current time slot to copy from
 * @returns {Object} - Result object with success status and updated observations
 */
export const copyObservationToNext = (observations, timeSlots, currentTime) => {
  const nextTime = getNextTimeSlot(timeSlots, currentTime);

  if (!nextTime) {
    return {
      success: false,
      error: 'No next time slot available',
      updatedObservations: observations,
    };
  }

  // Deep clone to avoid mutation
  const updatedObservations = JSON.parse(JSON.stringify(observations));

  const sourceCards = (observations[currentTime] ?? []).map(withNewCardId);
  const copiedNamedSubjects = new Set(
    sourceCards
      .filter((card) => card.subjectId !== GENERIC_JUVENILE_ID)
      .map((card) => card.subjectId)
  );
  const copiedGenericCount = sourceCards.filter(
    (card) => card.subjectId === GENERIC_JUVENILE_ID
  ).length;

  let genericSeen = 0;
  const survivingTargetCards = (observations[nextTime] ?? []).filter((card) => {
    if (card.subjectId === GENERIC_JUVENILE_ID) {
      genericSeen += 1;
      return genericSeen > copiedGenericCount;
    }
    return !copiedNamedSubjects.has(card.subjectId);
  });
  updatedObservations[nextTime] = [...sourceCards, ...survivingTargetCards];

  return {
    success: true,
    updatedObservations,
    targetTime: nextTime,
  };
};
