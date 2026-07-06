/**
 * Validation error-key convention.
 *
 * Observation errors are keyed `${time}_${cardId}_${field}` — one entry per
 * card per slot. Cards key by their slot-local cardId, not subjectId:
 * generic "Juvenile" cards (P2-D8) may duplicate a subjectId within a slot.
 * Metadata errors use the bare field name. Keys are only built and looked
 * up, never parsed.
 */
export const observationErrorKey = (time, cardId, field) =>
  `${time}_${cardId}_${field}`;

/**
 * Slot-level error (no card to attach to), e.g. a time slot with zero
 * recorded subjects — the backend rejects empty slots, so the client must
 * block them with a visible message first.
 */
export const slotErrorKey = (time) => `${time}__slot`;
