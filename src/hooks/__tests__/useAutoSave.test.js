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
      Object.values(observations).some((obs) => obs.behavior)
    );
  }),
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
    aviary: "Sayyida's Cove",
    patient: 'Sayyida',
    mode: 'live',
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
        metadata: { observerName: 'John' },
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
        '09:00': { behavior: 'perching', location: '1' },
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
      hasDraft.mockReturnValue(true);
      loadDraft.mockReturnValue({
        metadata: { observerName: 'John' },
        observations: { '09:00': { behavior: 'perching' } },
        savedAt: '2025-01-15T10:00:00.000Z',
      });

      const { result } = renderHook(() =>
        useAutoSave(metadata, observations, mockOnRestore)
      );

      expect(result.current.showDraftNotice).toBe(true);

      act(() => {
        result.current.handleRestoreDraft();
      });

      expect(mockOnRestore).toHaveBeenCalledWith({
        metadata: { observerName: 'John' },
        observations: { '09:00': { behavior: 'perching' } },
        savedAt: '2025-01-15T10:00:00.000Z',
      });
      expect(result.current.showDraftNotice).toBe(false);
      expect(result.current.draftTimestamp).toBeNull();
    });

    it('should handle missing onRestore callback gracefully', () => {
      hasDraft.mockReturnValue(true);
      loadDraft.mockReturnValue({
        metadata: { observerName: 'John' },
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
        metadata: {},
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
