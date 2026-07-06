/**
 * Keep-listed rule (Phase 1 design §4): a select's current value must stay
 * renderable even when it is no longer in the config-derived menu (retired,
 * or dropped from the aviary's enablement, between sessions). Otherwise a
 * controlled <select> would render blank and silently drop the observer's
 * saved selection.
 */

/**
 * Return options with the current value injected as a disabled "(retired)"
 * entry when it is missing from the list.
 * @param {Array<{value: string, label: string}>} options
 * @param {string} value - The select's current value
 * @param {(value: string) => string|undefined} [lookupLabel] - Label resolver
 *   for out-of-menu values (falls back to the raw value)
 */
export const withCurrentValue = (options, value, lookupLabel) => {
  if (!value || options.some((o) => o.value === value)) {
    return options;
  }

  const label = (lookupLabel && lookupLabel(value)) || value;
  return [...options, { value, label: `${label} (retired)`, disabled: true }];
};
