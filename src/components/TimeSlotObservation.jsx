import React from 'react';
import { BEHAVIORS, VALID_PERCHES } from '../constants';

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

  const handleBehaviorChange = (value) => {
    onChange(time, 'behavior', value);
  };

  const handleBehaviorBlur = () => {
    onValidate(time, 'behavior');
  };

  const handleLocationChange = (value) => {
    onChange(time, 'location', value);
  };

  const handleLocationBlur = () => {
    onValidate(time, 'location');
  };

  return (
    <div className="time-slot">
      <div className="time-slot-header">{time}</div>
      
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
          <input
            type="text"
            list={`perch-options-${time}`}
            value={observation.location}
            onChange={(e) => handleLocationChange(e.target.value)}
            onBlur={handleLocationBlur}
            placeholder="Type or select..."
            className={locationError ? 'error' : ''}
          />
          <datalist id={`perch-options-${time}`}>
            <option value="Ground">Ground</option>
            {VALID_PERCHES.map((perch) => (
              <option key={perch} value={perch}>
                {perch}
              </option>
            ))}
          </datalist>
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
