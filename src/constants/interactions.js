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
  { value: 'other', label: 'Other (specify below)' },
];

// Animal types for "Interacting with Other Animal" behavior
export const ANIMAL_TYPES = [
  { value: '', label: 'Select animal...' },
  { value: 'adult_aviary_occupant', label: 'Adult Aviary Occupant' },
  { value: 'juvenile_aviary_occupant', label: 'Juvenile Aviary Occupant' },
  { value: 'insect_within_aviary', label: 'Insect within Aviary' },
  {
    value: 'potential_prey_animal',
    label: 'Potential Prey Animal within Aviary',
  },
  {
    value: 'potential_prey_outside',
    label: 'Potential Prey Item Outside Aviary',
  },
  { value: 'same_species_outside', label: 'Same Species Outside Aviary' },
  {
    value: 'potential_predator_outside',
    label: 'Potential Predator Outside Aviary',
  },
  { value: 'other', label: 'Other (specify below)' },
];

// Interaction types for "Interacting with Other Animal" behavior
export const INTERACTION_TYPES = [
  { value: '', label: 'Select interaction...' },
  { value: 'watching', label: 'Watching' },
  { value: 'preening_grooming', label: 'Preening/Grooming' },
  { value: 'feeding', label: 'Feeding' },
  { value: 'playing', label: 'Playing' },
  { value: 'non_aggressive_biting', label: 'Non-Aggressive Biting' },
  {
    value: 'non_aggressive_foot_grabbing',
    label: 'Non-Aggressive Foot Grabbing',
  },
  { value: 'other', label: 'Other (specify below)' },
];
