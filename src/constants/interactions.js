// Dropdown option lists. Convention: the empty "Select..." placeholder stays first and
// "Other (specify below)" stays last; everything between is sorted alphabetically by label
// (study feedback #4 — options were previously "in the order I thought of them").

// Inanimate objects for "Interacting with Inanimate Object" behavior
export const INANIMATE_OBJECTS = [
  { value: '', label: 'Select object...' },
  { value: 'camera', label: 'Camera' },
  { value: 'newspaper', label: 'Newspaper' },
  { value: 'perch', label: 'Perch' },
  { value: 'plant', label: 'Plant' },
  { value: 'plastic_ball', label: 'Plastic Ball' },
  { value: 'rope_ball', label: 'Rope Ball' },
  { value: 'rubber_duck', label: 'Rubber Duck' },
  { value: 'stump', label: 'Stump' },
  { value: 'wooden_blocks', label: 'Wooden Blocks' },
  { value: 'other', label: 'Other (specify below)' },
];

// Object interaction types for "Interacting with Inanimate Object" behavior
export const OBJECT_INTERACTION_TYPES = [
  { value: '', label: 'Select interaction...' },
  { value: 'biting', label: 'Biting/Chewing' },
  { value: 'carrying', label: 'Carrying' },
  { value: 'footing', label: 'Footing' },
  { value: 'pouncing', label: 'Pouncing' },
  { value: 'watching', label: 'Watching/Head Bobbing' },
  { value: 'other', label: 'Other (specify below)' },
];

// Animal types for "Interacting with Other Animal" behavior
export const ANIMAL_TYPES = [
  { value: '', label: 'Select animal...' },
  { value: 'adult_aviary_occupant', label: 'Adult Aviary Occupant' },
  { value: 'human', label: 'Human' },
  { value: 'insect_within_aviary', label: 'Insect within Aviary' },
  { value: 'juvenile_aviary_occupant', label: 'Juvenile Aviary Occupant' },
  {
    value: 'potential_predator_outside',
    label: 'Potential Predator Outside Aviary',
  },
  {
    value: 'potential_prey_animal',
    label: 'Potential Prey Animal within Aviary',
  },
  {
    value: 'potential_prey_outside',
    label: 'Potential Prey Item Outside Aviary',
  },
  { value: 'same_species_outside', label: 'Same Species Outside Aviary' },
  { value: 'other', label: 'Other (specify below)' },
];

// Animal interaction types for "Interacting with Other Animal" behavior
export const ANIMAL_INTERACTION_TYPES = [
  { value: '', label: 'Select interaction...' },
  { value: 'aggression_biting', label: 'Aggression: Biting' },
  { value: 'aggression_lunging', label: 'Aggression: Flying or Lunging At' },
  { value: 'aggression_footing', label: 'Aggression: Footing' },
  { value: 'aggression_other', label: 'Aggression: Other' },
  {
    value: 'defensive_posturing',
    label: 'Defensive Posturing or Beak Clacking',
  },
  { value: 'feeding', label: 'Feeding' },
  { value: 'non_aggressive_biting', label: 'Non-Aggressive Biting' },
  {
    value: 'non_aggressive_foot_grabbing',
    label: 'Non-Aggressive Foot Grabbing',
  },
  { value: 'playing', label: 'Playing' },
  { value: 'preening_grooming', label: 'Preening/Grooming' },
  { value: 'watching', label: 'Watching' },
];
