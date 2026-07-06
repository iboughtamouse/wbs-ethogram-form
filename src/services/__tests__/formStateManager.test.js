import {
  createEmptyObservation,
  ensureCardIds,
  generateObservationsForSlots,
  updateObservationField,
  addSubjectObservation,
  removeSubjectObservation,
} from '../formStateManager';

const DEFAULT_SUBJECT = { type: 'foster_parent', name: 'Sayyida' };

const makeCard = (overrides = {}) => ({
  ...createEmptyObservation(DEFAULT_SUBJECT.type, DEFAULT_SUBJECT.name),
  ...overrides,
});

// For deep-equality assertions against freshly created cards: cardId is a
// random UUID, so match it with expect.any(String).
const expectedCard = (overrides = {}) => ({
  ...makeCard(overrides),
  cardId: expect.any(String),
});

describe('formStateManager', () => {
  describe('createEmptyObservation', () => {
    it('should create a card with subject identity, a cardId, and empty fields', () => {
      const result = createEmptyObservation('juvenile', 'Pip');

      expect(result).toEqual({
        cardId: expect.any(String),
        subjectType: 'juvenile',
        subjectId: 'Pip',
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
      });
    });

    it('should assign a unique cardId to each new card', () => {
      const first = createEmptyObservation('juvenile', 'Pip');
      const second = createEmptyObservation('juvenile', 'Pip');

      expect(first.cardId).not.toBe(second.cardId);
    });
  });

  describe('ensureCardIds', () => {
    it('should assign cardIds only where missing and leave existing cards untouched', () => {
      const cardWithId = makeCard({ behavior: 'perching' });
      const legacyCard = makeCard({ behavior: 'flying' });
      delete legacyCard.cardId;
      const observations = { '09:00': [cardWithId, legacyCard] };

      const result = ensureCardIds(observations);

      // Existing card keeps its identity (not even cloned)
      expect(result['09:00'][0]).toBe(cardWithId);
      // Legacy card gets a new cardId on a new object
      expect(result['09:00'][1]).not.toBe(legacyCard);
      expect(result['09:00'][1].cardId).toEqual(expect.any(String));
      expect(result['09:00'][1].behavior).toBe('flying');
      // Original card was not mutated
      expect(legacyCard).not.toHaveProperty('cardId');
    });

    it('should normalize every time slot', () => {
      const legacyA = makeCard();
      delete legacyA.cardId;
      const legacyB = makeCard();
      delete legacyB.cardId;
      const observations = { '09:00': [legacyA], '09:05': [legacyB] };

      const result = ensureCardIds(observations);

      expect(result['09:00'][0].cardId).toEqual(expect.any(String));
      expect(result['09:05'][0].cardId).toEqual(expect.any(String));
      expect(result['09:00'][0].cardId).not.toBe(result['09:05'][0].cardId);
    });
  });

  describe('generateObservationsForSlots', () => {
    it('should create a default-subject card for all time slots when no existing observations', () => {
      const slots = ['09:00', '09:05', '09:10'];
      const existingObservations = {};

      const result = generateObservationsForSlots(
        slots,
        existingObservations,
        DEFAULT_SUBJECT
      );

      expect(result).toEqual({
        '09:00': [expectedCard()],
        '09:05': [expectedCard()],
        '09:10': [expectedCard()],
      });
    });

    it('should create empty slots when no default subject is configured', () => {
      const slots = ['09:00', '09:05'];

      const result = generateObservationsForSlots(slots, {}, null);

      expect(result).toEqual({
        '09:00': [],
        '09:05': [],
      });
    });

    it('should preserve existing observation data when regenerating slots', () => {
      const slots = ['09:00', '09:05', '09:10'];
      const existingObservations = {
        '09:00': [
          makeCard({
            behavior: 'perching',
            location: '1',
            notes: 'Resting on perch',
          }),
        ],
      };

      const result = generateObservationsForSlots(
        slots,
        existingObservations,
        DEFAULT_SUBJECT
      );

      // Should preserve existing observation cards
      expect(result['09:00']).toEqual(existingObservations['09:00']);

      // Should create new default-subject cards for other slots
      expect(result['09:05']).toEqual([expectedCard()]);
      expect(result['09:10']).toEqual([expectedCard()]);
    });

    it('should handle empty slots array', () => {
      const slots = [];
      const existingObservations = {};

      const result = generateObservationsForSlots(
        slots,
        existingObservations,
        DEFAULT_SUBJECT
      );

      expect(result).toEqual({});
    });

    it('should only include observations for slots in the new range', () => {
      const slots = ['09:00', '09:05'];
      const existingObservations = {
        '09:00': [makeCard({ behavior: 'perching', location: '1' })],
        '09:05': [makeCard({ behavior: 'flying' })],
        '09:10': [
          makeCard({ behavior: 'preening', location: '2', notes: 'Old slot' }),
        ],
      };

      const result = generateObservationsForSlots(
        slots,
        existingObservations,
        DEFAULT_SUBJECT
      );

      expect(result).toHaveProperty('09:00');
      expect(result).toHaveProperty('09:05');
      expect(result).not.toHaveProperty('09:10'); // Old slot removed
    });
  });

  describe('updateObservationField', () => {
    const initialObservations = {
      '09:00': [makeCard({ behavior: 'perching', location: '1' })],
    };
    const initialCardId = initialObservations['09:00'][0].cardId;

    it('should update a single field value', () => {
      const result = updateObservationField(
        initialObservations,
        '09:00',
        initialCardId,
        'notes',
        'Bird is alert'
      );

      expect(result['09:00'][0].notes).toBe('Bird is alert');
      expect(result['09:00'][0].behavior).toBe('perching'); // Other fields unchanged
    });

    it('should only touch the matching card, leaving other cards in the slot untouched', () => {
      const sayyidaCard = makeCard({ behavior: 'perching', location: '1' });
      const pipCard = {
        ...createEmptyObservation('juvenile', 'Pip'),
        behavior: 'flying',
      };
      const observations = { '09:00': [sayyidaCard, pipCard] };

      const result = updateObservationField(
        observations,
        '09:00',
        pipCard.cardId,
        'notes',
        'Swooping low'
      );

      expect(result['09:00'][1].notes).toBe('Swooping low');
      expect(result['09:00'][1].behavior).toBe('flying');
      // Non-matching card keeps its identity (not even cloned)
      expect(result['09:00'][0]).toBe(sayyidaCard);
    });

    it('should clear location when behavior is set to empty', () => {
      const result = updateObservationField(
        initialObservations,
        '09:00',
        initialCardId,
        'behavior',
        ''
      );

      expect(result['09:00'][0].behavior).toBe('');
      expect(result['09:00'][0].location).toBe('');
    });

    it('should preserve location when behavior is changed to non-empty value', () => {
      const result = updateObservationField(
        initialObservations,
        '09:00',
        initialCardId,
        'behavior',
        'flying'
      );

      expect(result['09:00'][0].behavior).toBe('flying');
      expect(result['09:00'][0].location).toBe('1'); // Preserved
    });

    it('should clear all conditional sub-fields when behavior changes', () => {
      const card = makeCard({
        behavior: 'interaction-inanimate',
        location: '1',
        description: 'Playing with toy',
        object: 'toy',
      });
      const observationsWithSubFields = { '09:00': [card] };

      const result = updateObservationField(
        observationsWithSubFields,
        '09:00',
        card.cardId,
        'behavior',
        'perching'
      );

      expect(result['09:00'][0].behavior).toBe('perching');
      expect(result['09:00'][0].description).toBe('');
      expect(result['09:00'][0].object).toBe('');
      expect(result['09:00'][0].objectOther).toBe('');
      expect(result['09:00'][0].animal).toBe('');
      expect(result['09:00'][0].animalOther).toBe('');
      expect(result['09:00'][0].objectInteractionType).toBe('');
      expect(result['09:00'][0].objectInteractionTypeOther).toBe('');
      expect(result['09:00'][0].animalInteractionType).toBe('');
      expect(result['09:00'][0].animalInteractionTypeOther).toBe('');
    });

    it('should clear objectOther when object changes away from "other"', () => {
      const card = makeCard({
        behavior: 'interaction-inanimate',
        location: '1',
        object: 'other',
        objectOther: 'custom item',
      });
      const observationsWithOther = { '09:00': [card] };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        card.cardId,
        'object',
        'toy'
      );

      expect(result['09:00'][0].object).toBe('toy');
      expect(result['09:00'][0].objectOther).toBe('');
    });

    it('should preserve objectOther when object is set to "other"', () => {
      const card = makeCard({
        behavior: 'interaction-inanimate',
        location: '1',
        object: 'toy',
        objectOther: 'custom item',
      });
      const observationsWithOther = { '09:00': [card] };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        card.cardId,
        'object',
        'other'
      );

      expect(result['09:00'][0].object).toBe('other');
      expect(result['09:00'][0].objectOther).toBe('custom item'); // Preserved
    });

    it('should clear animalOther when animal changes away from "other"', () => {
      const card = makeCard({
        behavior: 'interaction-animate',
        location: '1',
        animal: 'other',
        animalOther: 'exotic species',
      });
      const observationsWithOther = { '09:00': [card] };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        card.cardId,
        'animal',
        'bird'
      );

      expect(result['09:00'][0].animal).toBe('bird');
      expect(result['09:00'][0].animalOther).toBe('');
    });

    it('should clear animalInteractionTypeOther when animalInteractionType changes away from "other"', () => {
      const card = makeCard({
        behavior: 'interaction-animate',
        location: '1',
        animal: 'bird',
        animalInteractionType: 'other',
        animalInteractionTypeOther: 'custom interaction',
      });
      const observationsWithOther = { '09:00': [card] };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        card.cardId,
        'animalInteractionType',
        'agonistic'
      );

      expect(result['09:00'][0].animalInteractionType).toBe('agonistic');
      expect(result['09:00'][0].animalInteractionTypeOther).toBe('');
    });

    it('should not mutate the original observations object', () => {
      const original = {
        '09:00': [{ ...initialObservations['09:00'][0] }],
      };

      const result = updateObservationField(
        initialObservations,
        '09:00',
        initialCardId,
        'notes',
        'New notes'
      );

      expect(initialObservations).toEqual(original); // Original unchanged
      expect(result).not.toBe(initialObservations); // New object returned
      expect(result['09:00']).not.toBe(initialObservations['09:00']); // New slot array
    });

    it('should handle updating a non-existent time slot gracefully', () => {
      const result = updateObservationField(
        initialObservations,
        '10:00', // Non-existent slot
        initialCardId,
        'notes',
        'No card to update'
      );

      // No card exists in the slot, so it stays empty — no crash
      expect(result['10:00']).toEqual([]);
      expect(result['09:00']).toEqual(initialObservations['09:00']);
    });
  });

  describe('addSubjectObservation', () => {
    it('should append an empty card for the new subject', () => {
      const sayyidaCard = makeCard({ behavior: 'perching' });
      const observations = { '09:00': [sayyidaCard] };

      const result = addSubjectObservation(observations, '09:00', {
        type: 'juvenile',
        name: 'Pip',
      });

      expect(result['09:00']).toHaveLength(2);
      expect(result['09:00'][0]).toBe(sayyidaCard); // Existing card untouched
      expect(result['09:00'][1]).toEqual({
        ...createEmptyObservation('juvenile', 'Pip'),
        cardId: expect.any(String),
      });
      expect(observations['09:00']).toHaveLength(1); // Original unchanged
    });

    it('should be a no-op when the subject already has a card in the slot', () => {
      const observations = {
        '09:00': [makeCard({ behavior: 'perching', notes: 'Existing data' })],
      };

      const result = addSubjectObservation(observations, '09:00', {
        type: DEFAULT_SUBJECT.type,
        name: DEFAULT_SUBJECT.name,
      });

      expect(result).toBe(observations); // Same object, nothing changed
      expect(result['09:00']).toHaveLength(1);
      expect(result['09:00'][0].notes).toBe('Existing data');
    });

    it('should add a duplicate-subjectId card with a distinct cardId when allowDuplicate is set', () => {
      const firstGeneric = createEmptyObservation('juvenile', 'Juvenile');
      const observations = { '09:00': [firstGeneric] };

      const result = addSubjectObservation(observations, '09:00', {
        type: 'juvenile',
        name: 'Juvenile',
        allowDuplicate: true,
      });

      expect(result['09:00']).toHaveLength(2);
      expect(result['09:00'][0]).toBe(firstGeneric); // Existing card untouched
      expect(result['09:00'][1].subjectId).toBe('Juvenile'); // Same subjectId
      expect(result['09:00'][1].cardId).not.toBe(firstGeneric.cardId); // Different cardId
    });

    it('should still dedupe an already-recorded subject when allowDuplicate is not set', () => {
      const firstGeneric = createEmptyObservation('juvenile', 'Juvenile');
      const observations = { '09:00': [firstGeneric] };

      const result = addSubjectObservation(observations, '09:00', {
        type: 'juvenile',
        name: 'Juvenile',
      });

      expect(result).toBe(observations); // Same object, nothing changed
      expect(result['09:00']).toHaveLength(1);
    });

    it('should add to an empty or missing slot', () => {
      const observations = {};

      const result = addSubjectObservation(observations, '09:00', {
        type: 'baby',
        name: 'Nugget',
      });

      expect(result['09:00']).toEqual([
        {
          ...createEmptyObservation('baby', 'Nugget'),
          cardId: expect.any(String),
        },
      ]);
    });
  });

  describe('removeSubjectObservation', () => {
    it('should remove only the matching card', () => {
      const sayyidaCard = makeCard({ behavior: 'perching' });
      const pipCard = createEmptyObservation('juvenile', 'Pip');
      const observations = { '09:00': [sayyidaCard, pipCard] };

      const result = removeSubjectObservation(
        observations,
        '09:00',
        pipCard.cardId
      );

      expect(result['09:00']).toEqual([sayyidaCard]);
      expect(result['09:00'][0]).toBe(sayyidaCard); // Remaining card untouched
      expect(observations['09:00']).toHaveLength(2); // Original unchanged
    });

    it('should remove exactly the matching cardId when two cards share a subjectId', () => {
      const genericA = createEmptyObservation('juvenile', 'Juvenile');
      const genericB = createEmptyObservation('juvenile', 'Juvenile');
      const observations = { '09:00': [genericA, genericB] };

      const result = removeSubjectObservation(
        observations,
        '09:00',
        genericA.cardId
      );

      expect(result['09:00']).toHaveLength(1);
      expect(result['09:00'][0]).toBe(genericB); // Same-subjectId sibling survives
    });

    it('should leave the slot unchanged when no card has the cardId', () => {
      const sayyidaCard = makeCard();
      const observations = { '09:00': [sayyidaCard] };

      const result = removeSubjectObservation(
        observations,
        '09:00',
        'no-such-card'
      );

      expect(result['09:00']).toEqual([sayyidaCard]);
    });
  });
});
