/**
 * useFormState Hook
 *
 * Encapsulates form state management and time slot generation.
 * Provides handlers for metadata and observation changes.
 * Since Phase 2, each time slot holds an array of per-subject observation
 * cards; metadata.aviary carries the aviary SLUG (display names are resolved
 * from config wherever the aviary is rendered).
 */

import { useState, useEffect, useCallback } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { generateTimeSlots, validateTimeRange } from '../utils/timeUtils';
import { getTodayWBS } from '../utils/dateUtils';
import { copyObservationToNext } from '../utils/observationUtils';
import {
  generateObservationsForSlots,
  updateObservationField,
  addSubjectObservation,
  removeSubjectObservation,
} from '../services/formStateManager';

export const useFormState = () => {
  // Aviary identity comes from config. The slug is deliberately mount-frozen
  // in the initial state and re-read only by resetForm/restoreDraft, even if
  // a fetched config upgrades the bundle post-mount — safe because slugs are
  // stable keys (append-only, never renamed by the publish rules).
  const { aviarySlug, getSubjectsPresentOn, selectAviary } = useConfig();
  const today = getTodayWBS();

  const [metadata, setMetadata] = useState({
    observerName: '',
    date: today,
    startTime: '',
    endTime: '',
    aviary: aviarySlug,
    mode: 'live',
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [observations, setObservations] = useState({});

  // New slots start with one card for the default subject (P2-D2): the
  // foster parent present on the observation date, else the first subject
  // present, else no card (an aviary with no residents that day).
  const defaultSubjectFor = (date) => {
    const present = getSubjectsPresentOn(date);
    const subject =
      present.find((s) => s.type === 'foster_parent') ?? present[0];
    return subject ? { type: subject.type, name: subject.name } : null;
  };

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
          observations,
          defaultSubjectFor(metadata.date)
        );
        setObservations(newObservations);
      }
      // Note: On invalid range, we preserve existing slots and observations
      // rather than clearing them. This prevents data loss during editing.
    } else {
      // Only clear when fields are completely empty
      setTimeSlots([]);
      setObservations({});
    }
    // Note: `observations` (and the date/subject context) are intentionally
    // excluded from dependencies. We only want to regenerate time slots when
    // start/end times change, not when observation data changes. The values
    // are read via closure, which is the correct behavior for preserving
    // existing data during slot regeneration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metadata.startTime, metadata.endTime]);

  const handleMetadataChange = useCallback(
    (field, value) => {
      setMetadata((prev) => ({ ...prev, [field]: value }));

      // Picking an aviary re-derives the vocabulary bundle from config.
      // Existing cards keep their values — the keep-listed rule renders them.
      if (field === 'aviary') {
        selectAviary(value);
      }
    },
    [selectAviary]
  );

  const handleObservationChange = useCallback(
    (time, subjectId, field, value) => {
      setObservations((prev) =>
        updateObservationField(prev, time, subjectId, field, value)
      );
    },
    []
  );

  const handleAddSubject = useCallback((time, subject) => {
    setObservations((prev) =>
      addSubjectObservation(prev, time, subject.type, subject.name)
    );
  }, []);

  const handleRemoveSubject = useCallback((time, subjectId) => {
    setObservations((prev) => removeSubjectObservation(prev, time, subjectId));
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
      date: getTodayWBS(),
      startTime: '',
      endTime: '',
      aviary: aviarySlug,
      mode: 'live',
    });
    setTimeSlots([]);
    setObservations({});
  }, [aviarySlug]);

  const restoreDraft = useCallback(
    (draftMetadata, draftObservations) => {
      // First, update metadata (will trigger time slot regeneration via useEffect)
      setMetadata(draftMetadata);

      // The draft's aviary drives the vocabulary bundle too
      if (draftMetadata.aviary) {
        selectAviary(draftMetadata.aviary);
      }

      // Then schedule observation restoration after time slots have been generated.
      // We use setTimeout(..., 0) to defer execution to the next event loop cycle,
      // ensuring the useEffect that generates time slots and initializes observations
      // completes before we restore the draft observations. This prevents a race condition
      // where the useEffect could overwrite the restored draft data.
      setTimeout(() => {
        setObservations(draftObservations);
      }, 0);
    },
    [selectAviary]
  );

  return {
    metadata,
    timeSlots,
    observations,
    handleMetadataChange,
    handleObservationChange,
    handleAddSubject,
    handleRemoveSubject,
    handleCopyToNext,
    resetForm,
    restoreDraft,
  };
};
