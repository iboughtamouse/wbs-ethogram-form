/**
 * Validation error-key convention.
 *
 * Observation errors are keyed `${time}_${subjectId}_${field}` — one entry
 * per subject card per slot (Phase 2). Metadata errors use the bare field
 * name. Keys are only built and looked up, never parsed, so subject names
 * containing underscores are safe.
 */
export const observationErrorKey = (time, subjectId, field) =>
  `${time}_${subjectId}_${field}`;
