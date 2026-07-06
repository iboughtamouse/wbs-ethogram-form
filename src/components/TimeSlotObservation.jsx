import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { withCurrentValue } from '../utils/selectOptions';
import { debounce } from '../utils/debounce';
import { formatTo12Hour } from '../utils/timeUtils';
import {
  AnimalSelect,
  BehaviorSelect,
  DescriptionField,
  InteractionTypeSelect,
  LocationInput,
  NotesField,
  ObjectSelect,
} from './form';

const TimeSlotObservation = ({
  time,
  observation,
  behaviorError,
  locationError,
  objectError,
  objectOtherError,
  objectInteractionTypeError,
  objectInteractionTypeOtherError,
  animalError,
  animalOtherError,
  animalInteractionTypeError,
  animalInteractionTypeOtherError,
  descriptionError,
  onChange,
  onValidate,
  onCopyToNext,
  isLastSlot,
}) => {
  const {
    ANIMAL_INTERACTION_TYPES,
    OBJECT_INTERACTION_TYPES,
    lookupVocabLabel,
    perchOptions,
    requiresAnimal,
    requiresAnimalInteraction,
    requiresDescription,
    requiresLocation,
    requiresObject,
    requiresObjectInteraction,
  } = useConfig();

  // Create debounced validator for text fields (200ms delay)
  // MUST be called before any conditional returns (Rules of Hooks)
  const debouncedValidateRef = useRef(
    debounce((time, field, value) => {
      onValidate(time, field, value);
    }, 200)
  );

  // Guard against undefined observation during React render cycles
  if (!observation) {
    return null;
  }

  // Use helper functions to check behavior requirements
  const showLocation = requiresLocation(observation.behavior);
  const showObject = requiresObject(observation.behavior);
  const showAnimal = requiresAnimal(observation.behavior);
  const showObjectInteraction = requiresObjectInteraction(observation.behavior);
  const showAnimalInteraction = requiresAnimalInteraction(observation.behavior);
  const showDescription = requiresDescription(observation.behavior);

  // Keep-listed rule: interaction options come from config; a draft-held
  // value no longer in the menu is injected as a disabled entry
  const objectInteractionOptions = withCurrentValue(
    OBJECT_INTERACTION_TYPES,
    observation.objectInteractionType,
    (v) => lookupVocabLabel('object_interaction', v)
  );
  const animalInteractionOptions = withCurrentValue(
    ANIMAL_INTERACTION_TYPES,
    observation.animalInteractionType,
    (v) => lookupVocabLabel('animal_interaction', v)
  );

  // Select/dropdown handlers - validate immediately on change
  const handleBehaviorChange = (value) => {
    onChange(time, 'behavior', value);
    onValidate(time, 'behavior', value);
  };

  const handleLocationChange = (selectedOption) => {
    const newValue = selectedOption ? selectedOption.value : '';
    onChange(time, 'location', newValue);
    onValidate(time, 'location', newValue);
  };

  const handleObjectChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'object', newValue);
    onValidate(time, 'object', newValue);
  };

  const handleAnimalChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'animal', newValue);
    onValidate(time, 'animal', newValue);
  };

  const handleObjectInteractionTypeChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'objectInteractionType', newValue);
    onValidate(time, 'objectInteractionType', newValue);
  };

  const handleAnimalInteractionTypeChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'animalInteractionType', newValue);
    onValidate(time, 'animalInteractionType', newValue);
  };

  // Text field handlers - validate with debounce on change
  const handleObjectOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'objectOther', newValue);
    debouncedValidateRef.current(time, 'objectOther', newValue);
  };

  const handleAnimalOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'animalOther', newValue);
    debouncedValidateRef.current(time, 'animalOther', newValue);
  };

  const handleObjectInteractionTypeOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'objectInteractionTypeOther', newValue);
    debouncedValidateRef.current(time, 'objectInteractionTypeOther', newValue);
  };

  const handleAnimalInteractionTypeOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'animalInteractionTypeOther', newValue);
    debouncedValidateRef.current(time, 'animalInteractionTypeOther', newValue);
  };

  const handleDescriptionChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'description', newValue);
    debouncedValidateRef.current(time, 'description', newValue);
  };

  // Prevent Enter key from submitting form, but trigger validation
  const handleKeyDown = (field) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger validation with current value
      onValidate(time, field, e.target.value);
    }
  };

  // Find the currently selected option for React Select
  const selectedLocationOption = perchOptions
    .flatMap((group) => group.options)
    .find((option) => option.value === observation.location);

  // Convert 24-hour time to 12-hour format for display
  const displayTime = formatTo12Hour(time);

  return (
    <div className="time-slot" data-time={time}>
      <div className="time-slot-header">
        <span className="time-slot-time">{displayTime}</span>
        {!isLastSlot && (
          <button
            type="button"
            onClick={() => onCopyToNext(time)}
            className="copy-to-next-button"
            title="Copy this observation to the next time slot"
          >
            Copy to next
          </button>
        )}
      </div>

      <BehaviorSelect
        value={observation.behavior}
        onChange={handleBehaviorChange}
        error={behaviorError}
      />

      {showLocation && (
        <LocationInput
          value={observation.location}
          onChange={handleLocationChange}
          error={locationError}
          behaviorValue={observation.behavior}
          perchOptions={perchOptions}
          selectedLocationOption={selectedLocationOption}
        />
      )}

      {showObject && (
        <ObjectSelect
          value={observation.object}
          otherValue={observation.objectOther}
          onChange={handleObjectChange}
          onOtherChange={handleObjectOtherChange}
          onKeyDown={handleKeyDown('objectOther')}
          error={objectError}
          otherError={objectOtherError}
        />
      )}

      {showAnimal && (
        <AnimalSelect
          value={observation.animal}
          otherValue={observation.animalOther}
          onChange={handleAnimalChange}
          onOtherChange={handleAnimalOtherChange}
          onKeyDown={handleKeyDown('animalOther')}
          error={animalError}
          otherError={animalOtherError}
        />
      )}

      {showObjectInteraction && (
        <InteractionTypeSelect
          label="Object Interaction Type"
          options={objectInteractionOptions}
          value={observation.objectInteractionType}
          otherValue={observation.objectInteractionTypeOther}
          onChange={handleObjectInteractionTypeChange}
          onOtherChange={handleObjectInteractionTypeOtherChange}
          onKeyDown={handleKeyDown('objectInteractionTypeOther')}
          error={objectInteractionTypeError}
          otherError={objectInteractionTypeOtherError}
        />
      )}

      {showAnimalInteraction && (
        <InteractionTypeSelect
          label="Animal Interaction Type"
          options={animalInteractionOptions}
          value={observation.animalInteractionType}
          otherValue={observation.animalInteractionTypeOther}
          onChange={handleAnimalInteractionTypeChange}
          onOtherChange={handleAnimalInteractionTypeOtherChange}
          onKeyDown={handleKeyDown('animalInteractionTypeOther')}
          error={animalInteractionTypeError}
          otherError={animalInteractionTypeOtherError}
        />
      )}

      {showDescription && (
        <DescriptionField
          value={observation.description}
          onChange={handleDescriptionChange}
          onKeyDown={handleKeyDown('description')}
          error={descriptionError}
        />
      )}

      <NotesField
        value={observation.notes}
        onChange={(e) => onChange(time, 'notes', e.target.value)}
        onKeyDown={handleKeyDown('notes')}
      />
    </div>
  );
};

TimeSlotObservation.propTypes = {
  time: PropTypes.string.isRequired,
  observation: PropTypes.shape({
    behavior: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
    object: PropTypes.string.isRequired,
    objectOther: PropTypes.string.isRequired,
    // Interaction-type fields are optional: drafts autosaved before the
    // interaction-field split won't contain them (see constants/interactions.js).
    objectInteractionType: PropTypes.string,
    objectInteractionTypeOther: PropTypes.string,
    animal: PropTypes.string.isRequired,
    animalOther: PropTypes.string.isRequired,
    animalInteractionType: PropTypes.string,
    animalInteractionTypeOther: PropTypes.string,
    description: PropTypes.string.isRequired,
  }).isRequired,
  behaviorError: PropTypes.string,
  locationError: PropTypes.string,
  objectError: PropTypes.string,
  objectOtherError: PropTypes.string,
  objectInteractionTypeError: PropTypes.string,
  objectInteractionTypeOtherError: PropTypes.string,
  animalError: PropTypes.string,
  animalOtherError: PropTypes.string,
  animalInteractionTypeError: PropTypes.string,
  animalInteractionTypeOtherError: PropTypes.string,
  descriptionError: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  onCopyToNext: PropTypes.func.isRequired,
  isLastSlot: PropTypes.bool.isRequired,
};

export default TimeSlotObservation;
