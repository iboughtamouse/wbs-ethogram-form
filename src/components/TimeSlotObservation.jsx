import { useRef } from 'react';
import PropTypes from 'prop-types';
import {
  requiresLocation,
  requiresObject,
  requiresAnimal,
  requiresInteraction,
  requiresDescription,
} from '../constants';
import { formatTo12Hour } from '../utils/timeUtils';
import { debounce } from '../utils/debounce';
import {
  NotesField,
  DescriptionField,
  BehaviorSelect,
  LocationInput,
  ObjectSelect,
  AnimalSelect,
  InteractionTypeSelect,
} from './form';

const TimeSlotObservation = ({
  time,
  observation,
  behaviorError,
  locationError,
  objectError,
  objectOtherError,
  animalError,
  animalOtherError,
  interactionTypeError,
  interactionTypeOtherError,
  descriptionError,
  onChange,
  onValidate,
  onCopyToNext,
  isLastSlot,
}) => {
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
  const showInteraction = requiresInteraction(observation.behavior);
  const showDescription = requiresDescription(observation.behavior);

  // Format perch options for React Select
  const perchOptions = [
    {
      label: 'Common Locations',
      options: [{ value: 'Ground', label: 'Ground' }],
    },
    {
      label: 'Perches (1-31)',
      options: [...Array(31)].map((_, i) => ({
        value: String(i + 1),
        label: `Perch ${i + 1}`,
      })),
    },
    {
      label: 'Baby Boxes',
      options: [
        { value: 'BB1', label: 'BB1 - North Baby Box' },
        { value: 'BB2', label: 'BB2 - South Baby Box' },
      ],
    },
    {
      label: 'Food Platforms',
      options: [
        { value: 'F1', label: 'F1 - Food Platform 1' },
        { value: 'F2', label: 'F2 - Food Platform 2' },
      ],
    },
    {
      label: 'Other',
      options: [
        { value: 'G', label: 'G - Ground' },
        { value: 'W', label: 'W - Water Bowl' },
      ],
    },
  ];

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

  const handleInteractionTypeChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'interactionType', newValue);
    onValidate(time, 'interactionType', newValue);
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

  const handleInteractionTypeOtherChange = (e) => {
    const newValue = e.target.value;
    onChange(time, 'interactionTypeOther', newValue);
    debouncedValidateRef.current(time, 'interactionTypeOther', newValue);
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

  // Get computed CSS variable values for react-select styling
  const rootStyles = getComputedStyle(document.documentElement);
  const colorBorder = rootStyles.getPropertyValue('--color-border').trim();
  const colorBorderFocus = rootStyles
    .getPropertyValue('--color-border-focus')
    .trim();
  const colorError = rootStyles.getPropertyValue('--color-error').trim();
  const colorBgPrimary = rootStyles
    .getPropertyValue('--color-bg-primary')
    .trim();
  const colorTextPrimary = rootStyles
    .getPropertyValue('--color-text-primary')
    .trim();
  const colorBgSecondary = rootStyles
    .getPropertyValue('--color-bg-secondary')
    .trim();
  const colorAccentPrimary = rootStyles
    .getPropertyValue('--color-accent-primary')
    .trim();

  // Custom styles for React Select to match our form styling and theme
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: colorBgPrimary,
      borderColor: locationError
        ? colorError
        : state.isFocused
          ? colorBorderFocus
          : colorBorder,
      color: colorTextPrimary,
      boxShadow: 'none',
      '&:hover': {
        borderColor: locationError
          ? colorError
          : state.isFocused
            ? colorBorderFocus
            : colorBorder,
      },
      minHeight: '38px',
      fontSize: '14px',
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: colorBgPrimary,
      fontSize: '14px',
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? colorAccentPrimary
        : state.isFocused
          ? colorBgSecondary
          : colorBgPrimary,
      color: state.isSelected ? 'white' : colorTextPrimary,
      '&:active': {
        backgroundColor: colorAccentPrimary,
      },
    }),
    singleValue: (base) => ({
      ...base,
      color: colorTextPrimary,
    }),
    input: (base) => ({
      ...base,
      color: colorTextPrimary,
    }),
    placeholder: (base) => ({
      ...base,
      color: colorTextPrimary,
      opacity: 0.5,
    }),
    groupHeading: (base) => ({
      ...base,
      color: colorTextPrimary,
      fontWeight: 600,
    }),
  };

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
          selectStyles={selectStyles}
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

      {showInteraction && (
        <InteractionTypeSelect
          value={observation.interactionType}
          otherValue={observation.interactionTypeOther}
          onChange={handleInteractionTypeChange}
          onOtherChange={handleInteractionTypeOtherChange}
          onKeyDown={handleKeyDown('interactionTypeOther')}
          error={interactionTypeError}
          otherError={interactionTypeOtherError}
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
    animal: PropTypes.string.isRequired,
    animalOther: PropTypes.string.isRequired,
    interactionType: PropTypes.string.isRequired,
    interactionTypeOther: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  behaviorError: PropTypes.string,
  locationError: PropTypes.string,
  objectError: PropTypes.string,
  objectOtherError: PropTypes.string,
  animalError: PropTypes.string,
  animalOtherError: PropTypes.string,
  interactionTypeError: PropTypes.string,
  interactionTypeOtherError: PropTypes.string,
  descriptionError: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onValidate: PropTypes.func.isRequired,
  onCopyToNext: PropTypes.func.isRequired,
  isLastSlot: PropTypes.bool.isRequired,
};

export default TimeSlotObservation;
