import {
  generateObservationsForSlots,
  updateObservationField,
} from '../formStateManager';

describe('formStateManager', () => {
  describe('generateObservationsForSlots', () => {
    it('should create new observations for all time slots when no existing observations', () => {
      const slots = ['09:00', '09:05', '09:10'];
      const existingObservations = {};

      const result = generateObservationsForSlots(slots, existingObservations);

      expect(result).toEqual({
        '09:00': {
          behavior: '',
          location: '',
          notes: '',
          description: '',
          object: '',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
        },
        '09:05': {
          behavior: '',
          location: '',
          notes: '',
          description: '',
          object: '',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
        },
        '09:10': {
          behavior: '',
          location: '',
          notes: '',
          description: '',
          object: '',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
        },
      });
    });

    it('should preserve existing observation data when regenerating slots', () => {
      const slots = ['09:00', '09:05', '09:10'];
      const existingObservations = {
        '09:00': {
          behavior: 'perching',
          location: '1',
          notes: 'Resting on perch',
          description: '',
          object: '',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
        },
      };

      const result = generateObservationsForSlots(slots, existingObservations);

      // Should preserve existing observation
      expect(result['09:00']).toEqual(existingObservations['09:00']);

      // Should create new observations for other slots
      expect(result['09:05'].behavior).toBe('');
      expect(result['09:10'].behavior).toBe('');
    });

    it('should handle empty slots array', () => {
      const slots = [];
      const existingObservations = {};

      const result = generateObservationsForSlots(slots, existingObservations);

      expect(result).toEqual({});
    });

    it('should only include observations for slots in the new range', () => {
      const slots = ['09:00', '09:05'];
      const existingObservations = {
        '09:00': { behavior: 'perching', location: '1', notes: '' },
        '09:05': { behavior: 'flying', location: '', notes: '' },
        '09:10': { behavior: 'preening', location: '2', notes: 'Old slot' },
      };

      const result = generateObservationsForSlots(slots, existingObservations);

      expect(result).toHaveProperty('09:00');
      expect(result).toHaveProperty('09:05');
      expect(result).not.toHaveProperty('09:10'); // Old slot removed
    });
  });

  describe('updateObservationField', () => {
    const initialObservations = {
      '09:00': {
        behavior: 'perching',
        location: '1',
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

    it('should update a single field value', () => {
      const result = updateObservationField(
        initialObservations,
        '09:00',
        'notes',
        'Bird is alert'
      );

      expect(result['09:00'].notes).toBe('Bird is alert');
      expect(result['09:00'].behavior).toBe('perching'); // Other fields unchanged
    });

    it('should clear location when behavior is set to empty', () => {
      const result = updateObservationField(
        initialObservations,
        '09:00',
        'behavior',
        ''
      );

      expect(result['09:00'].behavior).toBe('');
      expect(result['09:00'].location).toBe('');
    });

    it('should preserve location when behavior is changed to non-empty value', () => {
      const result = updateObservationField(
        initialObservations,
        '09:00',
        'behavior',
        'flying'
      );

      expect(result['09:00'].behavior).toBe('flying');
      expect(result['09:00'].location).toBe('1'); // Preserved
    });

    it('should clear all conditional sub-fields when behavior changes', () => {
      const observationsWithSubFields = {
        '09:00': {
          behavior: 'interaction-inanimate',
          location: '1',
          notes: '',
          description: 'Playing with toy',
          object: 'toy',
          objectOther: '',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
        },
      };

      const result = updateObservationField(
        observationsWithSubFields,
        '09:00',
        'behavior',
        'perching'
      );

      expect(result['09:00'].behavior).toBe('perching');
      expect(result['09:00'].description).toBe('');
      expect(result['09:00'].object).toBe('');
      expect(result['09:00'].objectOther).toBe('');
      expect(result['09:00'].animal).toBe('');
      expect(result['09:00'].animalOther).toBe('');
      expect(result['09:00'].interactionType).toBe('');
      expect(result['09:00'].interactionTypeOther).toBe('');
    });

    it('should clear objectOther when object changes away from "other"', () => {
      const observationsWithOther = {
        '09:00': {
          behavior: 'interaction-inanimate',
          location: '1',
          notes: '',
          description: '',
          object: 'other',
          objectOther: 'custom item',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
        },
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'object',
        'toy'
      );

      expect(result['09:00'].object).toBe('toy');
      expect(result['09:00'].objectOther).toBe('');
    });

    it('should preserve objectOther when object is set to "other"', () => {
      const observationsWithOther = {
        '09:00': {
          behavior: 'interaction-inanimate',
          location: '1',
          notes: '',
          description: '',
          object: 'toy',
          objectOther: 'custom item',
          animal: '',
          animalOther: '',
          interactionType: '',
          interactionTypeOther: '',
        },
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'object',
        'other'
      );

      expect(result['09:00'].object).toBe('other');
      expect(result['09:00'].objectOther).toBe('custom item'); // Preserved
    });

    it('should clear animalOther when animal changes away from "other"', () => {
      const observationsWithOther = {
        '09:00': {
          behavior: 'interaction-animate',
          location: '1',
          notes: '',
          description: '',
          object: '',
          objectOther: '',
          animal: 'other',
          animalOther: 'exotic species',
          interactionType: '',
          interactionTypeOther: '',
        },
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'animal',
        'bird'
      );

      expect(result['09:00'].animal).toBe('bird');
      expect(result['09:00'].animalOther).toBe('');
    });

    it('should clear interactionTypeOther when interactionType changes away from "other"', () => {
      const observationsWithOther = {
        '09:00': {
          behavior: 'interaction-animate',
          location: '1',
          notes: '',
          description: '',
          object: '',
          objectOther: '',
          animal: 'bird',
          animalOther: '',
          interactionType: 'other',
          interactionTypeOther: 'custom interaction',
        },
      };

      const result = updateObservationField(
        observationsWithOther,
        '09:00',
        'interactionType',
        'agonistic'
      );

      expect(result['09:00'].interactionType).toBe('agonistic');
      expect(result['09:00'].interactionTypeOther).toBe('');
    });

    it('should not mutate the original observations object', () => {
      const original = { ...initialObservations };

      const result = updateObservationField(
        initialObservations,
        '09:00',
        'notes',
        'New notes'
      );

      expect(initialObservations).toEqual(original); // Original unchanged
      expect(result).not.toBe(initialObservations); // New object returned
    });

    it('should handle updating non-existent time slot gracefully', () => {
      const result = updateObservationField(
        initialObservations,
        '10:00', // Non-existent slot
        'notes',
        'Should create new'
      );

      expect(result['10:00'].notes).toBe('Should create new');
    });
  });
});
