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

export const useFormState = () => {
  const today = new Date().toISOString().split('T')[0];

  const [metadata, setMetadata] = useState({
    observerName: '',
    date: today,
    startTime: '',
    endTime: '',
    aviary: "Sayyida's Cove",
    patient: 'Sayyida',
    mode: 'live',
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [observations, setObservations] = useState({});

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
    setMetadata({
      observerName: '',
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
    // Use queueMicrotask to ensure this runs after the current render cycle
    // and the useEffect has completed, but before the next paint.
    queueMicrotask(() => {
      setObservations(draftObservations);
    });
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
