import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { BEHAVIORS, VALID_PERCHES, INANIMATE_OBJECTS, ANIMAL_TYPES, INTERACTION_TYPES } from '../constants';
import { formatTo12Hour } from '../utils/timeUtils';
import PerchDiagramModal from './PerchDiagramModal';
import { debounce } from '../utils/debounce';
import NotesField from './form/NotesField';

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
  isLastSlot
}) => {
  const [isPerchModalOpen, setIsPerchModalOpen] = useState(false);
  
  // Create debounced validator for text fields (200ms delay)
  const debouncedValidateRef = useRef(
    debounce((time, field, value) => {
      onValidate(time, field, value);
    }, 200)
  );
  
  const behaviorDef = BEHAVIORS.find(b => b.value === observation.behavior);
  const requiresLocation = behaviorDef?.requiresLocation || false;
  const requiresObject = behaviorDef?.requiresObject || false;
  const requiresAnimal = behaviorDef?.requiresAnimal || false;
  const requiresInteraction = behaviorDef?.requiresInteraction || false;
  const requiresDescription = behaviorDef?.requiresDescription || false;

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

  const handleDescriptionBlur = (e) => {
    onValidate(time, 'description', e.target.value);
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
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <Select
                options={perchOptions}
                value={selectedLocationOption}
                onChange={handleLocationChange}
                placeholder="Type or select..."
                isClearable
                styles={selectStyles}
              />
            </div>
            <button
              type="button"
              className="view-perch-map-btn"
              onClick={() => setIsPerchModalOpen(true)}
              title="Open perch diagram to select location"
            >
              <span className="map-icon">🗺️</span>
              Map
            </button>
          </div>
          {locationError && (
            <div className="field-error">{locationError}</div>
          )}
          <PerchDiagramModal
            isOpen={isPerchModalOpen}
            onClose={() => setIsPerchModalOpen(false)}
          />
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
                onKeyDown={handleKeyDown('objectOther')}
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
                onKeyDown={handleKeyDown('animalOther')}
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
                onKeyDown={handleKeyDown('interactionTypeOther')}
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

      {requiresDescription && (
        <div className="form-group">
          <label>
            Description <span className="required">*</span>
          </label>
          <input
            type="text"
            value={observation.description}
            onChange={handleDescriptionChange}
            onKeyDown={handleKeyDown('description')}
            placeholder="Describe the behavior..."
            className={descriptionError ? 'error' : ''}
          />
          {descriptionError && (
            <div className="field-error">{descriptionError}</div>
          )}
        </div>
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
    description: PropTypes.string.isRequired
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
  isLastSlot: PropTypes.bool.isRequired
};

export default TimeSlotObservation;
