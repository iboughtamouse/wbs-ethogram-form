/**
 * useAutoSave Hook
 *
 * Handles draft management and autosave functionality.
 * Loads drafts on mount, autosaves when data changes, provides restore/discard handlers.
 */

import { useState, useEffect } from 'react';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  hasDraft,
} from '../utils/localStorageUtils';
import { shouldAutosave } from '../services/draftManager';

/**
 * Custom hook for managing form drafts and autosave
 *
 * @param {Object} metadata - Current form metadata
 * @param {Object} observations - Current observations
 * @param {Function} onRestore - Callback to restore draft (receives draft object)
 * @returns {Object} Draft state and handlers
 */
export const useAutoSave = (metadata, observations, onRestore) => {
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState(null);

  // Check for saved draft on mount
  useEffect(() => {
    if (hasDraft()) {
      const draft = loadDraft();
      if (draft) {
        setShowDraftNotice(true);
        setDraftTimestamp(draft.savedAt);
      }
    }
  }, []);

  // Autosave to localStorage when metadata or observations change
  useEffect(() => {
    if (shouldAutosave(metadata, observations)) {
      saveDraft(metadata, observations);
    }
  }, [metadata, observations]);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft && onRestore) {
      onRestore(draft);
    }
    setShowDraftNotice(false);
    setDraftTimestamp(null);
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftNotice(false);
    setDraftTimestamp(null);
  };

  return {
    showDraftNotice,
    draftTimestamp,
    handleRestoreDraft,
    handleDiscardDraft,
  };
};
