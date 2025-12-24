import { prepareOutputData } from '../formSubmission';

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

    it('should include metadata, observations, and submittedAt timestamp', () => {
      const result = prepareOutputData(metadata, observations);

      expect(result).toHaveProperty('metadata');
      expect(result).toHaveProperty('observations');
      expect(result).toHaveProperty('submittedAt');
      expect(result.submittedAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/
      ); // ISO format
    });

    it('should preserve times unchanged for both live and vod modes', () => {
      const liveResult = prepareOutputData(
        { ...metadata, mode: 'live' },
        observations
      );
      const vodResult = prepareOutputData(
        { ...metadata, mode: 'vod' },
        observations
      );

      // Both modes work identically - no timezone conversion
      expect(liveResult.metadata.startTime).toBe('09:00');
      expect(liveResult.metadata.endTime).toBe('10:00');
      expect(vodResult.metadata.startTime).toBe('09:00');
      expect(vodResult.metadata.endTime).toBe('10:00');

      // Observations preserved unchanged
      expect(liveResult.observations).toEqual(observations);
      expect(vodResult.observations).toEqual(observations);

      // No observerTimezone field added
      expect(liveResult.metadata).not.toHaveProperty('observerTimezone');
      expect(vodResult.metadata).not.toHaveProperty('observerTimezone');
    });

    it('should preserve observation timestamps unchanged', () => {
      const result = prepareOutputData(metadata, observations);

      expect(result.observations).toHaveProperty('09:00');
      expect(result.observations).toHaveProperty('09:05');
      expect(result.observations['09:00']).toEqual(observations['09:00']);
      expect(result.observations['09:05']).toEqual(observations['09:05']);
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
