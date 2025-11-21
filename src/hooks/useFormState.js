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
      date: today,
      startTime: '',
      endTime: '',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    });
    setTimeSlots([]);
    setObservations({});
  }, [today]);

  return {
    metadata,
    timeSlots,
    observations,
    handleMetadataChange,
    handleObservationChange,
    handleCopyToNext,
    resetForm,
    setMetadata,
    setObservations,
  };
};
