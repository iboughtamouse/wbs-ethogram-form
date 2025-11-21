// Behavior definitions from the ethogram
export const BEHAVIORS = [
  { value: '', label: 'Select a behavior...', requiresLocation: false },
  {
    value: 'eating_food_platform',
    label: 'Eating - On Food Platform',
    requiresLocation: false,
  },
  {
    value: 'eating_elsewhere',
    label: 'Eating - Elsewhere',
    requiresLocation: true,
  },
  {
    value: 'walking_ground',
    label: 'Locomotion - Walking on Ground',
    requiresLocation: false,
  },
  {
    value: 'walking_perch',
    label: 'Locomotion - Walking on Perch',
    requiresLocation: true,
  },
  { value: 'flying', label: 'Locomotion - Flying', requiresLocation: false },
  { value: 'jumping', label: 'Locomotion - Jumping', requiresLocation: true },
  {
    value: 'repetitive_locomotion',
    label: 'Repetitive Locomotion (Same movement 3+ times)',
    requiresLocation: false,
  },
  { value: 'drinking', label: 'Drinking', requiresLocation: false },
  { value: 'bathing', label: 'Bathing', requiresLocation: false },
  { value: 'preening', label: 'Preening/Grooming', requiresLocation: true },
  {
    value: 'repetitive_preening',
    label: 'Repetitive Preening/Feather Damage',
    requiresLocation: false,
  },
  { value: 'nesting', label: 'Nesting', requiresLocation: false },
  { value: 'vocalizing', label: 'Vocalizing', requiresLocation: false },
  {
    value: 'resting_alert',
    label: 'Resting on Perch/Ground - Alert',
    requiresLocation: true,
  },
  {
    value: 'resting_not_alert',
    label: 'Resting on Perch/Ground - Not Alert',
    requiresLocation: true,
  },
  {
    value: 'resting_unknown',
    label: 'Resting on Perch/Ground - Status Unknown',
    requiresLocation: true,
  },
  {
    value: 'interacting_object',
    label: 'Interacting with Inanimate Object',
    requiresLocation: false,
    requiresObject: true,
  },
  {
    value: 'interacting_animal',
    label: 'Interacting with Other Animal',
    requiresLocation: false,
    requiresAnimal: true,
    requiresInteraction: true,
  },
  {
    value: 'aggression',
    label: 'Aggression or Defensive Posturing',
    requiresLocation: false,
    requiresDescription: true,
  },
  { value: 'not_visible', label: 'Not Visible', requiresLocation: false },
  {
    value: 'other',
    label: 'Other',
    requiresLocation: false,
    requiresDescription: true,
  },
];

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
 * Check if a behavior requires interaction type
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresInteraction = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresInteraction || false;
};

/**
 * Check if a behavior requires description
 * @param {string} behaviorValue - The behavior value
 * @returns {boolean}
 */
export const requiresDescription = (behaviorValue) => {
  return getBehaviorByValue(behaviorValue)?.requiresDescription || false;
};
