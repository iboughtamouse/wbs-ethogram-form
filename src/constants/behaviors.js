// Behavior definitions from the ethogram
export const BEHAVIORS = [
  { value: '', label: 'Select a behavior...', requiresLocation: false },
  {
    value: 'eating',
    label: 'Eating',
    requiresLocation: true,
  },
  { value: 'walking', label: 'Locomotion - Walking', requiresLocation: true },
  { value: 'flying', label: 'Locomotion - Flying', requiresLocation: false },
  { value: 'jumping', label: 'Locomotion - Jumping', requiresLocation: true },
  {
    value: 'repetitive_locomotion',
    label: 'Repetitive Locomotion (Same movement 3+ times)',
    requiresLocation: true,
  },
  { value: 'drinking', label: 'Drinking', requiresLocation: false },
  { value: 'bathing', label: 'Bathing', requiresLocation: false },
  { value: 'preening', label: 'Preening/Grooming', requiresLocation: true },
  {
    value: 'repetitive_preening',
    label: 'Repetitive Preening/Feather Damage',
    requiresLocation: true,
  },
  { value: 'nesting', label: 'Nesting', requiresLocation: false },
  { value: 'vocalizing', label: 'Vocalizing', requiresLocation: true },
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
    requiresLocation: true,
    requiresObject: true,
    requiresObjectInteraction: true,
  },
  {
    value: 'interacting_animal',
    label: 'Interacting with Other Animal',
    requiresLocation: true,
    requiresAnimal: true,
    requiresAnimalInteraction: true,
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
