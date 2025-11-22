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
 * Copy observation data to the next time slot
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

  // Copy all fields from current observation to next
  updatedObservations[nextTime] = { ...observations[currentTime] };

  return {
    success: true,
    updatedObservations,
    targetTime: nextTime,
  };
};
