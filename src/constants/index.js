// Barrel export for constants
// Makes imports cleaner: import { BEHAVIORS, VALID_PERCHES } from './constants'

export {
  BEHAVIORS,
  getBehaviorByValue,
  requiresLocation,
  requiresObject,
  requiresAnimal,
  requiresInteraction,
  requiresDescription,
} from './behaviors';
export { VALID_PERCHES, TIME_SLOTS } from './locations';
export {
  INANIMATE_OBJECTS,
  ANIMAL_TYPES,
  INTERACTION_TYPES,
} from './interactions';
