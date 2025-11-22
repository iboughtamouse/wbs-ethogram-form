import {
  getNextTimeSlot,
  copyObservationToNext,
} from '../src/utils/observationUtils';

describe('getNextTimeSlot', () => {
  test('returns the next time slot in sequence', () => {
    const timeSlots = ['15:00', '15:05', '15:10', '15:15'];
    expect(getNextTimeSlot(timeSlots, '15:00')).toBe('15:05');
    expect(getNextTimeSlot(timeSlots, '15:05')).toBe('15:10');
    expect(getNextTimeSlot(timeSlots, '15:10')).toBe('15:15');
  });

  test('returns null when on last time slot', () => {
    const timeSlots = ['15:00', '15:05', '15:10'];
    expect(getNextTimeSlot(timeSlots, '15:10')).toBe(null);
  });

  test('returns null when time slot not found', () => {
    const timeSlots = ['15:00', '15:05', '15:10'];
    expect(getNextTimeSlot(timeSlots, '16:00')).toBe(null);
  });

  test('handles single time slot', () => {
    const timeSlots = ['15:00'];
    expect(getNextTimeSlot(timeSlots, '15:00')).toBe(null);
  });

  test('handles empty time slots array', () => {
    const timeSlots = [];
    expect(getNextTimeSlot(timeSlots, '15:00')).toBe(null);
  });
});

describe('copyObservationToNext', () => {
  const sampleObservation = {
    behavior: 'perching',
    location: '12',
    notes: 'Watching stream',
    object: '',
    objectOther: '',
    animal: '',
    animalOther: '',
    interactionType: '',
    interactionTypeOther: '',
  };

  test('copies all observation fields to next time slot', () => {
    const observations = {
      '15:00': sampleObservation,
      '15:05': {
        behavior: '',
        location: '',
        notes: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05']).toEqual(sampleObservation);
    expect(result.targetTime).toBe('15:05');
  });

  test('overwrites existing data in next slot', () => {
    const observations = {
      '15:00': sampleObservation,
      '15:05': {
        behavior: 'flying',
        location: '5',
        notes: 'Old data',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05'].behavior).toBe('perching');
    expect(result.updatedObservations['15:05'].location).toBe('12');
    expect(result.updatedObservations['15:05'].notes).toBe('Watching stream');
  });

  test('returns failure when on last time slot', () => {
    const observations = {
      '15:00': sampleObservation,
      '15:05': sampleObservation,
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:05');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No next time slot available');
    expect(result.updatedObservations).toEqual(observations);
  });

  test('copies interaction sub-fields correctly', () => {
    const observationWithInteraction = {
      ...sampleObservation,
      behavior: 'interacting_object',
      object: 'newspaper',
      objectOther: '',
    };
    const observations = {
      '15:00': observationWithInteraction,
      '15:05': {
        behavior: '',
        location: '',
        notes: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05'].object).toBe('newspaper');
    expect(result.updatedObservations['15:05'].behavior).toBe(
      'interacting_object'
    );
  });

  test('copies "other" text fields correctly', () => {
    const observationWithOther = {
      ...sampleObservation,
      behavior: 'interacting_object',
      object: 'other',
      objectOther: 'Custom toy',
    };
    const observations = {
      '15:00': observationWithOther,
      '15:05': {
        behavior: '',
        location: '',
        notes: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05'].object).toBe('other');
    expect(result.updatedObservations['15:05'].objectOther).toBe('Custom toy');
  });

  test('handles empty source observation', () => {
    const emptyObservation = {
      behavior: '',
      location: '',
      notes: '',
      object: '',
      objectOther: '',
      animal: '',
      animalOther: '',
      interactionType: '',
      interactionTypeOther: '',
    };
    const observations = {
      '15:00': emptyObservation,
      '15:05': emptyObservation,
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05']).toEqual(emptyObservation);
  });

  test('preserves time slot keys - does not modify time strings', () => {
    const observations = {
      '15:00': sampleObservation,
      '15:05': {
        behavior: '',
        location: '',
        notes: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(Object.keys(result.updatedObservations)).toEqual(['15:00', '15:05']);
    expect(result.updatedObservations['15:00']).toEqual(sampleObservation); // Content unchanged
  });

  test('does not mutate original observations object', () => {
    const observations = {
      '15:00': { ...sampleObservation },
      '15:05': {
        behavior: '',
        location: '',
        notes: '',
        object: '',
        objectOther: '',
        animal: '',
        animalOther: '',
        interactionType: '',
        interactionTypeOther: '',
      },
    };
    const timeSlots = ['15:00', '15:05'];
    const originalObservations = JSON.parse(JSON.stringify(observations));

    copyObservationToNext(observations, timeSlots, '15:00');

    expect(observations).toEqual(originalObservations);
  });
});
