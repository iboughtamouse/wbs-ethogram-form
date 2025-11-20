import { renderHook, act } from '@testing-library/react';
import { useFormValidation } from '../useFormValidation';

describe('useFormValidation', () => {
  describe('validateMetadata', () => {
    it('should validate observer name is required', () => {
      const { result } = renderHook(() => useFormValidation());
      
      act(() => {
        result.current.validateSingleMetadataField('observerName', '', { observerName: '' });
      });

      expect(result.current.fieldErrors.observerName).toBe('Discord username is required');
    });

    it('should pass when observer name is provided', () => {
      const { result } = renderHook(() => useFormValidation());
      
      act(() => {
        result.current.validateSingleMetadataField('observerName', 'testuser', { observerName: 'testuser' });
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
        result.current.validateSingleMetadataField('startTime', '', { startTime: '', endTime: '' });
      });

      expect(result.current.fieldErrors.startTime).toBe('Time range is required');
    });

    it('should validate time range duration (too short)', () => {
      const { result } = renderHook(() => useFormValidation());
      
      act(() => {
        result.current.validateSingleMetadataField('endTime', '09:03', { 
          startTime: '09:00', 
          endTime: '09:03' 
        });
      });

      expect(result.current.fieldErrors.endTime).toBe('Time range must be at least 5 minutes');
    });

    it('should validate time range duration (too long)', () => {
      const { result } = renderHook(() => useFormValidation());
      
      act(() => {
        result.current.validateSingleMetadataField('endTime', '10:05', { 
          startTime: '09:00', 
          endTime: '10:05' 
        });
      });

      expect(result.current.fieldErrors.endTime).toBe('Time range cannot exceed 1 hour');
    });

    it('should pass with valid time range', () => {
      const { result } = renderHook(() => useFormValidation());
      
      act(() => {
        result.current.validateSingleMetadataField('endTime', '10:00', { 
          startTime: '09:00', 
          endTime: '10:00' 
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
          endTime: '09:03' 
        });
      });

      expect(result.current.fieldErrors.endTime).toBeDefined();

      // Now fix the time range by updating startTime
      act(() => {
        result.current.validateSingleMetadataField('startTime', '09:00', { 
          startTime: '09:00', 
          endTime: '09:30' 
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
        '09:00': { behavior: '', location: '', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'behavior', observations);
      });

      expect(result.current.fieldErrors['09:00_behavior']).toBe('Please select a behavior');
    });

    it('should pass when behavior is selected', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': { behavior: 'eating_food_platform', location: '', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'behavior', observations);
      });

      expect(result.current.fieldErrors['09:00_behavior']).toBeUndefined();
    });

    it('should require location when behavior requires it', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': { behavior: 'walking_perch', location: '', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'location', observations);
      });

      expect(result.current.fieldErrors['09:00_location']).toBe('Location is required for this behavior');
    });

    it('should accept valid perch number', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': { behavior: 'walking_perch', location: '5', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'location', observations);
      });

      expect(result.current.fieldErrors['09:00_location']).toBeUndefined();
    });

    it('should accept "Ground" as location (case-insensitive)', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': { behavior: 'preening', location: 'ground', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'location', observations);
      });

      expect(result.current.fieldErrors['09:00_location']).toBeUndefined();
    });

    it('should accept special perch codes (BB1, F1, etc.)', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': { behavior: 'preening', location: 'BB1', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'location', observations);
      });

      expect(result.current.fieldErrors['09:00_location']).toBeUndefined();
    });

    it('should reject invalid perch number', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': { behavior: 'walking_perch', location: '99', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'location', observations);
      });

      expect(result.current.fieldErrors['09:00_location']).toBe('Invalid perch number "99"');
    });

    it('should not require location when behavior does not need it', () => {
      const { result } = renderHook(() => useFormValidation());
      const observations = {
        '09:00': { behavior: 'eating_food_platform', location: '', notes: '' }
      };
      
      act(() => {
        result.current.validateSingleObservationField('09:00', 'location', observations);
      });

      expect(result.current.fieldErrors['09:00_location']).toBeUndefined();
    });
  });

  describe('validateForm', () => {
    it('should validate entire form and return false with errors', () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: '',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00'
      };
      const observations = {
        '09:00': { behavior: '', location: '', notes: '' }
      };
      
      let isValid;
      act(() => {
        isValid = result.current.validateForm(metadata, observations);
      });

      expect(isValid).toBe(false);
      expect(result.current.fieldErrors.observerName).toBeDefined();
      expect(result.current.fieldErrors['09:00_behavior']).toBeDefined();
    });

    it('should return true when form is completely valid', () => {
      const { result } = renderHook(() => useFormValidation());
      const metadata = {
        observerName: 'testuser',
        date: '2025-11-20',
        startTime: '09:00',
        endTime: '10:00'
      };
      const observations = {
        '09:00': { behavior: 'eating_food_platform', location: '', notes: '' },
        '09:05': { behavior: 'walking_perch', location: '5', notes: '' }
      };
      
      let isValid;
      act(() => {
        isValid = result.current.validateForm(metadata, observations);
      });

      expect(isValid).toBe(true);
      expect(Object.keys(result.current.fieldErrors)).toHaveLength(0);
    });
  });

  describe('clearFieldError', () => {
    it('should clear a specific field error', () => {
      const { result } = renderHook(() => useFormValidation());
      
      // Set an error first
      act(() => {
        result.current.validateSingleMetadataField('observerName', '', { observerName: '' });
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
        endTime: ''
      };
      const observations = {
        '09:00': { behavior: '', location: '', notes: '' }
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
});
