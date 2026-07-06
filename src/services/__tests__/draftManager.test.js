import { shouldAutosave, migrateDraft } from '../draftManager';

describe('draftManager', () => {
  describe('shouldAutosave', () => {
    it('should return false when metadata and observations are completely empty', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(false);
    });

    it('should return true when observerName is filled', () => {
      const metadata = {
        observerName: 'John Doe',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when startTime is filled', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when endTime is filled', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '10:00',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when an observation card has behavior', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {
        '09:00': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: 'perching',
            location: '',
            notes: '',
          },
        ],
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when an observation card has location', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {
        '09:00': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: '',
            location: '1',
            notes: '',
          },
        ],
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when an observation card has notes', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {
        '09:00': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: '',
            location: '',
            notes: 'Some observation notes',
          },
        ],
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return false when observations exist but all cards are empty', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {
        '09:00': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
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
          },
        ],
        '09:05': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
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
          },
        ],
      };

      expect(shouldAutosave(metadata, observations)).toBe(false);
    });

    it('should return true when at least one card in any slot has data', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {
        '09:00': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: '',
            location: '',
            notes: '',
          },
        ],
        '09:05': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: '',
            location: '',
            notes: '',
          },
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: 'flying',
            location: '',
            notes: '',
          },
        ],
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should ignore default metadata fields (date, aviary, mode)', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15', // Default value, should be ignored
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove', // Default value, should be ignored
        mode: 'live', // Default value, should be ignored
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(false);
    });

    it('should handle empty observations object', () => {
      const metadata = {
        observerName: 'John',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: 'sayyidas-cove',
        mode: 'live',
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });
  });

  describe('migrateDraft', () => {
    const config = {
      fosterParentName: 'Sayyida',
      aviarySlug: 'sayyidas-cove',
      aviaryOptions: [{ slug: 'sayyidas-cove', name: "Sayyida's Cove" }],
    };

    it('should return null for a null draft', () => {
      expect(migrateDraft(null, config)).toBeNull();
    });

    it('should pass a v2 draft through untouched', () => {
      const draft = {
        shapeVersion: 2,
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: 'sayyidas-cove',
          mode: 'live',
        },
        observations: {
          '09:00': [
            {
              subjectType: 'foster_parent',
              subjectId: 'Sayyida',
              behavior: 'perching',
              location: '',
              notes: '',
            },
          ],
        },
        savedAt: '2025-01-15T09:05:00.000Z',
      };

      expect(migrateDraft(draft, config)).toBe(draft);
    });

    it('should migrate a v1 draft: flat observations become single-card arrays attributed to the draft patient, patient is dropped, and the aviary display name maps to its slug', () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          patient: 'Ruby',
          mode: 'live',
        },
        observations: {
          '09:00': {
            behavior: 'perching',
            location: '1',
            notes: 'Alert',
          },
          '09:05': {
            behavior: '',
            location: '',
            notes: '',
          },
        },
        savedAt: '2025-01-15T09:05:00.000Z',
      };

      const migrated = migrateDraft(draft, config);

      expect(migrated.shapeVersion).toBe(2);
      expect(migrated.metadata).toEqual({
        observerName: 'Jane',
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '10:00',
        aviary: 'sayyidas-cove',
        mode: 'live',
      });
      expect(migrated.metadata).not.toHaveProperty('patient');
      expect(migrated.observations).toEqual({
        '09:00': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Ruby',
            behavior: 'perching',
            location: '1',
            notes: 'Alert',
          },
        ],
        '09:05': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Ruby',
            behavior: '',
            location: '',
            notes: '',
          },
        ],
      });
      expect(migrated.savedAt).toBe('2025-01-15T09:05:00.000Z');
    });

    it('should fall back to config.fosterParentName when the v1 draft has no patient', () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': {
            behavior: 'perching',
            location: '',
            notes: '',
          },
        },
      };

      const migrated = migrateDraft(draft, config);

      expect(migrated.observations['09:00']).toEqual([
        {
          subjectType: 'foster_parent',
          subjectId: 'Sayyida',
          behavior: 'perching',
          location: '',
          notes: '',
        },
      ]);
    });

    it('should return null when metadata is missing date', () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {},
      };

      expect(migrateDraft(draft, config)).toBeNull();
    });

    it('should return null when observations is null', () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: null,
      };

      expect(migrateDraft(draft, config)).toBeNull();
    });

    it('should return null when observations is an array', () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: [{ behavior: 'perching', location: '', notes: '' }],
      };

      expect(migrateDraft(draft, config)).toBeNull();
    });

    it('should return null for a draft with a future shapeVersion', () => {
      const draft = {
        shapeVersion: 3,
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: 'sayyidas-cove',
          mode: 'live',
        },
        observations: {},
      };

      expect(migrateDraft(draft, config)).toBeNull();
    });

    it('should return null for a v2 draft whose slot value is a flat object instead of an array', () => {
      const draft = {
        shapeVersion: 2,
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: 'sayyidas-cove',
          mode: 'live',
        },
        observations: {
          '09:00': {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: 'perching',
            location: '',
            notes: '',
          },
        },
      };

      expect(migrateDraft(draft, config)).toBeNull();
    });

    it('should return null for a v1 draft with a slot value that is a string', () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': 'perching',
        },
      };

      expect(migrateDraft(draft, config)).toBeNull();
    });

    it("should fall back to 'Unknown' when the v1 draft has no patient and config.fosterParentName is empty", () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: "Sayyida's Cove",
          mode: 'live',
        },
        observations: {
          '09:00': {
            behavior: 'perching',
            location: '',
            notes: '',
          },
        },
      };

      const migrated = migrateDraft(draft, { ...config, fosterParentName: '' });

      expect(migrated.observations['09:00']).toEqual([
        {
          subjectType: 'foster_parent',
          subjectId: 'Unknown',
          behavior: 'perching',
          location: '',
          notes: '',
        },
      ]);
    });

    it('should fall back to config.aviarySlug when the v1 aviary name is not in aviaryOptions', () => {
      const draft = {
        metadata: {
          observerName: 'Jane',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '10:00',
          aviary: 'Retired Aviary',
          patient: 'Sayyida',
          mode: 'live',
        },
        observations: {},
      };

      const migrated = migrateDraft(draft, config);

      expect(migrated.metadata.aviary).toBe('sayyidas-cove');
    });
  });
});
