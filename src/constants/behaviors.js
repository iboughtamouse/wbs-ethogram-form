// Behavior definitions from the ethogram.
// Each behavior carries a `group` (its ethogram category) used to render the dropdown as
// grouped <optgroup>s, alphabetized within each group (study feedback #4). Only the flags a
// behavior needs are set; the rest are treated as false by the requires* helpers below.
export const BEHAVIORS = [
  { value: '', label: 'Select a behavior...', requiresLocation: false },
  {
    value: 'eating',
    label: 'Eating',
    group: 'Feeding',
    requiresLocation: true,
  },
  {
    value: 'walking',
    label: 'Locomotion - Walking',
    group: 'Locomotion',
    requiresLocation: true,
  },
  {
    value: 'flying',
    label: 'Locomotion - Flying',
    group: 'Locomotion',
    requiresLocation: false,
  },
  {
    value: 'jumping',
    label: 'Locomotion - Jumping',
    group: 'Locomotion',
    requiresLocation: true,
  },
  {
    value: 'repetitive_locomotion',
    label: 'Repetitive Locomotion (Same movement 3+ times)',
    group: 'Locomotion',
    requiresLocation: true,
  },
  {
    value: 'drinking',
    label: 'Drinking',
    group: 'Maintenance',
    requiresLocation: false,
  },
  {
    value: 'bathing',
    label: 'Bathing',
    group: 'Maintenance',
    requiresLocation: false,
  },
  {
    value: 'preening',
    label: 'Preening/Grooming',
    group: 'Maintenance',
    requiresLocation: true,
  },
  {
    value: 'repetitive_preening',
    label: 'Repetitive Preening/Feather Damage',
    group: 'Maintenance',
    requiresLocation: true,
  },
  {
    value: 'nesting',
    label: 'Nesting',
    group: 'Other',
    requiresLocation: false,
  },
  {
    value: 'vocalizing',
    label: 'Vocalizing',
    group: 'Social & Environmental',
    requiresLocation: true,
  },
  {
    value: 'resting_alert',
    label: 'Resting on Perch/Ground - Alert',
    group: 'Resting',
    requiresLocation: true,
  },
  {
    value: 'resting_not_alert',
    label: 'Resting on Perch/Ground - Not Alert',
    group: 'Resting',
    requiresLocation: true,
  },
  {
    value: 'resting_unknown',
    label: 'Resting on Perch/Ground - Status Unknown',
    group: 'Resting',
    requiresLocation: true,
  },
  {
    value: 'interacting_object',
    label: 'Interacting with Inanimate Object',
    group: 'Social & Environmental',
    requiresLocation: true,
    requiresObject: true,
    requiresObjectInteraction: true,
  },
  {
    value: 'interacting_animal',
    label: 'Interacting with Other Animal',
    group: 'Social & Environmental',
    requiresLocation: true,
    requiresAnimal: true,
    requiresAnimalInteraction: true,
  },
  {
    value: 'not_visible',
    label: 'Not Visible',
    group: 'Other',
    requiresLocation: false,
  },
  {
    value: 'other',
    label: 'Other',
    group: 'Other',
    requiresLocation: false,
    requiresDescription: true,
  },
];

// Order in which behavior groups appear in the dropdown.
export const BEHAVIOR_GROUP_ORDER = [
  'Feeding',
  'Locomotion',
  'Resting',
  'Maintenance',
  'Social & Environmental',
  'Other',
];

/**
 * Groups behaviors for the dropdown: returns [{ group, options }] in BEHAVIOR_GROUP_ORDER,
 * with each group's options sorted alphabetically by label. Excludes the empty placeholder
 * (the select renders that separately as the first option).
 * @returns {{ group: string, options: Array<{value: string, label: string}> }[]}
 */
export const getGroupedBehaviors = () =>
  BEHAVIOR_GROUP_ORDER.map((group) => ({
    group,
    options: BEHAVIORS.filter((b) => b.group === group).sort((a, b) =>
      a.label.localeCompare(b.label)
    ),
  })).filter((g) => g.options.length > 0);

/**
 * Get behavior definition by value
 * @param {string} value - The behavior value
 * @returns {Object|undefined} - The behavior definition or undefined
 */
export const getBehaviorByValue = (value) => {
  return BEHAVIORS.find((b) => b.value === value);
};

/**
 * Check if a behavior requires location
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresLocation = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresLocation || false;
};

/**
 * Check if a behavior requires object selection
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresObject = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresObject || false;
};

/**
 * Check if a behavior requires animal selection
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresAnimal = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresAnimal || false;
};

/**
 * Check if a behavior requires object interaction type
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresObjectInteraction = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresObjectInteraction || false;
};

/**
 * Check if a behavior requires animal interaction type
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresAnimalInteraction = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresAnimalInteraction || false;
};

/**
 * Check if a behavior requires description
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresDescription = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresDescription || false;
};
