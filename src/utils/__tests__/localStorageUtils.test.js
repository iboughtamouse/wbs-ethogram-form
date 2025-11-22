/**
 * Tests for localStorage utilities
 */

import {
  saveDraft,
  loadDraft,
  clearDraft,
  hasDraft,
} from '../localStorageUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store = {};

  return {
    getItem: (key) => store[key] || null,
    setItem: (key, value) => {
      store[key] = value.toString();
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Replace global localStorage with mock
Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

describe('localStorageUtils', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  describe('saveDraft', () => {
    it('should save metadata and observations to localStorage', () => {
      const metadata = {
        observerName: 'Test Observer',
        date: '2024-01-15',
        startTime: '15:00',
        endTime: '16:00',
        aviary: 'A1',
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {
        '15:00': { behavior: 'Perching', location: '5', notes: 'Test note' },
        '15:05': { behavior: 'Flying', location: '', notes: '' },
      };

      const result = saveDraft(metadata, observations);

      expect(result).toBe(true);
      const saved = JSON.parse(localStorage.getItem('wbs-ethogram-draft'));
      expect(saved.metadata).toEqual(metadata);
      expect(saved.observations).toEqual(observations);
      expect(saved.savedAt).toBeDefined();
      expect(typeof saved.savedAt).toBe('string');
    });

    it('should include ISO timestamp when saving', () => {
      const metadata = { observerName: 'Test' };
      const observations = {};

      saveDraft(metadata, observations);

      const saved = JSON.parse(localStorage.getItem('wbs-ethogram-draft'));
      const savedDate = new Date(saved.savedAt);
      expect(savedDate).toBeInstanceOf(Date);
      expect(savedDate.getTime()).not.toBeNaN();
    });

    it('should overwrite previous draft when called multiple times', () => {
      const metadata1 = { observerName: 'First Observer' };
      const metadata2 = { observerName: 'Second Observer' };
      const observations = {};

      saveDraft(metadata1, observations);
      saveDraft(metadata2, observations);

      const saved = JSON.parse(localStorage.getItem('wbs-ethogram-draft'));
      expect(saved.metadata.observerName).toBe('Second Observer');
    });

    it('should return false and log error if localStorage fails', () => {
      // Mock setItem to throw error
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const result = saveDraft({}, {});

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to save draft to localStorage:',
        expect.any(Error)
      );

      localStorage.setItem.mockRestore();
    });
  });

  describe('loadDraft', () => {
    it('should load saved draft from localStorage', () => {
      const metadata = { observerName: 'Test Observer' };
      const observations = {
        '15:00': { behavior: 'Perching', location: '5', notes: '' },
      };
      saveDraft(metadata, observations);

      const loaded = loadDraft();

      expect(loaded).not.toBeNull();
      expect(loaded.metadata).toEqual(metadata);
      expect(loaded.observations).toEqual(observations);
      expect(loaded.savedAt).toBeDefined();
    });

    it('should return null when no draft exists', () => {
      const loaded = loadDraft();
      expect(loaded).toBeNull();
    });

    it('should return null and log error if JSON parsing fails', () => {
      // Manually set invalid JSON
      localStorage.setItem('wbs-ethogram-draft', 'invalid-json{');

      const loaded = loadDraft();

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load draft from localStorage:',
        expect.any(Error)
      );
    });

    it('should return null and log error if localStorage getItem fails', () => {
      // Mock getItem to throw error
      jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const loaded = loadDraft();

      expect(loaded).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load draft from localStorage:',
        expect.any(Error)
      );

      localStorage.getItem.mockRestore();
    });
  });

  describe('clearDraft', () => {
    it('should remove draft from localStorage', () => {
      saveDraft({ observerName: 'Test' }, {});
      expect(localStorage.getItem('wbs-ethogram-draft')).not.toBeNull();

      const result = clearDraft();

      expect(result).toBe(true);
      expect(localStorage.getItem('wbs-ethogram-draft')).toBeNull();
    });

    it('should return true even if no draft exists', () => {
      const result = clearDraft();
      expect(result).toBe(true);
    });

    it('should return false and log error if localStorage fails', () => {
      // Mock removeItem to throw error
      jest.spyOn(localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = clearDraft();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to clear draft from localStorage:',
        expect.any(Error)
      );

      localStorage.removeItem.mockRestore();
    });
  });

  describe('hasDraft', () => {
    it('should return true when draft exists', () => {
      saveDraft({ observerName: 'Test' }, {});

      const result = hasDraft();

      expect(result).toBe(true);
    });

    it('should return false when no draft exists', () => {
      const result = hasDraft();
      expect(result).toBe(false);
    });

    it('should return false after draft is cleared', () => {
      saveDraft({ observerName: 'Test' }, {});
      expect(hasDraft()).toBe(true);

      clearDraft();

      expect(hasDraft()).toBe(false);
    });

    it('should return false and log error if localStorage fails', () => {
      // Mock getItem to throw error
      jest.spyOn(localStorage, 'getItem').mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const result = hasDraft();

      expect(result).toBe(false);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to check for draft in localStorage:',
        expect.any(Error)
      );

      localStorage.getItem.mockRestore();
    });
  });

  describe('Integration scenarios', () => {
    it('should handle full save-load-clear cycle', () => {
      const metadata = {
        observerName: 'Integration Test',
        date: '2024-01-15',
        startTime: '15:00',
        endTime: '16:00',
        aviary: 'A1',
        patient: 'Sayyida',
        mode: 'live',
      };
      const observations = {
        '15:00': {
          behavior: 'Perching',
          location: '5',
          notes: 'First observation',
        },
        '15:05': { behavior: 'Flying', location: '', notes: '' },
        '15:10': { behavior: 'Eating', location: 'G', notes: 'On ground' },
      };

      // Save
      expect(hasDraft()).toBe(false);
      const saveResult = saveDraft(metadata, observations);
      expect(saveResult).toBe(true);
      expect(hasDraft()).toBe(true);

      // Load
      const loaded = loadDraft();
      expect(loaded).not.toBeNull();
      expect(loaded.metadata).toEqual(metadata);
      expect(loaded.observations).toEqual(observations);

      // Clear
      const clearResult = clearDraft();
      expect(clearResult).toBe(true);
      expect(hasDraft()).toBe(false);
      expect(loadDraft()).toBeNull();
    });

    it('should preserve complex observation data structures', () => {
      const observations = {
        '15:00': { behavior: 'Perching', location: '1', notes: 'Top perch' },
        '15:05': {
          behavior: 'Perching',
          location: '15',
          notes: 'Middle perch',
        },
        '15:10': { behavior: 'Flying', location: '', notes: '' },
        '15:15': { behavior: 'Eating', location: 'G', notes: 'Ground feeding' },
        '15:20': { behavior: 'Perching', location: 'BB1', notes: 'Back box 1' },
      };

      saveDraft({}, observations);
      const loaded = loadDraft();

      expect(loaded.observations).toEqual(observations);
      expect(Object.keys(loaded.observations)).toHaveLength(5);
    });
  });
});
