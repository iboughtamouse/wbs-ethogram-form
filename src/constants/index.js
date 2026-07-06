// Barrel export for constants
// Makes imports cleaner: import { BEHAVIORS, VALID_PERCHES } from './constants'

export {
  BEHAVIORS,
  BEHAVIOR_GROUP_ORDER,
  getGroupedBehaviors,
  getBehaviorByValue,
  requiresLocation,
  requiresObject,
  requiresAnimal,
  requiresObjectInteraction,
  requiresAnimalInteraction,
  requiresDescription,
} from './behaviors';
export { VALID_PERCHES, TIME_SLOTS } from './locations';
export {
  INANIMATE_OBJECTS,
  OBJECT_INTERACTION_TYPES,
  ANIMAL_TYPES,
  ANIMAL_INTERACTION_TYPES,
} from './interactions';
