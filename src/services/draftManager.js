/**
 * Draft Management Service
 *
 * Handles logic for determining when to autosave form drafts and for
 * migrating older draft shapes on restore.
 * Works with localStorageUtils for actual storage operations.
 */

import { DRAFT_SHAPE_VERSION } from '../constants/ui';
import { ensureCardIds } from './formStateManager';

/**
 * Determines if the form has enough data to warrant autosaving
 *
 * Autosaves when:
 * - Observer name is filled
 * - Start or end time is filled
 * - Any observation card has behavior, location, or notes
 *
 * @param {Object} metadata - Form metadata
 * @param {Object} observations - Observations keyed by time, arrays of cards
 * @returns {boolean} True if form should be autosaved
 */
export const shouldAutosave = (metadata, observations) => {
  // Check if metadata has user-entered data
  const hasMetadataData =
    !!metadata.observerName || !!metadata.startTime || !!metadata.endTime;

  // Check if any observation card has data
  const hasObservationData = Object.values(observations).some((slot) =>
    slot.some((obs) => obs.behavior || obs.location || obs.notes)
  );

  return hasMetadataData || hasObservationData;
};

/** The metadata fields every restorable draft must carry as strings. */
const REQUIRED_METADATA_FIELDS = [
  'observerName',
  'date',
  'startTime',
  'endTime',
];

const hasUsableShape = (draft) => {
  if (!draft || typeof draft !== 'object') return false;
  const { metadata, observations } = draft;
  if (!metadata || typeof metadata !== 'object') return false;
  if (!observations || typeof observations !== 'object') return false;
  if (Array.isArray(observations)) return false;
  return REQUIRED_METADATA_FIELDS.every(
    (field) => typeof metadata[field] === 'string'
  );
};

/**
 * Migrate a loaded draft to the current shape, or return null for anything
 * unusable (corrupt JSON shapes, unknown FUTURE shape versions) — a null is
 * treated as "no draft", which beats crashing the restore path.
 *
 * Pre-Phase-2 drafts (no shapeVersion) hold flat per-slot observations,
 * metadata.patient, and the aviary display name; they migrate to single-card
 * arrays attributed to the draft's own patient (the faithful record of who
 * was being observed — the config foster parent is only a fallback), and
 * the aviary maps to its slug.
 *
 * @param {Object|null} draft - Parsed draft from localStorage
 * @param {Object} config - The useConfig() bundle (fosterParentName,
 *   aviaryOptions, aviarySlug)
 * @returns {Object|null} A current-shape draft, or null
 */
export const migrateDraft = (draft, config) => {
  if (!hasUsableShape(draft)) return null;

  if (draft.shapeVersion >= DRAFT_SHAPE_VERSION) {
    // A shape newer than this build understands is not restorable
    if (draft.shapeVersion > DRAFT_SHAPE_VERSION) return null;
    // Current shape: every slot must already be an array of card objects
    // (a null/primitive entry would crash normalization and every consumer).
    // Cards saved before cardIds existed are normalized here (P2-D8).
    const slotsUsable = Object.values(draft.observations).every(
      (slot) =>
        Array.isArray(slot) &&
        slot.every((card) => card && typeof card === 'object')
    );
    return slotsUsable
      ? { ...draft, observations: ensureCardIds(draft.observations) }
      : null;
  }

  const { patient, ...metadata } = draft.metadata;
  // 'Unknown' is the last-resort subject label the whole system uses; the
  // backend requires a non-empty subjectId
  const subjectId = patient || config.fosterParentName || 'Unknown';

  const observations = {};
  for (const [time, obs] of Object.entries(draft.observations)) {
    if (Array.isArray(obs)) {
      observations[time] = obs;
    } else if (obs && typeof obs === 'object') {
      observations[time] = [
        { ...obs, subjectType: 'foster_parent', subjectId },
      ];
    } else {
      // A slot that is neither a card array nor a flat observation is a
      // corrupt draft — refuse it whole rather than restore partial data
      return null;
    }
  }

  // v1 drafts stored the aviary display name; map it to the slug, falling
  // back to the active aviary for names the config no longer lists
  const bySlug = (config.aviaryOptions ?? []).find(
    (a) => a.name === metadata.aviary || a.slug === metadata.aviary
  );
  metadata.aviary = bySlug?.slug ?? config.aviarySlug;

  return {
    ...draft,
    shapeVersion: DRAFT_SHAPE_VERSION,
    metadata,
    observations: ensureCardIds(observations),
  };
};
