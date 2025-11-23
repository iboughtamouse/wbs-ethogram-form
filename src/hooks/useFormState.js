/**
 * useFormState Hook
 *
 * Encapsulates form state management and time slot generation.
 * Provides handlers for metadata and observation changes.
 */

import { useState, useEffect, useCallback } from 'react';
import { generateTimeSlots, validateTimeRange } from '../utils/timeUtils';
import { copyObservationToNext } from '../utils/observationUtils';
import {
  generateObservationsForSlots,
  updateObservationField,
} from '../services/formStateManager';
import { loadObserverName, saveObserverName } from '../utils/localStorageUtils';

export const useFormState = () => {
  const today = new Date().toISOString().split('T')[0];

  // Load saved observer name from localStorage on initial mount
  const savedObserverName = loadObserverName() || '';

  const [metadata, setMetadata] = useState({
    observerName: savedObserverName,
    date: today,
    startTime: '',
    endTime: '',
    aviary: "Sayyida's Cove",
    patient: 'Sayyida',
    mode: 'live',
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [observations, setObservations] = useState({});

  // Save observer name to localStorage whenever it changes
  useEffect(() => {
    if (metadata.observerName) {
      saveObserverName(metadata.observerName);
    }
  }, [metadata.observerName]);

  // Generate time slots when start/end time changes
  useEffect(() => {
    if (metadata.startTime && metadata.endTime) {
      // Validate time range before generating slots
      const validation = validateTimeRange(
        metadata.startTime,
        metadata.endTime
      );

      if (validation.valid) {
        const slots = generateTimeSlots(metadata.startTime, metadata.endTime);
        setTimeSlots(slots);

        // Initialize observations for new slots (preserving existing data)
        const newObservations = generateObservationsForSlots(
          slots,
          observations
        );
        setObservations(newObservations);
      } else {
        // Invalid time range - clear slots and observations
        setTimeSlots([]);
        setObservations({});
      }
    } else {
      setTimeSlots([]);
      setObservations({});
    }
    // Note: `observations` is intentionally excluded from dependencies.
    // We only want to regenerate time slots when start/end times change,
    // not when observation data changes. The generateObservationsForSlots
    // function accesses the current observations via closure, which is
    // the correct behavior for preserving existing data during slot regeneration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.startTime, metadata.endTime]);

  const handleMetadataChange = useCallback((field, value) => {
    setMetadata((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleObservationChange = useCallback((time, field, value) => {
    setObservations((prev) => updateObservationField(prev, time, field, value));
  }, []);

  const handleCopyToNext = useCallback(
    (time) => {
      const result = copyObservationToNext(observations, timeSlots, time);

      if (result.success) {
        setObservations(result.updatedObservations);
        return true;
      }

      return false;
    },
    [observations, timeSlots]
  );

  const resetForm = useCallback(() => {
    // Keep the observer name from localStorage when resetting
    const savedName = loadObserverName() || '';

    setMetadata({
      observerName: savedName,
      date: new Date().toISOString().split('T')[0],
      startTime: '',
      endTime: '',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    });
    setTimeSlots([]);
    setObservations({});
  }, []);

  const restoreDraft = useCallback((draftMetadata, draftObservations) => {
    // First, update metadata (will trigger time slot regeneration via useEffect)
    setMetadata(draftMetadata);

    // Then schedule observation restoration after time slots have been generated.
    // We use setTimeout(..., 0) to defer execution to the next event loop cycle,
    // ensuring the useEffect that generates time slots and initializes observations
    // completes before we restore the draft observations. This prevents a race condition
    // where the useEffect could overwrite the restored draft data.
    setTimeout(() => {
      setObservations(draftObservations);
    }, 0);
  }, []);

  return {
    metadata,
    timeSlots,
    observations,
    handleMetadataChange,
    handleObservationChange,
    handleCopyToNext,
    resetForm,
    restoreDraft,
  };
};
