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

  // Copy every subject's card from the current slot to the next. Cards for
  // subjects recorded ONLY in the target slot are kept — copying must never
  // silently destroy another subject's already-entered data.
  const sourceCards = (observations[currentTime] ?? []).map((observation) => ({
    ...observation,
  }));
  const copiedSubjects = new Set(sourceCards.map((card) => card.subjectId));
  const targetOnlyCards = (observations[nextTime] ?? []).filter(
    (card) => !copiedSubjects.has(card.subjectId)
  );
  updatedObservations[nextTime] = [...sourceCards, ...targetOnlyCards];

  return {
    success: true,
    updatedObservations,
    targetTime: nextTime,
  };
};
