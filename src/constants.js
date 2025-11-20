// Behavior definitions from the ethogram
export const BEHAVIORS = [
  { value: '', label: 'Select a behavior...', requiresLocation: false },
  { value: 'eating_food_platform', label: 'Eating - On Food Platform', requiresLocation: false },
  { value: 'eating_elsewhere', label: 'Eating - Elsewhere', requiresLocation: true },
  { value: 'walking_ground', label: 'Locomotion - Walking on Ground', requiresLocation: false },
  { value: 'walking_perch', label: 'Locomotion - Walking on Perch', requiresLocation: true },
  { value: 'flying', label: 'Locomotion - Flying', requiresLocation: false },
  { value: 'jumping', label: 'Locomotion - Jumping', requiresLocation: false },
  { value: 'repetitive_locomotion', label: 'Repetitive Locomotion (Same movement 3+ times)', requiresLocation: false },
  { value: 'drinking', label: 'Drinking', requiresLocation: false },
  { value: 'bathing', label: 'Bathing', requiresLocation: false },
  { value: 'preening', label: 'Preening/Grooming', requiresLocation: true },
  { value: 'repetitive_preening', label: 'Repetitive Preening/Feather Damage', requiresLocation: false },
  { value: 'nesting', label: 'Nesting', requiresLocation: false },
  { value: 'vocalizing', label: 'Vocalizing', requiresLocation: false },
  { value: 'resting_alert', label: 'Resting on Perch/Ground - Alert', requiresLocation: true },
  { value: 'resting_not_alert', label: 'Resting on Perch/Ground - Not Alert', requiresLocation: true },
  { value: 'resting_unknown', label: 'Resting on Perch/Ground - Status Unknown', requiresLocation: true },
  { value: 'interacting_object', label: 'Interacting with Inanimate Object', requiresLocation: false },
  { value: 'interacting_animal', label: 'Interacting with Other Animal', requiresLocation: false },
  { value: 'aggression', label: 'Aggression or Defensive Posturing', requiresLocation: false },
  { value: 'not_visible', label: 'Not Visible', requiresLocation: false },
  { value: 'other', label: 'Other', requiresLocation: false }
];

// Valid perch numbers from the diagrams
export const VALID_PERCHES = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
  11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  'BB1', 'BB2', 'F1', 'F2', 'G', 'W'
];

// Generate time slots for one hour (0:00 to 0:55)
export const TIME_SLOTS = Array.from({ length: 12 }, (_, i) => {
  const minutes = i * 5;
  return `0:${minutes.toString().padStart(2, '0')}`;
});
