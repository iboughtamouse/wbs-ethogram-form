import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';

// Mock the utilities
jest.mock('../../utils/localStorageUtils', () => ({
  saveDraft: jest.fn(),
  loadDraft: jest.fn(),
  clearDraft: jest.fn(),
  hasDraft: jest.fn(() => false),
}));

jest.mock('../../services/draftManager', () => ({
  shouldAutosave: jest.fn((metadata, observations) => {
    // Simple implementation for testing
    return (
      !!metadata.observerName ||
      !!metadata.startTime ||
      Object.values(observations).some((slot) =>
        slot.some((obs) => obs.behavior)
      )
    );
  }),
  // Use the real migration so restore tests exercise actual draft shapes
  migrateDraft: jest.requireActual('../../services/draftManager').migrateDraft,
}));

import {
  saveDraft,
  loadDraft,
  clearDraft,
  hasDraft,
} from '../../utils/localStorageUtils';
import { shouldAutosave } from '../../services/draftManager';

describe('useAutoSave', () => {
  const metadata = {
    observerName: '',
    date: '2025-01-15',
    startTime: '',
    endTime: '',
    aviary: 'sayyidas-cove',
  };

  const observations = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with no draft notice when no draft exists', () => {
      hasDraft.mockReturnValue(false);

      const { result } = renderHook(() => useAutoSave(metadata, observations));

      expect(result.current.showDraftNotice).toBe(false);
      expect(result.current.draftTimestamp).toBeNull();
    });

    it('should show draft notice when draft exists', () => {
      hasDraft.mockReturnValue(true);
      loadDraft.mockReturnValue({
        metadata: {
          observerName: 'John',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:30',
          aviary: 'sayyidas-cove',
        },
        observations: {},
        savedAt: '2025-01-15T10:00:00.000Z',
      });

      const { result } = renderHook(() => useAutoSave(metadata, observations));

      expect(result.current.showDraftNotice).toBe(true);
      expect(result.current.draftTimestamp).toBe('2025-01-15T10:00:00.000Z');
      expect(hasDraft).toHaveBeenCalled();
      expect(loadDraft).toHaveBeenCalled();
    });

    it('should not show draft notice when hasDraft returns true but loadDraft fails', () => {
      hasDraft.mockReturnValue(true);
      loadDraft.mockReturnValue(null);

      const { result } = renderHook(() => useAutoSave(metadata, observations));

      expect(result.current.showDraftNotice).toBe(false);
      expect(result.current.draftTimestamp).toBeNull();
    });
  });

  describe('autosave', () => {
    it('should save draft when data changes and shouldAutosave returns true', () => {
      // Start with false to prevent initial save
      shouldAutosave.mockReturnValue(false);

      const { rerender } = renderHook(
        ({ metadata, observations }) => useAutoSave(metadata, observations),
        {
          initialProps: { metadata, observations },
        }
      );

      // Clear any calls from initial render
      saveDraft.mockClear();

      // Update metadata with data and make shouldAutosave return true
      shouldAutosave.mockReturnValue(true);
      const updatedMetadata = { ...metadata, observerName: 'John Doe' };

      rerender({ metadata: updatedMetadata, observations });

      expect(shouldAutosave).toHaveBeenCalledWith(
        updatedMetadata,
        observations
      );
      expect(saveDraft).toHaveBeenCalledWith(updatedMetadata, observations);
    });

    it('should not save draft when shouldAutosave returns false', () => {
      shouldAutosave.mockReturnValue(false);

      const { rerender } = renderHook(
        ({ metadata, observations }) => useAutoSave(metadata, observations),
        {
          initialProps: { metadata, observations },
        }
      );

      const updatedMetadata = { ...metadata };
      rerender({ metadata: updatedMetadata, observations });

      expect(shouldAutosave).toHaveBeenCalled();
      expect(saveDraft).not.toHaveBeenCalled();
    });

    it('should save draft when observations change', () => {
      // Explicitly set mock return value for this test
      shouldAutosave.mockReturnValue(true);

      const { rerender } = renderHook(
        ({ metadata, observations }) => useAutoSave(metadata, observations),
        {
          initialProps: { metadata, observations },
        }
      );

      const updatedObservations = {
        '09:00': [
          {
            subjectType: 'foster_parent',
            subjectId: 'Sayyida',
            behavior: 'perching',
            location: '1',
          },
        ],
      };

      rerender({ metadata, observations: updatedObservations });

      expect(shouldAutosave).toHaveBeenCalledWith(
        metadata,
        updatedObservations
      );
      expect(saveDraft).toHaveBeenCalledWith(metadata, updatedObservations);
    });
  });

  describe('handleRestoreDraft', () => {
    it('should restore draft and hide notice', () => {
      const mockOnRestore = jest.fn();
      const currentDraft = {
        shapeVersion: 2,
        metadata: {
          observerName: 'John',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:30',
          aviary: 'sayyidas-cove',
        },
        observations: {
          '09:00': [
            {
              subjectType: 'foster_parent',
              subjectId: 'Sayyida',
              behavior: 'perching',
            },
          ],
        },
        savedAt: '2025-01-15T10:00:00.000Z',
      };
      hasDraft.mockReturnValue(true);
      loadDraft.mockReturnValue(currentDraft);

      const { result } = renderHook(() =>
        useAutoSave(metadata, observations, mockOnRestore)
      );

      expect(result.current.showDraftNotice).toBe(true);

      act(() => {
        result.current.handleRestoreDraft();
      });

      // migrateDraft normalizes cardIds even on the v2 pass-through path, so
      // the restored draft is a new object whose cards gained a cardId
      expect(mockOnRestore).toHaveBeenCalledWith({
        ...currentDraft,
        observations: {
          '09:00': [
            {
              subjectType: 'foster_parent',
              subjectId: 'Sayyida',
              behavior: 'perching',
              cardId: expect.any(String),
            },
          ],
        },
      });
      expect(result.current.showDraftNotice).toBe(false);
      expect(result.current.draftTimestamp).toBeNull();
    });

    it('should migrate a v1 draft before passing it to onRestore', () => {
      const mockOnRestore = jest.fn();
      hasDraft.mockReturnValue(true);
      // Pre-Phase-2 draft: no shapeVersion, flat observations,
      // metadata.patient, aviary stored as the display name
      loadDraft.mockReturnValue({
        metadata: {
          observerName: 'John',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:30',
          aviary: "Sayyida's Cove",
          patient: 'Sayyida',
        },
        observations: { '09:00': { behavior: 'perching', location: '1' } },
        savedAt: '2025-01-15T10:00:00.000Z',
      });

      const { result } = renderHook(() =>
        useAutoSave(metadata, observations, mockOnRestore)
      );

      act(() => {
        result.current.handleRestoreDraft();
      });

      expect(mockOnRestore).toHaveBeenCalledWith({
        shapeVersion: 2,
        metadata: {
          observerName: 'John',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:30',
          aviary: 'sayyidas-cove',
        },
        observations: {
          '09:00': [
            {
              behavior: 'perching',
              location: '1',
              subjectType: 'foster_parent',
              subjectId: 'Sayyida',
              cardId: expect.any(String),
            },
          ],
        },
        savedAt: '2025-01-15T10:00:00.000Z',
      });
      expect(result.current.showDraftNotice).toBe(false);
    });

    it('should handle missing onRestore callback gracefully', () => {
      hasDraft.mockReturnValue(true);
      loadDraft.mockReturnValue({
        metadata: {
          observerName: 'John',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:30',
          aviary: 'sayyidas-cove',
        },
        observations: {},
        savedAt: '2025-01-15T10:00:00.000Z',
      });

      const { result } = renderHook(() => useAutoSave(metadata, observations));

      act(() => {
        result.current.handleRestoreDraft();
      });

      // Should not throw, just hide notice
      expect(result.current.showDraftNotice).toBe(false);
    });
  });

  describe('handleDiscardDraft', () => {
    it('should clear draft and hide notice', () => {
      hasDraft.mockReturnValue(true);
      loadDraft.mockReturnValue({
        metadata: {
          observerName: 'John',
          date: '2025-01-15',
          startTime: '09:00',
          endTime: '09:30',
          aviary: 'sayyidas-cove',
        },
        observations: {},
        savedAt: '2025-01-15T10:00:00.000Z',
      });

      const { result } = renderHook(() => useAutoSave(metadata, observations));

      expect(result.current.showDraftNotice).toBe(true);

      act(() => {
        result.current.handleDiscardDraft();
      });

      expect(clearDraft).toHaveBeenCalled();
      expect(result.current.showDraftNotice).toBe(false);
      expect(result.current.draftTimestamp).toBeNull();
    });
  });
});
