import React from 'react';
import Select from 'react-select';
import { BEHAVIORS, VALID_PERCHES } from '../constants';
import { formatTo12Hour } from '../utils/timeUtils';

const TimeSlotObservation = ({ 
  time, 
  observation, 
  behaviorError, 
  locationError, 
  onChange,
  onValidate 
}) => {
  const behaviorDef = BEHAVIORS.find(b => b.value === observation.behavior);
  const requiresLocation = behaviorDef?.requiresLocation || false;

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

  return (
    <div className="time-slot">
      <div className="time-slot-header">{displayTime}</div>
      
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
            Location (Perch # or "Ground") <span className="required">*</span>
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
