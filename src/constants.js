// Barrel export for all constants
// This file re-exports everything from the constants/ directory for backward compatibility

export {
  BEHAVIORS,
  getBehaviorByValue,
  requiresLocation,
  requiresObject,
  requiresAnimal,
  requiresInteraction,
  requiresDescription,
} from './constants/behaviors';
export { VALID_PERCHES, TIME_SLOTS } from './constants/locations';
export {
  INANIMATE_OBJECTS,
  ANIMAL_TYPES,
  INTERACTION_TYPES,
} from './constants/interactions';
