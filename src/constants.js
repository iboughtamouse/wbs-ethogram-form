// Behavior definitions from the ethogram
export const BEHAVIORS = [
  { value: '', label: 'Select a behavior...', requiresLocation: false },
  { value: 'eating_food_platform', label: 'Eating - On Food Platform', requiresLocation: false },
  { value: 'eating_elsewhere', label: 'Eating - Elsewhere', requiresLocation: true },
  { value: 'walking_ground', label: 'Locomotion - Walking on Ground', requiresLocation: false },
  { value: 'walking_perch', label: 'Locomotion - Walking on Perch', requiresLocation: true },
  { value: 'flying', label: 'Locomotion - Flying', requiresLocation: false },
  { value: 'jumping', label: 'Locomotion - Jumping', requiresLocation: true },
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
  { value: 'interacting_object', label: 'Interacting with Inanimate Object', requiresLocation: false, requiresObject: true },
  { value: 'interacting_animal', label: 'Interacting with Other Animal', requiresLocation: false, requiresAnimal: true, requiresInteraction: true },
  { value: 'aggression', label: 'Aggression or Defensive Posturing', requiresLocation: false, requiresDescription: true },
  { value: 'not_visible', label: 'Not Visible', requiresLocation: false },
  { value: 'other', label: 'Other', requiresLocation: false, requiresDescription: true }
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

// Inanimate objects for "Interacting with Inanimate Object" behavior
export const INANIMATE_OBJECTS = [
  { value: '', label: 'Select object...' },
  { value: 'newspaper', label: 'Newspaper' },
  { value: 'rope_ball', label: 'Rope Ball' },
  { value: 'plastic_ball', label: 'Plastic Ball' },
  { value: 'rubber_duck', label: 'Rubber Duck' },
  { value: 'wooden_blocks', label: 'Wooden Blocks' },
  { value: 'camera', label: 'Camera' },
  { value: 'plant', label: 'Plant' },
  { value: 'stump', label: 'Stump' },
  { value: 'perch', label: 'Perch' },
  { value: 'other', label: 'Other (specify below)' }
];

// Animal types for "Interacting with Other Animal" behavior
export const ANIMAL_TYPES = [
  { value: '', label: 'Select animal...' },
  { value: 'adult_aviary_occupant', label: 'Adult Aviary Occupant' },
  { value: 'juvenile_aviary_occupant', label: 'Juvenile Aviary Occupant' },
  { value: 'insect_within_aviary', label: 'Insect within Aviary' },
  { value: 'potential_prey_animal', label: 'Potential Prey Animal within Aviary' },
  { value: 'potential_prey_outside', label: 'Potential Prey Item Outside Aviary' },
  { value: 'same_species_outside', label: 'Same Species Outside Aviary' },
  { value: 'potential_predator_outside', label: 'Potential Predator Outside Aviary' },
  { value: 'other', label: 'Other (specify below)' }
];

// Interaction types for "Interacting with Other Animal" behavior
export const INTERACTION_TYPES = [
  { value: '', label: 'Select interaction...' },
  { value: 'watching', label: 'Watching' },
  { value: 'preening_grooming', label: 'Preening/Grooming' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'playing', label: 'Playing' },
  { value: 'non_aggressive_biting', label: 'Non-Aggressive Biting' },
  { value: 'non_aggressive_foot_grabbing', label: 'Non-Aggressive Foot Grabbing' },
  { value: 'other', label: 'Other (specify below)' }
];
