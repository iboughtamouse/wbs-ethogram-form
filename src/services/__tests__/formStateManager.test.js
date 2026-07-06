import {
  createEmptyObservation,
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

describe('formStateManager', () => {
  describe('createEmptyObservation', () => {
    it('should create a card with subject identity and empty fields', () => {
      const result = createEmptyObservation('juvenile', 'Pip');

      expect(result).toEqual({
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
        '09:00': [makeCard()],
        '09:05': [makeCard()],
        '09:10': [makeCard()],
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
      expect(result['09:05']).toEqual([makeCard()]);
      expect(result['09:10']).toEqual([makeCard()]);
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

    it('should update a single field value', () => {
      const result = updateObservationField(
        initialObservations,
        '09:00',
        'Sayyida',
        'notes',
        'Bird is alert'
      );

      expect(result['09:00'][0].notes).toBe('Bird is alert');
      expect(result['09:00'][0].behavior).toBe('perching'); // Other fields unchanged
    });

    it('should only touch the matching subject card, leaving other cards in the slot untouched', () => {
      const sayyidaCard = makeCard({ behavior: 'perching', location: '1' });
      const pipCard = {
        ...createEmptyObservation('juvenile', 'Pip'),
        behavior: 'flying',
      };
      const observations = { '09:00': [sayyidaCard, pipCard] };

      const result = updateObservationField(
        observations,
        '09:00',
        'Pip',
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
        'Sayyida',
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
        'Sayyida',
        'behavior',
        'flying'
      );

      expect(result['09:00'][0].behavior).toBe('flying');
      expect(result['09:00'][0].location).toBe('1'); // Preserved
    });

    it('should clear all conditional sub-fields when behavior changes', () => {
      const observationsWithSubFields = {
        '09:00': [
          makeCard({
            behavior: 'interaction-inanimate',
            location: '1',
            description: 'Playing with toy',
            object: 'toy',
          }),
        ],
      };

      const result = updateObservationField(
        observationsWithSubFields,
        '09:00',
        'Sayyida',
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
      const observationsWithOther = {
        '09:00': [
          makeCard({
            behavior: 'interaction-inanimate',
            location: '1',
            object: 'other',
            objectOther: 'custom item',
          }),
        ],
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'Sayyida',
        'object',
        'toy'
      );

      expect(result['09:00'][0].object).toBe('toy');
      expect(result['09:00'][0].objectOther).toBe('');
    });

    it('should preserve objectOther when object is set to "other"', () => {
      const observationsWithOther = {
        '09:00': [
          makeCard({
            behavior: 'interaction-inanimate',
            location: '1',
            object: 'toy',
            objectOther: 'custom item',
          }),
        ],
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'Sayyida',
        'object',
        'other'
      );

      expect(result['09:00'][0].object).toBe('other');
      expect(result['09:00'][0].objectOther).toBe('custom item'); // Preserved
    });

    it('should clear animalOther when animal changes away from "other"', () => {
      const observationsWithOther = {
        '09:00': [
          makeCard({
            behavior: 'interaction-animate',
            location: '1',
            animal: 'other',
            animalOther: 'exotic species',
          }),
        ],
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'Sayyida',
        'animal',
        'bird'
      );

      expect(result['09:00'][0].animal).toBe('bird');
      expect(result['09:00'][0].animalOther).toBe('');
    });

    it('should clear animalInteractionTypeOther when animalInteractionType changes away from "other"', () => {
      const observationsWithOther = {
        '09:00': [
          makeCard({
            behavior: 'interaction-animate',
            location: '1',
            animal: 'bird',
            animalInteractionType: 'other',
            animalInteractionTypeOther: 'custom interaction',
          }),
        ],
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'Sayyida',
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
        'Sayyida',
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
        'Sayyida',
        'notes',
        'No card to update'
      );

      // No card exists for the subject, so the slot stays empty — no crash
      expect(result['10:00']).toEqual([]);
      expect(result['09:00']).toEqual(initialObservations['09:00']);
    });
  });

  describe('addSubjectObservation', () => {
    it('should append an empty card for the new subject', () => {
      const sayyidaCard = makeCard({ behavior: 'perching' });
      const observations = { '09:00': [sayyidaCard] };

      const result = addSubjectObservation(
        observations,
        '09:00',
        'juvenile',
        'Pip'
      );

      expect(result['09:00']).toHaveLength(2);
      expect(result['09:00'][0]).toBe(sayyidaCard); // Existing card untouched
      expect(result['09:00'][1]).toEqual(
        createEmptyObservation('juvenile', 'Pip')
      );
      expect(observations['09:00']).toHaveLength(1); // Original unchanged
    });

    it('should be a no-op when the subject already has a card in the slot', () => {
      const observations = {
        '09:00': [makeCard({ behavior: 'perching', notes: 'Existing data' })],
      };

      const result = addSubjectObservation(
        observations,
        '09:00',
        DEFAULT_SUBJECT.type,
        DEFAULT_SUBJECT.name
      );

      expect(result).toBe(observations); // Same object, nothing changed
      expect(result['09:00']).toHaveLength(1);
      expect(result['09:00'][0].notes).toBe('Existing data');
    });

    it('should add to an empty or missing slot', () => {
      const observations = {};

      const result = addSubjectObservation(
        observations,
        '09:00',
        'baby',
        'Nugget'
      );

      expect(result['09:00']).toEqual([
        createEmptyObservation('baby', 'Nugget'),
      ]);
    });
  });

  describe('removeSubjectObservation', () => {
    it('should remove only the matching subject card', () => {
      const sayyidaCard = makeCard({ behavior: 'perching' });
      const pipCard = createEmptyObservation('juvenile', 'Pip');
      const observations = { '09:00': [sayyidaCard, pipCard] };

      const result = removeSubjectObservation(observations, '09:00', 'Pip');

      expect(result['09:00']).toEqual([sayyidaCard]);
      expect(result['09:00'][0]).toBe(sayyidaCard); // Remaining card untouched
      expect(observations['09:00']).toHaveLength(2); // Original unchanged
    });

    it('should leave the slot unchanged when the subject has no card', () => {
      const sayyidaCard = makeCard();
      const observations = { '09:00': [sayyidaCard] };

      const result = removeSubjectObservation(observations, '09:00', 'Pip');

      expect(result['09:00']).toEqual([sayyidaCard]);
    });
  });
});
