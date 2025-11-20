import React from 'react';
import Select from 'react-select';
import { BEHAVIORS, VALID_PERCHES, INANIMATE_OBJECTS, ANIMAL_TYPES, INTERACTION_TYPES } from '../constants';
import { formatTo12Hour } from '../utils/timeUtils';

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
  onChange,
  onValidate,
  onCopyToNext,
  isLastSlot
}) => {
  const behaviorDef = BEHAVIORS.find(b => b.value === observation.behavior);
  const requiresLocation = behaviorDef?.requiresLocation || false;
  const requiresObject = behaviorDef?.requiresObject || false;
  const requiresAnimal = behaviorDef?.requiresAnimal || false;
  const requiresInteraction = behaviorDef?.requiresInteraction || false;

  // Format perch options for React Select
  const perchOptions = [
    { 
      label: 'Common Locations',
      options: [
        { value: 'Ground', label: 'Ground' }
      ]
    },
    {
      label: 'Perches (1-31)',
      options: [...Array(31)].map((_, i) => ({
        value: String(i + 1),
        label: `Perch ${i + 1}`
      }))
    },
    {
      label: 'Baby Boxes',
      options: [
        { value: 'BB1', label: 'BB1 - North Baby Box' },
        { value: 'BB2', label: 'BB2 - South Baby Box' }
      ]
    },
    {
      label: 'Food Platforms',
      options: [
        { value: 'F1', label: 'F1 - Food Platform 1' },
        { value: 'F2', label: 'F2 - Food Platform 2' }
      ]
    },
    {
      label: 'Other',
      options: [
        { value: 'G', label: 'G - Ground' },
        { value: 'W', label: 'W - Water Bowl' }
      ]
    }
  ];

  const handleBehaviorChange = (value) => {
    onChange(time, 'behavior', value);
  };

  const handleBehaviorBlur = () => {
    onValidate(time, 'behavior');
  };

  const handleLocationChange = (selectedOption) => {
    onChange(time, 'location', selectedOption ? selectedOption.value : '');
  };

  const handleLocationBlur = () => {
    onValidate(time, 'location');
  };

  // Object interaction handlers
  const handleObjectChange = (e) => {
    onChange(time, 'object', e.target.value);
  };

  const handleObjectBlur = (e) => {
    onValidate(time, 'object', e.target.value);
  };

  const handleObjectOtherChange = (e) => {
    onChange(time, 'objectOther', e.target.value);
  };

  const handleObjectOtherBlur = (e) => {
    onValidate(time, 'objectOther', e.target.value);
  };

  // Animal interaction handlers
  const handleAnimalChange = (e) => {
    onChange(time, 'animal', e.target.value);
  };

  const handleAnimalBlur = (e) => {
    onValidate(time, 'animal', e.target.value);
  };

  const handleAnimalOtherChange = (e) => {
    onChange(time, 'animalOther', e.target.value);
  };

  const handleAnimalOtherBlur = (e) => {
    onValidate(time, 'animalOther', e.target.value);
  };

  const handleInteractionTypeChange = (e) => {
    onChange(time, 'interactionType', e.target.value);
  };

  const handleInteractionTypeBlur = (e) => {
    onValidate(time, 'interactionType', e.target.value);
  };

  const handleInteractionTypeOtherChange = (e) => {
    onChange(time, 'interactionTypeOther', e.target.value);
  };

  const handleInteractionTypeOtherBlur = (e) => {
    onValidate(time, 'interactionTypeOther', e.target.value);
  };

  // Find the currently selected option for React Select
  const selectedLocationOption = perchOptions
    .flatMap(group => group.options)
    .find(option => option.value === observation.location);

  // Custom styles for React Select to match our form styling
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: locationError ? '#e74c3c' : (state.isFocused ? '#3498db' : '#ddd'),
      boxShadow: 'none',
      '&:hover': {
        borderColor: locationError ? '#e74c3c' : (state.isFocused ? '#3498db' : '#ddd')
      },
      minHeight: '38px',
      fontSize: '14px'
    }),
    menu: (base) => ({
      ...base,
      fontSize: '14px'
    })
  };

  // Convert 24-hour time to 12-hour format for display
  const displayTime = formatTo12Hour(time);

  const handleCopyPrevious = (e) => {
    if (e.target.checked && onCopyToNext) {
      // Find previous time slot and copy it to this one
      // This is a bit of a hack - we're using onCopyToNext with the previous time
      // We'll need to add a new prop for the previous time
      // For now, let's add this functionality properly
    }
  };

  return (
    <div className="time-slot">
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
      
      <div className="form-group">
        <label>
          Behavior <span className="required">*</span>
        </label>
        <select
          value={observation.behavior}
          onChange={(e) => handleBehaviorChange(e.target.value)}
          onBlur={handleBehaviorBlur}
          className={behaviorError ? 'error' : ''}
        >
          {BEHAVIORS.map((behavior) => (
            <option key={behavior.value} value={behavior.value}>
              {behavior.label}
            </option>
          ))}
        </select>
        {behaviorError && (
          <div className="field-error">{behaviorError}</div>
        )}
      </div>

      {requiresLocation && (
        <div className="form-group location-input">
          <label>
            {observation.behavior === 'jumping' ? 'Starting Location' : 'Location'} (Perch # or "Ground") <span className="required">*</span>
          </label>
          <Select
            options={perchOptions}
            value={selectedLocationOption}
            onChange={handleLocationChange}
            onBlur={handleLocationBlur}
            placeholder="Type or select..."
            isClearable
            styles={selectStyles}
          />
          {locationError && (
            <div className="field-error">{locationError}</div>
          )}
        </div>
      )}

      {requiresObject && (
        <>
          <div className="form-group">
            <label>
              Object <span className="required">*</span>
            </label>
            <select
              value={observation.object}
              onChange={handleObjectChange}
              onBlur={handleObjectBlur}
              className={objectError ? 'error' : ''}
            >
              {INANIMATE_OBJECTS.map((obj) => (
                <option key={obj.value} value={obj.value}>
                  {obj.label}
                </option>
              ))}
            </select>
            {objectError && (
              <div className="field-error">{objectError}</div>
            )}
          </div>

          {observation.object === 'other' && (
            <div className="form-group">
              <label>
                Specify object: <span className="required">*</span>
              </label>
              <input
                type="text"
                value={observation.objectOther}
                onChange={handleObjectOtherChange}
                onBlur={handleObjectOtherBlur}
                placeholder="Enter object name..."
                className={objectOtherError ? 'error' : ''}
              />
              {objectOtherError && (
                <div className="field-error">{objectOtherError}</div>
              )}
            </div>
          )}
        </>
      )}

      {requiresAnimal && (
        <>
          <div className="form-group">
            <label>
              Animal <span className="required">*</span>
            </label>
            <select
              value={observation.animal}
              onChange={handleAnimalChange}
              onBlur={handleAnimalBlur}
              className={animalError ? 'error' : ''}
            >
              {ANIMAL_TYPES.map((animal) => (
                <option key={animal.value} value={animal.value}>
                  {animal.label}
                </option>
              ))}
            </select>
            {animalError && (
              <div className="field-error">{animalError}</div>
            )}
          </div>

          {observation.animal === 'other' && (
            <div className="form-group">
              <label>
                Specify animal: <span className="required">*</span>
              </label>
              <input
                type="text"
                value={observation.animalOther}
                onChange={handleAnimalOtherChange}
                onBlur={handleAnimalOtherBlur}
                placeholder="Enter animal type..."
                className={animalOtherError ? 'error' : ''}
              />
              {animalOtherError && (
                <div className="field-error">{animalOtherError}</div>
              )}
            </div>
          )}
        </>
      )}

      {requiresInteraction && (
        <>
          <div className="form-group">
            <label>
              Interaction Type <span className="required">*</span>
            </label>
            <select
              value={observation.interactionType}
              onChange={handleInteractionTypeChange}
              onBlur={handleInteractionTypeBlur}
              className={interactionTypeError ? 'error' : ''}
            >
              {INTERACTION_TYPES.map((interaction) => (
                <option key={interaction.value} value={interaction.value}>
                  {interaction.label}
                </option>
              ))}
            </select>
            {interactionTypeError && (
              <div className="field-error">{interactionTypeError}</div>
            )}
          </div>

          {observation.interactionType === 'other' && (
            <div className="form-group">
              <label>
                Specify interaction: <span className="required">*</span>
              </label>
              <input
                type="text"
                value={observation.interactionTypeOther}
                onChange={handleInteractionTypeOtherChange}
                onBlur={handleInteractionTypeOtherBlur}
                placeholder="Enter interaction type..."
                className={interactionTypeOtherError ? 'error' : ''}
              />
              {interactionTypeOtherError && (
                <div className="field-error">{interactionTypeOtherError}</div>
              )}
            </div>
          )}
        </>
      )}

      <div className="form-group">
        <label>Notes (optional)</label>
        <input
          type="text"
          value={observation.notes}
          onChange={(e) => onChange(time, 'notes', e.target.value)}
          placeholder="Any additional observations..."
        />
      </div>

    </div>
  );
};

export default TimeSlotObservation;
