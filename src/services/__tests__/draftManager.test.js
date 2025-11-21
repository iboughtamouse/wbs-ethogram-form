import { shouldAutosave } from '../draftManager';

describe('draftManager', () => {
  describe('shouldAutosave', () => {
    it('should return false when metadata and observations are completely empty', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
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
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
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
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
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
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when observation has behavior', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {
        '09:00': {
          behavior: 'perching',
          location: '',
          notes: '',
        },
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when observation has location', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {
        '09:00': {
          behavior: '',
          location: '1',
          notes: '',
        },
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return true when observation has notes', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {
        '09:00': {
          behavior: '',
          location: '',
          notes: 'Some observation notes',
        },
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should return false when observations exist but all fields are empty', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {
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
      };

      expect(shouldAutosave(metadata, observations)).toBe(false);
    });

    it('should return true when at least one observation has any data', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15',
        startTime: '',
        endTime: '',
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {
        '09:00': {
          behavior: '',
          location: '',
          notes: '',
        },
        '09:05': {
          behavior: 'flying',
          location: '',
          notes: '',
        },
      };

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });

    it('should ignore default metadata fields (date, aviary, patient, mode)', () => {
      const metadata = {
        observerName: '',
        date: '2025-01-15', // Default value, should be ignored
        startTime: '',
        endTime: '',
        aviary: "Sayyida's Cove", // Default value, should be ignored
        patient: 'Sayyida', // Default value, should be ignored
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
        aviary: "Sayyida's Cove",
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {};

      expect(shouldAutosave(metadata, observations)).toBe(true);
    });
  });
});
