import { renderHook, act, waitFor } from '@testing-library/react';
import { useFormState } from '../useFormState';
import { createEmptyObservation } from '../../services/formStateManager';

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
        [nextTime]: (observations[time] ?? []).map((card) => ({ ...card })),
      },
    };
  }),
}));

import { generateTimeSlots, validateTimeRange } from '../../utils/timeUtils';
import { copyObservationToNext } from '../../utils/observationUtils';

// Helper: a Sayyida card (the bundled config's foster parent) with overrides
const sayyidaCard = (overrides = {}) => ({
  ...createEmptyObservation('foster_parent', 'Sayyida'),
  ...overrides,
});

// Helper: generate the 09:00–10:00 slots so cards exist to update
const setupTimeSlots = async (result) => {
  act(() => {
    result.current.handleMetadataChange('startTime', '09:00');
    result.current.handleMetadataChange('endTime', '10:00');
  });

  await waitFor(() => {
    expect(result.current.timeSlots.length).toBe(4);
  });
};

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
      aviary: 'sayyidas-cove', // Aviary is stored as the SLUG
      mode: 'live',
    });
    expect(result.current.metadata).not.toHaveProperty('patient');
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

    it('should initialize new slots with exactly one foster-parent card', async () => {
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

        // Each new slot holds exactly one card, for the foster parent
        expect(result.current.observations['09:00']).toHaveLength(1);
        expect(result.current.observations['09:00'][0]).toMatchObject({
          subjectType: 'foster_parent',
          subjectId: 'Sayyida',
          behavior: '',
          location: '',
          notes: '',
        });
      });
    });

    it('should fall back to current residents when the date predates every episode', async () => {
      const { result } = renderHook(() => useFormState());

      // 2025-06-01 is before the bundled config's arrivedOn (2025-11-29),
      // so no episode covers it — the current-residents fallback applies.
      act(() => {
        result.current.handleMetadataChange('date', '2025-06-01');
        result.current.handleMetadataChange('startTime', '09:00');
        result.current.handleMetadataChange('endTime', '10:00');
      });

      await waitFor(() => {
        expect(result.current.timeSlots).toEqual([
          '09:00',
          '09:05',
          '09:10',
          '09:15',
        ]);
      });

      // Every new slot still gets exactly one Sayyida foster-parent card
      result.current.timeSlots.forEach((time) => {
        expect(result.current.observations[time]).toHaveLength(1);
        expect(result.current.observations[time][0]).toMatchObject({
          subjectType: 'foster_parent',
          subjectId: 'Sayyida',
          behavior: '',
        });
      });
    });

    it('should preserve existing observation data when time range changes', async () => {
      const { result } = renderHook(() => useFormState());

      // Set initial time range
      await setupTimeSlots(result);

      // Add observation data
      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'behavior',
          'perching'
        );
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'location',
          '1'
        );
      });

      // Change end time to extend range
      act(() => {
        result.current.handleMetadataChange('endTime', '10:30');
      });

      await waitFor(() => {
        // Original observation should be preserved
        expect(result.current.observations['09:00'][0].behavior).toBe(
          'perching'
        );
        expect(result.current.observations['09:00'][0].location).toBe('1');
        // New slots get a fresh foster-parent card
        expect(result.current.observations['09:20']).toHaveLength(1);
        expect(result.current.observations['09:20'][0].subjectId).toBe(
          'Sayyida'
        );
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

      // Clear the end time (empty fields bypass validation and clear slots)
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
    it('should update observation field on the subject card', async () => {
      const { result } = renderHook(() => useFormState());

      await setupTimeSlots(result);

      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'behavior',
          'perching'
        );
      });

      expect(result.current.observations['09:00']).toHaveLength(1);
      expect(result.current.observations['09:00'][0].behavior).toBe('perching');
    });

    it('should clear conditional fields when behavior changes', async () => {
      const { result } = renderHook(() => useFormState());

      await setupTimeSlots(result);

      // Set interaction fields
      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'behavior',
          'interaction-inanimate'
        );
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'object',
          'toy'
        );
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'description',
          'Playing with toy'
        );
      });

      // Verify fields are set
      expect(result.current.observations['09:00'][0].behavior).toBe(
        'interaction-inanimate'
      );
      expect(result.current.observations['09:00'][0].object).toBe('toy');
      expect(result.current.observations['09:00'][0].description).toBe(
        'Playing with toy'
      );

      // Change behavior
      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'behavior',
          'perching'
        );
      });

      // Conditional fields should be cleared
      expect(result.current.observations['09:00'][0].behavior).toBe('perching');
      expect(result.current.observations['09:00'][0].object).toBe('');
      expect(result.current.observations['09:00'][0].description).toBe('');
    });
  });

  describe('handleAddSubject / handleRemoveSubject', () => {
    it('should add and remove a subject card round-trip', async () => {
      const { result } = renderHook(() => useFormState());

      await setupTimeSlots(result);

      // Add a second subject to one slot
      act(() => {
        result.current.handleAddSubject('09:00', {
          type: 'juvenile',
          name: 'Pip',
        });
      });

      expect(result.current.observations['09:00']).toHaveLength(2);
      expect(result.current.observations['09:00'][1]).toMatchObject({
        subjectType: 'juvenile',
        subjectId: 'Pip',
        behavior: '',
      });
      // Other slots are untouched
      expect(result.current.observations['09:05']).toHaveLength(1);

      // The new card is editable independently
      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'Pip',
          'behavior',
          'flying'
        );
      });

      expect(result.current.observations['09:00'][1].behavior).toBe('flying');
      expect(result.current.observations['09:00'][0].behavior).toBe('');

      // Remove it again — back to just the foster parent's card
      act(() => {
        result.current.handleRemoveSubject('09:00', 'Pip');
      });

      expect(result.current.observations['09:00']).toHaveLength(1);
      expect(result.current.observations['09:00'][0].subjectId).toBe('Sayyida');
    });
  });

  describe('handleCopyToNext', () => {
    it('should call copyObservationToNext and return true on success', async () => {
      const { result } = renderHook(() => useFormState());

      // Mock successful copy
      copyObservationToNext.mockReturnValueOnce({
        success: true,
        updatedObservations: {
          '09:00': [sayyidaCard({ behavior: 'perching', location: '1' })],
          '09:05': [sayyidaCard({ behavior: 'perching', location: '1' })],
        },
      });

      await setupTimeSlots(result);

      // Add an observation via the normal handler
      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'behavior',
          'perching'
        );
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'location',
          '1'
        );
      });

      let copyResult;
      act(() => {
        copyResult = result.current.handleCopyToNext('09:00');
      });

      expect(copyResult).toBe(true);
      expect(copyObservationToNext).toHaveBeenCalled();
      expect(result.current.observations['09:05'][0].behavior).toBe('perching');
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
    it('should reset all form state', async () => {
      const { result } = renderHook(() => useFormState());

      // Set up some data
      act(() => {
        result.current.handleMetadataChange('observerName', 'John Doe');
        result.current.handleMetadataChange('mode', 'vod');
      });

      await setupTimeSlots(result);

      act(() => {
        result.current.handleObservationChange(
          '09:00',
          'Sayyida',
          'behavior',
          'perching'
        );
      });

      expect(result.current.metadata.observerName).toBe('John Doe');
      expect(result.current.metadata.mode).toBe('vod');
      expect(result.current.observations['09:00'][0].behavior).toBe('perching');

      // Reset
      act(() => {
        result.current.resetForm();
      });

      expect(result.current.metadata.observerName).toBe('');
      expect(result.current.metadata.mode).toBe('live'); // Back to default
      expect(result.current.metadata.startTime).toBe('');
      expect(result.current.metadata.endTime).toBe('');
      expect(result.current.metadata.aviary).toBe('sayyidas-cove');
      expect(result.current.metadata).not.toHaveProperty('patient');
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
        aviary: 'sayyidas-cove',
        mode: 'live',
      };

      const draftObservations = {
        '14:00': [
          sayyidaCard({
            behavior: 'perching',
            location: '1',
            notes: 'Draft note',
          }),
        ],
        '14:05': [sayyidaCard({ behavior: 'flying' })],
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

      // Wait for observations to be restored via the deferred setter
      await waitFor(() => {
        expect(result.current.observations['14:00']).toHaveLength(1);
        expect(result.current.observations['14:00'][0]).toMatchObject({
          subjectId: 'Sayyida',
          behavior: 'perching',
          location: '1',
          notes: 'Draft note',
        });
      });
    });
  });
});
