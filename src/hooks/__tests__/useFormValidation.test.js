import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';

// Builds one subject observation card with all fields present
const makeCard = (overrides = {}) => ({
  subjectType: 'foster_parent',
  subjectId: 'Sayyida',
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
  ...overrides,
});

describe('useFormValidation', () => {
  describe('validateMetadata', () => {
    it('should validate observer name is required', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateSingleMetadataField('observerName', '', {
          observerName: '',
        });
      });

      expect(result.current.fieldErrors.observerName).toBe(
        'Observer name is required'
      );
    });

    it('should pass when observer name is provided', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateSingleMetadataField('observerName', 'testuser', {
          observerName: 'testuser',
        });
      });

      expect(result.current.fieldErrors.observerName).toBeUndefined();
    });

    it('should validate date is required', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateSingleMetadataField('date', '', { date: '' });
      });

      expect(result.current.fieldErrors.date).toBe('Date is required');
    });

    it('should validate time range is required', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateSingleMetadataField('startTime', '', {
          startTime: '',
          endTime: '',
        });
      });

      expect(result.current.fieldErrors.startTime).toBe(
        'Time range is required'
      );
    });

    it('should validate time range duration (too short)', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateSingleMetadataField('endTime', '09:03', {
          startTime: '09:00',
          endTime: '09:03',
        });
      });

      expect(result.current.fieldErrors.endTime).toBe(
        'Time range must be at least 5 minutes'
      );
    });

    it('should validate time range duration (too long)', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateSingleMetadataField('endTime', '10:05', {
          startTime: '09:00',
          endTime: '10:05',
        });
      });

      expect(result.current.fieldErrors.endTime).toBe(
        'Time range cannot exceed 1 hour'
      );
    });

    it('should pass with valid time range', () => {
      const { result } = renderHook(() => useFormValidation());

      act(() => {
        result.current.validateSingleMetadataField('endTime', '10:00', {
          startTime: '09:00',
          endTime: '10:00',
        });
      });

      expect(result.current.fieldErrors.endTime).toBeUndefined();
    });

    it('should clear paired time error when validating start time', () => {
      const { result } = renderHook(() => useFormValidation());

      // First set an error on endTime
      act(() => {
        result.current.validateSingleMetadataField('endTime', '09:03', {
          startTime: '09:00',
          endTime: '09:03',
        });
      });

      expect(result.current.fieldErrors.endTime).toBeDefined();

      // Now fix the time range by updating startTime
      act(() => {
        result.current.validateSingleMetadataField('startTime', '09:00', {
          startTime: '09:00',
          endTime: '09:30',
        });
      });

      expect(result.current.fieldErrors.startTime).toBeUndefined();
      expect(result.current.fieldErrors.endTime).toBeUndefined();
    });
  });

  describe('validateObservations', () => {
    it('should require behavior to be selected', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: '' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'behavior',
          observations
        );
      });

      expect(result.current.fieldErrors['09:00_Sayyida_behavior']).toBe(
        'Please select a behavior'
      );
    });

    it('should pass when behavior is selected', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'eating' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'behavior',
          observations
        );
      });

      expect(
        result.current.fieldErrors['09:00_Sayyida_behavior']
      ).toBeUndefined();
    });

    it('should require location when behavior requires it', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'walking', location: '' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'location',
          observations
        );
      });

      expect(result.current.fieldErrors['09:00_Sayyida_location']).toBe(
        'Location is required for this behavior'
      );
    });

    it('should accept valid perch number', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'walking', location: '5' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'location',
          observations
        );
      });

      expect(
        result.current.fieldErrors['09:00_Sayyida_location']
      ).toBeUndefined();
    });

    it('should accept "Ground" as location (case-insensitive)', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'preening', location: 'ground' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'location',
          observations
        );
      });

      expect(
        result.current.fieldErrors['09:00_Sayyida_location']
      ).toBeUndefined();
    });

    it('should accept special perch codes (BB1, F1, etc.)', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'preening', location: 'BB1' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'location',
          observations
        );
      });

      expect(
        result.current.fieldErrors['09:00_Sayyida_location']
      ).toBeUndefined();
    });

    it('should reject invalid perch number', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'walking', location: '99' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'location',
          observations
        );
      });

      expect(result.current.fieldErrors['09:00_Sayyida_location']).toBe(
        'Invalid perch number "99"'
      );
    });

    it('should not require location when behavior does not need it', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'drinking', location: '' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'location',
          observations
        );
      });

      expect(
        result.current.fieldErrors['09:00_Sayyida_location']
      ).toBeUndefined();
    });

    it('should track same-named field errors per subject in one slot', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [
          makeCard({ subjectId: 'Sayyida', behavior: '' }),
          makeCard({
            subjectType: 'resident',
            subjectId: 'Peanut',
            behavior: '',
          }),
        ],
      };

      // Both subjects' behavior fields are invalid
      act(() => {
        result.current.validateObservationSlot('09:00', observations);
      });

      expect(result.current.fieldErrors['09:00_Sayyida_behavior']).toBe(
        'Please select a behavior'
      );
      expect(result.current.fieldErrors['09:00_Peanut_behavior']).toBe(
        'Please select a behavior'
      );

      // Fixing one subject's field must NOT clear the other's error
      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'behavior',
          observations,
          'eating'
        );
      });

      expect(
        result.current.fieldErrors['09:00_Sayyida_behavior']
      ).toBeUndefined();
      expect(result.current.fieldErrors['09:00_Peanut_behavior']).toBe(
        'Please select a behavior'
      );
    });
  });

  describe('validateDescription', () => {
    it('should require description for other behavior', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'other', description: '' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'description',
          observations,
          ''
        );
      });

      expect(result.current.fieldErrors['09:00_Sayyida_description']).toBe(
        'Description is required for this behavior'
      );
    });

    it('should not require description when behavior does not need it', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'eating', description: '' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'description',
          observations,
          ''
        );
      });

      expect(
        result.current.fieldErrors['09:00_Sayyida_description']
      ).toBeUndefined();
    });

    it('should reject whitespace-only description', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'other', description: '   ' })],
      };

      act(() => {
        result.current.validateSingleObservationField(
          '09:00',
          'Sayyida',
          'description',
          observations,
          '   '
        );
      });

      expect(result.current.fieldErrors['09:00_Sayyida_description']).toBe(
        'Description is required for this behavior'
      );
    });
  });

  describe('validateForm', () => {
    it('should validate entire form and return false with errors', () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: '',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00',
      };
      const observations = {
        '09:00': [makeCard({ behavior: '' })],
      };

      let isValid;
      act(() => {
        isValid = result.current.validateForm(metadata, observations);
      });

      expect(isValid).toBe(false);
      expect(result.current.fieldErrors.observerName).toBeDefined();
      expect(
        result.current.fieldErrors['09:00_Sayyida_behavior']
      ).toBeDefined();
    });

    it('should return true when form is completely valid', () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: 'testuser',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00',
      };
      const observations = {
        '09:00': [makeCard({ behavior: 'eating', location: 'F1' })],
        '09:05': [makeCard({ behavior: 'walking', location: '5' })],
      };

      let isValid;
      act(() => {
        isValid = result.current.validateForm(metadata, observations);
      });

      expect(isValid).toBe(true);
      expect(Object.keys(result.current.fieldErrors)).toHaveLength(0);
    });

    it('should return false and set a slot-level error for an empty (no cards) slot', () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: 'testuser',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00',
      };
      const observations = {
        '09:00': [makeCard({ behavior: 'eating' })],
        '09:05': [],
      };

      let isValid;
      act(() => {
        isValid = result.current.validateForm(metadata, observations);
      });

      expect(isValid).toBe(false);
      expect(result.current.fieldErrors['09:05__slot']).toBe(
        'Record at least one subject for this time slot'
      );
      // The filled slot stays clean
      expect(result.current.fieldErrors['09:00__slot']).toBeUndefined();
    });

    it('should validate every subject card in a slot', () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: 'testuser',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00',
      };
      const observations = {
        '09:00': [
          makeCard({ subjectId: 'Sayyida', behavior: 'eating' }),
          makeCard({
            subjectType: 'resident',
            subjectId: 'Peanut',
            behavior: '',
          }),
        ],
      };

      let isValid;
      act(() => {
        isValid = result.current.validateForm(metadata, observations);
      });

      expect(isValid).toBe(false);
      expect(
        result.current.fieldErrors['09:00_Sayyida_behavior']
      ).toBeUndefined();
      expect(result.current.fieldErrors['09:00_Peanut_behavior']).toBe(
        'Please select a behavior'
      );
    });
  });

  describe('clearObservationErrors', () => {
    it("should clear all of one card's errors but keep other subjects' and metadata errors", () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: '',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00',
      };
      const observations = {
        '09:00': [
          // Sayyida's card produces two errors (animal + interaction type)
          makeCard({ subjectId: 'Sayyida', behavior: 'interacting_animal' }),
          makeCard({
            subjectType: 'resident',
            subjectId: 'Peanut',
            behavior: '',
          }),
        ],
      };

      act(() => {
        result.current.validateForm(metadata, observations);
      });

      expect(result.current.fieldErrors['09:00_Sayyida_animal']).toBeDefined();
      expect(
        result.current.fieldErrors['09:00_Sayyida_animalInteractionType']
      ).toBeDefined();
      expect(result.current.fieldErrors['09:00_Peanut_behavior']).toBeDefined();
      expect(result.current.fieldErrors.observerName).toBeDefined();

      // Remove Sayyida's card errors for the slot
      act(() => {
        result.current.clearObservationErrors('09:00', 'Sayyida');
      });

      // Every Sayyida key for the slot is gone
      const sayyidaKeys = Object.keys(result.current.fieldErrors).filter(
        (key) => key.startsWith('09:00_Sayyida_')
      );
      expect(sayyidaKeys).toHaveLength(0);

      // Other subject's error and metadata error are untouched
      expect(result.current.fieldErrors['09:00_Peanut_behavior']).toBe(
        'Please select a behavior'
      );
      expect(result.current.fieldErrors.observerName).toBe(
        'Observer name is required'
      );
    });
  });

  describe('clearFieldError', () => {
    it('should clear a specific field error', () => {
      const { result } = renderHook(() => useFormValidation());

      // Set an error first
      act(() => {
        result.current.validateSingleMetadataField('observerName', '', {
          observerName: '',
        });
      });

      expect(result.current.fieldErrors.observerName).toBeDefined();

      // Clear it
      act(() => {
        result.current.clearFieldError('observerName');
      });

      expect(result.current.fieldErrors.observerName).toBeUndefined();
    });
  });

  describe('clearAllErrors', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: '',
        date: '',
        startTime: '',
        endTime: '',
      };
      const observations = {
        '09:00': [makeCard({ behavior: '' })],
      };

      // Generate multiple errors
      act(() => {
        result.current.validateForm(metadata, observations);
      });

      expect(Object.keys(result.current.fieldErrors).length).toBeGreaterThan(0);

      // Clear all
      act(() => {
        result.current.clearAllErrors();
      });

      expect(Object.keys(result.current.fieldErrors)).toHaveLength(0);
    });
  });

  describe('validateObservationSlot', () => {
    it('should return invalid when behavior is empty', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: '' })],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors['09:00_Sayyida_behavior']).toBe(
        'Please select a behavior'
      );
    });

    it('should return invalid when required location is missing', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'walking', location: '' })],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors['09:00_Sayyida_location']).toBeDefined();
    });

    it('should return valid when all required fields are filled', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'walking', location: '5' })],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(true);
      expect(Object.keys(validation.errors)).toHaveLength(0);
    });

    it('should return invalid when object is required but not filled', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'interacting_object' })],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors['09:00_Sayyida_object']).toBe(
        'Object is required'
      );
    });

    it('should return invalid when objectOther is required but not filled', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [
          makeCard({ behavior: 'interacting_object', object: 'other' }),
        ],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors['09:00_Sayyida_objectOther']).toBe(
        'Please specify the object'
      );
    });

    it('should return invalid when description is required but not filled', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'other' })],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors['09:00_Sayyida_description']).toBe(
        'Description is required for this behavior'
      );
    });

    it('should return invalid when animal and interaction type are required but not filled', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: 'interacting_animal' })],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors['09:00_Sayyida_animal']).toBe(
        'Animal is required'
      );
      expect(validation.errors['09:00_Sayyida_animalInteractionType']).toBe(
        'Animal interaction type is required'
      );
    });

    it('should validate every card in the slot and key errors by subject', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [
          makeCard({ subjectId: 'Sayyida', behavior: 'walking', location: '' }),
          makeCard({
            subjectType: 'resident',
            subjectId: 'Peanut',
            behavior: '',
          }),
        ],
      };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      expect(validation.errors['09:00_Sayyida_location']).toBe(
        'Location is required for this behavior'
      );
      expect(validation.errors['09:00_Peanut_behavior']).toBe(
        'Please select a behavior'
      );
    });

    it('should update fieldErrors state when validation fails', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': [makeCard({ behavior: '' })],
      };

      act(() => {
        result.current.validateObservationSlot('09:00', observations);
      });

      expect(result.current.fieldErrors['09:00_Sayyida_behavior']).toBe(
        'Please select a behavior'
      );
    });

    it('should return invalid for non-existent observation slot', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {};

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      // Empty/missing slots now surface a slot-level error the UI can show
      // (the backend rejects empty slots — a silent false would 400 later)
      expect(validation.errors).toEqual({
        '09:00__slot': 'Record at least one subject for this time slot',
      });
    });

    it('should return invalid for an empty (no cards) slot', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = { '09:00': [] };

      let validation;
      act(() => {
        validation = result.current.validateObservationSlot(
          '09:00',
          observations
        );
      });

      expect(validation.valid).toBe(false);
      // Empty/missing slots now surface a slot-level error the UI can show
      // (the backend rejects empty slots — a silent false would 400 later)
      expect(validation.errors).toEqual({
        '09:00__slot': 'Record at least one subject for this time slot',
      });
    });
  });
});
