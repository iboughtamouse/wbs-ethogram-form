import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormState } from '../useFormState';

// Mock the utility functions
jest.mock('../../utils/timeUtils', () => ({
  generateTimeSlots: jest.fn((start, end) => {
    // Simple mock implementation
    if (start === '09:00' && end === '10:00') {
      return ['09:00', '09:05', '09:10', '09:15'];
    }
    if (start === '09:00' && end === '10:30') {
      return ['09:00', '09:05', '09:10', '09:15', '09:20', '09:25'];
    }
    if (start === '14:00' && end === '14:30') {
      return ['14:00', '14:05', '14:10', '14:15', '14:20', '14:25'];
    }
    return [];
  }),
  validateTimeRange: jest.fn((start, end) => {
    // Valid if both present and start < end
    if (!start || !end) return { valid: false };
    return { valid: start < end };
  }),
}));

jest.mock('../../utils/observationUtils', () => ({
  copyObservationToNext: jest.fn((observations, timeSlots, time) => {
    const currentIndex = timeSlots.indexOf(time);
    const nextTime = timeSlots[currentIndex + 1];

    if (!nextTime) {
      return { success: false };
    }

    return {
      success: true,
      updatedObservations: {
        ...observations,
        [nextTime]: { ...observations[time] },
      },
    };
  }),
}));

import { generateTimeSlots, validateTimeRange } from '../../utils/timeUtils';
import { copyObservationToNext } from '../../utils/observationUtils';

describe('useFormState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default metadata', () => {
    const { result } = renderHook(() => useFormState());

    expect(result.current.metadata).toMatchObject({
      observerName: '',
      startTime: '',
      endTime: '',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    });
    expect(result.current.metadata.date).toBeTruthy(); // Today's date
  });

  it('should initialize with empty time slots and observations', () => {
    const { result } = renderHook(() => useFormState());

    expect(result.current.timeSlots).toEqual([]);
    expect(result.current.observations).toEqual({});
  });

  describe('handleMetadataChange', () => {
    it('should update metadata field', () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.handleMetadataChange('observerName', 'John Doe');
      });

      expect(result.current.metadata.observerName).toBe('John Doe');
    });

    it('should update multiple metadata fields independently', () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.handleMetadataChange('observerName', 'John Doe');
        result.current.handleMetadataChange('mode', 'vod');
      });

      expect(result.current.metadata.observerName).toBe('John Doe');
      expect(result.current.metadata.mode).toBe('vod');
    });
  });

  describe('time slot generation', () => {
    it('should generate time slots when start and end times are set', async () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.handleMetadataChange('startTime', '09:00');
        result.current.handleMetadataChange('endTime', '10:00');
      });

      await waitFor(() => {
        expect(validateTimeRange).toHaveBeenCalledWith('09:00', '10:00');
        expect(generateTimeSlots).toHaveBeenCalledWith('09:00', '10:00');
        expect(result.current.timeSlots).toEqual([
          '09:00',
          '09:05',
          '09:10',
          '09:15',
        ]);
      });
    });

    it('should initialize observations for generated time slots', async () => {
      const { result } = renderHook(() => useFormState());

      act(() => {
        result.current.handleMetadataChange('startTime', '09:00');
        result.current.handleMetadataChange('endTime', '10:00');
      });

      await waitFor(() => {
        expect(result.current.observations).toHaveProperty('09:00');
        expect(result.current.observations).toHaveProperty('09:05');
        expect(result.current.observations).toHaveProperty('09:10');
        expect(result.current.observations).toHaveProperty('09:15');

        expect(result.current.observations['09:00']).toMatchObject({
          behavior: '',
          location: '',
          notes: '',
        });
      });
    });

    it('should preserve existing observation data when time range changes', async () => {
      const { result } = renderHook(() => useFormState());

      // Set initial time range
      act(() => {
        result.current.handleMetadataChange('startTime', '09:00');
        result.current.handleMetadataChange('endTime', '10:00');
      });

      await waitFor(() => {
        expect(result.current.timeSlots.length).toBe(4);
      });

      // Add observation data
      act(() => {
        result.current.handleObservationChange('09:00', 'behavior', 'perching');
        result.current.handleObservationChange('09:00', 'location', '1');
      });

      // Change end time to extend range
      act(() => {
        result.current.handleMetadataChange('endTime', '10:30');
      });

      await waitFor(() => {
        // Original observation should be preserved
        expect(result.current.observations['09:00'].behavior).toBe('perching');
        expect(result.current.observations['09:00'].location).toBe('1');
      });
    });

    it('should clear time slots when time range becomes invalid', async () => {
      const { result } = renderHook(() => useFormState());

      // Set valid time range first
      act(() => {
        result.current.handleMetadataChange('startTime', '09:00');
        result.current.handleMetadataChange('endTime', '10:00');
      });

      await waitFor(() => {
        expect(result.current.timeSlots.length).toBeGreaterThan(0);
      });

      // Make range invalid
      validateTimeRange.mockReturnValueOnce({ valid: false });

      act(() => {
        result.current.handleMetadataChange('endTime', '');
      });

      await waitFor(() => {
        expect(result.current.timeSlots).toEqual([]);
        expect(result.current.observations).toEqual({});
      });
    });
  });

  describe('handleObservationChange', () => {
    it('should update observation field', () => {
      const { result } = renderHook(() => useFormState());

      // Directly update observations without relying on time slot generation
      act(() => {
        result.current.handleObservationChange('09:00', 'behavior', 'perching');
      });

      expect(result.current.observations['09:00']).toBeDefined();
      expect(result.current.observations['09:00'].behavior).toBe('perching');
    });

    it('should clear conditional fields when behavior changes', () => {
      const { result } = renderHook(() => useFormState());

      // Set interaction fields
      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'behavior',
          'interaction-inanimate'
        );
        result.current.handleObservationChange('09:00', 'object', 'toy');
        result.current.handleObservationChange(
          '09:00',
          'description',
          'Playing with toy'
        );
      });

      // Verify fields are set
      expect(result.current.observations['09:00'].behavior).toBe(
        'interaction-inanimate'
      );
      expect(result.current.observations['09:00'].object).toBe('toy');
      expect(result.current.observations['09:00'].description).toBe(
        'Playing with toy'
      );

      // Change behavior
      act(() => {
        result.current.handleObservationChange('09:00', 'behavior', 'perching');
      });

      // Conditional fields should be cleared
      expect(result.current.observations['09:00'].behavior).toBe('perching');
      expect(result.current.observations['09:00'].object).toBe('');
      expect(result.current.observations['09:00'].description).toBe('');
    });
  });

  describe('handleCopyToNext', () => {
    it('should call copyObservationToNext and return true on success', () => {
      const { result } = renderHook(() => useFormState());

      // Mock successful copy
      copyObservationToNext.mockReturnValueOnce({
        success: true,
        updatedObservations: {
          '09:00': { behavior: 'perching', location: '1' },
          '09:05': { behavior: 'perching', location: '1' },
        },
      });

      // Add an observation via the normal handler
      act(() => {
        result.current.handleObservationChange('09:00', 'behavior', 'perching');
        result.current.handleObservationChange('09:00', 'location', '1');
      });

      let copyResult;
      act(() => {
        copyResult = result.current.handleCopyToNext('09:00');
      });

      expect(copyResult).toBe(true);
      expect(copyObservationToNext).toHaveBeenCalled();
    });

    it('should return false when copy fails', () => {
      const { result } = renderHook(() => useFormState());

      // Mock failure (last slot)
      copyObservationToNext.mockReturnValueOnce({ success: false });

      let copyResult;
      act(() => {
        copyResult = result.current.handleCopyToNext('09:15');
      });

      expect(copyResult).toBe(false);
    });
  });

  describe('resetForm', () => {
    it('should reset all form state', () => {
      const { result } = renderHook(() => useFormState());

      // Set up some data
      act(() => {
        result.current.handleMetadataChange('observerName', 'John Doe');
        result.current.handleMetadataChange('mode', 'vod');
        result.current.handleObservationChange('09:00', 'behavior', 'perching');
      });

      expect(result.current.metadata.observerName).toBe('John Doe');
      expect(result.current.metadata.mode).toBe('vod');
      expect(result.current.observations['09:00']).toBeDefined();

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.metadata.observerName).toBe('');
      expect(result.current.metadata.mode).toBe('live'); // Back to default
      expect(result.current.metadata.startTime).toBe('');
      expect(result.current.metadata.endTime).toBe('');
      expect(result.current.timeSlots).toEqual([]);
      expect(result.current.observations).toEqual({});
    });
  });

  describe('restoreDraft', () => {
    it('should restore metadata and observations from draft', async () => {
      const { result } = renderHook(() => useFormState());

      const draftMetadata = {
        observerName: 'Jane Doe',
        date: '2025-01-15',
        startTime: '14:00',
        endTime: '14:30',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };

      const draftObservations = {
        '14:00': { behavior: 'perching', location: '1', notes: 'Draft note' },
        '14:05': { behavior: 'flying', location: '', notes: '' },
      };

      act(() => {
        result.current.restoreDraft(draftMetadata, draftObservations);
      });

      // Wait for metadata to be set and time slots to generate
      await waitFor(() => {
        expect(result.current.metadata.observerName).toBe('Jane Doe');
        expect(result.current.metadata.startTime).toBe('14:00');
        expect(result.current.metadata.endTime).toBe('14:30');
      });

      // Wait for observations to be restored via queueMicrotask
      await waitFor(() => {
        expect(result.current.observations['14:00']).toBeDefined();
        expect(result.current.observations['14:00'].behavior).toBe('perching');
        expect(result.current.observations['14:00'].location).toBe('1');
        expect(result.current.observations['14:00'].notes).toBe('Draft note');
      });
    });
  });
});
