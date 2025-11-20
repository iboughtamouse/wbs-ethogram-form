import { useState } from 'react';
import { BEHAVIORS, VALID_PERCHES } from '../constants';
import { validateTimeRange } from '../utils/timeUtils';

export const useFormValidation = () => {
  const [fieldErrors, setFieldErrors] = useState({});

  const validateMetadataField = (field, value, metadata) => {
    let error = null;

    switch (field) {
      case 'observerName':
        if (!value.trim()) {
          error = 'Discord username is required';
        }
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
          const validation = validateTimeRange(metadata.startTime, metadata.endTime);
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

  const validateObservationField = (time, field, value, observations) => {
    let error = null;
    const observation = observations[time];
    const behaviorDef = BEHAVIORS.find(b => b.value === observation.behavior);

    if (field === 'behavior') {
      if (!value) {
        error = 'Please select a behavior';
      }
    } else if (field === 'location') {
      if (behaviorDef?.requiresLocation) {
        if (!value.trim()) {
          error = 'Location is required for this behavior';
        } else {
          const locationValue = value.toUpperCase().trim();
          const isValidPerch = VALID_PERCHES.some(p => 
            p.toString().toUpperCase() === locationValue
          );
          if (!isValidPerch && locationValue !== 'GROUND') {
            error = `Invalid perch number "${value}"`;
          }
        }
      }
    } else if (field === 'object') {
      if (behaviorDef?.requiresObject) {
        if (!value) {
          error = 'Object is required';
        }
      }
    } else if (field === 'objectOther') {
      if (behaviorDef?.requiresObject && observation.object === 'other') {
        if (!value.trim()) {
          error = 'Please specify the object';
        }
      }
    } else if (field === 'animal') {
      if (behaviorDef?.requiresAnimal) {
        if (!value) {
          error = 'Animal is required';
        }
      }
    } else if (field === 'animalOther') {
      if (behaviorDef?.requiresAnimal && observation.animal === 'other') {
        if (!value.trim()) {
          error = 'Please specify the animal';
        }
      }
    } else if (field === 'interactionType') {
      if (behaviorDef?.requiresInteraction) {
        if (!value) {
          error = 'Interaction type is required';
        }
      }
    } else if (field === 'interactionTypeOther') {
      if (behaviorDef?.requiresInteraction && observation.interactionType === 'other') {
        if (!value.trim()) {
          error = 'Please specify the interaction';
        }
      }
    } else if (field === 'description') {
      if (behaviorDef?.requiresDescription) {
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
    ['observerName', 'date', 'startTime', 'endTime'].forEach(field => {
      const error = validateMetadataField(field, metadata[field], metadata);
      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  };

  const validateObservations = (observations) => {
    const errors = {};

    Object.entries(observations).forEach(([time, obs]) => {
      const behaviorError = validateObservationField(time, 'behavior', obs.behavior, observations);
      if (behaviorError) {
        errors[`${time}_behavior`] = behaviorError;
      }

      const locationError = validateObservationField(time, 'location', obs.location, observations);
      if (locationError) {
        errors[`${time}_location`] = locationError;
      }

      const objectError = validateObservationField(time, 'object', obs.object, observations);
      if (objectError) {
        errors[`${time}_object`] = objectError;
      }

      const objectOtherError = validateObservationField(time, 'objectOther', obs.objectOther, observations);
      if (objectOtherError) {
        errors[`${time}_objectOther`] = objectOtherError;
      }

      const animalError = validateObservationField(time, 'animal', obs.animal, observations);
      if (animalError) {
        errors[`${time}_animal`] = animalError;
      }

      const animalOtherError = validateObservationField(time, 'animalOther', obs.animalOther, observations);
      if (animalOtherError) {
        errors[`${time}_animalOther`] = animalOtherError;
      }

      const interactionTypeError = validateObservationField(time, 'interactionType', obs.interactionType, observations);
      if (interactionTypeError) {
        errors[`${time}_interactionType`] = interactionTypeError;
      }

      const interactionTypeOtherError = validateObservationField(time, 'interactionTypeOther', obs.interactionTypeOther, observations);
      if (interactionTypeOtherError) {
        errors[`${time}_interactionTypeOther`] = interactionTypeOtherError;
      }

      const descriptionError = validateObservationField(time, 'description', obs.description, observations);
      if (descriptionError) {
        errors[`${time}_description`] = descriptionError;
      }
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
    
    setFieldErrors(prev => {
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

  const validateSingleObservationField = (time, field, observations, currentValue = null) => {
    const observation = observations[time];
    // Use provided currentValue if available, otherwise read from observation
    const value = currentValue !== null ? currentValue : observation[field];
    const error = validateObservationField(time, field, value, observations);
    
    const errorKey = `${time}_${field}`;
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[errorKey] = error;
      } else {
        delete newErrors[errorKey];
      }
      return newErrors;
    });
  };

  const clearFieldError = (field) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const clearAllErrors = () => {
    setFieldErrors({});
  };

  return {
    fieldErrors,
    validateForm,
    validateSingleMetadataField,
    validateSingleObservationField,
    clearFieldError,
    clearAllErrors
  };
};
