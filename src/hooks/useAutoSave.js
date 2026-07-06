/**
 * useAutoSave Hook
 *
 * Handles draft management and autosave functionality.
 * Loads drafts on mount, autosaves when data changes, provides restore/discard handlers.
 */

import { useState, useEffect, useRef } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import {
  saveDraft,
  loadDraft,
  clearDraft,
  hasDraft,
} from '../utils/localStorageUtils';
import { shouldAutosave, migrateDraft } from '../services/draftManager';

/**
 * Custom hook for managing form drafts and autosave
 *
 * @param {Object} metadata - Current form metadata
 * @param {Object} observations - Current observations
 * @param {Function} onRestore - Callback to restore draft (receives draft object)
 * @returns {Object} Draft state and handlers
 */
export const useAutoSave = (metadata, observations, onRestore) => {
  const config = useConfig();
  const [showDraftNotice, setShowDraftNotice] = useState(false);
  const [draftTimestamp, setDraftTimestamp] = useState(null);
  // Restore happens in two renders (metadata, then deferred observations);
  // the autosave in between would overwrite the stored draft with the
  // intermediate empty state — skip exactly that one save.
  const skipNextAutosaveRef = useRef(false);

  // Check for saved draft on mount. The same migration gate as restore:
  // a draft that can't be restored must not offer a Resume button.
  useEffect(() => {
    if (hasDraft()) {
      const draft = migrateDraft(loadDraft(), config);
      if (draft) {
        setShowDraftNotice(true);
        setDraftTimestamp(draft.savedAt);
      }
    }
    // Mount-only by design; config is the mount-frozen bundle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave to localStorage when metadata or observations change
  useEffect(() => {
    if (skipNextAutosaveRef.current) {
      skipNextAutosaveRef.current = false;
      return;
    }
    if (shouldAutosave(metadata, observations)) {
      saveDraft(metadata, observations);
    }
  }, [metadata, observations]);

  const handleRestoreDraft = () => {
    // Older drafts migrate to the current shape on restore (never in place —
    // the stored copy stays untouched until the next autosave overwrites it)
    const draft = migrateDraft(loadDraft(), config);
    if (draft && onRestore) {
      skipNextAutosaveRef.current = true;
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
