import { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { validateTimeRange } from '../utils/timeUtils';
import { validateLocation, validateObserverName } from '../utils/validators';
import { observationErrorKey, slotErrorKey } from '../utils/errorKeys';

// Fields to validate in observations (all except 'notes' which is always optional)
const OBSERVATION_FIELDS_TO_VALIDATE = [
  'behavior',
  'location',
  'object',
  'objectOther',
  'objectInteractionType',
  'objectInteractionTypeOther',
  'animal',
  'animalOther',
  'animalInteractionType',
  'animalInteractionTypeOther',
  'description',
];

export const useFormValidation = () => {
  const {
    requiresLocation,
    requiresObject,
    requiresAnimal,
    requiresObjectInteraction,
    requiresAnimalInteraction,
    requiresDescription,
    VALID_PERCHES,
  } = useConfig();
  const [fieldErrors, setFieldErrors] = useState({});

  const validateMetadataField = (field, value, metadata) => {
    let error = null;

    switch (field) {
      case 'observerName':
        error = validateObserverName(value);
        break;
      case 'date':
        if (!value) {
          error = 'Date is required';
        }
        break;
      case 'startTime':
      case 'endTime':
        // Validate time range when either start or end time changes
        if (metadata && metadata.startTime && metadata.endTime) {
          const validation = validateTimeRange(
            metadata.startTime,
            metadata.endTime
          );
          if (!validation.valid) {
            error = validation.error;
          }
        } else if (!value) {
          error = 'Time range is required';
        }
        break;
      default:
        break;
    }

    return error;
  };

  const validateObservationField = (field, value, observation) => {
    let error = null;
    const behaviorValue = observation.behavior;

    if (field === 'behavior') {
      if (!value) {
        error = 'Please select a behavior';
      }
    } else if (field === 'location') {
      if (requiresLocation(behaviorValue)) {
        const validation = validateLocation(value, VALID_PERCHES);
        if (!validation.valid) {
          error = validation.error;
        }
      }
    } else if (field === 'object') {
      if (requiresObject(behaviorValue)) {
        if (!value) {
          error = 'Object is required';
        }
      }
    } else if (field === 'objectOther') {
      if (requiresObject(behaviorValue) && observation.object === 'other') {
        if (!value.trim()) {
          error = 'Please specify the object';
        }
      }
    } else if (field === 'animal') {
      if (requiresAnimal(behaviorValue)) {
        if (!value) {
          error = 'Animal is required';
        }
      }
    } else if (field === 'animalOther') {
      if (requiresAnimal(behaviorValue) && observation.animal === 'other') {
        if (!value.trim()) {
          error = 'Please specify the animal';
        }
      }
    } else if (field === 'objectInteractionType') {
      if (requiresObjectInteraction(behaviorValue)) {
        if (!value) {
          error = 'Object interaction type is required';
        }
      }
    } else if (field === 'objectInteractionTypeOther') {
      if (
        requiresObjectInteraction(behaviorValue) &&
        observation.objectInteractionType === 'other'
      ) {
        if (!value.trim()) {
          error = 'Please specify the interaction';
        }
      }
    } else if (field === 'animalInteractionType') {
      if (requiresAnimalInteraction(behaviorValue)) {
        if (!value) {
          error = 'Animal interaction type is required';
        }
      }
    } else if (field === 'animalInteractionTypeOther') {
      if (
        requiresAnimalInteraction(behaviorValue) &&
        observation.animalInteractionType === 'other'
      ) {
        if (!value.trim()) {
          error = 'Please specify the interaction';
        }
      }
    } else if (field === 'description') {
      if (requiresDescription(behaviorValue)) {
        if (!value.trim()) {
          error = 'Description is required for this behavior';
        }
      }
    }

    return error;
  };

  const validateMetadata = (metadata) => {
    const errors = {};

    // Validate each field
    ['observerName', 'date', 'startTime', 'endTime'].forEach((field) => {
      const error = validateMetadataField(field, metadata[field], metadata);
      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  };

  /**
   * Helper: Validate all fields for one subject's observation card
   * @param {string} time - The time slot
   * @param {Object} observation - One subject's observation card
   * @returns {Object} - Errors keyed `${time}_${cardId}_${field}`
   */
  const validateObservation = (time, observation) => {
    const errors = {};

    // Validate each field - validateObservationField returns null if field is not required
    OBSERVATION_FIELDS_TO_VALIDATE.forEach((field) => {
      const error = validateObservationField(
        field,
        observation[field],
        observation
      );
      if (error) {
        errors[observationErrorKey(time, observation.cardId, field)] = error;
      }
    });

    return errors;
  };

  const validateObservations = (observations) => {
    const errors = {};

    Object.entries(observations).forEach(([time, slot]) => {
      if (slot.length === 0) {
        // The backend rejects empty slots (array min(1)) — surface a
        // client-side error instead of a generic server 400
        errors[slotErrorKey(time)] =
          'Record at least one subject for this time slot';
        return;
      }
      if (slot.length > 20) {
        // Mirror of the backend's per-slot cap (array max(20)). The add
        // button stops at 20, but copy-to-next can merge past it
        errors[slotErrorKey(time)] =
          'At most 20 subjects can be recorded per time slot — remove some cards';
      }
      slot.forEach((observation) => {
        Object.assign(errors, validateObservation(time, observation));
      });
    });

    return errors;
  };

  const validateForm = (metadata, observations) => {
    const metadataErrors = validateMetadata(metadata);
    const observationErrors = validateObservations(observations);

    const allErrors = { ...metadataErrors, ...observationErrors };
    setFieldErrors(allErrors);

    return Object.keys(allErrors).length === 0;
  };

  const validateSingleMetadataField = (field, value, metadata) => {
    const error = validateMetadataField(field, value, metadata);

    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field];
        // Also clear the paired time field error if validating start/end time
        if (field === 'startTime') {
          delete newErrors['endTime'];
        } else if (field === 'endTime') {
          delete newErrors['startTime'];
        }
      }
      return newErrors;
    });
  };

  const validateSingleObservationField = (
    time,
    cardId,
    field,
    observations,
    currentValue = null
  ) => {
    const observation = (observations[time] ?? []).find(
      (card) => card.cardId === cardId
    );
    if (!observation) return;

    // Use provided currentValue if available, otherwise read from observation
    const value = currentValue !== null ? currentValue : observation[field];
    const error = validateObservationField(field, value, observation);

    const errorKey = observationErrorKey(time, cardId, field);
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[errorKey] = error;
      } else {
        delete newErrors[errorKey];
      }
      return newErrors;
    });
  };

  /**
   * Clear every error belonging to one subject's card in one slot —
   * used when the card is removed so re-adding the subject starts clean.
   */
  const clearObservationErrors = (time, cardId) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      OBSERVATION_FIELDS_TO_VALIDATE.forEach((field) => {
        delete newErrors[observationErrorKey(time, cardId, field)];
      });
      return newErrors;
    });
  };

  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setFieldErrors({});
  };

  /**
   * Validate all required fields for a single observation slot — every
   * subject's card. Used before copying to next slot to ensure valid data.
   * @param {string} time - The time slot to validate
   * @param {Object} observations - All observations
   * @returns {Object} - { valid: boolean, errors: Object }
   */
  const validateObservationSlot = (time, observations) => {
    const slot = observations[time];

    if (!slot || slot.length === 0) {
      const errors = {
        [slotErrorKey(time)]: 'Record at least one subject for this time slot',
      };
      setFieldErrors((prev) => ({ ...prev, ...errors }));
      return { valid: false, errors };
    }

    // Use shared validation helper across every card in the slot
    const errors = {};
    slot.forEach((observation) => {
      Object.assign(errors, validateObservation(time, observation));
    });

    // Update field errors state with any errors found
    if (Object.keys(errors).length > 0) {
      setFieldErrors((prev) => ({ ...prev, ...errors }));
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  };

  return {
    fieldErrors,
    validateForm,
    validateSingleMetadataField,
    validateSingleObservationField,
    validateObservationSlot,
    clearObservationErrors,
    clearFieldError,
    clearAllErrors,
  };
};
