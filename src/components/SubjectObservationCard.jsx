import PropTypes from 'prop-types';
import { useRef } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import {
  withCurrentValue,
  withCurrentGroupedValue,
} from '../utils/selectOptions';
import { debounce } from '../utils/debounce';
import {
  AnimalSelect,
  BehaviorSelect,
  DescriptionField,
  InteractionTypeSelect,
  LocationInput,
  NotesField,
  ObjectSelect,
} from './form';

/**
 * One subject's observation card within a time slot (P2-D2). The field set
 * is the classic single-observation form; the card adds subject identity to
 * every change/validate callback.
 */
const SubjectObservationCard = ({
  time,
  observation,
  isPresent,
  canRemove,
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
  onRemove,
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

  // Create debounced validator for text fields (200ms delay).
  // MUST be called before any conditional returns (Rules of Hooks).
  // The debounce wrapper is created once, but it must call the LATEST
  // onValidate — a mount-time closure would validate against a stale
  // observations snapshot (e.g. behavior still '') and suppress errors.
  const onValidateRef = useRef(onValidate);
  onValidateRef.current = onValidate;
  const debouncedValidateRef = useRef(
    debounce((slotTime, subjectId, field, value) => {
      onValidateRef.current(slotTime, subjectId, field, value);
    }, 200)
  );

  // Guard against undefined observation during React render cycles
  if (!observation) {
    return null;
  }

  const { subjectId } = observation;

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
    onChange(time, subjectId, 'behavior', value);
    onValidate(time, subjectId, 'behavior', value);
  };

  const handleLocationChange = (selectedOption) => {
    const newValue = selectedOption ? selectedOption.value : '';
    onChange(time, subjectId, 'location', newValue);
    onValidate(time, subjectId, 'location', newValue);
  };

  const handleObjectChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'object', newValue);
    onValidate(time, subjectId, 'object', newValue);
  };

  const handleAnimalChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'animal', newValue);
    onValidate(time, subjectId, 'animal', newValue);
  };

  const handleObjectInteractionTypeChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'objectInteractionType', newValue);
    onValidate(time, subjectId, 'objectInteractionType', newValue);
  };

  const handleAnimalInteractionTypeChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'animalInteractionType', newValue);
    onValidate(time, subjectId, 'animalInteractionType', newValue);
  };

  // Text field handlers - validate with debounce on change
  const handleObjectOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'objectOther', newValue);
    debouncedValidateRef.current(time, subjectId, 'objectOther', newValue);
  };

  const handleAnimalOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'animalOther', newValue);
    debouncedValidateRef.current(time, subjectId, 'animalOther', newValue);
  };

  const handleObjectInteractionTypeOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'objectInteractionTypeOther', newValue);
    debouncedValidateRef.current(
      time,
      subjectId,
      'objectInteractionTypeOther',
      newValue
    );
  };

  const handleAnimalInteractionTypeOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'animalInteractionTypeOther', newValue);
    debouncedValidateRef.current(
      time,
      subjectId,
      'animalInteractionTypeOther',
      newValue
    );
  };

  const handleDescriptionChange = (e) => {
    const newValue = e.target.value;
    onChange(time, subjectId, 'description', newValue);
    debouncedValidateRef.current(time, subjectId, 'description', newValue);
  };

  // Prevent Enter key from submitting form, but trigger validation
  const handleKeyDown = (field) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Trigger validation with current value
      onValidate(time, subjectId, field, e.target.value);
    }
  };

  // Keep-listed rule for the location select too: a draft-held perch that was
  // retired since the draft was saved stays selectable/visible
  const locationOptions = withCurrentGroupedValue(
    perchOptions,
    observation.location
  );

  // Find the currently selected option for React Select
  const selectedLocationOption = locationOptions
    .flatMap((group) => group.options)
    .find((option) => option.value === observation.location);

  return (
    <div className="subject-card" data-subject={subjectId}>
      <div className="subject-card-header">
        <span className="subject-card-name">{subjectId}</span>
        {!isPresent && (
          <span
            className="subject-card-flag"
            title="This subject has no residency episode covering the selected date. The data is kept — double-check the date or the subject."
          >
            not listed for this date
          </span>
        )}
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(time, subjectId)}
            className="subject-remove-button"
            title={`Remove ${subjectId}'s observation from this time slot`}
          >
            Remove
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
          perchOptions={locationOptions}
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
        onChange={(e) => onChange(time, subjectId, 'notes', e.target.value)}
        onKeyDown={handleKeyDown('notes')}
      />
    </div>
  );
};

SubjectObservationCard.propTypes = {
  time: PropTypes.string.isRequired,
  observation: PropTypes.shape({
    subjectType: PropTypes.string.isRequired,
    subjectId: PropTypes.string.isRequired,
    behavior: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    notes: PropTypes.string.isRequired,
    object: PropTypes.string.isRequired,
    objectOther: PropTypes.string.isRequired,
    // Interaction-type fields are optional: drafts autosaved before the
    // interaction-field split won't contain them.
    objectInteractionType: PropTypes.string,
    objectInteractionTypeOther: PropTypes.string,
    animal: PropTypes.string.isRequired,
    animalOther: PropTypes.string.isRequired,
    animalInteractionType: PropTypes.string,
    animalInteractionTypeOther: PropTypes.string,
    description: PropTypes.string.isRequired,
  }).isRequired,
  isPresent: PropTypes.bool.isRequired,
  canRemove: PropTypes.bool.isRequired,
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
  onRemove: PropTypes.func.isRequired,
};

export default SubjectObservationCard;
