import {
  getNextTimeSlot,
  copyObservationToNext,
} from '../src/utils/observationUtils';
import { createEmptyObservation } from '../src/services/formStateManager';

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
  const makeCard = (overrides = {}) => ({
    ...createEmptyObservation('foster_parent', 'Sayyida'),
    ...overrides,
  });

  const sampleCard = makeCard({
    behavior: 'perching',
    location: '12',
    notes: 'Watching stream',
  });

  test('copies all observation fields to next time slot', () => {
    const observations = {
      '15:00': [sampleCard],
      '15:05': [makeCard()],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05']).toEqual([
      { ...sampleCard, cardId: expect.any(String) },
    ]);
    expect(result.targetTime).toBe('15:05');
  });

  test('copies the whole card set - a two-card slot copies both cards', () => {
    const secondCard = makeCard({
      subjectType: 'resident',
      subjectId: 'Dorothy',
      behavior: 'vocalizing',
      location: '3',
    });
    const observations = {
      '15:00': [sampleCard, secondCard],
      '15:05': [makeCard()],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05']).toEqual([
      { ...sampleCard, cardId: expect.any(String) },
      { ...secondCard, cardId: expect.any(String) },
    ]);
    expect(result.updatedObservations['15:05']).toHaveLength(2);
  });

  test('overwrites existing data in next slot', () => {
    const observations = {
      '15:00': [sampleCard],
      '15:05': [
        makeCard({
          behavior: 'flying',
          location: '5',
          notes: 'Old data',
        }),
      ],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05'][0].behavior).toBe('perching');
    expect(result.updatedObservations['15:05'][0].location).toBe('12');
    expect(result.updatedObservations['15:05'][0].notes).toBe(
      'Watching stream'
    );
  });

  test('keeps a target-only subject card when merging into the next slot', () => {
    const babyCard = makeCard({
      subjectType: 'patient',
      subjectId: 'Baby',
      behavior: 'vocalizing',
      location: '7',
      notes: 'Baby data already entered',
    });
    const staleSayyidaCard = makeCard({
      behavior: 'flying',
      location: '5',
      notes: 'Old Sayyida data',
    });
    const observations = {
      '15:00': [sampleCard],
      '15:05': [staleSayyidaCard, babyCard],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    // Source cards first, then the untouched target-only subject's card
    expect(result.updatedObservations['15:05']).toEqual([
      { ...sampleCard, cardId: expect.any(String) },
      { ...babyCard, cardId: expect.any(String) },
    ]);
    expect(result.updatedObservations['15:05']).toHaveLength(2);
  });

  test('replaces same-subject target cards with the copy (no duplicates)', () => {
    const staleSayyidaCard = makeCard({
      behavior: 'flying',
      location: '5',
      notes: 'Stale Sayyida data',
    });
    const observations = {
      '15:00': [sampleCard],
      '15:05': [staleSayyidaCard],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    const sayyidaCards = result.updatedObservations['15:05'].filter(
      (card) => card.subjectId === 'Sayyida'
    );
    expect(sayyidaCards).toHaveLength(1);
    expect(sayyidaCards[0]).toEqual({
      ...sampleCard,
      cardId: expect.any(String),
    });
  });

  test('returns failure when on last time slot', () => {
    const observations = {
      '15:00': [sampleCard],
      '15:05': [sampleCard],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:05');

    expect(result.success).toBe(false);
    expect(result.error).toBe('No next time slot available');
    expect(result.updatedObservations).toEqual(observations);
  });

  test('copies interaction sub-fields correctly', () => {
    const cardWithInteraction = makeCard({
      behavior: 'interacting_object',
      object: 'newspaper',
      objectInteractionType: 'beaking',
    });
    const observations = {
      '15:00': [cardWithInteraction],
      '15:05': [makeCard()],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05'][0].object).toBe('newspaper');
    expect(result.updatedObservations['15:05'][0].objectInteractionType).toBe(
      'beaking'
    );
    expect(result.updatedObservations['15:05'][0].behavior).toBe(
      'interacting_object'
    );
  });

  test('copies "other" text fields correctly', () => {
    const cardWithOther = makeCard({
      behavior: 'interacting_object',
      object: 'other',
      objectOther: 'Custom toy',
    });
    const observations = {
      '15:00': [cardWithOther],
      '15:05': [makeCard()],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    expect(result.updatedObservations['15:05'][0].object).toBe('other');
    expect(result.updatedObservations['15:05'][0].objectOther).toBe(
      'Custom toy'
    );
  });

  test('handles empty source observation', () => {
    const emptySourceCard = makeCard();
    const observations = {
      '15:00': [emptySourceCard],
      '15:05': [makeCard()],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(result.success).toBe(true);
    // Copied cards are NEW cards: same content, fresh cardId
    expect(result.updatedObservations['15:05']).toEqual([
      { ...emptySourceCard, cardId: expect.any(String) },
    ]);
    expect(result.updatedObservations['15:05'][0].cardId).not.toBe(
      emptySourceCard.cardId
    );
  });

  test('preserves time slot keys - does not modify time strings', () => {
    const observations = {
      '15:00': [sampleCard],
      '15:05': [makeCard()],
    };
    const timeSlots = ['15:00', '15:05'];

    const result = copyObservationToNext(observations, timeSlots, '15:00');

    expect(Object.keys(result.updatedObservations)).toEqual(['15:00', '15:05']);
    expect(result.updatedObservations['15:00']).toEqual([sampleCard]); // Content unchanged
  });

  test('does not mutate original observations object', () => {
    const observations = {
      '15:00': [makeCard(sampleCard)],
      '15:05': [makeCard()],
    };
    const timeSlots = ['15:00', '15:05'];
    const originalObservations = JSON.parse(JSON.stringify(observations));

    copyObservationToNext(observations, timeSlots, '15:00');

    expect(observations).toEqual(originalObservations);
  });
});

describe('copyObservationToNext — generic juvenile merge (P2-D8)', () => {
  const genericCard = (overrides = {}) => ({
    ...createEmptyObservation('juvenile', 'Juvenile'),
    ...overrides,
  });

  it('keeps extra filled generic target cards beyond the copied count', () => {
    const source = createEmptyObservation('juvenile', 'Juvenile');
    source.behavior = 'flying';
    const targetA = genericCard({ behavior: 'eating', notes: 'bird A' });
    const targetB = genericCard({ behavior: 'preening', notes: 'bird B' });
    const observations = {
      '15:00': [source],
      '15:05': [targetA, targetB],
    };

    const result = copyObservationToNext(
      observations,
      ['15:00', '15:05'],
      '15:00'
    );

    const slot = result.updatedObservations['15:05'];
    // Source generic replaces the FIRST target generic positionally; the
    // second unidentified bird's data survives
    expect(slot).toHaveLength(2);
    expect(slot[0]).toMatchObject({
      subjectId: 'Juvenile',
      behavior: 'flying',
    });
    expect(slot[1]).toMatchObject({ notes: 'bird B', behavior: 'preening' });
  });

  it('is idempotent: copying twice does not pile up generic duplicates', () => {
    const sourceA = genericCard({ behavior: 'flying' });
    const sourceB = genericCard({ behavior: 'eating' });
    let observations = {
      '15:00': [sourceA, sourceB],
      '15:05': [],
    };

    observations = copyObservationToNext(
      observations,
      ['15:00', '15:05'],
      '15:00'
    ).updatedObservations;
    observations = copyObservationToNext(
      observations,
      ['15:00', '15:05'],
      '15:00'
    ).updatedObservations;

    expect(observations['15:05']).toHaveLength(2);
  });

  it('gives copied cards fresh cardIds', () => {
    const source = genericCard({ behavior: 'flying' });
    const observations = { '15:00': [source], '15:05': [] };

    const result = copyObservationToNext(
      observations,
      ['15:00', '15:05'],
      '15:00'
    );

    const copied = result.updatedObservations['15:05'][0];
    expect(copied.cardId).toEqual(expect.any(String));
    expect(copied.cardId).not.toBe(source.cardId);
    expect(copied.behavior).toBe('flying');
  });
});
