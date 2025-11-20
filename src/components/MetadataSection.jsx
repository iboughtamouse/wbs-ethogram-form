import React from 'react';
import TimeRangePicker from 'react-timerange-picker';
import { validateTimeRange, roundToNearestFiveMinutes } from '../utils/timeUtils';
import 'react-timerange-picker/dist/TimeRangePicker.css';
import 'react-clock/dist/Clock.css';

const MetadataSection = ({ metadata, fieldErrors, onChange }) => {
  const handleTimeRangeChange = (value) => {
    if (!value) {
      onChange('startTime', '', false);
      onChange('endTime', '', false);
      return;
    }

    const [startTime, endTime] = value;
    
    // Round times to nearest 5-minute interval
    const roundedStart = startTime ? roundToNearestFiveMinutes(startTime) : '';
    const roundedEnd = endTime ? roundToNearestFiveMinutes(endTime) : '';
    
    onChange('startTime', roundedStart, false);
    onChange('endTime', roundedEnd, false);
  };

  const handleTimeRangeBlur = () => {
    if (metadata.startTime && metadata.endTime) {
      const validation = validateTimeRange(metadata.startTime, metadata.endTime);
      if (!validation.valid) {
        // Set error through onChange with validation flag
        onChange('startTime', metadata.startTime, true);
      }
    }
  };

  // Combine start and end time for the picker
  const timeRangeValue = metadata.startTime && metadata.endTime 
    ? [metadata.startTime, metadata.endTime] 
    : null;

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
          <TimeRangePicker
            onChange={handleTimeRangeChange}
            onBlur={handleTimeRangeBlur}
            value={timeRangeValue}
            disableClock={true}
            format="h:mm a"
            rangeDivider="to"
            className={timeRangeError ? 'error-picker' : ''}
            clearIcon={null}
            clockIcon={null}
          />
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
