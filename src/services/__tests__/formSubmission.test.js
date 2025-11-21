import { prepareOutputData } from '../formSubmission';

// Mock timezone utilities
jest.mock('../../utils/timezoneUtils', () => ({
  convertToWBSTime: jest.fn((date, time) => `WBS_${time}`),
  getUserTimezone: jest.fn(() => 'America/New_York'),
}));

import { convertToWBSTime, getUserTimezone } from '../../utils/timezoneUtils';

describe('formSubmission', () => {
  describe('prepareOutputData', () => {
    const metadata = {
      observerName: 'John Doe',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      aviary: "Sayyida's Cove",
      patient: 'Sayyida',
      mode: 'live',
    };

    const observations = {
      '09:00': {
        behavior: 'perching',
        location: '1',
        notes: 'Resting quietly',
        description: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
      '09:05': {
        behavior: 'preening',
        location: '2',
        notes: '',
        description: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should include metadata, observations, and submittedAt timestamp', () => {
      const result = prepareOutputData(metadata, observations);

      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('observations');
      expect(result).toHaveProperty('submittedAt');
      expect(result.submittedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      ); // ISO format
    });

    it('should convert times to WBS timezone when mode is "live"', () => {
      const result = prepareOutputData(
        { ...metadata, mode: 'live' },
        observations
      );

      expect(convertToWBSTime).toHaveBeenCalledWith('2025-01-15', '09:00');
      expect(convertToWBSTime).toHaveBeenCalledWith('2025-01-15', '10:00');

      expect(result.metadata.startTime).toBe('WBS_09:00');
      expect(result.metadata.endTime).toBe('WBS_10:00');
    });

    it('should include observerTimezone in metadata when mode is "live"', () => {
      const result = prepareOutputData(
        { ...metadata, mode: 'live' },
        observations
      );

      expect(getUserTimezone).toHaveBeenCalled();
      expect(result.metadata.observerTimezone).toBe('America/New_York');
    });

    it('should convert observation timestamps to WBS timezone when mode is "live"', () => {
      const result = prepareOutputData(
        { ...metadata, mode: 'live' },
        observations
      );

      expect(convertToWBSTime).toHaveBeenCalledWith('2025-01-15', '09:00');
      expect(convertToWBSTime).toHaveBeenCalledWith('2025-01-15', '09:05');

      expect(result.observations).toHaveProperty('WBS_09:00');
      expect(result.observations).toHaveProperty('WBS_09:05');
      expect(result.observations['WBS_09:00']).toEqual(observations['09:00']);
      expect(result.observations['WBS_09:05']).toEqual(observations['09:05']);
    });

    it('should NOT convert times when mode is "vod"', () => {
      const result = prepareOutputData(
        { ...metadata, mode: 'vod' },
        observations
      );

      expect(convertToWBSTime).not.toHaveBeenCalled();
      expect(getUserTimezone).not.toHaveBeenCalled();

      expect(result.metadata.startTime).toBe('09:00');
      expect(result.metadata.endTime).toBe('10:00');
      expect(result.metadata).not.toHaveProperty('observerTimezone');
    });

    it('should preserve original observations when mode is "vod"', () => {
      const result = prepareOutputData(
        { ...metadata, mode: 'vod' },
        observations
      );

      expect(result.observations).toEqual(observations);
      expect(result.observations).toHaveProperty('09:00');
      expect(result.observations).toHaveProperty('09:05');
    });

    it('should not mutate original metadata object', () => {
      const originalMetadata = { ...metadata };

      prepareOutputData(metadata, observations);

      expect(metadata).toEqual(originalMetadata);
    });

    it('should not mutate original observations object', () => {
      const originalObservations = { ...observations };

      prepareOutputData(metadata, observations);

      expect(observations).toEqual(originalObservations);
    });

    it('should handle empty observations object', () => {
      const result = prepareOutputData(metadata, {});

      expect(result.observations).toEqual({});
    });

    it('should preserve all metadata fields', () => {
      const result = prepareOutputData(metadata, observations);

      expect(result.metadata.observerName).toBe('John Doe');
      expect(result.metadata.date).toBe('2025-01-15');
      expect(result.metadata.aviary).toBe("Sayyida's Cove");
      expect(result.metadata.patient).toBe('Sayyida');
      expect(result.metadata.mode).toBe('live');
    });

    it('should generate valid ISO timestamp for submittedAt', () => {
      const beforeTime = new Date();
      const result = prepareOutputData(metadata, observations);
      const afterTime = new Date();

      const submittedTime = new Date(result.submittedAt);

      expect(submittedTime.getTime()).toBeGreaterThanOrEqual(
        beforeTime.getTime()
      );
      expect(submittedTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});
