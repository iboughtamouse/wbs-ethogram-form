import React from 'react';
import { validateTimeRange, roundToNearestFiveMinutes } from '../utils/timeUtils';

const MetadataSection = ({ metadata, fieldErrors, onChange }) => {
  const handleTimeChange = (field, value) => {
    // Round to nearest 5-minute interval
    const roundedTime = value ? roundToNearestFiveMinutes(value) : '';
    onChange(field, roundedTime, false);
  };

  const handleTimeBlur = (field) => {
    // Validate time range if both times are present
    if (metadata.startTime && metadata.endTime) {
      const validation = validateTimeRange(metadata.startTime, metadata.endTime);
      if (!validation.valid) {
        // Set error through onChange with validation flag
        onChange(field, metadata[field], true);
      }
    }
  };

  // Check for time range validation error
  const timeRangeError = metadata.startTime && metadata.endTime
    ? validateTimeRange(metadata.startTime, metadata.endTime).error
    : null;

  return (
    <div className="section">
      <h2 className="section-title">Observer Information</h2>
      <div className="metadata-grid">
        <div className="form-group">
          <label>
            Discord Username <span className="required">*</span>
          </label>
          <input
            type="text"
            value={metadata.observerName}
            onChange={(e) => onChange('observerName', e.target.value)}
            onBlur={(e) => onChange('observerName', e.target.value, true)}
            placeholder="Enter your Discord username"
            className={fieldErrors.observerName ? 'error' : ''}
          />
          {fieldErrors.observerName && (
            <div className="field-error">{fieldErrors.observerName}</div>
          )}
        </div>

        <div className="form-group">
          <label>
            Date <span className="required">*</span>
          </label>
          <input
            type="date"
            value={metadata.date}
            onChange={(e) => onChange('date', e.target.value)}
            onBlur={(e) => onChange('date', e.target.value, true)}
            className={fieldErrors.date ? 'error' : ''}
          />
          {fieldErrors.date && (
            <div className="field-error">{fieldErrors.date}</div>
          )}
        </div>

        <div className="form-group">
          <label>
            Time Range <span className="required">*</span>
          </label>
          <div className="time-range-help-text">
            Select start and end time (5-60 minutes)
          </div>
          <div className="time-range-inputs">
            <input
              type="time"
              value={metadata.startTime}
              onChange={(e) => handleTimeChange('startTime', e.target.value)}
              onBlur={() => handleTimeBlur('startTime')}
              className={timeRangeError || fieldErrors.startTime ? 'error' : ''}
              step="300"
            />
            <span className="time-range-divider">to</span>
            <input
              type="time"
              value={metadata.endTime}
              onChange={(e) => handleTimeChange('endTime', e.target.value)}
              onBlur={() => handleTimeBlur('endTime')}
              className={timeRangeError || fieldErrors.endTime ? 'error' : ''}
              step="300"
            />
          </div>
          {timeRangeError && (
            <div className="field-error">{timeRangeError}</div>
          )}
        </div>

        <div className="form-group">
          <label>Aviary</label>
          <input
            type="text"
            value={metadata.aviary}
            readOnly
            disabled
          />
        </div>

        <div className="form-group">
          <label>Patient</label>
          <input
            type="text"
            value={metadata.patient}
            readOnly
            disabled
          />
        </div>
      </div>
    </div>
  );
};

export default MetadataSection;
