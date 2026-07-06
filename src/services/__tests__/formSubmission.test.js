import { prepareOutputData } from '../formSubmission';

describe('formSubmission', () => {
  describe('prepareOutputData', () => {
    const metadata = {
      observerName: 'John Doe',
      date: '2025-01-15',
      startTime: '09:00',
      endTime: '10:00',
      aviary: 'sayyidas-cove',
      mode: 'live',
    };

    const observations = {
      '09:00': [
        {
          subjectType: 'foster-parent',
          subjectId: 'Sayyida',
          behavior: 'perching',
          location: '1',
          notes: 'Resting quietly',
          description: '',
          object: '',
          objectOther: '',
          objectInteractionType: '',
          objectInteractionTypeOther: '',
          animal: '',
          animalOther: '',
          animalInteractionType: '',
          animalInteractionTypeOther: '',
        },
        {
          subjectType: 'patient',
          subjectId: 'Patient 25-482',
          behavior: 'vocalizing',
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
        },
      ],
      '09:05': [
        {
          subjectType: 'foster-parent',
          subjectId: 'Sayyida',
          behavior: 'preening',
          location: '2',
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
        },
      ],
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

    it('should pass array-native observation slots through untouched', () => {
      const result = prepareOutputData(metadata, observations);

      // Same reference - no transformation or cloning of slots
      expect(result.observations).toBe(observations);

      expect(Array.isArray(result.observations['09:00'])).toBe(true);
      expect(Array.isArray(result.observations['09:05'])).toBe(true);
      expect(result.observations['09:00']).toHaveLength(2);
      expect(result.observations['09:05']).toHaveLength(1);
    });

    it('should preserve per-subject card identity fields', () => {
      const result = prepareOutputData(metadata, observations);

      const [fosterCard, patientCard] = result.observations['09:00'];
      expect(fosterCard.subjectType).toBe('foster-parent');
      expect(fosterCard.subjectId).toBe('Sayyida');
      expect(fosterCard.behavior).toBe('perching');
      expect(patientCard.subjectType).toBe('patient');
      expect(patientCard.subjectId).toBe('Patient 25-482');
      expect(patientCard.behavior).toBe('vocalizing');
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
      expect(result.metadata.aviary).toBe('sayyidas-cove');
      expect(result.metadata.mode).toBe('live');
    });

    it('should not add a patient key to metadata', () => {
      const result = prepareOutputData(metadata, observations);

      expect(result.metadata).not.toHaveProperty('patient');
      expect(Object.keys(result.metadata).sort()).toEqual([
        'aviary',
        'date',
        'endTime',
        'mode',
        'observerName',
        'startTime',
      ]);
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
